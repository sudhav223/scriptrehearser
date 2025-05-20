import { View, Text, ScrollView, Button, Alert, StyleSheet } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import * as Speech from 'expo-speech';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ChatBubble from '../components/chatbox';
import { parseScript } from '../services/scriptparser';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/config';
//import { useLayoutEffect } from 'react';

//voice settings 
import { Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider'; 
import { getScriptById, getAllCharacters, updateCharacterVoice, getCurrentUserdetails } from '../services/dbservice';
import { Picker } from '@react-native-picker/picker';
import { updateProgress } from '../services/appwriteservices';

//video
// import { Camera, CameraType } from 'expo-camera';
// import * as FileSystem from 'expo-file-system';


type Script = {
  id: number;
  userID: string,
  docID: string,
  title: string;
  fileURI: string;
  content: string;
  deadline: string;

};

type Character = {
  id: number;
  name: string;
  pitch: number;
  rate: number;
};


const Rehearsal = () => {
  const { id: scriptId, character, script } = useLocalSearchParams();
  const parsedScript = parseScript(JSON.parse(Array.isArray(script) ? script[0] : script));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [readLines, setReadLines] = useState<number[]>([]);
  const [spokenLines, setSpokenLines] = useState<string[]>([]);
  const [similarityResults, setSimilarityResults] = useState<
    { original: string; spoken: string; color: string; similarity: number }[]
  >([]);
  const [isListening, setIsListening] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const lastIndexRef = useRef<number | null>(null);

  //modal
  //const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);

    const[username, setusername]= useState('')
    const [Script, setScript] = useState<Script | null>(null);
    const [names, setNames] = useState<string[]>([]);
    const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
    const [showPicker, setShowPicker] = useState<boolean>(false);
    const [characterVoices, setCharacterVoices] = useState<{ [key: string]: { pitch: number; rate: number; voice: string } }>({});
    const [voices, setVoices] = useState<Speech.Voice[]>([]);


    //video
  // const cameraRef = useRef<Camera | null>(null);
  // const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  // const [isRecording, setIsRecording] = useState(false);

//   useEffect(() => {
//   (async () => {
//     const { status } = await Camera.requestCameraPermissionsAsync();
//     setHasCameraPermission(status === 'granted');
//   })();
// }, []);
      
    useEffect(() => {
      if (modalVisible) {
        Speech.getAvailableVoicesAsync()
          .then((availableVoices) => {
            const englishVoices = availableVoices.filter(
              (voice) =>
                voice.language.startsWith('en') 
            );
    
            if (englishVoices.length === 0) {
              Alert.alert("No English Voices Found");
            } else {
              setVoices(englishVoices);
            }
          })
          .catch((err) => {
            console.error("Error fetching voices:", err);
          });
      }
    }, [modalVisible]);
//similarity check :
const lastTranscript = useRef<string>('');

    useEffect(() => {
        fetchScripts();
      }, []);
    
      const fetchScripts = async () => {
        try {
          const userdetails = await getCurrentUserdetails();
          const scriptData = await getScriptById(scriptId);
          const characterList = await getAllCharacters(scriptId);
          const nameList = characterList.map((character) => character.name);
          setScript(scriptData);
          setNames(nameList);
          setusername(userdetails.name)
          Speech.getAvailableVoicesAsync().then((availableVoices) => {
            //console.log("Available voices:", availableVoices);             
              setVoices(availableVoices);
              const voiceNames = availableVoices.map((voice) => voice.name);
              //console.log("\n Voice names:", voiceNames);
            
          }).catch((err) => {
            console.error("Error fetching voices:", err);
          });
    
          const voiceSettings: { [key: string]: { pitch: number; rate: number; voice: string } } = {};
          characterList.forEach((char) => {
            voiceSettings[char.name] = {
              pitch: char.pitch ?? 1.0,
              rate: char.rate ?? 1.0,
              voice: char.voice?? voices[0]?.identifier,
            };
          });
          setCharacterVoices(voiceSettings);
        } catch (error) {
          console.error("Error fetching scripts", error);
        }
      };
        //{"identifier": "nl-be-x-bed-local", "language": "nl-BE", "name": "nl-be-x-bed-local", "quality": "Enhanced"}
        const handleSave = async () => {
          if (!selectedCharacter) return;
      
          const voice = characterVoices[selectedCharacter];
          try {
            await updateCharacterVoice(1,selectedCharacter, voice.pitch, voice.rate, voice.voice);
            //console.log("voice variable: ", voice.voice )
            Alert.alert("Success", "Voice settings saved.");
          } catch (error) {
            console.error("Error saving voice settings", error);
            Alert.alert("Error", "Failed to save changes.");
          }
        };
    

  const router = useRouter();

  useSpeechRecognitionEvent("start", () => setIsListening(true));
  useSpeechRecognitionEvent("end", () => setIsListening(false));

  const handleSpeechAttempt = async () => {
    const transcript = lastTranscript.current; // store the last result globally or however you're handling it
    if (!transcript) return;
  
    const originalLine = parsedScript[currentIndex]?.content;
    const cleanOriginal = originalLine.trim().toLowerCase();
    const cleanSpoken = transcript.trim().toLowerCase();
    console.log("spoken line:", transcript)
  
    if (cleanOriginal === cleanSpoken) {
      setSpokenLines((prev) => [...prev, transcript]);
      setReadLines((prev) => [...prev, currentIndex]);
      setSimilarityResults((prev) => [
        ...prev,
        {
          original: originalLine,
          spoken: transcript,
          color: 'green',
          similarity: 100,
        },
      ]);
      setCurrentIndex((idx) => idx + 1);
      return;
    }
  
    try {
      const response = await axios.post(`${BASE_URL}/similarity`, {
        sentence1: originalLine,
        sentence2: transcript,
      });
  
      const { similarity_percent, color } = response.data;
  
      if (similarity_percent >= 50) {
        setSpokenLines((prev) => [...prev, transcript]);
        setReadLines((prev) => [...prev, currentIndex]);
        setSimilarityResults((prev) => [
          ...prev,
          {
            original: originalLine,
            spoken: transcript,
            color,
            similarity: similarity_percent,
          },
        ]);
        setCurrentIndex((idx) => idx + 1);
      } else {
        Alert.alert("Try Again", "Your response wasn't close enough. We'll retry in 5 seconds.");
  
        if (isPlaying && parsedScript[currentIndex]?.character === character) {
          setTimeout(() => {
            ExpoSpeechRecognitionModule.start({
              lang: 'en-US',
              interimResults: false,
              continuous: false,
            });
            setIsListening(true);
          }, 5000);
        }
      }
    } catch (err) {
      console.error("Error fetching similarity:", err);
      Alert.alert("Similarity check failed", "Please try again.");
    }
  };
  
  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results[0]?.transcript ?? '';
    if (!transcript) return;
  
    lastTranscript.current = transcript; // store it temporarily
    handleSpeechAttempt(); // begin the checking logic
  });
  

  useSpeechRecognitionEvent("error", (event) => {
    if (isPlaying && parsedScript[currentIndex]?.character === character) {
      setTimeout(() => {
        ExpoSpeechRecognitionModule.start({
          lang: 'en-US',
          interimResults: false,
          continuous: false,
        });
        setIsListening(true);
      }, 2000);
    }
  });


  

  const startListening = async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      Alert.alert("Permissions not granted", "Please allow microphone access.");
      return;
    }

    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: false,
      continuous: false,
    });
  };

  const stopListening = () => {
    ExpoSpeechRecognitionModule.stop();
    setIsListening(false);
  };

  useEffect(() => {
    if (isPlaying && currentIndex < parsedScript.length) {
      const line = parsedScript[currentIndex];
      if (line.type === 'dialogue') {
        if (line.character === character) {
          startListening();
        } else {
          console.log("voice used:", characterVoices[line.character])
          Speech.speak(line.content, {
            pitch: characterVoices[line.character].pitch,
            rate: characterVoices[line.character].rate,
            voice: characterVoices[line.character].voice,
            onDone: () => {
              setReadLines((prev) => [...prev, currentIndex]);
              setCurrentIndex((i) => i + 1);
            },
          });
        }
      } else {
        setCurrentIndex((i) => i + 1);
      }
    }

    return () => {
      stopListening();
    };
  }, [currentIndex, isPlaying]);

  useEffect(() => {
    lastIndexRef.current = currentIndex;
  }, [currentIndex]);

  const handlePlay = () => {setIsPlaying(true);
    //startRecording();//video
  }

  const handlePause = () => {
    Speech.stop();
    stopListening();
    setIsPlaying(false);
  };

  const handleStop = async () => {
    Speech.stop();
    stopListening();
    setIsPlaying(false);
    //stopRecording(); // Stop camera recordin

    const accuracy = calculateAccuracy();
    const progress = calculateProgress();

    await saveRehearsalResult(String(scriptId), similarityResults, accuracy, progress);
    // Only update progress if docID is not null
  if (Script?.docID != null) {
    console.log("updated progress collection ")
    await updateProgress(Script.docID, Script.userID, username, Script.title, progress, accuracy);
  }

    setCurrentIndex(0);
    setReadLines([]);
    setSpokenLines([]);
    setSimilarityResults([]);
  };

  const calculateAccuracy = () => {
    if (similarityResults.length === 0) return 0;
    const total = similarityResults.reduce((sum, r) => sum + r.similarity, 0);
    return Math.round(total / similarityResults.length);
  };

  const calculateProgress = () => {
    const userDialogues = parsedScript.filter(
      (line) => line.type === 'dialogue' && line.character === character
    );
    const completed = readLines.filter(
      (index) =>
        parsedScript[index]?.type === 'dialogue' &&
        parsedScript[index]?.character === character
    ).length;
    // (spokenlines/total lines of the user)

    return Math.round((completed / userDialogues.length) * 100);
  };
//video recorder 
//   const startRecording = async () => {
//   if (!cameraRef.current || isRecording) return;
//   try {
//     setIsRecording(true);
//     const video = await cameraRef.current.recordAsync();
    
//     // Save to FileSystem
//     const fileUri = `${FileSystem.documentDirectory}rehearsal_${Date.now()}.mp4`;
//     await FileSystem.moveAsync({
//       from: video.uri,
//       to: fileUri,
//     });

//     console.log("Video saved at:", fileUri);
//   } catch (err) {
//     console.error("Recording error:", err);
//   } finally {
//     setIsRecording(false);
//   }
// };

// const stopRecording = () => {
//   if (cameraRef.current && isRecording) {
//     cameraRef.current.stopRecording();
//   }
// };

  const saveRehearsalResult = async (
    scriptId: string,
    results: { original: string; spoken: string; color: string; similarity: number }[],
    accuracy: number,
    progress: number
  ) => {
    try {
      const key = `rehearsalResults_${scriptId}`;
      const newEntry = {
        scriptId,
        attempts: results,
        accuracy,
        progress,
        timestamp: new Date().toISOString(),
      };
  
      const existing = await AsyncStorage.getItem(key);
      let parsed = existing ? JSON.parse(existing) : [];
  
      // Log existing results
      //console.log('📦 Existing stored results:', parsed);
  
      // Keep only last 4 entries
      if (parsed.length >= 5) {
        parsed.shift(); // remove oldest
      }
  
      parsed.push(newEntry);
  
      // Log what we're saving
      //console.log('New rehearsal result to be saved:', newEntry);
      //console.log('Updated rehearsal result list:', parsed);
  
      await AsyncStorage.setItem(key, JSON.stringify(parsed));
  
      // 🔍 Log all progress values
      const allProgressValues = parsed.map((entry) => entry.progress);
      //console.log('All stored progress values:', allProgressValues);
    } catch (error) {
      console.error('Failed to save rehearsal result:', error);
    }
  };

  
  
  
  return (
    <SafeAreaView style={styles.container}>
      <View style = {styles.headerContainer}>
      <View style={{ width: 30 }} />
      <Text style={styles.headerText}> Practice Script</Text>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.settingsButton}>
        <Ionicons name="settings-outline" size={30} color="black" />
      </TouchableOpacity>
      </View>
  
      <View style={styles.chatContainer}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          onContentSizeChange={() => {
            if (lastIndexRef.current !== currentIndex) {
              scrollRef.current?.scrollToEnd({ animated: true });
              lastIndexRef.current = currentIndex;
            }
          }}
        >
         {/*
  {hasCameraPermission && (
    <Camera
      style={{ width: 1, height: 1, position: 'absolute', top: -9999 }}
      type={CameraType.front}
      ref={(ref) => (cameraRef.current = ref)}
    />
  )}
*/}
          {parsedScript.map((line, index) => (
            <ChatBubble
              key={index}
              type={line.type}
              content={line.content}
              character={line.character}
              isUser={line.character === character}
              read={readLines.includes(index)}
              onPress={() => {
                Speech.stop();
                stopListening();
                setCurrentIndex(index);
                setIsPlaying(true);
              }}
            />
          ))}
          {isListening && (
            <Text style={styles.listeningText}>Listening...</Text>
          )}
        </ScrollView>
  
        <View style={styles.controls}>
          <Button title="▶️ Play" onPress={handlePlay} disabled={isPlaying} />
          <Button title="⏸ Pause" onPress={handlePause} />
          {isPlaying || isListening ? (
            <Button title="⏹ Stop" onPress={handleStop} />
          ) : (
            <Button
              title="📊 Progress"
              onPress={() =>
                router.push({
                  pathname: '/screens/progress',
                  params: { scriptId: String(scriptId) },
                })
              }
            />
          )}
          {isListening && <Button title="🛑 Stop Listening" onPress={stopListening} />}
        </View>
  
        
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Character Voice Settings</Text>

          <Text style={styles.label}>Select Character:</Text>
          <Picker
            selectedValue={selectedCharacter}
            onValueChange={(itemValue) => setSelectedCharacter(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="-- Choose --" value={null} />
            {names.map((name, index) => (
              <Picker.Item key={index} label={name} value={name} />
            ))}
          </Picker>

          {selectedCharacter && (
      <>
        <Text style={styles.selected}>Selected: {selectedCharacter}</Text>

        <Text style={styles.label}>Select Voice:</Text>
        <Picker
          selectedValue={characterVoices[selectedCharacter]?.voice}
          onValueChange={(value) =>
            setCharacterVoices((prev) => ({
              ...prev,
              [selectedCharacter]: {
                ...prev[selectedCharacter],
                voice: value,
              },
            }))
          }
          style={styles.picker}
        >
          {voices.map((voice, index) => (
            <Picker.Item
              key={index}
              label={`(${voice.name})`}
              value={voice.identifier}
            />
          ))}
        </Picker>

        <Text style={styles.detail}>
          Pitch: {characterVoices[selectedCharacter]?.pitch.toFixed(2)}
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={0.5}
          maximumValue={2.0}
          step={0.1}
          value={parseFloat(characterVoices[selectedCharacter]?.pitch.toFixed(2))}

          onValueChange={(value) => {
            setCharacterVoices((prev) => ({
              ...prev,
              [selectedCharacter]: {
                ...prev[selectedCharacter],
                pitch: value,
              },
            }));
          }}
        />

        <Text style={styles.detail}>
          Rate: {characterVoices[selectedCharacter]?.rate.toFixed(2)}
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={0.5}
          maximumValue={2.0}
          step={0.01}
          value={parseFloat(characterVoices[selectedCharacter]?.rate.toFixed(2))}
          onValueChange={(value) => {
            setCharacterVoices((prev) => ({
              ...prev,
              [selectedCharacter]: {
                ...prev[selectedCharacter],
                rate: value,
              },
            }));
          }}
        />
      </>
    )}

          <Button title="Save Changes" onPress={handleSave} />
          <Button title="Close" onPress={() => {
    setModalVisible(false);
    setSelectedCharacter(null); // Reset character selection
  }} />
        </View>
      </Modal>
      </View>
    </SafeAreaView>
  );
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  settingsButton: {
    marginRight: 15,
    alignSelf: 'flex-end',
    marginTop: 10,
    marginEnd: 15,
    
  },
  headerContainer:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  chatContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
  },
  listeningText: {
    textAlign: 'center',
    color: 'green',
    padding: 10,
  },
  headerText:{
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',

  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    marginTop: 10,
  },

  modalContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  detail: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 5,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    marginBottom: 20,
  },
  selected: {
    fontSize: 18,
    marginVertical: 10,
    textAlign: "center",
  },
  slider: {
    width: "100%",
    height: 40,
    marginVertical: 10,
  },
});


export default Rehearsal;
