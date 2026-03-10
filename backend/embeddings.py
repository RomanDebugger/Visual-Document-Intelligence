from sentence_transformers import SentenceTransformer

class EmbeddingEngine:
    def __init__(self, model_name='all-MiniLM-L6-v2'):
        self.model = SentenceTransformer(model_name)

    def get_embeddings(self, text_list):
        return self.model.encode(text_list, show_progress_bar=True)

    def get_query_embedding(self, query):
        return self.model.encode([query])[0]

if __name__ == "__main__":
    engine = EmbeddingEngine()
    test_text = ["Hello world", "Machine learning is fun"]
    vectors = engine.get_embeddings(test_text)
    print(f"Vector size: {len(vectors[0])}")
    print("Successfully turned text into numbers!")