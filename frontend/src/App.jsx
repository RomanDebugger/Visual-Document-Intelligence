import { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://backend:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      alert(data.message);
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    }
  };
const handleAsk = async () => {
  if (!question) return;

  const userMessage = { type: "user", text: question };

  setMessages((prev) => [...prev, userMessage]);

  try {
    const res = await fetch("http://backend:8000/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();

    const aiMessage = {
      type: "ai",
      text: data.answer,
      sources: data.sources,
    };

    setMessages((prev) => [...prev, aiMessage]);

    setQuestion("");
  } catch (error) {
    console.error(error);
  }
};

  return (
    <div className="container">

      {/* Sidebar */}
      <div className="sidebar">
        <h2>📂 Upload</h2>

        <input 
          type="file" 
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button onClick={handleUpload}>
          Upload PDF
        </button>
      </div>

      {/* Main Chat */}
      <div className="main">
        <h1>💬 Chat with Document</h1>

        <div className="chat-box">
          {messages.length === 0 ? (
            <p className="placeholder">Chat will appear here...</p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  textAlign: msg.type === "user" ? "right" : "left",
                  marginBottom: "10px",
                }}
              >
                <span
                  style={{
                    background: msg.type === "user" ? "#3b82f6" : "#334155",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    display: "inline-block",
                  }}
                >
                  {msg.text}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="input-area">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask something..."
          />
          <button onClick={handleAsk}>Ask</button>
        </div>
      </div>

      {/* Right Panel */}
      <div className="right-panel">
        <h2>📊 Insights</h2>
        <p className="placeholder">Graphs will appear here...</p>
      </div>

    </div>
  );
}

export default App;