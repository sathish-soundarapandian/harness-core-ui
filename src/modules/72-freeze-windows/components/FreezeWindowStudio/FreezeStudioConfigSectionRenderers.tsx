/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { SelectOption } from '@wings-software/uicore'
import { FormInput } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'

export enum FIELD_KEYS {
  EnvType = 'EnvType',
  Service = 'Service',
  Org = 'Org',
  ExcludeOrgCheckbox = 'ExcludeOrgCheckbox',
  ExcludeOrg = 'ExcludeOrg'
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

  return <FormInput.Select name={name} items={envTypes} label={getString('envType')} />
}

export const ServiceFieldRenderer = ({ getString, isDisabled, name }) => {
  const [disabledItems] = React.useState<SelectOption[]>([{ label: getString('common.allServices'), value: All }])
  if (isDisabled) {
    return <FormInput.Select name={name} items={disabledItems} disabled={isDisabled} label={getString('services')} />
  }
  return <div>null</div>
}

export const Organizationfield = ({ getString, namePrefix, organizations, values, setFieldValue }) => {
  const orgValue = values[FIELD_KEYS.Org]
  const excludeOrgValue = values[FIELD_KEYS.ExcludeOrgCheckbox]
  const isCheckBoxEnabled = orgValue === All
  const checkBoxName = `${namePrefix}.${FIELD_KEYS.ExcludeOrgCheckbox}`
  const excludeOrgName = `${namePrefix}.${FIELD_KEYS.ExcludeOrg}`
  return (
    <>
      <FormInput.Select
        name={`${namePrefix}.${FIELD_KEYS.Org}`}
        items={organizations}
        label={getString('orgLabel')}
        onChange={(selected?: SelectOption) => {
          if (!(selected?.value === All)) {
            setFieldValue(checkBoxName, false)
            // todo: clear exclude Orgs also
          }
        }}
      />

      <FormInput.CheckBox
        name={checkBoxName}
        label={getString('freezeWindows.freezeStudio.excludeOrgs')}
        disabled={!isCheckBoxEnabled}
        onChange={() => {
          setFieldValue(excludeOrgName, undefined)
        }}
      />

      {isCheckBoxEnabled && excludeOrgValue ? <FormInput.Select name={excludeOrgName} items={organizations} /> : null}
    </>
  )
}
