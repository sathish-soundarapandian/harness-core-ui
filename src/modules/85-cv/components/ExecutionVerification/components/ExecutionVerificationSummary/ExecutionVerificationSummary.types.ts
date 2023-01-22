/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StageType } from '@pipeline/utils/stageHelpers'
import type { AnalysedNodeOverview } from 'services/cv'
import type { ExecutionNode } from 'services/pipeline-ng'

export interface VerifyExecutionProps {
  step: ExecutionNode
  stageType?: StageType
  displayAnalysisCount?: boolean
  onSelectNode?: (selectedNode?: AnalysedNodeOverview) => void
  className?: string
  isConsoleView?: boolean
}
