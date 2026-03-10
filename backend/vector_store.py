import faiss
import numpy as np

class VectorDatabase:
    def __init__(self, dimension=384):
        self.index = faiss.IndexFlatL2(dimension)
        self.chunks = []

    def add_to_index(self, embeddings, text_chunks):
        vector_data = np.array(embeddings).astype('float32')
        self.index.add(vector_data)
        self.chunks.extend(text_chunks)

    def search(self, query_vector, k=3):
        query_vector = np.array([query_vector]).astype('float32')
        distances, indices = self.index.search(query_vector, k)
        
        results = []
        for i, idx in enumerate(indices[0]):
            if idx != -1:
                results.append({
                    "content": self.chunks[idx]["content"],
                    "page": self.chunks[idx]["metadata"]["page"],
                    "score": float(distances[0][i])
                })
        return results