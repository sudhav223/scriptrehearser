from fastapi import FastAPI, UploadFile,File 
from pydantic import BaseModel
import fitz  # PyMuPDF
import re
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class NameRequest(BaseModel):
    name: str

class SimilarityRequest(BaseModel):
    sentence1: str
    sentence2: str


@app.post("/connect")
async def say_hello(request: NameRequest):
    return {"message": f"{request.name} established"}


def extract_text_from_pdf(pdf_bytes):
    """Extract text from PDF bytes."""
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")  
        text = "\n".join(page.get_text() for page in doc)  
        return text
    except Exception as e:
        return f"Error extracting text: {e}"


def extract_character_names(script_text: str):
    lines = script_text.splitlines()
    possible_names = set()

    for i, line in enumerate(lines):
        line_stripped = line.strip()

        if not line_stripped or len(line_stripped) > 40:
            continue

        name = None

        #COLON style example NAME:
        if re.match(r"^[A-Z][A-Z\s\-']{1,30}:", line_stripped):
            name = line_stripped.split(":")[0].strip()

        #ALL CAPS name followed by dialogue
        elif (
            line_stripped.isupper()
            and i + 1 < len(lines)
            and lines[i + 1].strip()
            and not lines[i + 1].strip().isupper()
        ):
            name = line_stripped

        if name:
            # Normalize name
            name = re.sub(r"\s*\(?(CONT'?D|CONT)\)?", "", name, flags=re.IGNORECASE)
            name = re.sub(r"[^\w\s'-]", "", name).strip()

            #Allow 1 or 2 word names only
            word_count = len(name.split())
            if word_count == 0 or word_count > 2:
                continue

            # 🧹 Filter out scene directions / headers
            if any(word in name for word in ["INT", "EXT", "BY", "SCENE", "ACT", "DAY", "NIGHT"]):
                continue

            possible_names.add(name)

    return sorted(possible_names)

@app.post("/extracttext")
async def extract_text(file: UploadFile = File(...)):
    """API endpoint to extract text from a Base64 PDF string."""
    try:
        # Read the uploaded file
        pdf_bytes = await file.read()
        extracted_text = extract_text_from_pdf(pdf_bytes)
        character_names = extract_character_names(extracted_text)
        
        return {"text": extracted_text, "characters": character_names}
    except Exception as e:
        return {"error": f"Failed to process PDF: {e}"}



# Initialize the model 
similarity_model = SentenceTransformer('bert-base-nli-mean-tokens')



@app.post("/similarity")
async def calculate_similarity(data: SimilarityRequest):
    try:
        # Encode the sentences
        vectors = similarity_model.encode([data.sentence1, data.sentence2])
        similarity = cosine_similarity([vectors[0]], [vectors[1]])[0][0]
        similarity_percent = float(round(similarity * 100, 2))

        # Determine color based on the similarity percentage 
        if similarity_percent >= 90:
            color = "green"
        elif similarity_percent >= 70:
            color = "orange"
        else:
            color = "red"

        return {
            "similarity_percent": similarity_percent,
            "color": color
        }
    except Exception as e:
        return {"error": f"Similarity calculation failed: {str(e)}"}
    
 






if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)