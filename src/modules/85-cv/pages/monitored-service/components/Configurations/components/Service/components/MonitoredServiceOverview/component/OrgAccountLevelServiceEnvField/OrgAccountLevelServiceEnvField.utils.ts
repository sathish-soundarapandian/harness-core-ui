/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isUndefined } from 'lodash-es'
import type { SelectOption } from '@harness/uicore'
import type {
  onChangeProps,
  ShouldShowServiceEnvironmentFieldProps,
  ShouldShowServiceEnvironmentFieldValues
} from './OrgAccountLevelServiceEnvField.types'
import { DefaultShowServiceEnvironment } from './OrgAccountLevelServiceEnvField.constants'

export const onValueChange = ({ isTemplate, value, onSuccess }: onChangeProps): void => {
  if (Array.isArray(value)) {
    onSuccess(value as unknown as SelectOption)
  } else {
    const selectedService = isTemplate ? { label: value, value: value } : value
    onSuccess(selectedService)
  }
}

export const shouldShowServiceEnvironmentField = ({
  isInputSet,
  serviceRef,
  environmentRef
}: ShouldShowServiceEnvironmentFieldProps): ShouldShowServiceEnvironmentFieldValues => {
  const showServiceEnvironmentField = Object.assign({}, DefaultShowServiceEnvironment)

  if (isInputSet) {
    showServiceEnvironmentField.showService = !isUndefined(serviceRef)
    showServiceEnvironmentField.showEnvironment = !isUndefined(environmentRef)
  }

  return showServiceEnvironmentField
}
