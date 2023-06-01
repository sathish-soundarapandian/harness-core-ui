import React from 'react'
import { ServiceOverridesProvider } from './context/ServiceOverrideContext'
import BaseServiceOverrides from './components/BaseServiceOverrides'

export default function GlobalEnvironmentOverrides(): React.ReactElement {
  return (
    <ServiceOverridesProvider serviceOverrideType="ENV_GLOBAL_OVERRIDE">
      <BaseServiceOverrides />
    </ServiceOverridesProvider>
  )
}
