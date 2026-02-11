from langchain_text_splitters import RecursiveCharacterTextSplitter

class DocumentChunker:
    def __init__(self, chunk_size=600, chunk_overlap=50):
        # This splitter tries to split on double newlines, then single, then spaces
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )

    def create_chunks(self, extracted_pages):
        """
        Takes output from PDFIngestor and returns a list of chunks with metadata.
        """
        final_chunks = []
        
        for item in extracted_pages:
            page_text = item['content']
            page_num = item['page_num']
            
            # Split the text of this specific page
            texts = self.splitter.split_text(page_text)
            
            for i, chunk in enumerate(texts):
                final_chunks.append({
                    "chunk_id": f"p{page_num}-c{i}",
                    "content": chunk,
                    "metadata": {
                        "page": page_num,
                        "char_count": len(chunk)
                    }
                })
        
        return final_chunks

if __name__ == "__main__":
    # Quick test logic
    sample_data = [{"page_num": 1, "content": "This is a long sentence for testing the chunker. " * 20}]
    chunker = DocumentChunker()
    chunks = chunker.create_chunks(sample_data)
    print(f"Created {len(chunks)} chunks.")
    print(f"First chunk: {chunks[0]['content'][:50]}...")