/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text } from '@harness/uicore'
import { get } from 'lodash-es'
import { useStrings } from 'framework/strings'

import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { RemoteTerraformVarFileSpec } from 'services/cd-ng'

import type { TerraformPlanData, TerraformPlanVariableStepProps } from '../../Common/Terraform/TerraformInterfaces'
import css from '@cd/components/PipelineSteps/Common/Terraform/TerraformStep.module.scss'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'
export function ConfigVariables(props: TerraformPlanVariableStepProps): React.ReactElement {
  const { variablesData = {} as TerraformPlanData, metadataMap, initialValues, fieldPath } = props
  const { getString } = useStrings()
  const variablesDataSpec = get(variablesData?.spec, `${fieldPath}`)
  const initialValuesSpec = get(initialValues?.spec, `${fieldPath}`)
  return (
    <>
      <VariablesListTable
        data={variablesDataSpec}
        originalData={initialValuesSpec}
        metadataMap={metadataMap}
        className={pipelineVariableCss.variablePaddingL3}
      />
      <VariablesListTable
        data={variablesDataSpec?.configFiles}
        originalData={initialValuesSpec?.configFiles}
        metadataMap={metadataMap}
        className={pipelineVariableCss.variablePaddingL3}
      />
      {variablesDataSpec?.configFiles?.store?.spec && (
        <>
          <Text className={css.stepTitle}>{getString('pipelineSteps.configFiles')}</Text>
          <VariablesListTable
            data={variablesDataSpec?.configFiles?.store?.spec}
            originalData={initialValuesSpec?.configFiles?.store?.spec}
            metadataMap={metadataMap}
            className={pipelineVariableCss.variablePaddingL4}
          />
        </>
      )}
      {variablesDataSpec?.varFiles?.length && (
        <>
          <Text className={css.stepTitle}>{getString('cd.terraformVarFiles')}</Text>
          {variablesDataSpec?.varFiles?.map((varFile: { varFile: { type: string } }, index: number) => {
            if (varFile?.varFile?.type === 'Inline') {
              return (
                <VariablesListTable
                  key={index}
                  data={variablesDataSpec?.varFiles?.[index]?.varFile?.spec}
                  originalData={initialValuesSpec?.varFiles?.[index]?.varFile?.spec || ({} as any)}
                  metadataMap={metadataMap}
                  className={pipelineVariableCss.variablePaddingL4}
                />
              )
            } else if (varFile?.varFile?.type === 'Remote') {
              const remoteSpec = variablesDataSpec?.varFiles?.[index]?.varFile?.spec as RemoteTerraformVarFileSpec
              const initVarSpec = initialValuesSpec?.varFiles?.[index]?.varFile?.spec as RemoteTerraformVarFileSpec
              return (
                <VariablesListTable
                  key={index}
                  data={remoteSpec?.store?.spec}
                  originalData={initVarSpec?.store?.spec || ({} as any)}
                  metadataMap={metadataMap}
                  className={pipelineVariableCss.variablePaddingL4}
                />
              )
            }
          })}
        </>
      )}
    </>
  )
}
