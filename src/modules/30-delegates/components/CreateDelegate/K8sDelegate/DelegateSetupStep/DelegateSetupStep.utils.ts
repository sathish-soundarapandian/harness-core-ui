/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as Yup from 'yup'
import type { UseStringsReturn } from 'framework/strings'
import { k8sPermissionType } from './DelegateSetupStep.types'
import { delegateNameRegex } from './DelegateSetupStep.constants'

export const validateDelegateSetupDetails = (
  getString: UseStringsReturn['getString'],
  selectedPermission: k8sPermissionType,
  isHelmDelegateEnabled: boolean
) => {
  return Yup.object().shape({
    name: Yup.string()
      .trim()
      .required(getString('delegate.delegateNameRequired'))
      .max(63)
      .matches(delegateNameRegex, getString('delegates.delegateNameRegexIssue')),
    size: Yup.string().trim().required(getString('delegate.delegateSizeRequired')),
    description: Yup.string().trim(),
    k8sConfigDetails: Yup.object().shape({
      k8sPermissionType: Yup.string().trim().required(getString('delegates.permissionRequired')),
      namespace:
        selectedPermission === k8sPermissionType.NAMESPACE_ADMIN
          ? Yup.string().trim().required(getString('delegates.delegateNamespaceRequired'))
          : Yup.string().trim()
    }),
    tokenName: Yup.string().trim().required(),
    delegateType: isHelmDelegateEnabled
      ? Yup.string().required(getString('delegates.delegateCreation.installerSelectionRequired'))
      : Yup.string().trim()
  })
}
