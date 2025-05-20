import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { deleteScript, getAllScripts, getScriptById } from '../services/dbservice';
import { Feather } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { deleteDownloadedBy } from '../services/appwriteservices';

type Script={
  id: number;
  title: string; 
  userID: string;
  docID: string;
};

const Search = () =>{
  const[searchText, setSearchText] = useState('');
  const [scripts, setScripts] = useState<Script[]>([]);
  const [filteredScripts, setFilteredScripts] = useState<Script[]>([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      fetchScripts();
    }, [])
  );
//Fetch all scripts from the database.
  const fetchScripts = async()=>{
    try{
      const data = await getAllScripts();
      setScripts(data);
      setFilteredScripts(data);
      console.log("datalength", data.length);
      
    }catch(error){
      console.error("Error fetching scripts", error);
    }
  };
//Filters scripts based on search input.
  const onSearch = (query: string) => {
    const filtered = scripts.filter((script)=> script.title.toLowerCase().includes(query.toLowerCase()));
    setFilteredScripts(filtered);

  };

  //whenever search query is changed it will call onsearch

  useEffect(()=>{
    onSearch(searchText);
  },[searchText])

  const confirmDelete = (id: Number) => {
    Alert.alert("Delete Script", "Are you sure you want to delete this script?", [
      { text: "No", style: "cancel" },
      { text: "Yes", onPress: () => handleDelete(id) },
    ]);
  };

  const handleDelete = async (id: Number) => {
    try {
      const result = await getScriptById(id);
      await deleteDownloadedBy(result.userID, result.docID)
      await deleteScript(id);
      fetchScripts(); // Refresh list after deletion
    } catch (error) {
      console.error("Error deleting script:", error);
    }
  };


  return (
    <View style ={styles.container}>
      <Text style={styles.header}>Search Script</Text>
      <View style= {styles.searchContainer}>
        <TextInput style = {styles.searchInput} placeholder='Search scripts' value= {searchText} clearButtonMode='always'
        onChangeText={(text)=>setSearchText(text)}/>
        </View>

        <FlatList
        data={filteredScripts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.scriptItem}>
            
            <Feather name="file-text" size={24} color={"#000"} />
            <Link href={`/screens/${item.id}`}>
            <Text style={styles.scriptTitle}>{item.title}</Text>
            </Link>
            <TouchableOpacity onPress={() => confirmDelete(Number(item.id))}>
            
              <Feather name="trash-2" size={24} color="red" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No scripts to show</Text>
          </View>
        }
      />

        
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F8F8F8",  },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 20, textAlign: 'center' },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchInput: { flex: 1, height: 40 },
  favIcon: { marginLeft: 10 },
  dateFilter: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  dateText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 15,
  },
  dateButton: {
    padding: 10,
    backgroundColor: "#888",
    borderRadius: 10,
    alignItems: "center",
  },
  selectedDateButton: { backgroundColor: "#0172B2" },
  selectedDateText: { color: "#fff", fontWeight: "bold" },
  scriptItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  scriptTitle: { flex: 1, marginLeft: 10, fontSize: 16 },
  emptyContainer: {},
  emptyText :{}
});
export default Search;