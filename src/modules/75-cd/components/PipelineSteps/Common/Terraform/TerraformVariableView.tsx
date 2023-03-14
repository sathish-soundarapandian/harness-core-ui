/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get } from 'lodash-es'
import { Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { TerraformData, TerraformVariableStepProps, TerraformStoreTypes } from './TerraformInterfaces'
import { ConfigVariables } from './Variableview/ConfigSection'
import css from './TerraformStep.module.scss'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export function TerraformVariableStep(props: TerraformVariableStepProps): React.ReactElement {
  const { variablesData = {} as TerraformData, metadataMap, initialValues, fieldPath } = props

  const { getString } = useStrings()
  const initialValuesSpec = get(initialValues?.spec, `${fieldPath}`)
  const variablesDataSpec = get(variablesData?.spec, `${fieldPath}`)
  if (initialValuesSpec?.type === 'Inline') {
    return (
      <>
        <VariablesListTable
          data={variablesData.spec?.provisionerIdentifier}
          originalData={initialValues.spec?.provisionerIdentifier}
          metadataMap={metadataMap}
          className={pipelineVariableCss.variablePaddingL3}
        />
        <ConfigVariables {...props} />
        {(variablesDataSpec?.spec?.backendConfig?.spec?.content ||
          variablesDataSpec?.spec?.backendConfig?.spec?.store?.spec) && (
          <>
            <Text className={css.stepTitle}>{getString('pipelineSteps.backendConfig')}</Text>
            <VariablesListTable
              data={variablesDataSpec?.spec?.backendConfig?.spec}
              originalData={initialValuesSpec?.spec?.backendConfig?.spec}
              metadataMap={metadataMap}
              className={pipelineVariableCss.variablePaddingL4}
            />
            <VariablesListTable
              data={variablesDataSpec?.spec?.backendConfig?.spec?.store?.spec}
              originalData={initialValuesSpec?.spec?.backendConfig?.spec?.store?.spec}
              metadataMap={metadataMap}
              className={pipelineVariableCss.variablePaddingL4}
            />
          </>
        )}
        {initialValuesSpec?.spec?.environmentVariables && (
          <Text className={css.stepTitle}>{getString('environmentVariables')}</Text>
        )}
        {((variablesDataSpec?.spec?.environmentVariables as []) || [])?.map((envVar, index) => {
          return (
            <VariablesListTable
              key={envVar}
              data={variablesDataSpec?.spec?.environmentVariables?.[index]}
              originalData={initialValuesSpec?.spec?.environmentVariables?.[index]}
              metadataMap={metadataMap}
              className={pipelineVariableCss.variablePaddingL4}
            />
          )
        })}
      </>
    )
  } else if (initialValuesSpec?.type !== TerraformStoreTypes.Inline) {
    return (
      <>
        <VariablesListTable
          className={pipelineVariableCss.variablePaddingL3}
          data={variablesData.spec}
          originalData={initialValues.spec}
          metadataMap={metadataMap}
        />

        <VariablesListTable
          data={variablesDataSpec?.type}
          originalData={initialValuesSpec?.type}
          metadataMap={metadataMap}
          className={pipelineVariableCss.variablePaddingL3}
        />
      </>
    )
  }
  /* istanbul ignore next */
  return <div />
}
