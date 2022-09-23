/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@harness/icons'
import { CloudProvider } from '@ce/types'

export const getResourceIcon = (cloudProvider: string): IconName => {
  switch (cloudProvider) {
    case CloudProvider.CLUSTER:
      return 'service-kubernetes'

    case CloudProvider.AWS:
      return 'service-aws'

    case CloudProvider.AZURE:
      return 'service-azure'

    case CloudProvider.GCP:
      return 'gcp'

    default:
      return 'harness'
  }
}

export const getServiceIcons = (serviceProvider: string): IconName => {
  switch (serviceProvider) {
    case 'RDS':
      return 'aws-rds'

    case 'GCP INSTANCE':
    case 'GCP DISK':
      return 'gcp-engine'

    case 'AZURE VM':
      return 'azure-vm'

    case 'AWS EC2':
    case 'AWS EBS':
      return 'aws-ectwo-service'

    default:
      return 'default-dashboard'
  }
}
