import './App.css';
import AppRouter from './AppRouter';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { DockerProvider } from './context/DockerContext';
import { TerminalProvider } from './context/TerminalContext';

function App() {
  return (
    <ErrorBoundary>
      <DockerProvider>
        <TerminalProvider>
          <AppRouter />
        </TerminalProvider>
      </DockerProvider>
    </ErrorBoundary>
  );
}

export default App;
