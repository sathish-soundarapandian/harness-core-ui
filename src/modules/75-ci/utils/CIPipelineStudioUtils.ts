/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { get } from 'lodash-es'
import type { CIBuildInfrastructureType } from '@pipeline/utils/constants'
import type { BuildStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'

export const getCIStageInfraType = (
  stage: StageElementWrapper<BuildStageElementConfig> | undefined
): CIBuildInfrastructureType => get(stage, 'stage.spec.infrastructure.type') || get(stage, 'stage.spec.runtime.type')
