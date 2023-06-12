import React from 'react'
import { OnboardingStoreProvider, useOnboardingStore } from './Store/OnboardingStore'
import CDOnboardingWizardWithCLI from './CDOnboardingWizardWithCLI'

export default function CDOnboardingWizard(): JSX.Element {
  const storeState = useOnboardingStore()
  return (
    <OnboardingStoreProvider {...storeState}>
      <CDOnboardingWizardWithCLI />
    </OnboardingStoreProvider>
  )
}
