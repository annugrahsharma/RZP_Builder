import { useOnboarding } from '../../context/OnboardingContext'
import OnboardingLayout from './OnboardingLayout'

// SuperMorpheus Logo Icon Component
function SuperMorpheusLogo({ size = 120 }) {
  return (
    <svg width={size} height={size * 1.52} viewBox="0 0 422 642" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Aspiration - Bottom */}
      <path d="M-1.732 36.95L207.99 9.474L241.622 59.531L-18.994 129.523Z" transform="translate(48.317 512.358)" fill="#D5CC8E"/>
      {/* Courage */}
      <path d="M20.351 34.309L226.646 0L257.7 49.431L0 128.222Z" transform="translate(36.792 400.951) rotate(13)" fill="#648349"/>
      {/* Sincerity */}
      <path d="M22.2 39.027L224.841 0L254.008 49.687L0 135.008Z" transform="translate(54.913 289.077) rotate(24)" fill="#E2B910"/>
      {/* Perseverance */}
      <path d="M224.361 36.95L14.638 9.474L-18.994 59.531L241.624 129.522Z" transform="translate(150.696 259.618)" fill="#D5CC8E"/>
      {/* Generosity */}
      <path d="M20.352 93.913L226.652 128.222L257.7 78.792L0 0Z" transform="translate(413.696 273.146) rotate(167)" fill="#648349"/>
      {/* Progress */}
      <path d="M22.2 95.981L224.842 135.008L254.009 85.321L0 0Z" transform="matrix(-0.914, 0.407, -0.407, -0.914, 421.641, 159.672)" fill="#E2B910"/>
      {/* Truth - Top circle */}
      <ellipse cx="330.446" cy="36" rx="36.5" ry="36" fill="#F0BA3F"/>
    </svg>
  )
}

function OnboardingWelcome() {
  const { nextStep } = useOnboarding()

  return (
    <OnboardingLayout showProgress={false} showBack={false}>
      <div className="welcome-screen">
        {/* SuperMorpheus Logo */}
        <div className="welcome-logo">
          <SuperMorpheusLogo size={100} />
        </div>

        {/* Welcome Content */}
        <div className="welcome-content">
          <h1 className="welcome-title">Welcome to Super Morpheus</h1>
          <p className="welcome-subtitle">
            Join our community built on Truth, Progress, Generosity, Perseverance, Sincerity, Courage, and Aspiration.
          </p>
        </div>

        {/* Features List */}
        <div className="welcome-features">
          <div className="welcome-feature">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className="feature-text">
              <h3>Create Your Profile</h3>
              <p>Share your journey, experiences, and aspirations</p>
            </div>
          </div>

          <div className="welcome-feature">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="feature-text">
              <h3>Connect with Members</h3>
              <p>Discover and network with like-minded professionals</p>
            </div>
          </div>

          <div className="welcome-feature">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div className="feature-text">
              <h3>Join Events</h3>
              <p>Participate in exclusive community gatherings</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button className="btn-primary welcome-cta" onClick={nextStep}>
          Let's Get Started
        </button>

        <p className="welcome-time-note">
          This will take about 5 minutes
        </p>
      </div>
    </OnboardingLayout>
  )
}

export default OnboardingWelcome
