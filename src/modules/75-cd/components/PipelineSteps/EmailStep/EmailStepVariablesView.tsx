/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { VariableResponseMapValue } from 'services/pipeline-ng'
import { getSanitizedflatObjectForVariablesView } from '@pipeline/components/PipelineSteps/Steps/Common/ApprovalCommons'
import type { EmailStepData } from './emailStepTypes'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export interface EmailStepVariablesViewProps {
  metadataMap: Record<string, VariableResponseMapValue>
  variablesData: EmailStepData
  originalData: EmailStepData
}

export function EmailStepVariablesView(props: EmailStepVariablesViewProps): React.ReactElement {
  const { variablesData, originalData, metadataMap } = props

  return (
    <VariablesListTable
      className={pipelineVariableCss.variablePaddingL3}
      metadataMap={metadataMap}
      data={getSanitizedflatObjectForVariablesView(variablesData)}
      originalData={originalData as Record<string, any>}
    />
  )
}
