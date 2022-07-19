/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import type { PipelineInfoConfig } from 'services/pipeline-ng'
import { PubSubAction } from './PubSubAction'
import type { PipelineActions } from './types'

interface PipelineActionArgs {
  pipeline: PipelineInfoConfig
  template: PipelineInfoConfig
  accountPathProps: AccountPathProps
  values?: PipelineInfoConfig
}

export const PubSubPipelineActions = new PubSubAction<PipelineActions, PipelineActionArgs, PipelineInfoConfig>()
