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
import type { AzureBlueprintData } from '../AzureBlueprintTypes.types'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export function AzureBlueprintVariableView(props: any): React.ReactElement {
  const { variablesData = {} as AzureBlueprintData, initialValues = {} as AzureBlueprintData, metadataMap } = props
  const { getString } = useStrings()
  return (
    <>
      <VariablesListTable
        data={get(variablesData, 'spec')}
        originalData={get(initialValues, 'spec')}
        metadataMap={metadataMap}
        className={pipelineVariableCss.variablePaddingL3}
      />
      <VariablesListTable
        data={get(variablesData, 'spec.configuration')}
        originalData={get(initialValues, 'spec.configuration')}
        metadataMap={metadataMap}
        className={pipelineVariableCss.variablePaddingL3}
      />
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
    </>
  )
}
