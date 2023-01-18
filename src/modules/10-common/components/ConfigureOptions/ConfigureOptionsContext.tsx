import React from 'react'

export interface ConfigureOptionsContextProps {
  disableConfigureOptions: boolean
}

export const ConfigureOptionsContext = React.createContext<ConfigureOptionsContextProps>({
  disableConfigureOptions: false
})

export function ConfigureOptionsContextProvider(
  props: React.PropsWithChildren<ConfigureOptionsContextProps>
): React.ReactElement {
  const { children, ...rest } = props

  return <ConfigureOptionsContext.Provider value={rest}>{children}</ConfigureOptionsContext.Provider>
}

export function useConfigureOptionsContext(): ConfigureOptionsContextProps {
  return React.useContext(ConfigureOptionsContext)
}
