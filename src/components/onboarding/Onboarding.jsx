import { useOnboarding } from '../../context/OnboardingContext'
import OnboardingWelcome from './OnboardingWelcome'
import OnboardingBasicInfo from './OnboardingBasicInfo'
import OnboardingProfessional from './OnboardingProfessional'
import OnboardingPersonal from './OnboardingPersonal'
import OnboardingComplete from './OnboardingComplete'

function Onboarding() {
  const { currentStep } = useOnboarding()

  const steps = [
    <OnboardingWelcome key="welcome" />,
    <OnboardingBasicInfo key="basic-info" />,
    <OnboardingProfessional key="professional" />,
    <OnboardingPersonal key="personal" />,
    <OnboardingComplete key="complete" />
  ]

  return steps[currentStep] || steps[0]
}

export default Onboarding
