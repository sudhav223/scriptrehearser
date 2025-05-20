 import * as DocumentPicker from "expo-document-picker";
 import * as FileSystem from "expo-file-system";
 import { getCurrentUserdetails, insertCharacters, insertScript } from "./dbservice";
 import{extractText} from "./client";
import { addscript } from "./appwriteservices";


//https://docs.expo.dev/versions/latest/sdk/document-picker/
 export const pickDocument = async() =>{
    try{
        const res = await DocumentPicker.getDocumentAsync({
            type:["application/pdf", "application/msword", 
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        });

        if(res.canceled || !res.assets) return;

        const fileUri = res.assets[0].uri;
        const fileName = res.assets[0].name;
        const fileType = res.assets[0].mimeType;

        

        //conver the pdf to Blob bas64 binary 
        const fileBlob = await FileSystem.readAsStringAsync
        (fileUri,{encoding: FileSystem.EncodingType.Base64});

        

        const rec= await extractText(res.assets[0]);  
       
        //console.log("text from client.js:",text);
        //console.log("................................................")   
        
        
    //console.log("rec returned:", rec); 

    if (!rec || !rec.data) {
      console.error("extractText did not return valid data");
      return;
    }

    const { text, characters } = rec.data;

    //console.log("Extracted text:", text);
    //console.log("Character list:", characters);
    const {userID, email} = await getCurrentUserdetails();
  const result = await addscript(userID, email, text, characters, fileName);

    if (result.status === 'success') {
    
      alert("Script added successfully!");

      console.log("doc ID after uploading : ", result.docID)

      // Add script to local
      const scriptID = await insertScript(fileName, fileBlob, fileUri, text.toString(),result.docID.toString());

      await insertCharacters(characters, parseInt(scriptID.toString(), 10), 1.0, 1.0);

      console.log("Script inserted successfully:", fileName);
      console.log("Script file URI:", fileUri);
    } else if (result.status === 'duplicate') {
      alert("Script already exists. Upload skipped.");
    } else {
      alert("Error uploading script. Please try again.");
    }


    } catch(error){
        console.error("Document error",error);
    }
 };


 export const scriptExtract = async() => {

 }