/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import css from '../Terraform/TerraformStep.module.scss'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'
import type { TerragruntData, TerragruntVariableStepProps } from './TerragruntInterface'

export function TerragruntVariableStep(props: TerragruntVariableStepProps): React.ReactElement {
  const { variablesData = {} as TerragruntData, metadataMap, initialValues } = props

  const { getString } = useStrings()

  if (initialValues?.spec?.configuration?.type === 'Inline') {
    return (
      <>
        <VariablesListTable
          data={variablesData.spec?.provisionerIdentifier}
          originalData={initialValues.spec?.provisionerIdentifier}
          metadataMap={metadataMap}
          className={pipelineVariableCss.variablePaddingL3}
        />
        <VariablesListTable
          data={variablesData?.spec?.configuration?.spec}
          originalData={initialValues.spec?.configuration?.spec}
          metadataMap={metadataMap}
          className={pipelineVariableCss.variablePaddingL3}
        />
        {variablesData?.spec?.configuration?.spec?.configFiles?.store?.spec && (
          <>
            <Text className={css.stepTitle}>{getString('pipelineSteps.configFiles')}</Text>
            <VariablesListTable
              data={variablesData?.spec?.configuration?.spec?.configFiles?.store?.spec}
              originalData={initialValues.spec?.configuration?.spec?.configFiles?.store?.spec}
              metadataMap={metadataMap}
              className={pipelineVariableCss.variablePaddingL3}
            />
          </>
        )}
      </>
    )
  } else {
    return (
      <>
        <VariablesListTable
          className={pipelineVariableCss.variablePaddingL3}
          data={variablesData.spec}
          originalData={initialValues.spec}
          metadataMap={metadataMap}
        />

        <VariablesListTable
          data={variablesData.spec?.configuration?.type}
          originalData={initialValues.spec?.configuration?.type}
          metadataMap={metadataMap}
          className={pipelineVariableCss.variablePaddingL3}
        />
      </>
    )
  }
}
