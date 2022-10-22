/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get, isEmpty } from 'lodash-es'
import { Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { AzureArmVariableStepProps } from '../AzureArm.types'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export function AzureArmVariableView({
  variablesData,
  initialValues,
  metadataMap
}: AzureArmVariableStepProps): React.ReactElement {
  const { getString } = useStrings()
  return (
    <>
      <VariablesListTable
        data={get(variablesData, 'spec.configuration')}
        originalData={get(initialValues, 'spec.configuration')}
        metadataMap={metadataMap}
        className={pipelineVariableCss.variablePaddingL3}
      />
      {!isEmpty(get(variablesData, 'spec.configuration.scope.spec')) && (
        <>
          <Text margin={{ left: 'xlarge' }}>{getString('common.scope')}</Text>
          <VariablesListTable
            data={get(variablesData, 'spec.configuration.scope.spec')}
            originalData={get(initialValues, 'spec.configuration.scope.spec')}
            metadataMap={metadataMap}
            className={pipelineVariableCss.variablePaddingL3}
          />
        </>
      )}
      {!isEmpty(get(variablesData, 'spec.configuration.template')) && (
        <>
          <Text margin={{ left: 'xlarge' }}>{getString('cd.cloudFormation.templateFile')}</Text>
          <VariablesListTable
            data={get(variablesData, 'spec.configuration.template.store.spec')}
            originalData={get(initialValues, 'spec.configuration.template.store.spec')}
            metadataMap={metadataMap}
            className={pipelineVariableCss.variablePaddingL3}
          />
        </>
      )}

      {!isEmpty(get(variablesData, 'spec.configuration.parameters')) && (
        <>
          <Text margin={{ left: 'xlarge' }}>{getString('cd.cloudFormation.parameterFileDetails')}</Text>
          <VariablesListTable
            data={get(variablesData, 'spec.configuration.parameters.store.spec')}
            originalData={get(initialValues, 'spec.configuration.parameters.store.spec')}
            metadataMap={metadataMap}
            className={pipelineVariableCss.variablePaddingL3}
          />
        </>
      )}
    </>
  )
}
