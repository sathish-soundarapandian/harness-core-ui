/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isEmpty } from 'lodash-es'
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
        data={variablesData.spec}
        originalData={initialValues.spec}
        metadataMap={metadataMap}
        className={pipelineVariableCss.variablePaddingL3}
      />
      {!isEmpty(variablesData.spec?.configuration?.template) && (
        <Text margin={{ left: 'xlarge' }}>{getString('cd.cloudFormation.templateFile')}</Text>
      )}
      <VariablesListTable
        data={variablesData.spec?.configuration?.template?.store?.spec}
        originalData={initialValues.spec?.configuration?.template?.store?.spec}
        metadataMap={metadataMap}
        className={pipelineVariableCss.variablePaddingL3}
      />
    </>
  )
}
