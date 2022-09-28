/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { parse } from 'yaml'
import { defaultTo, isEmpty, pick, set } from 'lodash-es'
import { ExcludeFieldKeys, FIELD_KEYS } from './FreezeStudioConfigSectionRenderers'
import { FreezeWindowLevels } from '@freeze-windows/components/FreezeWindowStudio/FreezeWindowContext/FreezeWindowContext'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import type { StringKeys } from 'framework/strings'
import type { EntityConfig } from '@freeze-windows/types'

export function isValidYaml(
  yamlHandler: YamlBuilderHandlerBinding | undefined,
  showInvalidYamlError: (error: string) => void,
  getString: (key: StringKeys, vars?: Record<string, any>) => string,
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

export const getFieldsVisibility = (freezeWindowLevel: FreezeWindowLevels) => {
  const obj = { showOrgField: false, showProjectField: false }
  if (freezeWindowLevel === FreezeWindowLevels.ACCOUNT) {
    obj.showOrgField = true
    obj.showProjectField = true
  }
  if (freezeWindowLevel === FreezeWindowLevels.ORG) {
    obj.showProjectField = true
  }
  return obj
}

export const getInitialValuesForConfigSection = (entityConfigs: EntityConfig[]) => {
  const initialValues = {}
  entityConfigs?.forEach((c: EntityConfig, i: number) => {
    set(initialValues, `entity[${i}].name`, c.name)

    const entities = c.entities
    entities?.forEach(entity => {
      const { type, filterType, entityRefs } = entity
      if (filterType === 'All') {
        // set filterType and entity
        set(initialValues, `entity[${i}].${type}`, filterType)
      } else if (filterType === 'Equals') {
        set(initialValues, `entity[${i}].${type}`, entityRefs[0])
        // equals
      } else if (filterType === 'NotEquals') {
        const excludeFieldKeys = ExcludeFieldKeys[type]
        if (excludeFieldKeys) {
          const { CheckboxKey, ExcludeFieldKey } = excludeFieldKeys
          set(initialValues, `entity[${i}].${type}`, 'All')
          set(initialValues, `entity[${i}].${CheckboxKey}`, true)
          set(initialValues, `entity[${i}].${ExcludeFieldKey}`, entityRefs[0])
        }
      }
    })
  })
  return initialValues
}

const updateEntities = (obj, entities, index) => {
  if (obj.entityRefs.length === 0) {
    delete obj.entityRefs
  }
  if (index >= 0) {
    entities[index] = obj
  } else {
    entities.push(obj)
  }
}
const adaptForOrgField = (currentValues, newValues, entities) => {
  const fieldKey = FIELD_KEYS.Org
  const orgFieldIndex = entities.findIndex(e => e.type === fieldKey)

  if (orgFieldIndex < 0 && !newValues[fieldKey]) {
    return
  }
  const obj = { type: fieldKey, filterType: '', entityRefs: [] }
  if (newValues[fieldKey] === 'All') {
    const hasExcludedOrgs = newValues[FIELD_KEYS.ExcludeOrgCheckbox] && !isEmpty(newValues[FIELD_KEYS.ExcludeOrg])
    obj.filterType = hasExcludedOrgs ? 'NotEquals' : 'All'
    if (hasExcludedOrgs) {
      obj.entityRefs.push(newValues[FIELD_KEYS.ExcludeOrg])
    }
    // exclude can be there
    // entityRefs reqd, if exclude is true
  } else {
    obj.filterType = 'Equals'
    obj.entityRefs.push(newValues[fieldKey])
  }

  updateEntities(obj, entities, orgFieldIndex)
}

const adaptForEnvField = (currentValues, newValues, entities) => {
  const fieldKey = FIELD_KEYS.EnvType
  const index = entities.findIndex(e => e.type === fieldKey)

  if (index < 0 && newValues[fieldKey]) {
    return
  }

  const obj = { type: fieldKey, filterType: '', entityRefs: [] }

  if (newValues[fieldKey] === 'All') {
    obj.filterType = newValues[fieldKey]
  } else {
    obj.filterType = 'Equals'
    obj.entityRefs = [newValues[fieldKey]]
    // equals, not equals
  }

  updateEntities(obj, entities, index)
}

export const convertValuesToYamlObj = (currentValues, newValues) => {
  const entities = [...(currentValues.entities || [])]

  adaptForEnvField(currentValues, newValues, entities)
  adaptForOrgField(currentValues, newValues, entities)

  return { name: newValues.name, entities }
}
