/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, toString } from 'lodash-es'

import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { VariableResponseMapValue } from 'services/pipeline-ng'
import type { ElastigroupSetupData } from './ElastigroupSetupTypes'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export interface ElastigroupSetupVariablesViewProps {
  metadataMap: Record<string, VariableResponseMapValue>
  variablesData: ElastigroupSetupData
  originalData: ElastigroupSetupData
}

export function ElastigroupSetupVariablesView(props: ElastigroupSetupVariablesViewProps): React.ReactElement {
  const { variablesData = {} as ElastigroupSetupData, originalData = {} as ElastigroupSetupData, metadataMap } = props
  const data: Record<string, string> = variablesData.spec

  if (variablesData.spec) {
    /* istanbul ignore else */
    if (variablesData.spec.name) {
      data['name'] = defaultTo(variablesData.spec.name, '')
    }

    /* istanbul ignore else */
    if (variablesData.spec.instances.type === 'Fixed') {
      /* istanbul ignore else */
      if (variablesData.spec.instances.spec.desired) {
        data['instances.spec.desired'] = toString(defaultTo(variablesData.spec.instances.spec.desired, 1))
      }
      /* istanbul ignore else */
      if (variablesData.spec.instances.spec.min) {
        data['instances.spec.min'] = toString(defaultTo(variablesData.spec.instances.spec.min, 1))
      }
      /* istanbul ignore else */
      if (variablesData.spec.instances.spec.max) {
        data['instances.spec.max'] = toString(defaultTo(variablesData.spec.instances.spec.max, 1))
      }
    }
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
