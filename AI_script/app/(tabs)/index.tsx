import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import {Feather} from '@expo/vector-icons';
import {pickDocument} from '../services/docservice.js';
import { createDatabase, getAllScripts, insertCharacters, insertScript } from '../services/dbservice';
import * as FileSystem from "expo-file-system";
import { Asset } from 'expo-asset';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { copyAsync } from 'expo-file-system';
import {apiconnect, extractText } from "../services/client";
import { initializeNotifications } from "../lib/notification";
import {scheduleNotificationsForScripts} from "../services/notificationservices"
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useFocusEffect } from 'expo-router';




const Upload = () =>{
  const[selectedOption, setSelectedOption] = useState('upload');
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('');
  



  const storeAssetFileAsBlob = async (assetPath: string, fileName:string) => {
    try {
      // Get the asset (from the assets folder)
      const asset = Asset.fromModule(assetPath);
      await asset.downloadAsync(); 
  
      const assetUri = asset.localUri; // Get the local file path
  
      // Define a new location in documentDirectory
      const newFileUri = FileSystem.documentDirectory + fileName;
  
      // Copy the asset to a writable location
      await FileSystem.copyAsync({
        from: assetUri,
        to: newFileUri,
      });
  
      // Read the file as Base64 (convert to BLOB)
      const fileContent = await FileSystem.readAsStringAsync(newFileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const str = `In this 2 person comedy scene, Lucia and Arnold are on a first date but the trouble is that they are 
from different time periods in history. From the play Over The Moon. 
LUCIA: What do you do for a living? 
ARNOLD: I manage the land. 
LUCIA: You’re a real estate guy. I figured you’d be something like that. I work at a nail salon. I’m really 
great with nails, always been great with nails. Wanted to be an artist originally like a great painter 
but settled on doing nails. 
ARNOLD: You’re incredible. 
LUCIA: I’m a nail technician. 
ARNOLD: And that makes you incredible. Can you paint my nails? 
LUCIA: Really? Well, I guess I can if..(she searches her bag) Ah! You’re in luck. I usually carry a few 
colors of nail polish with me wherever I go. It keeps me calm just knowing they’re with me. Like a 
comfort thing. Do you care what color I use on you? 
ARNOLD: Not at all. 
LUCIA: Cool. 
Lucia begins painting Arnold’s nails. 
ARNOLD: Fascinating. 
LUCIA: Yeah, started doing this since I could walk and talk. And since the moon is out, I’m going to 
place a tiny moon right there on your pinkie as a reminder of our special night. 
ARNOLD: You’re too kind. 
LUCIA: Don’t mention it. I mean, I can always go back to painting on canvas. I still have a few of them 
canvases laying around my apartment. It’s not like I can’t pick up the brush at any time. My hands 
still work. (beat) You like that? 
Arnold holds up his hand and stares in awe. 
ARNOLD: Magnificent.`;
      // Now store the file in SQLite
      const samplescriptID = await insertScript("sample script 1",fileContent,newFileUri.toString(),str);
      
      const samplechar = ['LUCIA', 'ARNOLD']
      await insertCharacters(samplechar,samplescriptID,1.0,1.0);
  
      console.log('File stored in SQLite successfully!');
  
    } catch (error) {
      console.error('Error storing asset file:', error);
    }
  };
  

  useEffect(() => {
    const initDB = async () => {
      try {
        await createDatabase();
        console.log("Database initialized successfully");
        
        await initializeNotifications();
        await scheduleNotificationsForScripts();
        const userInfo = await GoogleSignin.getCurrentUser();
              if (userInfo) {
                setName(userInfo.user.name || '')
              setPhoto(userInfo.user.photo || '');
            }
        await apiconnect();
      } catch (error) {
        console.error("Database initialization failed:", error);
      }
    };

   

   

    const samplescript = async() =>{
      try{
        const alreadyStored = await AsyncStorage.getItem("sampleScriptUploaded");
        const data = await getAllScripts();
        if(data.length === 0){
          await AsyncStorage.setItem("sampleScriptUploaded", "false");
        }
        if (alreadyStored && (data.length!=0)) {
          console.log("Sample script already uploaded, skipping...");
          return;
        }
      const fileURI = require('../sampleScripts/what_do_for_living.pdf');
      storeAssetFileAsBlob(fileURI, "samplescript");
      
      
      console.log("sample script uploaded");
      await AsyncStorage.setItem("sampleScriptUploaded", "true");

    }catch(e){
    console.error("error uploading sample script",e);
  }
};


    initDB();
    samplescript();
  }, []);



  const alertDocupload = async ()=>{
    try {
      await pickDocument();
      Alert.alert("Success", "Script uploaded successfully");
      //console.log("Script upload success");
    } catch (error) {
      Alert.alert("Error", "Failed to upload script");
      console.error("Document upload failed:", error);
    }
  };
  return (
    <View>
      <Text style ={styles.header}>Hi {name}</Text>
      <Text style ={styles.header2}>Welcome Back!</Text>
      
      

      <View style= {styles.buttonContainer}>
        <TouchableOpacity style ={[styles.buttonText, selectedOption ==='upload' && styles.selected]} onPress={()=> setSelectedOption('upload')}>
          <Text style = {{color : selectedOption === 'upload' ? '#fff' : '#000', padding : 5 }}> Upload Doc</Text>
        </TouchableOpacity>

        <TouchableOpacity style ={[styles.buttonText, selectedOption ==='photo' && styles.selected]} onPress={()=> setSelectedOption('photo')}>
          <Text style = {{color : selectedOption === 'photo' ? '#fff' : '#000', padding : 5 }}> Take Photo</Text>
        </TouchableOpacity>
      </View>

      <View style={{alignItems : 'center', margin : 20}}>
        {selectedOption ==='upload'? (<>
        <View style = {styles.uploadcontainer} >
          <TouchableOpacity onPress={alertDocupload}>
          <Feather name='upload' size={40} color={'#fff'} style={{alignSelf: 'center'}}/>
          </TouchableOpacity>
          </View><Text style={ {fontSize: 18, fontWeight : 'bold', margin: 10}}>Upload Script Document</Text></>)
          : (<>
            <View style = {styles.uploadcontainer} >
              <Feather name='camera' size={40} color={'#fff'} style={{alignSelf: 'center'}}/></View><Text style={ {fontSize: 18, fontWeight : 'bold', margin: 10}}>Take a photo</Text></>)
              
        }
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
header: {
  fontSize : 24, fontWeight: 'bold', marginTop :10, marginBottom :10, marginLeft: 5,
},
header2: {
  fontSize : 18, fontWeight: 'bold', marginTop :10, marginBottom :10, marginLeft: 5,color : '#888888',
},
recentscripts : {
  fontSize : 16, fontWeight: '600', marginTop :10, marginBottom : 10, marginLeft: 20,
},
uploadbutton : {
  backgroundColor : '#333', marginVertical :5, borderRadius : 5, height: 50, width:50,
  justifyContent: 'center',
},
buttonContainer: { flexDirection: 'row', marginVertical: 2 , justifyContent : 'space-between', marginTop: 150},
buttonText:{ borderRadius : 10, height: 35, width: 'auto', marginHorizontal: 40 , alignContent : 'center', alignItems: 'center', borderBlockColor:'#0172B2', borderWidth: 0.75 }, 
selected :{ backgroundColor: '#0172B2' },
scriptalign: {flexDirection: 'row', gap: 15, margin: 20, }, 
scriptContainer:{ height: '40%', width :'30%', borderColor: '#0172B2', borderRadius: 20, backgroundColor :'#fff',
   alignContent: 'center', shadowColor : '#000', shadowOpacity : 0.9, shadowRadius : 50, borderTopColor : '#0172B2', borderWidth : 0.75,
 justifyContent: 'space-between', gap :10,},
scripticon :{alignItems:'center' , alignContent: 'center', textAlign: 'center', marginTop : 10,  },
scripttext :{alignItems:'center' , alignContent: 'center', textAlign: 'center', marginTop : 5, marginBottom : 15, },
uploadcontainer: {height : 60, width : 70, backgroundColor: '#0172B2', borderRadius : 20, justifyContent: 'center'},

})
export default Upload;