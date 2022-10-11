/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type React from 'react'
import type { CardRailViewProps } from '@pipeline/components/Dashboards/CardRailView/CardRailView'
import type { ExecutionCardProps } from '@pipeline/components/ExecutionCard/ExecutionCard'
import type { PipelineExecutionDetail } from 'services/pipeline-ng'
import type { UserLabelProps } from '@common/exports'

export interface STOAppCustomProps {
  stoApiPath?: string
  lang?: string
  customComponents: Partial<{
    ExecutionCard: React.ComponentType<ExecutionCardProps>
    CardRailView: React.ComponentType<CardRailViewProps>
    UserLabel: React.ComponentType<UserLabelProps>
  }>
}

export interface PipelineSecurityViewProps {
  pipelineExecutionDetail: PipelineExecutionDetail
}
