/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { pick } from 'lodash-es'

import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { VariableResponseMapValue } from 'services/pipeline-ng'
import type { HttpStepData } from './types'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'
export interface HttpStepVariablesViewProps {
  metadataMap: Record<string, VariableResponseMapValue>
  variablesData: HttpStepData
  originalData: HttpStepData
}

export function HttpStepVariablesView(props: HttpStepVariablesViewProps): React.ReactElement {
  const { variablesData = {} as HttpStepData, originalData = {} as HttpStepData, metadataMap } = props

  const data: Record<string, string> = pick(variablesData.spec, [
    'method',
    'url',
    'requestBody',
    'assertion',
    'certificate',
    'certificateKey'
  ])

  if (Array.isArray(variablesData.spec?.headers)) {
    variablesData.spec.headers.forEach((row, i) => {
      data[`headers[${i}].value`] = row.value as string
    })
  }

  if (Array.isArray(variablesData.spec?.inputVariables)) {
    variablesData.spec.inputVariables.forEach((row, i) => {
      data[`inputVariables[${i}].value`] = row.value as string
    })
  }

  if (Array.isArray(variablesData.spec?.outputVariables)) {
    variablesData.spec.outputVariables.forEach((row, i) => {
      data[`outputVariables[${i}].value`] = row.value as string
    })
  }

  return (
    <VariablesListTable
      className={pipelineVariableCss.variablePaddingL3}
      metadataMap={metadataMap}
      data={data}
      originalData={originalData?.spec}
    />
  )
}
