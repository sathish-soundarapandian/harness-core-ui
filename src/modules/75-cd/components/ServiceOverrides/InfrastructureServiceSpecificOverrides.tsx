import React from 'react'
import { ServiceOverridesProvider } from './context/ServiceOverrideContext'
import BaseServiceOverrides from './components/BaseServiceOverrides'

export default function InfrastructureServiceSpecificOverrides(): React.ReactElement {
  return (
    <ServiceOverridesProvider serviceOverrideType="INFRA_SERVICE_OVERRIDE">
      <BaseServiceOverrides />
    </ServiceOverridesProvider>
  )
}
