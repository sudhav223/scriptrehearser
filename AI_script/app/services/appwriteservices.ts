import {config, database} from '../lib/appwrtie';
import { ID, Query } from 'react-native-appwrite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUserdetails, insertCharacters, insertScript } from './dbservice';

export const getcloudscripts = async () => {
    try{
        
        const {documents, total} = await database.listDocuments(config.db, config.col.cloudscripts)
        console.log("cloud script retrieved", total);
        return documents;
    }catch(error)
    {
        console.error(error)
        return error
    }
};
     
 


export const adduser = async (email: string, username: string) => {
  try {
    console.log("Checking if user already exists...");

    // 1. Check if email already exists in the collection
    const existing = await database.listDocuments(
      config.db,
      config.col.user,
      [Query.equal("email", email)]
    );

    if (existing.total > 0) {
      const existingId = existing.documents[0].$id;
      console.log("User already exists with ID:", existingId);

      // save it in AsyncStorage anyway
      await AsyncStorage.setItem(email, existingId);

      return existingId;
    }

    // 2. Email not found — create a new user
    const response = await database.createDocument(
      config.db,
      config.col.user,
      ID.unique(),
      {
        email,
        username,
      }
    );

    const newId = response.$id;
    await AsyncStorage.setItem(email, newId);

    console.log(`New user created with ID: ${newId}`);
    return newId;

  } catch (error) {
    console.error("Error in adduser:", error);
    return null;
  }
};

export const addscript = async (
  uploadedby: string,
  useremail: string,
  content: string,
  characterlist: string,
  title: string
) => {
  try {
    // Check if script with same useremail, title and characterlist already exists
    const existing = await database.listDocuments(
      config.db,
      config.col.cloudscripts,
      [
        Query.equal('useremail', useremail),
        Query.equal('title', title),
        Query.equal('characterlist', characterlist)
      ]
    );

    if (existing.total > 0) {
      console.log('Duplicate script. Upload skipped.');
      return { status: 'duplicate', message: 'Script already exists' };
    }

    // Create new script
    const response = await database.createDocument(
      config.db,
      config.col.cloudscripts,
      ID.unique(),
      {
        uploadedby,
        useremail,
        content,
        characterlist,
        title
      }
    );

    console.log('Script uploaded:', response);
    console.log('Document ID:', response?.$id);
    return { status: 'success', data: response, docID: response.$id };

  } catch (error) {
    console.error('Error uploading script:', error);
    return { status: 'error', error };
  }
};


export const deletescript = async (scriptId: string, userId: string) => {
  try {
    // Fetch script by scriptId
    const script = await database.getDocument(config.db, config.col.cloudscripts, scriptId);

    // Check if the uploadedby matches the userId
    if (script.uploadedby !== userId) {
      console.log('You are not authorized to delete this script');
      return { status: 'unauthorized', message: 'User does not have permission to delete this script' };
    }

    // Proceed to delete the script
    const response = await database.deleteDocument(config.db, config.col.cloudscripts, scriptId);
    const deleteResponse = await deleteprogress(scriptId);
    console.log('Script deleted:', scriptId);
    return { status: 'success', message: 'Script deleted successfully' };

  } catch (error) {
    console.error('Error deleting script:', error);
    return { status: 'error', error };
  }
};

export const updateDownloadedBy = async (userId: string, scriptId: string) => {
  try {
    // Fetch the script by scriptId
    const script = await database.getDocument(config.db, config.col.cloudscripts, scriptId);

    // Check if the uploadedby is not the same as the userId
    if (script.uploadedby === userId) {
      console.log('You cannot download your own script');
      return { status: 'error', message: 'You cannot download your own script' };
    }

    // Check if the userId is already in the downloadedby array
    if (script.downloadedby && script.downloadedby.includes(userId)) {
      console.log('User has already downloaded this script');
      return { status: 'error', message: 'User has already downloaded this script' };
    }

    // Update the downloadedby array to include the userId
    const updatedDownloadedBy = script.downloadedby ? [...script.downloadedby, userId] : [userId];

    // Update the script document with the new downloadedby field
    const updatedScript = await database.updateDocument(config.db, config.col.cloudscripts, scriptId, {
      downloadedby: updatedDownloadedBy
    });

    console.log('Downloadedby updated:', updatedScript.downloadedby);
    return { status: 'success', message: 'Downloadedby updated successfully', data: updatedScript };

  } catch (error) {
    console.error('Error updating downloadedby:', error);
    return { status: 'error', message: 'An error occurred while updating' };
  }
};

export const getprogress = async (scriptid: string) => {
  try {
    console.log("Fetching progress for script:", scriptid);

    // Use a query to filter documents where the scriptid matches
    const query = Query.equal('scriptid', scriptid);

    // Get the documents from the database
    const { documents, total } = await database.listDocuments(config.db, config.col.progress, [query]);

    console.log('Fetched documents:', documents);

    // Return the documents matching the scriptid
    return documents;
  } catch (error) {
    console.error('Error fetching progress:', error);
    return { error: 'Error fetching progress' };
  }
};


export const updateProgress = async (
  scriptID: string,
  userID: string,
  username: string,
  title: string,  
  progress: number,
  accuracy: number
) => {
  try {
    // 1. Check if document exists for this script + user
    const existing = await database.listDocuments(config.db, config.col.progress, [
      Query.equal('scriptid', scriptID),
      Query.equal('userid', userID),
    ]);

    if (existing.total > 0) {
      // 2. If exists, update the first matching document
      const docId = existing.documents[0].$id;
      const updated = await database.updateDocument(config.db, config.col.progress, docId, {
        title,
        progress,
        accuracy,
      });

      console.log('Progress updated new progress', progress );
      return updated;
    } else {
      // 3. If not exists, create new document
      const newDoc = await database.createDocument(config.db, config.col.progress, ID.unique(), {
        scriptid: scriptID,
        userid: userID,
        username,
        title,
        progress,
        accuracy,
      });

      console.log('Progress created:', newDoc);
      return newDoc;
    }
  } catch (error) {
    console.error('Error in updateProgress:', error);
    return { error };
  }
};

export const deleteprogress = async (scriptid: string) => {
  try {
    console.log("Deleting progress for script:", scriptid);

    // Use a query to filter documents where the scriptid matches
    const query = Query.equal('scriptid', scriptid);

    // Get the documents from the database
    const { documents, total } = await database.listDocuments(config.db, config.col.progress, [query]);

    // If no documents are found
    if (total === 0) {
      console.log('No progress found for this script ID');
      return { message: 'No progress found for this script ID' };
    }

    // Loop through the documents and delete each one
    for (const doc of documents) {
      const docId = doc.$id;
      
      // Delete the document using its ID
      await database.deleteDocument(config.db, config.col.progress, docId);
      console.log(`Deleted progress document with ID: ${docId}`);
    }

    return { message: 'Progress deleted successfully' };
  } catch (error) {
    console.error('Error deleting progress:', error);
    return { error: 'Error deleting progress' };
  }
};

export const downloadScriptFromAppwriteToLocal = async (scriptID: string) => {
  try {
    const { userID } = await getCurrentUserdetails();

    // Fetch the script document from Appwrite
    const script = await database.getDocument(
      config.db,
      config.col.cloudscripts,
      scriptID
    );

    if (!script) {
      console.warn("Script not found with ID:", scriptID);
      alert("Script not found.");
      return;
    }

    // Early check: prevent re-downloads
    if (script.uploadedby === userID) {
      alert("You cannot download your own script.");
      return;
    }

    if (script.downloadedby && script.downloadedby.includes(userID)) {
      alert("You have already downloaded this script.");
      return;
    }

    const { content, title, characterlist } = script;

    // Insert script locally
    const localScriptID = await insertScript(
      title,
      "", // No fileBlob
      "", // No file URI
      content,scriptID,script.uploadedby
    );

    await insertCharacters(characterlist, parseInt(localScriptID.toString(), 10), 1.0, 1.0);

    // Mark as downloaded
    const updateResult = await updateDownloadedBy(userID, scriptID);
    if (updateResult.status === 'success') {
      console.log(`Marked script "${title}" as downloaded by ${userID}`);
    } else {
      console.warn(`Download tracking failed: ${updateResult.message}`);
    }

    alert(`Script "${title}" downloaded successfully.`);
  } catch (error) {
    console.error("Error syncing script:", error);
    alert("Failed to sync script.");
  }
};

export const deleteDownloadedBy = async (userId: string, scriptId: string) => {
  try {
    // Fetch the script document
    const script = await database.getDocument(config.db, config.col.cloudscripts, scriptId);

    // Check if the userId is in the downloadedby array
    if (!script.downloadedby || !script.downloadedby.includes(userId)) {
      console.log("User not in downloadedby list");
      return { status: 'error', message: 'User not found in downloadedby list' };
    }

    // Filter out the userId
    const updatedDownloadedBy = script.downloadedby.filter((id: string) => id !== userId);

    // Update the document
    const updatedScript = await database.updateDocument(config.db, config.col.cloudscripts, scriptId, {
      downloadedby: updatedDownloadedBy
    });

    console.log('User removed from downloadedby:', updatedScript.downloadedby);
    return { status: 'success', message: 'User removed from downloadedby', data: updatedScript };

  } catch (error) {
    console.error('Error removing user from downloadedby:', error);
    return { status: 'error', message: 'An error occurred while updating the document' };
  }
};


