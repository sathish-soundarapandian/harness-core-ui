/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as Yup from 'yup'
import type { SelectOption } from '@harness/uicore'
import type { StringKeys, UseStringsReturn } from 'framework/strings'
import type { NGVariable } from 'services/cd-ng'

export enum VariableType {
  String = 'String',
  Secret = 'Secret',
  Number = 'Number'
}
export enum ServiceOverrideTab {
  VARIABLE = 'variableoverride',
  CONFIG = 'CONFIGoverride',
  MANIFEST = 'manifestoverride'
}

export const labelStringMap: Record<VariableType, StringKeys> = {
  [VariableType.String]: 'string',
  [VariableType.Secret]: 'secretType',
  [VariableType.Number]: 'number'
}

export const getVariableTypeOptions = (getString: (key: StringKeys) => string): SelectOption[] =>
  [VariableType.String, VariableType.Secret, VariableType.Number].map(type => ({
    label: getString(labelStringMap[type]),
    value: type
  }))

// TODO: TO be removed
export interface NGServiceOverrides {
  serviceRef: string
  variables: NGVariable[]
}
export function getValidationSchema(selectedTab: string, getString: UseStringsReturn['getString']): any {
  if (selectedTab === ServiceOverrideTab.VARIABLE) {
    return Yup.object().shape({
      serviceRef: Yup.string().required(getString('common.validation.fieldIsRequired', { name: getString('service') })),
      variableOverride: Yup.object()
        .required()
        .shape({
          name: Yup.string().required(getString('common.validation.fieldIsRequired', { name: getString('name') })),
          type: Yup.string().oneOf(['String', 'Number', 'Secret']).required(),
          value: Yup.mixed().test({
            test(valueObj): boolean | Yup.ValidationError {
              // istanbul ignore else
              if (valueObj === undefined) {
                return this.createError({
                  path: 'variableOverride.value',
                  message: getString('common.validation.fieldIsRequired', { name: getString('valueLabel') })
                })
              }
              return true
            }
          })
        })
    })
  }
}
