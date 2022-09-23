/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo } from 'lodash-es'
import type { SelectOption } from '@wings-software/uicore'
import type { StringKeys } from 'framework/strings'

export enum VariableType {
  String = 'String',
  Secret = 'Secret',
  Number = 'Number',
  Connector = 'Connector'
}

export const labelStringMap: Record<VariableType, StringKeys> = {
  [VariableType.String]: 'string',
  [VariableType.Secret]: 'secretType',
  [VariableType.Number]: 'number',
  [VariableType.Connector]: 'connector'
}

export const getVaribaleTypeOptions = (
  allowedVarialblesTypes: VariableType[] | undefined,
  getString: (key: StringKeys) => string
): SelectOption[] =>
  defaultTo(allowedVarialblesTypes, [VariableType.String, VariableType.Secret, VariableType.Number]).map(type => ({
    label: getString(labelStringMap[type]),
    value: type
  }))
