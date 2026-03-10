from backend.ingest import PDFIngestor
from backend.chunker import DocumentChunker
from backend.embeddings import EmbeddingEngine
from backend.vector_store import VectorDatabase

class RAGController:
    def __init__(self):
        self.ingestor = PDFIngestor()
        self.chunker = DocumentChunker()
        self.embedder = EmbeddingEngine()
        self.vdb = VectorDatabase()

    def setup_document(self, pdf_path):
        """
        Runs the full pipeline: Ingest -> Chunk -> Embed -> Store
        """
        print(f"--- Processing: {pdf_path} ---")
        pages = self.ingestor.extract_text(pdf_path)
        chunks = self.chunker.create_chunks(pages)
        
        texts = [c['content'] for c in chunks]
        embeddings = self.embedder.get_embeddings(texts)
        
        self.vdb.add_to_index(embeddings, chunks)
        print("--- Document Ready for Queries ---")

    def ask(self, question):
        """
        The search part: Question -> Vector -> Search -> Results
        """
        query_vector = self.embedder.get_query_embedding(question)
        
        results = self.vdb.search(query_vector, k=3)
        return results

if __name__ == "__main__":
    ctrl = RAGController()
    pdf = "data/raw_docs/sample.pdf"
    
    import os
    if os.path.exists(pdf):
        ctrl.setup_document(pdf)
        answer_chunks = ctrl.ask("What is the main summary?")
        
        for i, res in enumerate(answer_chunks):
            print(f"\nResult {i+1} (Page {res['page']}):")
            print(f"Content: {res['content'][:150]}...")
    else:
        print("Please add a sample.pdf to data/raw_docs/ to test.")