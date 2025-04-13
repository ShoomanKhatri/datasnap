// src/App.jsx
import React, { useState } from "react";
import axios from "axios";
import "./App.css"; // Optional if you're adding global styles

function App() {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");

  const trackUser = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("/track"); // make sure your backend is deployed
      setUserData(res.data);
    } catch (err) {
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (userData) {
      navigator.clipboard.writeText(JSON.stringify(userData, null, 2));
      alert("JSON copied to clipboard!");
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center p-4 relative font-mono text-sm text-gray-200">
      <div className="bg-gray-800 rounded-lg overflow-hidden max-w-3xl w-full shadow-2xl shadow-blue-400/50">
        {/* VS Code top bar */}
        <div className="flex items-center space-x-2 p-3 bg-gray-700">
          <span className="w-3 h-3 bg-red-500 rounded-full"></span>
          <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          <div className="flex items-center ml-6 bg-gray-900 px-4 pb-6 pt-4 h-full rounded-lg -mb-6">
            <i className="fas fa-file-code text-gray-400 mr-2"></i>
            <p className="text-gray-400 text-sm">data.json</p>
          </div>
        </div>

        {/* Editor */}
        <div className="p-6 min-h-[300px] bg-gray-900 overflow-auto">
          {loading ? (
            <div className="flex items-center">
              <i className="fas fa-spinner fa-spin text-blue-400 text-2xl"></i>
              <p className="text-gray-400 ml-2">Fetching data...</p>
            </div>
          ) : error ? (
            <p className="text-red-400">// {error}</p>
          ) : userData ? (
            <div className="relative">
              <button
                onClick={copyToClipboard}
                className="absolute top-2 right-2 bg-gray-700 text-gray-400 px-3 py-1 rounded hover:bg-gray-600"
              >
                <i className="fas fa-copy mr-1"></i> Copy
              </button>
              <pre className="text-green-400">
                {JSON.stringify(userData, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-green-400">
              // Click the "Track Me" button to fetch user data
            </p>
          )}
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={trackUser}
        className="fixed bottom-6 right-6 bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-blue-700 transition font-semibold flex items-center"
      >
        <i className="fas fa-play mr-2"></i> Track Me
      </button>
    </div>
  );
}

export default App;
