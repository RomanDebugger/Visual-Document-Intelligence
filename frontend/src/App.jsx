import { useState } from "react";
import "./App.css";

export default function App() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [docLoaded, setDocLoaded] = useState(false);
  const [docName, setDocName] = useState("");
  const [stats, setStats] = useState({ pages: "—", chunks: "—", queries: 0, sources: 0 });
  const [activity, setActivity] = useState([{ text: "Session started", color: "#6b7fa3", time: now() }]);
  const [scores, setScores] = useState([]);
  const [topics, setTopics] = useState([]);

  function now() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function addActivity(text, color) {
    setActivity((prev) => [{ text, color, time: now() }, ...prev].slice(0, 6));
  }

  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file || loading) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("http://localhost:8000/upload", { method: "POST", body: formData });
      const data = await res.json();
      setDocLoaded(true);
      setDocName(file.name);
      setStats((s) => ({ ...s, pages: data.pages || "—", chunks: data.chunks || "—" }));
      addActivity("Document processed", "#22c55e");
    } catch {
      setDocLoaded(true);
      setDocName(file.name);
      setStats((s) => ({ ...s, pages: "12", chunks: "48" }));
      addActivity("Document processed (demo)", "#22c55e");
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim() || loading) return;
    const q = question.trim();
    setQuestion("");
    setLoading(true);
    setMessages((prev) => [...prev, { type: "user", text: q, time: now() }]);

    try {
      const res = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { type: "ai", text: data.answer, sources: data.sources, time: now() }]);
      if (data.sources) {
        setScores(data.sources.slice(0, 3));
        setStats((s) => ({ ...s, sources: s.sources + data.sources.length }));
      }
    } catch {
      const demoAns = `Demo response for: "${q}". Connect your backend at http://localhost:8000 to get real answers.`;
      const demoSources = [
        { page: 3, score: 0.91, content: "Sample source excerpt from the document that matched your query closely." },
        { page: 7, score: 0.74, content: "Another relevant passage from the document containing useful context." },
      ];
      setMessages((prev) => [...prev, { type: "ai", text: demoAns, sources: demoSources, time: now() }]);
      setScores(demoSources);
      setStats((s) => ({ ...s, sources: s.sources + 2 }));
    }

    setStats((s) => ({ ...s, queries: s.queries + 1 }));
    addActivity(`"${q.slice(0, 28)}${q.length > 28 ? "…" : ""}"`, "#3b82f6");
    const topic = q.split(" ").find((w) => w.length > 4) || q.split(" ")[0];
    if (topic) setTopics((prev) => [...new Set([...prev, topic.toLowerCase()])]);
    setLoading(false);
  };

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">⚡</div>
            Doc<span>Intel</span>
          </div>
        </div>
        <div className="sidebar-body">
          <div>
            <div className="section-label">Upload Document</div>
            <label className={`upload-zone ${file ? "has-file" : ""}`}>
              <input type="file" accept=".pdf" onChange={handleFileSelect} />
              <span className="upload-icon">📄</span>
              <div className="upload-label">
                <strong>{file ? file.name.slice(0, 22) + (file.name.length > 22 ? "…" : "") : "Drop PDF here"}</strong>
                {file ? `${(file.size / 1024).toFixed(0)} KB · PDF` : "or click to browse"}
              </div>
            </label>
          </div>

          <button className="btn btn-primary" onClick={handleUpload} disabled={!file || loading}>
            {loading ? "⏳ Processing…" : docLoaded ? "✓ Processed" : "↑ Process Document"}
          </button>

          <div className="sidebar-docs">
            <div className="section-label">Loaded Documents</div>
            {docLoaded ? (
              <div className="doc-item">
                <div className="doc-dot ready" />
                <div className="doc-text">{docName}</div>
              </div>
            ) : (
              <div className="empty-docs">No documents yet</div>
            )}
          </div>

          {docLoaded && (
            <div className="sidebar-stats">
              {[["pages", stats.pages], ["chunks", stats.chunks], ["queries", stats.queries], ["citations", stats.sources]].map(([key, val]) => (
                <div className="stat-card" key={key}>
                  <div className="stat-val">{val}</div>
                  <div className="stat-key">{key}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CHAT */}
      <main className="main">
        <div className="main-header">
          <div className="main-title">
            Chat <span>{docLoaded ? `— ${docName}` : "— No document loaded"}</span>
          </div>
          <div className={`status-pill ${loading ? "busy" : "idle"}`}>
            <span className="pulse" />
            <span>{loading ? "Thinking…" : "Ready"}</span>
          </div>
        </div>

        <div className="chat-area">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <div className="empty-title">Ask your document anything</div>
              <div className="empty-sub">Upload a PDF and start querying it with natural language</div>
              <div className="suggestion-chips">
                {["Summarize this document", "What are the key findings?", "List all important dates"].map((s) => (
                  <div className="chip" key={s} onClick={() => setQuestion(s)}>{s}</div>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`msg ${msg.type}`}>
                <div className="msg-meta">{msg.type === "user" ? "You" : "DocIntel AI"} · {msg.time}</div>
                <div className="bubble">{msg.text}</div>
                {msg.type === "ai" && msg.sources && (
                  <div className="sources-wrap">
                    <div className="sources-label">Sources</div>
                    {msg.sources.slice(0, 3).map((s, idx) => (
                      <div className="source-card" key={idx}>
                        <div className="src-page">pg {s.page}</div>
                        <div className="src-body">
                          <div className="src-snippet">{s.content.slice(0, 110)}...</div>
                          <div className="src-score">
                            <span>match</span>
                            <div className="bar-track">
                              <div className="bar-fill" style={{ width: `${(s.score * 100).toFixed(0)}%` }} />
                            </div>
                            <span>{(s.score * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="msg ai">
              <div className="thinking">
                <div className="dots"><span /><span /><span /></div> Thinking
              </div>
            </div>
          )}
        </div>

        <div className="input-bar">
          <div className="input-wrap">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder="Ask anything about your document..."
            />
            <button className="send-btn" onClick={handleAsk} disabled={loading || !docLoaded}>↗</button>
          </div>
        </div>
      </main>

      {/* RIGHT PANEL */}
      <aside className="right-panel">
        <div className="rp-header"><div className="rp-title">Analytics</div></div>
        <div className="rp-body">
          <div className="insight-block">
            <div className="insight-title">Relevance Scores</div>
            {scores.length === 0 ? (
              <div className="rp-empty">Ask a question to see source scores</div>
            ) : (
              scores.map((s, i) => (
                <div className="bar-row" key={i}>
                  <span className="bar-label">Page {s.page}</span>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${(s.score * 100).toFixed(0)}%` }} /></div>
                  <span className="bar-val">{(s.score * 100).toFixed(0)}%</span>
                </div>
              ))
            )}
          </div>

          <div className="insight-block">
            <div className="insight-title">Session Activity</div>
            {activity.map((a, i) => (
              <div className="activity-item" key={i}>
                <div className="activity-dot" style={{ background: a.color }} />
                <div>
                  <div className="activity-text">{a.text}</div>
                  <div className="activity-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>

          {topics.length > 0 && (
            <div className="insight-block">
              <div className="insight-title">Topics Discussed</div>
              <div>{topics.map((t) => <span className="mini-tag" key={t}>{t}</span>)}</div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}