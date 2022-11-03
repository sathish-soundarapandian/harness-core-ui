/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { DeployEnvironmentEntityConfig } from '../DeployEnvironmentEntityStep/types'

export type DeployClusterEntityStepProps = Required<DeployEnvironmentEntityConfig>['environment']

export interface DeployClusterEntityCustomStepProps {
  environmentIdentifier?: string
  isMultipleCluster?: boolean
}

export interface DeployClusterEntityCustomInputStepProps extends DeployClusterEntityCustomStepProps {
  deployToAllClusters?: boolean
}
