import * as SQLite from "expo-sqlite";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';


export const getCurrentUserID = async (): Promise<string> => {
  const currentUser = await GoogleSignin.getCurrentUser();

  if (!currentUser) {
    throw new Error("No user signed in");
  }

  const email = currentUser.user.email;
  const userID = await AsyncStorage.getItem(email);

  if (!userID) {
    throw new Error("UserID not found in AsyncStorage for email: " + email);
  }

  return userID;
};

export const getCurrentUserdetails = async (): Promise<{ userID: string; email: string; name: string}> => {
  const currentUser = await GoogleSignin.getCurrentUser();

  if (!currentUser) {
    throw new Error("No user signed in");
  }

  const email = currentUser.user.email;
  const name = currentUser.user.name;
  const userID = await AsyncStorage.getItem(email);

  if (!userID) {
    throw new Error("UserID not found in AsyncStorage for email: " + email);
  }

  return {userID,email, name};
};

//DROP TABLE IF EXISTS scripts;
//DROP TABLE IF EXISTS characters;
export const createDatabase = async() => {

try{
    const db = await SQLite.openDatabaseAsync("localdb");
        await db.execAsync(
            `
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS scripts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userID TEXT,
            docID TEXT,
            createdby TEXT,
            title TEXT,
            file BLOB,
            fileURI TEXT,
            content TEXT,
            character TEXT,
            lastnotified TEXT DEFAULT CURRENT_TIMESTAMP,
            dateCreated TEXT DEFAULT CURRENT_TIMESTAMP,
            deadline TEXT DEFAULT CURRENT_TIMESTAMP);`
        
        );
        //const schema = await db.getAllAsync('PRAGMA table_info(scripts);');
        //console.log("TABLE SCHEMA:",schema);
        console.log("script table created succesfully" );

        await db.execAsync(
            `
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS characters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scriptID INTEGER,
            userID TEXT,
            name TEXT,
            pitch FLOAT,
            rate FLOAT,
            voice TEXT,
            UNIQUE(name, scriptID)
        );`
        
        );
        console.log("characters table created succesfully" );
    
    }catch(e){
        console.error("Error creating DB", e);
    }
    };
    
 //DROP TABLE IF EXISTS scripts;   


export const insertScript = async(title, fileBlob, fileURI, content, docID = null, createdby = null) =>{
    try{
        const userID = await getCurrentUserID();
        const db = await SQLite.openDatabaseAsync("localdb");
        console.log("Inserting Script - Title:", title);
        const insertedScript=  await db.runAsync(
        `INSERT INTO scripts (userID, title, file, fileURI, content, docID, createdby)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,[userID, title, fileBlob, fileURI, content, docID, createdby]
        );
        const allRows = await db.getAllAsync('SELECT * FROM scripts');
        //console.log(allRows);
    //     for (const row of allRows) {
    //         console.log(row.id, row.title, row.fileURI, row.deadline);
        
      
    //  }
     console.log("last inserted id :", insertedScript.lastInsertRowId )
    return insertedScript.lastInsertRowId;   
    }catch(error){
        console.log("Upload failed", error);

    }
    };

export const insertCharacters = async(characters, scriptID, pitch , rate) =>{

    // Convert pitch and rate to floats
    const parsedPitch = parseFloat(pitch as string);
    const parsedRate = parseFloat(rate as string);
    const userID = await getCurrentUserID();
    const db = await SQLite.openDatabaseAsync("localdb");
    for (const name of characters){
    try{
        
        console.log("Inserting characters of ", scriptID);
    await db.runAsync(
        'INSERT OR IGNORE INTO characters ( userID, name, scriptID, pitch, rate ) VALUES (?,?,?,?,?)',userID, name, scriptID, parsedPitch, parsedRate
            
        );
       
        console.log(`Inserted: ${name} (Script ${scriptID})`);
    }catch(error){
        console.log("Upload failed", error);

    }
    };
}

export const updatecharactername = async(scriptID, character)=>{
    try{
        const db = await SQLite.openDatabaseAsync("localdb");
        const result = await db.runAsync('UPDATE scripts SET character = ? WHERE id = ?', character, scriptID);
        console.log(character, " INSERTED");
    }catch(error){
        console.error("Error inserting character", error);
    }
}

export const updateCharacterVoice = async (scriptID: number, name: string, pitch, rate, voice) => {
    try {
      const db = await SQLite.openDatabaseAsync("localdb");
      await db.runAsync(
        'UPDATE characters SET pitch = ?, rate = ?, voice = ? WHERE scriptID = ? AND name = ?',
        pitch, rate, voice, scriptID, name
      );
      console.log(`${name} updated voice:${voice}, pitch ${pitch}:, rate:${rate} `);
    } catch (error) {
      console.error("Error updating character's voice", error);
    }
  };

export const getAllCharacters = async(scriptID) =>{
    try{
        const db = await SQLite.openDatabaseAsync("localdb");
        const results = await db.getAllAsync(
            'SELECT * FROM characters WHERE scriptID =?',scriptID
        );
        console.log(" all characters are retrieved");
        return results;
    }catch(e)
    {
        console.error("ERROR fetching characters name:",e);
        return [];
    }

}


export const getAllScripts = async () => {
    const userID = await getCurrentUserID();
    console.log("current user ID: ", userID)
  try {
    const db = await SQLite.openDatabaseAsync("localdb");
    const result = await db.getAllAsync("SELECT * FROM scripts WHERE userID = ?", userID);
    //const result = await db.getAllAsync("SELECT * FROM scripts;",[]);
    // for (const row of result) {
    //         console.log(row.id, row.title, row.fileURI, row.deadline, row.userID);
    //       }
    console.log(`script of userID: ${userID} retrieved`)     
    return result
  } catch (error) {
    console.error("Error retrieving scripts", error);
    throw error;
  }
};

export const deleteScript = async(id)=>{
    try{
        const db = await SQLite.openDatabaseAsync("localdb");
        await db.runAsync("DELETE FROM scripts WHERE id = ?",id);
        console.log("script deleted successfully:",id);
        await db.runAsync("DELETE FROM characters WHERE scriptID =?",id);
        //const allRows = await db.getAllAsync('SELECT * FROM scripts');
        //console.log(allRows);
        // for (const row of allRows) {
        //     console.log(row.id, row.title);}
        //console.log("script deleted succesdfully, Script ID: ", id)
            // Delete associated progress from AsyncStorage
    const progressKey = `rehearsalResults_${id}`;
    await AsyncStorage.removeItem(progressKey);
    console.log("Progress deleted from AsyncStorage:", progressKey);
    }catch(error){
        console.error("Error deleting script",error);
        throw error;

    }
}

export const deletecharacter = async(id)=>{
    try{
        const db = await SQLite.openDatabaseAsync("localdb");
        await db.runAsync("DELETE FROM characters WHERE scriptID =?",id);
        console.log("character deleted successfully:",id);
        //const allRows = await db.getAllAsync('SELECT * FROM scripts');
        //console.log(allRows);
        // for (const row of allRows) {
        //     console.log(row.id, row.title);}
        //console.log("script deleted succesdfully, Script ID: ", id)

    }catch(error){
        console.error("Error deleting script",error);
        throw error;

    }
}


export const getScriptById = async(id)=>{
    try{ 
        console.log("script retrieving :",id);
        const db = await SQLite.openDatabaseAsync("localdb");
        const result= await db.getFirstAsync("SELECT * FROM scripts WHERE id = ?;",id);
        console.log("script retrieved successfully:",id);
        console.log("Title of the script :",result.title);
        return result;
    }catch(error){
        console.error("Error deleting script",error);
        throw error;

    }
}

//update deadline 
export const updateScriptDeadline = async (id, deadline) => {
    const db = await SQLite.openDatabaseAsync("localdb");
    console.log("script deadline updated succesfully")
    return await db.runAsync(
      'UPDATE scripts SET deadline = ? WHERE id = ?',
      deadline, id
    );
  };


  //reset database :

  export const resetDatabase = async() => {

    console.log("reset database");

try{
    const db = await SQLite.openDatabaseAsync("localdb");
        await db.execAsync(
            `
            PRAGMA journal_mode = WAL;
            DROP TABLE IF EXISTS scripts;
            CREATE TABLE IF NOT EXISTS scripts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userID TEXT,
            docID TEXT,
            createdby TEXT,
            title TEXT,
            file BLOB,
            fileURI TEXT,
            content TEXT,
            character TEXT,
            lastnotified TEXT DEFAULT CURRENT_TIMESTAMP,
            dateCreated TEXT DEFAULT CURRENT_TIMESTAMP,
            deadline TEXT DEFAULT CURRENT_TIMESTAMP);`
        
        );
        //const schema = await db.getAllAsync('PRAGMA table_info(scripts);');
        //console.log("TABLE SCHEMA:",schema);
        console.log("script table created succesfully" );

        await db.execAsync(
            `
            PRAGMA journal_mode = WAL;
            DROP TABLE IF EXISTS characters;
            CREATE TABLE IF NOT EXISTS characters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scriptID INTEGER,
            userID TEXT,
            name TEXT,
            pitch FLOAT,
            rate FLOAT,
            voice TEXT,
            UNIQUE(name, scriptID)
        );`
        
        );
        console.log("characters table created succesfully" );
    
    }catch(e){
        console.error("Error creating DB", e);
    }
    };