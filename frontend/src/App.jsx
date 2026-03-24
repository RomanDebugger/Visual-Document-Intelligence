import { useState } from "react";
import "./App.css";

function App() {
  return (
    <div className="container">

      {/* Sidebar */}
      <div className="sidebar">
        <h2>📂 Upload</h2>
        <input type="file" />
        <button>Upload PDF</button>
      </div>

      {/* Main Chat */}
      <div className="main">
        <h1>💬 Chat with Document</h1>

        <div className="chat-box">
          <p className="placeholder">Chat will appear here...</p>
        </div>

        <div className="input-area">
          <input placeholder="Ask something..." />
          <button>Ask</button>
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