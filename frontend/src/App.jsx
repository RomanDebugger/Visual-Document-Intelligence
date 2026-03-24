import { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Select a PDF");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await fetch("http://backend:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      alert(data.message);
    } catch {
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async () => {
    if (!question) return;

    const userMsg = { type: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");

    try {
      setLoading(true);

      const res = await fetch("http://backend:8000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      const aiMsg = {
        type: "ai",
        text: data.answer,
        sources: data.sources,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      
      {/* Sidebar */}
      <div className="sidebar">
        <h2>📄 Doc Intel</h2>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Processing..." : "Upload PDF"}
        </button>
      </div>

      {/* Chat Section */}
      <div className="main">
        <h1>💬 Chat with your document</h1>

        <div className="chat-box">
          {messages.length === 0 ? (
            <p className="placeholder">Ask anything about your PDF...</p>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`message ${msg.type}`}>
                
                <div className="bubble">
                  {msg.text}
                </div>

                {/* Show sources for AI */}
                {msg.type === "ai" && msg.sources && (
                  <div className="sources">
                    {msg.sources.slice(0, 3).map((s, idx) => (
                      <div key={idx} className="source-card">
                        <p><b>Page:</b> {s.page}</p>
                        <p><b>Score:</b> {s.score.toFixed(3)}</p>
                        <p className="snippet">{s.content.slice(0, 120)}...</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}

          {loading && <p className="loading">Thinking...</p>}
        </div>

        <div className="input-area">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask something..."
          />
          <button onClick={handleAsk} disabled={loading}>
            Ask
          </button>
        </div>
      </div>

      {/* Right Panel */}
      <div className="right-panel">
        <h2>📊 Insights</h2>
        <p className="placeholder">Visual analytics coming soon...</p>
      </div>

    </div>
  );
}

export default App;