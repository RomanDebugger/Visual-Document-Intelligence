import os
import google.generativeai as genai
from dotenv import load_dotenv

from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel

from backend.ingest import PDFIngestor
from backend.chunker import DocumentChunker
from backend.embeddings import EmbeddingEngine
from backend.vector_store import VectorDatabase
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    question: str


class RAGController:
    def __init__(self):
        self.ingestor = PDFIngestor()
        self.chunker = DocumentChunker()
        self.embedder = EmbeddingEngine()
        self.vdb = VectorDatabase()

    def setup_document(self, pdf_path):

        print(f"--- Processing: {pdf_path} ---")

        pages = self.ingestor.extract_text(pdf_path)
        chunks = self.chunker.create_chunks(pages)

        texts = [c["content"] for c in chunks]
        embeddings = self.embedder.get_embeddings(texts)

        self.vdb.add_to_index(embeddings, chunks)

        print("--- Document Ready for Queries ---")

    def ask(self, question):

        query_vector = self.embedder.get_query_embedding(question)

        results = self.vdb.search(query_vector, k=3)

        context = "\n\n".join([r["content"] for r in results])

        prompt = f"""
You are a helpful AI assistant.

Use the following document context to answer the question.

Context:
{context}

Question:
{question}

Provide a clear and concise answer.
"""

        response = model.generate_content(prompt)

        return {
            "answer": response.text,
            "sources": results
        }


# Initialize controller
rag = RAGController()


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    file_location = f"data/raw_docs/{file.filename}"

    with open(file_location, "wb") as f:
        f.write(await file.read())

    rag.setup_document(file_location)

    return {"message": "PDF uploaded and processed successfully"}


@app.post("/ask")
def ask_question(query: QueryRequest):

    result = rag.ask(query.question)

    return result