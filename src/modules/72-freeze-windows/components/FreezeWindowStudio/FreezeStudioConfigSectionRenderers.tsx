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
  ExcludeOrg = 'ExcludeOrg',
  Proj = 'Proj',
  ExcludeProjCheckbox = 'ExcludeProjCheckbox',
  ExcludeProj = 'ExcludeProj'
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

const getOrgNameKeys = namePrefix => {
  const orgFieldName = `${namePrefix}.${FIELD_KEYS.Org}`
  const orgCheckBoxName = `${namePrefix}.${FIELD_KEYS.ExcludeOrgCheckbox}`
  const excludeOrgName = `${namePrefix}.${FIELD_KEYS.ExcludeOrg}`
  return { orgFieldName, orgCheckBoxName, excludeOrgName }
}

const getProjNameKeys = namePrefix => {
  const projFieldName = `${namePrefix}.${FIELD_KEYS.Proj}`
  const projCheckBoxName = `${namePrefix}.${FIELD_KEYS.ExcludeProjCheckbox}`
  const excludeProjName = `${namePrefix}.${FIELD_KEYS.ExcludeProj}`
  return { projFieldName, projCheckBoxName, excludeProjName }
}

export const Organizationfield = ({ getString, namePrefix, organizations, values, setFieldValue }) => {
  const orgValue = values[FIELD_KEYS.Org]
  const excludeOrgValue = values[FIELD_KEYS.ExcludeOrgCheckbox]
  const isCheckBoxEnabled = orgValue === All
  const { orgFieldName, orgCheckBoxName, excludeOrgName } = getOrgNameKeys(namePrefix)
  const { projFieldName, projCheckBoxName, excludeProjName } = getProjNameKeys(namePrefix)

  const [allOrgs, setAllOrgs] = React.useState([])
  React.useEffect(() => {
    if (organizations.length) {
      setAllOrgs([{ label: 'All Organizations', value: All }, ...organizations])
    }
  }, [organizations])
  return (
    <>
      <FormInput.Select
        name={orgFieldName}
        items={allOrgs}
        label={getString('orgLabel')}
        onChange={(selected?: SelectOption) => {
          if (!(selected?.value === All)) {
            setFieldValue(orgCheckBoxName, false)
            // todo: clear exclude Orgs
          }
          if (selected?.value === All) {
            setFieldValue(projFieldName, All)
            setFieldValue(projCheckBoxName, false)
            setFieldValue(excludeProjName, undefined)
          }
        }}
      />

      <FormInput.CheckBox
        name={orgCheckBoxName}
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

export const ProjectField = ({ getString, namePrefix, projects, values, setFieldValue }) => {
  // If one organization, show projects, else show all projects
  const orgValue = values[FIELD_KEYS.Org]
  const isOrgValueAll = orgValue === All
  const projValue = values[FIELD_KEYS.Proj]
  const excludeProjValue = values[FIELD_KEYS.ExcludeProjCheckbox]
  const isCheckBoxEnabled = projValue === All
  const { projFieldName, projCheckBoxName, excludeProjName } = getProjNameKeys(namePrefix)
  const [allProj, setAllProj] = React.useState([])

  React.useEffect(() => {
    if (isOrgValueAll) {
      setAllProj([{ label: 'All Projects', value: All }])
    } else if (projects.length) {
      setAllProj([{ label: 'All Projects', value: All }, ...projects])
    }
  }, [projects, isOrgValueAll])
  return (
    <>
      <FormInput.Select
        name={projFieldName}
        items={allProj}
        label={getString('projectsText')}
        disabled={isOrgValueAll}
        onChange={(selected?: SelectOption) => {
          if (!(selected?.value === All)) {
            setFieldValue(projCheckBoxName, false)
            // todo: clear exclude Proj also
          }
        }}
      />

      <FormInput.CheckBox
        name={projCheckBoxName}
        label={getString('freezeWindows.freezeStudio.excludeProjects')}
        disabled={!isCheckBoxEnabled || isOrgValueAll}
        onChange={() => {
          setFieldValue(excludeProjName, undefined)
        }}
      />

      {isCheckBoxEnabled && excludeProjValue ? (
        <FormInput.Select disabled={isOrgValueAll} name={excludeProjName} items={projects} />
      ) : null}
    </>
  )
}
