/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { MultiTypeInputType } from '@harness/uicore'
import type { StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import type { StageElementConfig, PageConnectorResponse, ServiceDefinition } from 'services/cd-ng'

export interface ReleaseRepoListViewProps {
  updateStage: (stage: StageElementConfig) => Promise<void>
  stage: StageElementWrapper | undefined
  isPropagating?: boolean
  connectors: PageConnectorResponse | undefined
  refetchConnectors: () => void
  listOfManifests: Array<any>
  isReadonly: boolean
  deploymentType: ServiceDefinition['type']
  allowableTypes: MultiTypeInputType[]
  allowOnlyOne?: boolean
}
