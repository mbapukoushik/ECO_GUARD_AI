import { SafetyProvider } from './context/SafetyContext';
import { MainDashboard } from './components/MainDashboard';

function App() {
  return (
    <SafetyProvider>
      <MainDashboard />
    </SafetyProvider>
  );
}

export default App
