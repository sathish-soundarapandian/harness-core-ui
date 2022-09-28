/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { AzureWebAppRollbackData, AzureWebAppRollbackVariableStepProps } from './Rollback.types'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export function AzureWebAppRollbackVariableStep(props: AzureWebAppRollbackVariableStepProps): React.ReactElement {
  /* istanbul ignore next */
  const { variablesData = {} as AzureWebAppRollbackData, metadataMap, initialValues } = props
  return (
    <VariablesListTable
      data={variablesData}
      originalData={initialValues}
      metadataMap={metadataMap}
      className={pipelineVariableCss.variablePaddingL3}
    />
  )
}
