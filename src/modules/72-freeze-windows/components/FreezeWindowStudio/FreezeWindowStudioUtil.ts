/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { parse } from 'yaml'
import { defaultTo, isEmpty, pick, set, once } from 'lodash-es'
import type { SelectOption } from '@wings-software/uicore'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import type { UseStringsReturn } from 'framework/strings'
import {
  EntityConfig,
  EntityType,
  FIELD_KEYS,
  FreezeWindowLevels,
  ResourcesInterface,
  EnvironmentType
} from '@freeze-windows/types'

export const isAllOptionSelected = (selected?: SelectOption[]) => {
  if (Array.isArray(selected)) {
    return selected.findIndex(item => item.value === 'All') >= 0
  }
  return false
}

export const allOrgsObj = (getString: UseStringsReturn['getString']) => ({
  label: getString('freezeWindows.freezeStudio.allOrganizations'),
  value: 'All'
})
export const allProjectsObj = (getString: UseStringsReturn['getString']) => ({
  label: getString('rbac.scopeItems.allProjects'),
  value: 'All'
})
export const allServicesObj = (getString: UseStringsReturn['getString']) => ({
  label: getString('common.allServices'),
  value: 'All'
})

export const getEnvTypeMap = once((getString: UseStringsReturn['getString']) => {
  return {
    [EnvironmentType.PROD]: getString('production'),
    [EnvironmentType.NON_PROD]: getString('common.preProduction'),
    All: getString('common.allEnvironments')
  }
})

export const ExcludeFieldKeys = {
  [FIELD_KEYS.Org]: {
    CheckboxKey: FIELD_KEYS.ExcludeOrgCheckbox,
    ExcludeFieldKey: FIELD_KEYS.ExcludeOrg
  },
  [FIELD_KEYS.Proj]: {
    CheckboxKey: FIELD_KEYS.ExcludeProjCheckbox,
    ExcludeFieldKey: FIELD_KEYS.ExcludeProj
  }
}

export function isValidYaml(
  yamlHandler: YamlBuilderHandlerBinding | undefined,
  showInvalidYamlError: (error: string) => void,
  getString: UseStringsReturn['getString'],
  updateFreeze: (freezeYAML: string) => void
): boolean {
  if (yamlHandler) {
    try {
      const parsedYaml = parse(yamlHandler.getLatestYaml())?.freeze
      if (!parsedYaml || yamlHandler.getYAMLValidationErrorMap()?.size > 0) {
        showInvalidYamlError(getString('invalidYamlText'))
        return false
      }
      updateFreeze(parsedYaml)
    } catch (e) {
      showInvalidYamlError(defaultTo(e.message, getString('invalidYamlText')))
      return false
    }
  }
  return true
}

export const getInitialValues = (freezeObj: any) => {
  const pickedValues = pick(freezeObj, 'name', 'identifier', 'description', 'tags')
  return {
    ...pickedValues
  }
}

export interface FieldVisibility {
  showOrgField: boolean
  showProjectField: boolean
  freezeWindowLevel: FreezeWindowLevels
}

export const getFieldsVisibility = (freezeWindowLevel: FreezeWindowLevels): FieldVisibility => {
  const obj = { showOrgField: false, showProjectField: false, freezeWindowLevel }
  if (freezeWindowLevel === FreezeWindowLevels.ACCOUNT) {
    obj.showOrgField = true
    obj.showProjectField = true
  }
  if (freezeWindowLevel === FreezeWindowLevels.ORG) {
    obj.showProjectField = true
  }
  return obj
}

const SINGLE_SELECT_FIELDS = {
  [FIELD_KEYS.EnvType]: true
}

const selectedValueForFilterTypeAll = (type: string, getString: UseStringsReturn['getString']) => {
  if (type === FIELD_KEYS.Org) {
    return [allOrgsObj(getString)]
  }
  if (type === FIELD_KEYS.Proj) {
    return [allProjectsObj(getString)]
  }
  if (type === FIELD_KEYS.Service) {
    return [allServicesObj(getString)]
  }
}

const makeOptions = (dataMap: Record<string, SelectOption>, keys?: string[]) => {
  return keys?.map(key => dataMap[key]).filter(optn => optn)
}

const equalsOptions = (type: FIELD_KEYS, entityRefs: string[], resources: ResourcesInterface) => {
  if (type === FIELD_KEYS.Service) {
    return makeOptions(resources.servicesMap, entityRefs)
  }
  if (type === FIELD_KEYS.Proj) {
    return makeOptions(resources.projectsMap, entityRefs)
  }

  // Single Select Field
  if (type === FIELD_KEYS.EnvType) {
    return entityRefs[0]
  }
}

export const getInitialValuesForConfigSection = (
  entityConfigs: EntityConfig[],
  getString: UseStringsReturn['getString'],
  resources: ResourcesInterface
) => {
  const initialValues = {}
  entityConfigs?.forEach((c: EntityConfig, i: number) => {
    set(initialValues, `entity[${i}].name`, c.name)

    const entities = c.entities
    entities?.forEach(entity => {
      const { type, filterType, entityRefs } = entity
      if (filterType === 'All') {
        // set filterType and entity
        set(
          initialValues,
          `entity[${i}].${type}`,
          SINGLE_SELECT_FIELDS[type as FIELD_KEYS.EnvType] ? filterType : selectedValueForFilterTypeAll(type, getString)
        )
      } else if (filterType === 'Equals') {
        set(initialValues, `entity[${i}].${type}`, equalsOptions(type, entityRefs || [], resources))
        // equals
      } else if (filterType === 'NotEquals') {
        const excludeFieldKeys = ExcludeFieldKeys[type as 'Org' | 'Project']
        if (excludeFieldKeys) {
          const { CheckboxKey, ExcludeFieldKey } = excludeFieldKeys
          set(initialValues, `entity[${i}].${type}`, selectedValueForFilterTypeAll(type, getString))
          set(initialValues, `entity[${i}].${CheckboxKey}`, true)
          set(initialValues, `entity[${i}].${ExcludeFieldKey}`, equalsOptions(type, entityRefs || [], resources))
        }
      }
    })
  })
  return initialValues
}

const updateEntities = (obj: any, entities: any, index: number) => {
  if (obj.entityRefs.length === 0) {
    delete obj.entityRefs
  }
  if (index >= 0) {
    entities[index] = obj
  } else {
    entities.push(obj)
  }
}

const getMetaDataForField = (fieldKey: FIELD_KEYS, entities: EntityType[], newValues: any) => {
  const index = entities.findIndex((e: any) => e.type === fieldKey)
  const isAllSelected = isAllOptionSelected(newValues[fieldKey])
  const obj: EntityType = { type: fieldKey, filterType: 'All', entityRefs: [] }
  const isNewValueEmpty = isEmpty(newValues[fieldKey])

  return { isAllSelected, obj, index, isNewValueEmpty }
}

const adaptForOrgField = (newValues: any, entities: EntityType[]) => {
  const fieldKey = FIELD_KEYS.Org
  const { isAllSelected, obj, index: orgFieldIndex } = getMetaDataForField(fieldKey, entities, newValues)
  if (orgFieldIndex < 0 && !newValues[fieldKey]) {
    return
  }
  if (isAllSelected) {
    const hasExcludedOrgs = newValues[FIELD_KEYS.ExcludeOrgCheckbox] && !isEmpty(newValues[FIELD_KEYS.ExcludeOrg])
    obj.filterType = hasExcludedOrgs ? 'NotEquals' : 'All'
    if (hasExcludedOrgs) {
      obj.entityRefs?.push(...(newValues[FIELD_KEYS.ExcludeOrg]?.map((field: SelectOption) => field.value) || []))
    }
    // exclude can be there
    // entityRefs reqd, if exclude is true
  } else {
    obj.filterType = 'Equals'
    obj.entityRefs?.push(...(newValues[fieldKey]?.map((field: SelectOption) => field.value) || []))
  }

  updateEntities(obj, entities, orgFieldIndex)
}

const adaptForEnvField = (newValues: any, entities: EntityType[]) => {
  const fieldKey = FIELD_KEYS.EnvType
  const index = entities.findIndex((e: any) => e.type === fieldKey)

  if (index < 0 && newValues[fieldKey]) {
    return
  }

  const obj: EntityType = { type: fieldKey, filterType: 'All', entityRefs: [] }

  if (newValues[fieldKey] === 'All') {
    obj.filterType = newValues[fieldKey]
  } else {
    obj.filterType = 'Equals'
    obj.entityRefs = [newValues[fieldKey]]
    // equals, not equals
  }

  updateEntities(obj, entities, index)
}

const adaptForProjectField = (newValues: any, entities: EntityType[]) => {
  const fieldKey = FIELD_KEYS.Proj
  const { isAllSelected, obj, index, isNewValueEmpty } = getMetaDataForField(fieldKey, entities, newValues)

  if (index < 0 && newValues[fieldKey]) {
    return
  }

  if (isAllSelected) {
    const hasExcludedProj = newValues[FIELD_KEYS.ExcludeProjCheckbox] && !isEmpty(newValues[FIELD_KEYS.ExcludeProj])
    obj.filterType = hasExcludedProj ? 'NotEquals' : 'All'
    if (hasExcludedProj) {
      obj.entityRefs?.push(...(newValues[FIELD_KEYS.ExcludeProj]?.map((field: SelectOption) => field.value) || []))
    }
  } else if (isNewValueEmpty) {
    // Do Nothing here
  } else {
    obj.filterType = 'Equals'
    obj.entityRefs?.push(...(newValues[fieldKey]?.map((field: SelectOption) => field.value) || []))
  }
  updateEntities(obj, entities, index)
}

const adaptForServiceField = (newValues: any, entities: EntityType[]) => {
  const fieldKey = FIELD_KEYS.Service
  const { isAllSelected, obj, index } = getMetaDataForField(fieldKey, entities, newValues)
  if (index < 0 && !newValues[fieldKey]) {
    return
  }

  if (isAllSelected) {
    obj.filterType = 'All'
  } else {
    obj.filterType = 'Equals'
    obj.entityRefs?.push(...(newValues[fieldKey]?.map((field: SelectOption) => field.value) || []))
  }

  updateEntities(obj, entities, index)
}

export const convertValuesToYamlObj = (currentValues: any, newValues: any, fieldsVisibility: FieldVisibility) => {
  const entities = [...(currentValues.entities || [])]

  adaptForEnvField(newValues, entities as EntityType[])
  if (fieldsVisibility.freezeWindowLevel === FreezeWindowLevels.ACCOUNT) {
    adaptForOrgField(newValues, entities)
  }

  if (fieldsVisibility.freezeWindowLevel === FreezeWindowLevels.PROJECT) {
    adaptForServiceField(newValues, entities)
  }

  if (fieldsVisibility.freezeWindowLevel === FreezeWindowLevels.ORG) {
    adaptForProjectField(newValues, entities)
  }

  return { name: newValues.name, entities }
}

export const getEmptyEntityConfig = (fieldsVisibility: FieldVisibility): EntityConfig => {
  const entities = []
  if (fieldsVisibility.showOrgField) {
    entities.push({
      type: FIELD_KEYS.Org,
      filterType: 'All'
    })
  }
  if (fieldsVisibility.showProjectField) {
    entities.push({
      type: FIELD_KEYS.Proj,
      filterType: 'All'
    })
  }
  entities.push({ type: FIELD_KEYS.Service, filterType: 'All' })
  entities.push({ type: FIELD_KEYS.EnvType, filterType: 'All' })
  return {
    name: '',
    entities: entities as EntityType[]
  }
}
