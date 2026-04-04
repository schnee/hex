import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { PatternContextProvider } from './context/PatternContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PatternContextProvider>
      <App />
    </PatternContextProvider>
  </StrictMode>
);
