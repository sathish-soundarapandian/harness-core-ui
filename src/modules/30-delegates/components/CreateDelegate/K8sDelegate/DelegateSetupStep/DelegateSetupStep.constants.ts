/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { DelegateType, DelegateInstallerDetails } from './DelegateSetupStep.types'

export const delegateInstaller: DelegateInstallerDetails[] = [
  {
    text: 'pipeline.manifestTypeLabels.HelmChartLabel',
    value: DelegateType.HELM_CHART,
    icon: 'service-helm'
  },
  {
    text: 'kubernetesText',
    value: DelegateType.KUBERNETES,
    icon: 'service-kubernetes'
  }
]

//this regex is retrieved from kubernetes
export const delegateNameRegex = /^[a-z]([-a-z0-9]*[a-z])?(\.[a-z0-9]([-a-z0-9]*[a-z])?)*$/g
