import React from 'react'
import { ServiceOverridesProvider } from './context/ServiceOverrideContext'
import BaseServiceOverrides from './components/BaseServiceOverrides'

export default function GlobalInfrastructureOverrides(): React.ReactElement {
  return (
    <ServiceOverridesProvider serviceOverrideType="INFRA_GLOBAL_OVERRIDE">
      <BaseServiceOverrides />
    </ServiceOverridesProvider>
  )
}
