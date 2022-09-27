/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormInput, SelectOption } from '@wings-software/uicore'
import { UseStringsReturn } from 'framework/strings'

export enum FIELD_KEYS {
  EnvType = 'EnvType',
  Service = 'Service'
}
const All = 'All'
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

export const ServiceFieldRenderer = ({ getString, isDisabled, name }) => {
  const [disabledItems] = React.useState<SelectOption[]>([{ label: getString('common.allServices'), value: All }])
  if (isDisabled) {
    return <FormInput.Select name={name} items={disabledItems} placeholder="All Services11" disabled={isDisabled} />
  }
  return <div>null</div>
}
