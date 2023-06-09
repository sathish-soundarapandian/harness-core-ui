import React from 'react'
import { ServiceOverridesProvider } from './context/ServiceOverrideContext'
import BaseServiceOverrides from './components/BaseServiceOverrides'

export default function EnvironmentServiceSpecificOverrides(): React.ReactElement {
  return (
    <ServiceOverridesProvider serviceOverrideType="ENV_SERVICE_OVERRIDE">
      <BaseServiceOverrides />
    </ServiceOverridesProvider>
  )
}
