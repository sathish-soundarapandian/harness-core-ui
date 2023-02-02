/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { get } from 'lodash-es'
import { Label, Container, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { isValueRuntimeInput } from '@common/utils/utils'
import { MonacoTextField } from '@common/components/MonacoTextField/MonacoTextField'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { TerraformPlanProps, TerraformStoreTypes } from '../../Common/Terraform/TerraformInterfaces'
import RemoteVarSection from './RemoteVarSection'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export default function TfVarFile(props: TerraformPlanProps): React.ReactElement {
  const { getString } = useStrings()
  const { inputSetData, path, allowableTypes, stepViewType, readonly } = props

  const { expressions } = useVariablesExpression()

  return (
    <>
      <Label style={{ color: Color.GREY_900, paddingBottom: 'var(--spacing-medium)' }}>
        {getString('cd.terraformVarFiles')}
      </Label>
      {inputSetData?.template?.spec?.configuration?.varFiles?.map((varFile: any, index) => {
        if (varFile?.varFile?.type === TerraformStoreTypes.Inline) {
          return (
            <React.Fragment key={`${path}.spec.configuration.varFiles[${index}]`}>
              <Container flex width={150} padding={{ bottom: 'small' }}>
                <Text font={{ weight: 'bold' }}>{getString('cd.varFile')}:</Text>
                {varFile?.varFile?.identifier}
              </Container>
              {isValueRuntimeInput(get(varFile.varFile, 'spec.content')) && (
                <div
                  className={cx(stepCss.formGroup, stepCss.md)}
                  // needed to prevent the run pipeline to get triggered on pressing enter within TFMonaco editor
                  onKeyDown={
                    /* istanbul ignore next */ e => {
                      e.stopPropagation()
                    }
                  }
                >
                  <MultiTypeFieldSelector
                    name={`${path}.spec.configuration.varFiles[${index}].varFile.spec.content`}
                    label={getString('pipelineSteps.content')}
                    defaultValueToReset=""
                    allowedTypes={allowableTypes}
                    skipRenderValueInExpressionLabel
                    disabled={readonly}
                    configureOptionsProps={{
                      isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
                    }}
                    expressionRender={
                      /* istanbul ignore next */ () => {
                        return (
                          <MonacoTextField
                            name={`${path}.spec.configuration.varFiles[${index}].varFile.spec.content`}
                            expressions={expressions}
                            height={200}
                            disabled={readonly}
                            fullScreenAllowed
                            fullScreenTitle={getString('pipelineSteps.content')}
                          />
                        )
                      }
                    }
                  >
                    <MonacoTextField
                      name={`${path}.spec.configuration.varFiles[${index}].varFile.spec.content`}
                      expressions={expressions}
                      height={200}
                      disabled={readonly}
                      fullScreenAllowed
                      fullScreenTitle={getString('pipelineSteps.content')}
                    />
                  </MultiTypeFieldSelector>
                </div>
              )}
            </React.Fragment>
          )
        } else if (varFile.varFile?.type === TerraformStoreTypes.Remote) {
          return <RemoteVarSection remoteVar={varFile} index={index} {...props} />
        }
        return <></>
      })}
    </>
  )
}
