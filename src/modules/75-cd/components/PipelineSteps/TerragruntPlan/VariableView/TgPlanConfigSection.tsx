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
import type { RemoteTerragruntVarFileSpec } from 'services/cd-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { TerragruntPlanVariableStepProps, TGPlanFormData } from '../../Common/Terragrunt/TerragruntInterface'
import css from '@cd/components/PipelineSteps/Common/Terraform/TerraformStep.module.scss'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export function ConfigVariables(props: TerragruntPlanVariableStepProps): React.ReactElement {
  const { variablesData = {} as TGPlanFormData, metadataMap, initialValues } = props
  const { getString } = useStrings()
  return (
    <>
      <VariablesListTable
        data={variablesData.spec.configuration}
        originalData={initialValues.spec.configuration}
        metadataMap={metadataMap}
        className={pipelineVariableCss.variablePaddingL3}
      />
      <VariablesListTable
        data={get(variablesData.spec.configuration, 'configFiles')}
        originalData={get(initialValues.spec.configuration, 'configFiles')}
        metadataMap={metadataMap}
        className={pipelineVariableCss.variablePaddingL3}
      />
      {get(variablesData.spec.configuration, 'configFiles.store.spec') && (
        <>
          <Text className={css.stepTitle}>{getString('pipelineSteps.configFiles')}</Text>
          <VariablesListTable
            data={get(variablesData.spec.configuration, 'configFiles.store.spec')}
            originalData={get(initialValues.spec.configuration, 'configFiles.store.spec')}
            metadataMap={metadataMap}
            className={pipelineVariableCss.variablePaddingL4}
          />
        </>
      )}
      {get(variablesData.spec, 'configuration.varFiles')?.length && (
        <>
          <Text className={css.stepTitle}>{getString('cd.terraformVarFiles')}</Text>
          {get(variablesData.spec.configuration, 'varFiles')?.map((varFile, index) => {
            const remoteSpec = get(variablesData.spec.configuration, `varFiles[${index}].varFile.spec`)

            const initVarSpec = get(initialValues.spec.configuration, `varFiles[${index}].varFile.spec`)

            if (get(varFile, 'varFile.type') === 'Inline') {
              return (
                <VariablesListTable
                  key={index}
                  data={remoteSpec}
                  originalData={initVarSpec}
                  metadataMap={metadataMap}
                  className={pipelineVariableCss.variablePaddingL4}
                />
              )
            } else if (get(varFile, 'varFile.type') === 'Remote') {
              return (
                <VariablesListTable
                  key={index}
                  data={get(remoteSpec as RemoteTerragruntVarFileSpec, 'store.spec')}
                  originalData={get(initVarSpec as RemoteTerragruntVarFileSpec, 'store.spec')}
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
