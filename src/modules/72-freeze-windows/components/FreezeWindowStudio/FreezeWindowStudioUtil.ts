/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { parse } from 'yaml'
import { defaultTo, pick, set } from 'lodash-es'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import type { StringKeys } from 'framework/strings'
import type { EntityConfig } from '@freeze-windows/types'
import { FIELD_KEYS } from './FreezeStudioConfigSectionRenderers'

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
      }
    })
  })
  return initialValues
}

const SINGLE_SELECT_FIELDS = [FIELD_KEYS.EnvType]

export const convertValuesToYamlObj = (currentValues, newValues) => {
  const entities = [...(currentValues.entities || [])]
  SINGLE_SELECT_FIELDS.forEach(fieldKey => {
    // if present, update
    // else create

    const index = entities.findIndex(e => e.type === fieldKey)
    const obj = { type: fieldKey, filterType: '', entityRefs: [] }

    if (newValues[fieldKey] === 'All') {
      obj.filterType = newValues[fieldKey]
    } else {
      obj.filterType = 'Equals'
      obj.entityRefs = [newValues[fieldKey]]
      // equals, not equals
    }

    if (obj.entityRefs.length === 0) {
      delete obj.entityRefs
    }

    // const isPresentInNewValues = [] -> delete

    if (index >= 0) {
      // update
      entities[index] = obj
    } else {
      entities.push(obj)
    }
  })

  return { name: newValues.name, entities }
}
