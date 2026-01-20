import { HashRouter, Routes, Route } from 'react-router-dom'
import Login from './components/Login'
import Onboarding from './components/onboarding/Onboarding'
import Dashboard from './components/dashboard/Dashboard'
import { OnboardingProvider } from './context/OnboardingContext'
import './styles/App.css'

// Wrapper component for onboarding with provider
function OnboardingWrapper() {
  return (
    <OnboardingProvider>
      <Onboarding />
    </OnboardingProvider>
  )
}

function App() {
  return (
    <HashRouter>
      <div className="app-container">
        <div className="mobile-frame">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<OnboardingWrapper />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  )
}

export default App
