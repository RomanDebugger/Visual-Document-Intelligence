import os
from pypdf import PdfReader

class PDFIngestor:
    @staticmethod
    def extract_text(file_path):
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
            
        reader = PdfReader(file_path)
        pages_content = []
        
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                pages_content.append({
                    "page_num": i + 1,
                    "content": text.strip()
                })
        return pages_content

if __name__ == "__main__":
    test_path = "data/raw_docs/sample.pdf"
    if os.path.exists(test_path):
        data = PDFIngestor.extract_text(test_path)
        print(f"Extracted {len(data)} pages.")