/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get, pick } from 'lodash-es'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type {
  AzureSlotDeploymentData,
  AzureSlotDeploymentVariableStepProps
} from './AzureSlotDeploymentInterface.types'

import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export function AzureSlotDeploymentVariableStep({
  variablesData = {} as AzureSlotDeploymentData,
  metadataMap,
  initialValues
}: AzureSlotDeploymentVariableStepProps): React.ReactElement {
  const data: Record<any, any> = pick(get(variablesData, 'spec', {}), ['webApp', 'deploymentSlot'])
  return (
    <VariablesListTable
      data={data}
      originalData={initialValues as Record<string, any>}
      metadataMap={metadataMap}
      className={pipelineVariableCss.variablePaddingL3}
    />
  )
}
