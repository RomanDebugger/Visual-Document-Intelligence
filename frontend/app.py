import streamlit as st
import requests
import pandas as pd

st.set_page_config(page_title="Visual Doc Intel", layout="wide")

st.title("📄 Visual Document Intelligence System")
st.markdown("---")

# Sidebar for Upload
with st.sidebar:
    st.header("1. Upload Document")
    uploaded_file = st.file_location = st.file_uploader("Choose a PDF", type="pdf")
    if st.button("Process Document"):
        if uploaded_file:
            with st.spinner("Processing..."):
                files = {"file": uploaded_file.getvalue()}
                response = requests.post("http://backend:8000/upload", files={"file": (uploaded_file.name, uploaded_file.getvalue())})
                st.success(response.json()['message'])
        else:
            st.error("Please select a file first.")

# Main Chat Interface
st.header("2. Semantic Search & AI Answer")
query = st.text_input("Ask a question about your document:")

if st.button("Ask AI"):
    if query:
        with st.spinner("Searching Vector DB & Generating Answer..."):
            res = requests.post("http://backend:8000/ask", json={"question": query})
            data = res.json()
            
            # Show the Gemini Answer
            st.subheader("🤖 AI Response")
            st.info(data['answer'])
            
            # Show the "Visual" part: The Sources and Scores
            st.subheader("📊 Visual Evidence (Explainability)")
            
            # Create a table for the sources
            source_df = pd.DataFrame([
                {"Page": s['page'], "Relevance Score": round(s['score'], 4), "Snippet": s['content'][:200] + "..."}
                for s in data['sources']
            ])
            st.table(source_df)
            
            # Small bar chart for scores
            st.bar_chart(source_df.set_index("Page")["Relevance Score"])
    else:
        st.warning("Please enter a question.")