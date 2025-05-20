import { StyleSheet, Text, View, FlatList, TextInput, Pressable, Alert } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { deletescript, downloadScriptFromAppwriteToLocal, getcloudscripts } from '../services/appwriteservices';
import { getCurrentUserID, insertCharacters, insertScript } from '../services/dbservice';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

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

const Explore = () => {
  const [data, setData] = useState<ScriptDoc[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      init();
    }, [])
  );

  const init = async () => {
    const uid = await getCurrentUserID();
    setCurrentUserId(uid);
    const docs = await getcloudscripts() as ScriptDoc[];
    setData(docs);
  };

  const confirmDelete = (docId: string) => {
      Alert.alert("Delete Script", "Are you sure you want to delete this script?", [
        { text: "No", style: "cancel" },
        { text: "Yes", onPress: () => handleDelete(docId) },
      ]);
    };

  const handleDelete = async(docId: string) => {
  
    //console.log('Delete script with id:', docId);
   try{ await deletescript(docId,currentUserId);
    init();
   }catch(error){
    console.error("Error deleting script:", error);
    Alert.alert("Error", "Failed to delete the script. Please try again.");

   }
    
  };

  const handleDownload = async(doc: ScriptDoc) => {
    await downloadScriptFromAppwriteToLocal(doc.$id)
    // const localscriptid = await insertScript(doc.title,'','',doc.content,doc.$id, doc.uploadedby)
    // await insertCharacters(doc.characterlist,localscriptid,1.0,1.0);
    //console.log('Download script with id:', );
  };

  const renderItem = ({ item }: { item: ScriptDoc }) => {
    //if (!currentUserId || item.downloadedby.includes(currentUserId)) return null;

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="document-text" size={24} color="white" />
          </View>
          <Pressable onPress={() => router.push({ pathname: '/screens/viewscript', params: { docID: item.$id } })} style={{ flex: 1 }}>
            <Text style={styles.titleText}>{item.title}</Text>
          </Pressable>
          {currentUserId === item.uploadedby ? (
            <Pressable onPress={() => confirmDelete(item.$id)} style={styles.iconRight}>
              <Ionicons name="trash-outline" size={20} color="#000" />
            </Pressable>
          ) : (
            <Pressable onPress={() => handleDownload(item)} style={styles.iconRight}>
              <Ionicons name="download-outline" size={20} color="#000" />
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>More Scripts</Text>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="gray" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Scripts"
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <FlatList
        data={data.filter((item) =>
          item.title.toLowerCase().includes(search.toLowerCase())
        )}
        keyExtractor={(item) => item.$id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </View>
  );
};

export default Explore;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#000',
    borderRadius: 30,
    padding: 8,
    marginRight: 12,
  },
  titleText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  iconRight: {
    marginLeft: 8,
  },
});
