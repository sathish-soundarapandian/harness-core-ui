import React, { ReactElement, ReactNode } from 'react'
export interface StepsProgress {
  [key: string]: {
    stepData: any
    isComplete?: boolean
  }
}

export interface OnboardingStoreContextProps {
  children?: ReactNode
  activeStepId?: string
  stepsProgress: StepsProgress
  saveToLS?: boolean
  updateOnboardingStore: (data: OnboardingStoreState) => void
}

type OnboardingStoreState = Omit<OnboardingStoreContextProps, 'updateOnboardingStore'>
export const OnboardingStoreContext = React.createContext<OnboardingStoreContextProps>({
  stepsProgress: {},
  updateOnboardingStore: () => void 0
})

export function useOnboardingStore(): OnboardingStoreContextProps {
  return React.useContext(OnboardingStoreContext)
}
export function OnboardingStoreProvider(props: React.PropsWithChildren<OnboardingStoreContextProps>): ReactElement {
  const [state, setState] = React.useState<OnboardingStoreState>({
    stepsProgress: {}
  })

  const updateOnboardingStore = React.useCallback(function updateOnboardingStore(data: OnboardingStoreState): void {
    setState(prevState => ({
      ...prevState,
      ...data
    }))
  }, [])
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
