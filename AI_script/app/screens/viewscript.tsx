import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { database, config  } from '../lib/appwrtie'; // adjust path as needed
import { router } from 'expo-router';
import { getCurrentUserID, insertCharacters, insertScript } from '../services/dbservice';
import { deletescript, downloadScriptFromAppwriteToLocal } from '../services/appwriteservices';

type ScriptDoc = {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  characterlist: string[];
  content: string;
  uploadedby: string;
  useremail: string;
  title: string;
  downloadedby: string[];
};

const ViewScript = () => {
  const route = useRoute();
  const { docID } = route.params as { docID: string };
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [script, setScript] = useState<null | {
    title: string;
    content: string;
    uploadedby: string
  }>(null);

  useEffect(() => {
    const fetchScript = async () => {
      try {
        const uid = await getCurrentUserID();
        setCurrentUserId(uid);
        const result = await database.getDocument(config.db, config.col.cloudscripts, docID);
        setScript({ title: result.title, content: result.content, uploadedby: result.uploadedby });
      } catch (error) {
        console.error('Failed to fetch script:', error);
      }
    };
    

    fetchScript();
  }, [docID]);

  if (!script) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading script...</Text>
      </View>
    );
  }
  const handleDelete = async(docId: string) => {
    
      //console.log('Delete script with id:', docId);
      await deletescript(docId,currentUserId)
    };
  

//   const handleDownload = async (docID: string) => {
//   try {
//     console.log('Downloading script with ID:', docID);
    
//   } catch (error) {
//     console.error('Failed to download script:', error);
//   }
// };
const handleDownload = async (docID: string) => {
  try {
    
        await downloadScriptFromAppwriteToLocal(docID)
        
      
   

    alert('Script downloaded successfully!');
  } catch (error) {
    console.error('Failed to download script:', error);
    alert('Failed to download script. Please try again.');
  }
};

return (
  <View style={styles.container}>
   <Text style={styles.title}>{String(script?.title ?? '')}</Text>

        <ScrollView style={styles.scriptBox} contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.content}>{String(script?.content ?? '')}</Text>
        </ScrollView>
    <Pressable
      style={styles.button}
      onPress={() => router.push({ pathname: '/screens/leaderboard', params: { docID } })}
    >
      <Text style={styles.buttonText}>View Leaderboard</Text>
    </Pressable>

    <View style={{ height: 12 }} /> 
    {currentUserId === script.uploadedby ? (
            <Pressable
      style={styles.button}
      onPress={() => handleDelete(docID)}
    >
      <Text style={styles.buttonText}>Delete Script</Text>
    </Pressable>
          ) : (
            <Pressable  style={styles.button}  onPress={() => handleDownload(docID)} >
                    <Text style={styles.buttonText}>Download Script</Text>
            </Pressable>
          )}
    
    
  </View>
);

};

export default ViewScript;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    paddingTop: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  scriptBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fdfdfd',
    marginBottom: 16,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
