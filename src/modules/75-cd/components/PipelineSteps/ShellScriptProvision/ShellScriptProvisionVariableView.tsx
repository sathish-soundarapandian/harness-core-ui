/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'

import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { VariableResponseMapValue } from 'services/pipeline-ng'
import type { ShellScriptProvisionData, ShellScriptProvisionFileStore, ShellScriptProvisionInline } from './types'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export interface ShellScriptProvisionVariablesViewProps {
  metadataMap: Record<string, VariableResponseMapValue>
  variablesData: ShellScriptProvisionData
  originalData: ShellScriptProvisionData
}

export function ShellScriptProvisionVariablesView(props: ShellScriptProvisionVariablesViewProps): React.ReactElement {
  const {
    variablesData = {} as ShellScriptProvisionData,
    originalData = {} as ShellScriptProvisionData,
    metadataMap
  } = props
  const data: Record<string, string> = variablesData.spec

  // istanbul ignore else
  if ((variablesData.spec?.source?.spec as ShellScriptProvisionInline)?.script) {
    data['source.spec.script'] = defaultTo((variablesData.spec?.source?.spec as ShellScriptProvisionInline)?.script, '')
  }

  // istanbul ignore else
  if ((variablesData.spec?.source?.spec as ShellScriptProvisionFileStore)?.file) {
    data['source.spec.file'] = defaultTo((variablesData.spec?.source?.spec as ShellScriptProvisionFileStore)?.file, '')
  }

  // istanbul ignore else
  if (Array.isArray(variablesData.spec?.environmentVariables)) {
    variablesData.spec.environmentVariables.forEach((row, i) => {
      data[`environmentVariables[${i}].value`] = row.value as string
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
