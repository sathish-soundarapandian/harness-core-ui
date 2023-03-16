/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { get } from 'lodash-es'
import { AllowedTypes, Container, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { MonacoTextField } from '@common/components/MonacoTextField/MonacoTextField'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { isValueRuntimeInput } from '@common/utils/utils'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface InlineVarFileInputSetProps<T> {
  varFilePath: string
  allowableTypes: AllowedTypes
  readonly?: boolean
  stepViewType?: StepViewType
  inlineVarFile: T
}

export default function InlineVarFileInputSet<T>(props: InlineVarFileInputSetProps<T>): React.ReactElement {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { varFilePath, allowableTypes, stepViewType, readonly, inlineVarFile } = props
  const { identifier, spec } = get(inlineVarFile, 'varFile')
  return (
    <React.Fragment key={varFilePath}>
      <Container flex width={120} padding={{ bottom: 'small' }}>
        <Text font={{ weight: 'bold' }}>{getString('cd.varFile')}:</Text>
        {identifier}
      </Container>

      {isValueRuntimeInput(get(spec, 'content')) && (
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
            name={`${varFilePath}.varFile.spec.content`}
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
                    name={`${varFilePath}.varFile.spec.content`}
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
              name={`${varFilePath}.varFile.spec.content`}
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
}
