import { createContext, useContext, useState } from 'react'

const OnboardingContext = createContext()

const initialProfileData = {
  // Basic Info
  profilePicture: null,
  profilePicturePreview: null,
  firstName: '',
  middleName: '',
  lastName: '',
  currentOrganization: '',
  currentRole: '',
  inspiringQuote: '',

  // About Section
  introduction: '',
  livesIn: '',
  city: '',
  pincode: '',
  locality: '',
  joyOutsideWork: '',

  // Coordinates/Social
  email: '',
  mobile: '',
  twitter: '',
  instagram: '',
  linkedin: '',
  contentLinks: [],
  otherSocialLinks: [],

  // Video Introductions
  videoEarlyLife: null,
  videoEarlyLifeUrl: null,
  videoProfessional: null,
  videoProfessionalUrl: null,
  videoCurrent: null,
  videoCurrentUrl: null
}

export function OnboardingProvider({ children }) {
  const [profileData, setProfileData] = useState(initialProfileData)
  const [currentStep, setCurrentStep] = useState(0)

  const totalSteps = 13 // Welcome, Name, Work, Quote, Joy, Intro, Location, Social, Content, VideoEarly, VideoPro, VideoCurrent, Complete

  const updateProfileData = (updates) => {
    setProfileData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const goToStep = (step) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step)
    }
  }

  const getCompletionPercentage = () => {
    const fields = [
      profileData.firstName,
      profileData.lastName,
      profileData.currentOrganization,
      profileData.currentRole,
      profileData.inspiringQuote,
      profileData.joyOutsideWork,
      profileData.introduction,
      profileData.locality,
      profileData.city,
      profileData.pincode
    ]

    const filledFields = fields.filter(field => field && field.trim() !== '').length
    return Math.round((filledFields / fields.length) * 100)
  }

  const value = {
    profileData,
    updateProfileData,
    currentStep,
    setCurrentStep,
    totalSteps,
    nextStep,
    prevStep,
    goToStep,
    getCompletionPercentage
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
