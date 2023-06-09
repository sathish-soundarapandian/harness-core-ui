import React, { ReactElement, ReactNode } from 'react'
export interface StepsProgress {
  isComplete?: boolean
}
export interface OnboardingStoreContextProps {
  children?: ReactNode
  activeStepId?: string
  steps: string[]
  stepsProgress: { [key: string]: StepsProgress }
  saveToLS?: boolean
  updateOnboardingStore: (data: OnboardingStoreContextProps) => void
}
export const OnboardingStoreContext = React.createContext<OnboardingStoreContextProps>({
  steps: [],
  stepsProgress: {},
  updateOnboardingStore: () => void 0
})

export function useOnboardingStore(): OnboardingStoreContextProps {
  return React.useContext(OnboardingStoreContext)
}

export function OnboardingStoreProvider(props: any): ReactElement {
  const [state, setState] = React.useState<Omit<OnboardingStoreContextProps, 'updateOnboardingStore'>>({
    steps: [],
    stepsProgress: {}
  })

  function updateOnboardingStore(data: OnboardingStoreContextProps): void {
    setState(prevState => ({
      ...prevState,
      ...data
    }))
  }
  return (
    <OnboardingStoreContext.Provider
      value={{
        ...state,
        updateOnboardingStore
      }}
    >
      {props.children}
    </OnboardingStoreContext.Provider>
  )
}
