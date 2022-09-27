import React from 'react'
import { FormInput, SelectOption } from '@wings-software/uicore'
import { UseStringsReturn } from 'framework/strings'

export enum FIELD_KEYS {
  EnvType = 'EnvType',
  Service = 'Service'
}

export enum EnvironmentType {
  All = 'All', // BE YAML Mapping
  PROD = 'PROD',
  NON_PROD = 'NON_PROD'
}

// All Environments
// Production
// Pre-Production

interface EnvTypeRendererProps {
  getString: UseStringsReturn['getString']
  name: string
}
export const EnvironmentTypeRenderer = ({ getString, name }: EnvTypeRendererProps) => {
  const [envTypes] = React.useState<SelectOption[]>([
    { label: getString('common.allEnvironments'), value: EnvironmentType.All },
    { label: getString('production'), value: EnvironmentType.PROD },
    { label: getString('common.preProduction'), value: EnvironmentType.NON_PROD }
  ])

  return <FormInput.Select name={name} items={envTypes} />
}
