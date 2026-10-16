import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import SetupScreen   from './components/SetupScreen';
import ErrorBoundary from './components/ErrorBoundary';
import { firebaseConfigured } from './lib/firebase';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      {firebaseConfigured ? <App /> : <SetupScreen />}
    </ErrorBoundary>
  </StrictMode>,
);
