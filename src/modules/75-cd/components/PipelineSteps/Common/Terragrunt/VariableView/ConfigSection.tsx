/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, get } from 'lodash-es'
import { Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { RemoteTerragruntVarFileSpec } from 'services/cd-ng'
import type { TerragruntData, TerragruntVariableStepProps } from '../TerragruntInterface'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'
import css from '@cd/components/PipelineSteps/Common/Terraform/TerraformStep.module.scss'

export function ConfigVariables(props: TerragruntVariableStepProps): React.ReactElement {
  const { variablesData = {} as TerragruntData, metadataMap, initialValues } = props
  const { getString } = useStrings()

  return (
    <>
      <VariablesListTable
        data={variablesData.spec.configuration?.spec}
        originalData={initialValues.spec.configuration?.spec}
        metadataMap={metadataMap}
        className={pipelineVariableCss.variablePaddingL4}
      />
      {get(variablesData.spec, 'configuration.spec.configFiles.store.spec') && (
        <>
          <Text className={css.stepTitle}>{getString('pipelineSteps.configFiles')}</Text>
          <VariablesListTable
            data={get(variablesData.spec, 'configuration.spec.configFiles.store.spec')}
            originalData={get(initialValues.spec, 'configuration.spec.configFiles.store.spec')}
            metadataMap={metadataMap}
            className={pipelineVariableCss.variablePaddingL4}
          />
        </>
      )}
      {get(variablesData.spec, 'configuration.spec.varFiles')?.length && (
        <>
          <Text className={css.stepTitle}>{getString('cd.terraformVarFiles')}</Text>
          {get(variablesData.spec, 'configuration.spec.varFiles')?.map((varFile: any, index: number) => {
            const remoteSpec = get(variablesData.spec.configuration, `spec.varFiles[${index}].varFile.spec`)
            const initVarSpec = get(initialValues.spec.configuration, `spec.varFiles[${index}].varFile.spec`)
            if (get(varFile, 'varFile.type') === 'Inline') {
              return (
                <VariablesListTable
                  key={index}
                  data={remoteSpec}
                  originalData={defaultTo(initVarSpec, {})}
                  metadataMap={metadataMap}
                  className={pipelineVariableCss.variablePaddingL4}
                />
              )
            } else if (get(varFile, 'varFile.type') === 'Remote') {
              return (
                <VariablesListTable
                  key={index}
                  data={get(remoteSpec as RemoteTerragruntVarFileSpec, 'store.spec')}
                  originalData={get(initVarSpec as RemoteTerragruntVarFileSpec, 'store.spec') || {}}
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
