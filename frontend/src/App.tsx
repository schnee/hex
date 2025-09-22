import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Hex Layout Toolkit</h1>
        <p>React Frontend v2.0.0</p>
      </header>
      <main className="app-main">
        <div className="welcome-message">
          <h2>🎯 Frontend Setup Complete!</h2>
          <p>React 18 + TypeScript + Vite development environment is ready.</p>
          <div className="status-grid">
            <div className="status-item">
              <strong>⚛️ React:</strong> 18.2.0
            </div>
            <div className="status-item">
              <strong>📘 TypeScript:</strong> 5.2.2
            </div>
            <div className="status-item">
              <strong>⚡ Vite:</strong> 4.5.0
            </div>
            <div className="status-item">
              <strong>🧪 Vitest:</strong> Testing Ready
            </div>
          </div>
          <p>
            Backend API available at: <code>http://localhost:8000</code>
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
