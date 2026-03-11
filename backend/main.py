from fastapi import FastAPI, UploadFile, File
import os
import shutil

from backend.query import RAGController

app = FastAPI()

query_engine = RAGController()

UPLOAD_DIR = "data/raw_docs"


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    query_engine.process_document(file_path)

    return {"message": "PDF uploaded and processed successfully"}


@app.get("/ask")
def ask_question(question: str):

    results = query_engine.query(question)

    return {"results": results}