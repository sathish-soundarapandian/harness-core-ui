/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get } from 'lodash-es'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { IACMTerraformPluginStepProps } from './StepTypes.types'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export function IACMTerraformPluginVariableStep({
  variablesData,
  metadataMap,
  initialValues
}: IACMTerraformPluginStepProps): React.ReactElement {
  return (
    <VariablesListTable
      data={get(variablesData, 'spec')}
      originalData={get(initialValues, 'spec')}
      metadataMap={metadataMap}
      className={pipelineVariableCss.variablePaddingL3}
    />
  )
}
