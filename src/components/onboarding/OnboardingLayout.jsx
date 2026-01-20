import { useOnboarding } from '../../context/OnboardingContext'
import StatusBar from '../StatusBar'
import '../../styles/onboarding.css'

function OnboardingLayout({ children, showProgress = true, showBack = true }) {
  const { currentStep, totalSteps, prevStep, getCompletionPercentage } = useOnboarding()

  const stepLabels = ['Welcome', 'Name', 'Work', 'Complete']

  return (
    <>
      <StatusBar />
      <div className="page-content">
        <div className="onboarding-screen">
          {/* Back Button */}
          {showBack && currentStep > 0 && currentStep < totalSteps - 1 && (
            <button className="onboarding-back-btn" onClick={prevStep}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
          )}

          {/* Progress Section */}
          {showProgress && currentStep > 0 && currentStep < totalSteps - 1 && (
            <div className="onboarding-progress">
              <div className="progress-header">
                <span className="progress-step">Step {currentStep} of {totalSteps - 2}</span>
                <span className="progress-percentage">{getCompletionPercentage()}% Complete</span>
              </div>

              {/* Progress Bar */}
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${((currentStep) / (totalSteps - 2)) * 100}%` }}
                />
              </div>

              {/* Step Indicators */}
              <div className="progress-steps">
                {stepLabels.slice(1, -1).map((label, index) => (
                  <div
                    key={label}
                    className={`progress-step-item ${index + 1 <= currentStep ? 'active' : ''} ${index + 1 < currentStep ? 'completed' : ''}`}
                  >
                    <div className="progress-step-dot">
                      {index + 1 < currentStep ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <span className="progress-step-label">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="onboarding-content">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

export default OnboardingLayout
