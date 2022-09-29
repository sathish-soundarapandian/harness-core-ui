/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { SelectOption } from '@wings-software/uicore'
import { FormInput } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'
import type { EntityType } from '@freeze-windows/types'

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

export const ExcludeFieldKeys = {
  [FIELD_KEYS.Org]: {
    CheckboxKey: FIELD_KEYS.ExcludeOrgCheckbox,
    ExcludeFieldKey: FIELD_KEYS.ExcludeOrg
  },
  [FIELD_KEYS.Proj]: {
    CheckboxKey: FIELD_KEYS.ExcludeOrgCheckbox,
    ExcludeFieldKey: FIELD_KEYS.ExcludeProj
  }
}

const All = 'All'
const Equals = 'Equals'
const NotEquals = 'NotEquals'
export enum EnvironmentType {
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
    { label: getString('common.allEnvironments'), value: All },
    { label: getString('production'), value: EnvironmentType.PROD },
    { label: getString('common.preProduction'), value: EnvironmentType.NON_PROD }
  ])

  return <FormInput.Select name={name} items={envTypes} label={getString('envType')} style={{ width: '400px' }} />
}

interface ServiceFieldRendererPropsInterface {
  getString: UseStringsReturn['getString']
  isDisabled: boolean
  name: string
}
export const ServiceFieldRenderer: React.FC<ServiceFieldRendererPropsInterface> = ({ getString, isDisabled, name }) => {
  const [disabledItems] = React.useState<SelectOption[]>([{ label: getString('common.allServices'), value: All }])
  if (isDisabled) {
    return (
      <FormInput.Select
        name={name}
        items={disabledItems}
        disabled={isDisabled}
        label={getString('services')}
        style={{ width: '400px' }}
      />
    )
  }
  return <div>null</div>
}

const getOrgNameKeys = (namePrefix: string) => {
  const orgFieldName = `${namePrefix}.${FIELD_KEYS.Org}`
  const orgCheckBoxName = `${namePrefix}.${FIELD_KEYS.ExcludeOrgCheckbox}`
  const excludeOrgName = `${namePrefix}.${FIELD_KEYS.ExcludeOrg}`
  return { orgFieldName, orgCheckBoxName, excludeOrgName }
}

const getProjNameKeys = (namePrefix: string) => {
  const projFieldName = `${namePrefix}.${FIELD_KEYS.Proj}`
  const projCheckBoxName = `${namePrefix}.${FIELD_KEYS.ExcludeProjCheckbox}`
  const excludeProjName = `${namePrefix}.${FIELD_KEYS.ExcludeProj}`
  return { projFieldName, projCheckBoxName, excludeProjName }
}

interface OrganizationfieldPropsInterface {
  getString: UseStringsReturn['getString']
  namePrefix: string
  organizations: SelectOption[]
  values: any
  setFieldValue: any
}
export const Organizationfield: React.FC<OrganizationfieldPropsInterface> = ({
  getString,
  namePrefix,
  organizations,
  values,
  setFieldValue
}) => {
  const orgValue = values[FIELD_KEYS.Org]
  const excludeOrgValue = values[FIELD_KEYS.ExcludeOrgCheckbox]
  const isCheckBoxEnabled = orgValue === All
  const { orgFieldName, orgCheckBoxName, excludeOrgName } = getOrgNameKeys(namePrefix)
  const { projFieldName, projCheckBoxName, excludeProjName } = getProjNameKeys(namePrefix)

  const [allOrgs, setAllOrgs] = React.useState<SelectOption[]>([])
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

      {isCheckBoxEnabled && excludeOrgValue ? (
        <FormInput.Select name={excludeOrgName} items={organizations} style={{ marginLeft: '24px' }} />
      ) : null}
    </>
  )
}

interface ProjectFieldPropsInterface {
  getString: UseStringsReturn['getString']
  namePrefix: string
  projects: SelectOption[]
  values: any
  setFieldValue: any
}
export const ProjectField: React.FC<ProjectFieldPropsInterface> = ({
  getString,
  namePrefix,
  projects,
  values,
  setFieldValue
}) => {
  // If one organization, show projects, else show all projects
  const orgValue = values[FIELD_KEYS.Org]
  const isOrgValueAll = orgValue === All
  const projValue = values[FIELD_KEYS.Proj]
  const excludeProjValue = values[FIELD_KEYS.ExcludeProjCheckbox]
  const isCheckBoxEnabled = projValue === All
  const { projFieldName, projCheckBoxName, excludeProjName } = getProjNameKeys(namePrefix)
  const [allProj, setAllProj] = React.useState<SelectOption[]>([])

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
        <FormInput.Select
          disabled={isOrgValueAll}
          name={excludeProjName}
          items={projects}
          style={{ marginLeft: '24px' }}
        />
      ) : null}
    </>
  )
}

const renderKeyValue = (key: string, value?: string) => {
  return (
    <div>
      <span>{key}</span>: <span>{value}</span>
    </div>
  )
}

interface OrgFieldViewModePropsInterface {
  data?: EntityType
  getString: UseStringsReturn['getString']
}
export const OrgFieldViewMode: React.FC<OrgFieldViewModePropsInterface> = ({ data, getString }) => {
  if (!data) return null
  const { filterType, entityRefs } = data
  let value = 'All Organizations'
  if (filterType === All) {
    value = 'All Organizations'
  } else if (filterType === Equals) {
    value = (entityRefs as string[])?.join(', ')
  } else if (filterType === NotEquals) {
    value = `All Organizations except ${entityRefs?.join(', ')}`
  }
  return renderKeyValue(getString('orgLabel'), value)
}

interface ProjectFieldViewModePropsInterface {
  data?: EntityType
  getString: UseStringsReturn['getString']
}
export const ProjectFieldViewMode: React.FC<ProjectFieldViewModePropsInterface> = ({ data, getString }) => {
  if (!data) return null
  const { filterType, entityRefs } = data
  let value = 'All Projects'
  if (filterType === All) {
    value = 'All Projects'
  } else if (filterType === Equals) {
    value = (entityRefs as string[])?.join(', ')
  } else if (filterType === NotEquals) {
    value = `All Projects except ${entityRefs?.join(', ')}`
  }
  return renderKeyValue(getString('projectsText'), value)
}

/***
 *
 *

 <Button icon="edit" minimal withoutCurrentColor className={css.editButton} />
 <Button icon="trash" minimal withoutCurrentColor />

 entityConfigs:
   - name: "rule1"
     entities:
       - filterType: "All"
         type: "Service"
       - filterType: "Equals"
         type: "Project"
       entityRefs:
         - "pip1"
         - "pip2"
       - filterType: "Equals"
         type: "Org"
         entityRefs:
           - "pip1"
           - "pip2"
       - filterType: "Equals"
         type: "EnvType"
         entityRefs:
           - PROD
       - filterType: "Equals"
         type: "Environment"
         entityRefs:
         - "pip1"
         - "pip2"
         - name: "rule2"
     entities:
       - filterType: "All"
         type: "Service"
       -filterType: "All"
         type: "EnvType"
 *
 */
