import { router, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, Dimensions, ScrollView, TouchableOpacity, Modal, StyleSheet, Pressable, Platform } from "react-native";
import { getAllCharacters, getScriptById, updatecharactername, updateScriptDeadline } from "../services/dbservice";
import React, { useEffect, useState } from "react";
import { Picker } from '@react-native-picker/picker'; // Import Picker
import { Link } from 'expo-router';  // Import Link for navigation
import DateTimePicker from '@react-native-community/datetimepicker';

type Script = {
  id: number;
  title: string;
  fileURI: string;
  content: string;
  deadline: string; 
};

export default function User() {
  const { id } = useLocalSearchParams();
  const [script, setScript] = useState<Script[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [names, setnames]= useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);

  //date
  const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [scrollBgColor, setScrollBgColor] = useState('#fff');
  
    const onChange = async(event: any, selectedDate?: Date) => {
      setShowPicker(Platform.OS === 'ios'); // iOS keeps picker open
      if (selectedDate) {
        setDate(selectedDate);
         // Call updateScriptDeadline to save the new date to the database
    try {
      await updateScriptDeadline(parseInt(id.toString(), 10), selectedDate.toISOString());
      console.log("Deadline updated successfully");
    } catch (error) {
      console.error("Failed to update deadline:", error);
    }
        
      }
    };
  
    const formattedDay = date.getDate();
    const formattedMonth = date.toLocaleString('default', { month: 'long' });
  
  // Sample characters array
  //const characters = ["Character 1", "Character 2", "Character 3", "Character 4"];

  //const { width, height } = Dimensions.get("window");

  useEffect(() => {
    fetchScripts();
    console.log("script loaded");
  }, []);

  const fetchScripts = async () => {
    try {
      const data = await getScriptById(parseInt(id.toString(), 10));
      const characterlist = await getAllCharacters(parseInt(id.toString(), 10))
      const names = characterlist.map(character => character.name);
      //console.log("character list:", names)
      setnames(names);
      setScript(data);
      const scriptDeadline = data.deadline ? new Date(data.deadline) : new Date();
      setDate(scriptDeadline);
      //console.log("title", data.title);       
    } catch (error) {
      console.error("Error fetching scripts", error);
    }
  };

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const handleConfirm = async () => {
    if (selectedCharacter) {
      try {
        await updatecharactername(parseInt(id.toString(), 10),selectedCharacter);

        console.log("Navigating to rehearsal with:", id?.toString(), selectedCharacter);
        closeModal();
        router.push({
          pathname: "/screens/rehearsal",
          params: {
            id: id.toString(),
            character: selectedCharacter,
            script: JSON.stringify(script.content),
          },
        });
      } catch (error) {
        console.error("Failed to update character name:", error);
      }
    }
  };

  return (
    <View style={{ flex: 1, padding: 10, backgroundColor: '#ccc' }}>
      {script ? (
        <>
          <View style={{ width: '100%', alignItems: 'center' ,height: '70%'}}>
            <ScrollView
  contentContainerStyle={{
    padding: 20,
    paddingBottom: 10,
  }}
  style={{
    width: '90%',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: scrollBgColor, // this uses white by default
  }}
>
              <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>
                {script.title}
              </Text>
              <Text style={{ marginTop: 20, fontSize: 16, lineHeight: 24, textAlign: 'center' }}>
                {script.content}
              </Text>
            </ScrollView>
          </View>

                         <View style={[styles.container2, { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}>
  <TouchableOpacity
    style={{ width: 40, height: 40, backgroundColor: 'yellow', borderRadius: 10, marginRight: 10 }}
    onPress={() => setScrollBgColor('yellow')}
  />
                <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.card}>
                  <Text style={styles.title}>Deadline</Text>
                  <View style={styles.circle}>
                    <Text style={styles.day}>{formattedDay}</Text>
                  </View>
                  <Text style={styles.month}>{formattedMonth}</Text>
                </TouchableOpacity>
                 <TouchableOpacity
    style={{ width: 40, height: 40, backgroundColor: 'lightgreen', borderRadius: 10, marginLeft: 10 }}
    onPress={() => setScrollBgColor('lightgreen')}
  />
                {showPicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onChange}
                  />
                )}
              </View>





          {/* Bottom Bar */}
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.button} onPress={openModal}>
              <Text style={styles.buttonText}>Start</Text>
            </TouchableOpacity>
            <TouchableOpacity
                      style={styles.button}
                      onPress={() =>
                        router.push({
                          pathname: '/screens/progress',
                          params: { scriptId: String(id) },
                        })
                      }
                    >
              <Text style={styles.buttonText}>Progress</Text>
            </TouchableOpacity>
          </View>

          {/* Modal for character selection */}
          <Modal
            animationType="slide"
            transparent={false}
            visible={isModalVisible}
            onRequestClose={closeModal}
          >
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={closeModal}>
                  <Text style={styles.backButton}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Character</Text>
              </View>

              <ScrollView contentContainerStyle={styles.modalContent}>
                <Text style={{ marginBottom: 20 }}>Select your character:</Text>
                
                <Picker
                  selectedValue={selectedCharacter}
                  onValueChange={(itemValue) => setSelectedCharacter(itemValue)}
                >
                  {names.map((character, index) => (
                    <Picker.Item key={index} label={character} value={character} />
                  ))}
                </Picker>

                {selectedCharacter && (
                  <>
                    <Text style={{ marginTop: 20, fontSize: 16 }}>
                      You have selected: {selectedCharacter}
                    </Text>

                    <Pressable style={styles.confirmButton} onPress={handleConfirm}>
                      <Text style={styles.buttonText}>Confirm</Text>
                    </Pressable>
                  </>
                )}
              </ScrollView>
            </View>
          </Modal>
        </>
      ) : (
        <Text>Loading script...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ccc',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingLeft: 10,
    paddingBottom: 20,
  },
  backButton: {
    fontSize: 18,
    color: '#007bff',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  confirmButton: {
    marginTop: 30,
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  container2: {
    alignItems: 'center',
    marginTop: 10,
  },
  card: {
    backgroundColor: '#2b2b2b',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: 150,
    borderColor: 'gray',
    borderWidth: 2,
  },
  title: {
    color: 'white',
    fontSize: 18,
    marginBottom: 10,
  },
  circle: {
    backgroundColor: '#5a5a5a',
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  day: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
  },
  month: {
    color: 'white',
    fontSize: 18,
  },
});
