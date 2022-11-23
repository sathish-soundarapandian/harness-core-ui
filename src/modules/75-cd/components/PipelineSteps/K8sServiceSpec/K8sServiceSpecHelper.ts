/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { get } from 'lodash-es'
import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import type { ServiceSpec } from 'services/cd-ng'

export const getNonRuntimeFields = (spec: { [key: string]: any } = {}, template: { [key: string]: any }): string => {
  const fields: { [key: string]: any } = {}

  Object.entries(spec).forEach(([key]): void => {
    if (getMultiTypeFromValue(template?.[key]) !== MultiTypeInputType.RUNTIME) {
      fields[key] = spec[key]
    }
  })
  return JSON.stringify(fields, null, 2)
}

export const isFieldRuntime = (fieldPath: string, template?: ServiceSpec): boolean =>
  getMultiTypeFromValue(get(template, fieldPath)) === MultiTypeInputType.RUNTIME

export const isFieldFixedType = (fieldPath: string, initialValues?: ServiceSpec): boolean =>
  getMultiTypeFromValue(get(initialValues, fieldPath)) === MultiTypeInputType.FIXED
