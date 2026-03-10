# Visual Document Intelligence System

## Project Description

The Visual Document Intelligence System is a practical AI application designed to improve how users interact with PDF documents. Traditional search methods rely on exact keyword matching, which often fails when users use synonyms or related concepts. This system implements Semantic Search, allowing users to query documents based on meaning and intent.

The project is built as a Retrieval-Augmented Generation (RAG) prototype that emphasizes explainability by providing visual feedback on how the AI retrieved specific information.

## Problem Statement

Standard document search tools (like Ctrl+F) are limited by literal string matching. If a user searches for "financial health" but the document uses the term "fiscal stability," the search will return no results. Furthermore, many AI systems provide answers without showing the source or the confidence level of the retrieval. This project addresses these issues by:

1. Understanding the conceptual relationship between words.
2. Visualizing the relevance scores of retrieved document sections.
3. Mapping the exact location (page number) of the source material.

## Core Objectives

* Implement a text extraction pipeline for PDF documents.
* Apply a recursive chunking strategy to maintain context during processing.
* Generate high-dimensional vector embeddings to represent document meaning.
* Utilize a vector database for efficient similarity searching.
* Provide visual metrics to explain the AI's retrieval process.

## System Architecture

The system operates through a modular four-stage pipeline:

1. **Ingestion:** Extracts raw text from PDF files using the pypdf library.
2. **Processing:** Breaks long text into 600-character segments with a 50-character overlap to ensure no context is lost at the boundaries.
3. **Vectorization:** Converts text segments into 384-dimensional vectors using the Sentence-Transformers model (all-MiniLM-L6-v2).
4. **Retrieval:** Compares the user's question vector against the stored document vectors using the FAISS library to find the most mathematically similar content.

## Technical Stack

* **Language:** Python
* **API Framework:** FastAPI
* **AI Model:** Sentence-Transformers (all-MiniLM-L6-v2)
* **Vector Database:** FAISS (Facebook AI Similarity Search)
* **Data Handling:** Pandas, NumPy
* **Visualization:** Matplotlib / Plotly

## Project Structure

```
doc-intel/
├── backend/
│   ├── main.py           # API Entry point
│   ├── ingest.py         # Document extraction
│   ├── chunker.py        # Text processing logic
│   ├── embeddings.py     # Vector generation
│   ├── vector_store.py   # Database management
│   └── query.py          # Search and retrieval logic
├── data/
│   ├── raw_docs/         # Source PDF storage
│   └── index/            # Saved vector indices
├── requirements.txt      # Dependency list
└── README.md             # Documentation

```

## Functional Advantages

* **Contextual Awareness:** Recognizes synonyms and related topics.
* **Explainable Outputs:** Shows numerical relevance scores for every retrieved chunk.
* **Lightweight Deployment:** Designed to run on standard consumer hardware without requiring high-end GPUs.

## Conclusion

This system demonstrates a functional bridge between raw data and actionable intelligence. By focusing on semantic retrieval and visual explanation, it provides a transparent and efficient way to manage and query complex document collections.
