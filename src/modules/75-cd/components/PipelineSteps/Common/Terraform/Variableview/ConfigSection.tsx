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
import type { RemoteTerraformVarFileSpec, TerraformVarFileWrapper } from 'services/cd-ng'

import type { TerraformData, TerraformVariableStepProps } from '../TerraformInterfaces'
import css from '@cd/components/PipelineSteps/Common/Terraform/TerraformStep.module.scss'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export function ConfigVariables(props: TerraformVariableStepProps): React.ReactElement {
  const { variablesData = {} as TerraformData, metadataMap, initialValues, fieldPath } = props
  const { getString } = useStrings()
  const initialValuesSpec = get(initialValues?.spec, `${fieldPath}`)
  const variablesDataSpec = get(variablesData?.spec, `${fieldPath}`)
  return (
    <>
      <VariablesListTable
        data={variablesDataSpec?.spec}
        originalData={initialValuesSpec?.spec}
        metadataMap={metadataMap}
        className={pipelineVariableCss.variablePaddingL3}
      />
      {variablesDataSpec?.spec?.configFiles?.store?.spec && (
        <>
          <Text className={css.stepTitle}>{getString('pipelineSteps.configFiles')}</Text>
          <VariablesListTable
            data={variablesDataSpec?.spec?.configFiles?.store?.spec}
            originalData={initialValuesSpec?.spec?.configFiles?.store?.spec}
            metadataMap={metadataMap}
            className={pipelineVariableCss.variablePaddingL3}
          />
        </>
      )}
      {variablesDataSpec?.spec?.varFiles?.length && (
        <>
          <Text className={css.stepTitle}>{getString('cd.terraformVarFiles')}</Text>
          {variablesDataSpec?.spec?.varFiles?.map((varFile: TerraformVarFileWrapper, index: number) => {
            if (varFile?.varFile?.type === 'Inline') {
              return (
                <VariablesListTable
                  key={index}
                  data={variablesDataSpec?.spec?.varFiles?.[index]?.varFile?.spec}
                  originalData={initialValuesSpec?.spec?.varFiles?.[index]?.varFile?.spec || ({} as any)}
                  metadataMap={metadataMap}
                  className={pipelineVariableCss.variablePaddingL4}
                />
              )
            } else if (varFile?.varFile?.type === 'Remote') {
              const remoteSpec = variablesDataSpec?.spec?.varFiles?.[index]?.varFile?.spec as RemoteTerraformVarFileSpec
              const initVarSpec = initialValuesSpec?.spec?.varFiles?.[index]?.varFile
                ?.spec as RemoteTerraformVarFileSpec
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
