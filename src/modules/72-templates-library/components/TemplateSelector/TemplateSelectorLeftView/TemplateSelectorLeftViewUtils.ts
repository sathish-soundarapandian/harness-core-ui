/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@wings-software/uicore'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { UseStringsReturn } from 'framework/strings'

export const getScopeOptions = (scope: Scope, getString: UseStringsReturn['getString']): SelectOption[] => {
  const scopeOptions: SelectOption[] = [
    {
      value: Scope.ACCOUNT,
      label: getString('account')
    }
  ]
  if (scope === Scope.ORG || scope === Scope.PROJECT) {
    scopeOptions.push({
      value: Scope.ORG,
      label: getString('orgLabel')
    })
  }
  if (scope === Scope.PROJECT) {
    scopeOptions.push({
      value: Scope.PROJECT,
      label: getString('projectLabel')
    })
  }
  if (scopeOptions.length > 1) {
    scopeOptions.unshift({
      value: 'all',
      label: getString('all')
    })
  }
  return scopeOptions
}
