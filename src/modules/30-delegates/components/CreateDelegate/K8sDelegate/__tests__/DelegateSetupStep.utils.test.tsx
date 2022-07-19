/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StringKeys } from 'framework/strings'
import { k8sPermissionType } from '../DelegateSetupStep/DelegateSetupStep.types'
import { validateDelegateSetupDetails } from '../DelegateSetupStep/DelegateSetupStep.utils'
import DelegateSetupStepDetailsMock from './DelegateSetupStepDetailsMock.json'

function getString(key: StringKeys): StringKeys {
  return key
}

describe('Test validateDelegateSetupDetails', () => {
  test('test validation condition', async () => {
    const fn = validateDelegateSetupDetails
    await expect(
      fn(getString, k8sPermissionType.NAMESPACE_ADMIN, false).validate(DelegateSetupStepDetailsMock)
    ).rejects.toThrow('delegates.delegateNamespaceRequired')
  })
})
