import axios from "axios";
import { BASE_URL } from '../constants/config';


export const apiconnect= async() =>{
  const name = "connection";
try{
  const response = await axios.post(`${BASE_URL}/connect`, { name });
  //const response = await axios.post("http://10.235.199.199:8000/connect", { name });//pc
  console.log("response:",response.data);
}catch(e){
  console.error("error connecting",e);
}
}


export const extractText = async (file) => {
  try {
    const apiUrl = `${BASE_URL}/extracttext`;
    //const apiUrl = "http://10.235.199.199:8000/extracttext";//pc

    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,               // URI of the file
      name: file.name,             // File name
      type: "application/pdf"      // file type
    });

    // Send to FastAPI
    const res = await axios.post(apiUrl,formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    console.log("Character list: ",res.data.characters)
    //console.log("Extracted text:", res.data.text);
    return res; 
  } catch (error) {
    console.error("Error extracting text:", error);
    return error;
  }
};
