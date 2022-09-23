/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { parse } from 'yaml'
import { defaultTo } from 'lodash-es'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import type { StringKeys } from 'framework/strings'

export function isValidYaml(
  yamlHandler: YamlBuilderHandlerBinding | undefined,
  showInvalidYamlError: (error: string) => void,
  getString: (key: StringKeys, vars?: Record<string, any>) => string,
  updateFreeze: (freeze: any) => void
): boolean {
  if (yamlHandler) {
    try {
      const parsedYaml = parse(yamlHandler.getLatestYaml())
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
