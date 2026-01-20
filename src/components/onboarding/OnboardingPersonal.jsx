import { useState } from 'react'
import { useOnboarding } from '../../context/OnboardingContext'
import OnboardingLayout from './OnboardingLayout'

function OnboardingPersonal() {
  const { profileData, updateProfileData, nextStep } = useOnboarding()
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    updateProfileData({ [name]: value })

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const validateAndNext = () => {
    const newErrors = {}

    if (!profileData.inspiringQuote?.trim()) {
      newErrors.inspiringQuote = 'Please share a quote that inspires you'
    }
    if (!profileData.joyOutsideWork?.trim()) {
      newErrors.joyOutsideWork = 'Please share what brings you joy'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    nextStep()
  }

  return (
    <OnboardingLayout>
      <div className="onboarding-form">
        <div className="form-header">
          <h1 className="form-title">A bit more about you</h1>
          <p className="form-subtitle">Help others get to know you better</p>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="inspiringQuote">A Quote That Inspires You *</label>
          <textarea
            id="inspiringQuote"
            name="inspiringQuote"
            className={`input-field textarea-field ${errors.inspiringQuote ? 'input-error' : ''}`}
            placeholder="Share a quote that motivates you, along with its source"
            value={profileData.inspiringQuote}
            onChange={handleChange}
            rows={3}
          />
          {errors.inspiringQuote && <span className="error-text">{errors.inspiringQuote}</span>}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="joyOutsideWork">What fills you with joy, outside your work? *</label>
          <textarea
            id="joyOutsideWork"
            name="joyOutsideWork"
            className={`input-field textarea-field ${errors.joyOutsideWork ? 'input-error' : ''}`}
            placeholder="Hobbies, interests, passions that energize you"
            value={profileData.joyOutsideWork}
            onChange={handleChange}
            rows={3}
          />
          {errors.joyOutsideWork && <span className="error-text">{errors.joyOutsideWork}</span>}
        </div>

        {/* Continue Button */}
        <button className="btn-primary" onClick={validateAndNext}>
          Continue
        </button>
      </div>
    </OnboardingLayout>
  )
}

export default OnboardingPersonal
