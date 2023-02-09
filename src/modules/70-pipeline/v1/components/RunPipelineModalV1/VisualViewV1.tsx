/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Dispatch, SetStateAction } from 'react'
import cx from 'classnames'
import { FormikForm, Layout, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { ResponseInputs } from 'services/pipeline-ng'
import { PipelineInputSetFormV1 } from './PipelineInputSetFormV1'
import { StepViewType } from '../../../components/AbstractSteps/Step'
import css from '../../../components/RunPipelineModal/RunPipelineForm.module.scss'

export type ExistingProvide = 'existing' | 'provide'

export interface VisualViewProps {
  executionView?: boolean
  setRunClicked: Dispatch<SetStateAction<boolean>>
  executionIdentifier?: string
  hasRuntimeInputs: boolean
  hasCodebaseInputs: boolean
  submitForm(): void
  loadingInputSets: boolean
  inputSets?: ResponseInputs | null
  inputSetsError: any
}

export default function VisualView(props: VisualViewProps): React.ReactElement {
  const {
    executionView,
    executionIdentifier,
    hasRuntimeInputs,
    hasCodebaseInputs,
    setRunClicked,
    submitForm,
    loadingInputSets,
    inputSets,
    inputSetsError
  } = props
  const { getString } = useStrings()

  const checkIfRuntimeInputsNotPresent = (): JSX.Element | string | undefined => {
    if (!hasRuntimeInputs && !hasCodebaseInputs && !inputSetsError) {
      return getString('runPipelineForm.noRuntimeInput')
    }
  }

  const noRuntimeInputs = checkIfRuntimeInputsNotPresent()

  return (
    <div
      className={cx(executionView ? css.runModalFormContentExecutionView : css.runModalFormContent)}
      data-testid="runPipelineVisualView"
      onKeyDown={ev => {
        if (ev.key === 'Enter') {
          ev.preventDefault()
          ev.stopPropagation()
          setRunClicked(true)
          submitForm()
        }
      }}
    >
      <FormikForm>
        {!hasRuntimeInputs && !hasCodebaseInputs ? (
          <Layout.Horizontal padding="medium" margin="medium">
            <Text>{noRuntimeInputs}</Text>
          </Layout.Horizontal>
        ) : (
          <>
            {!loadingInputSets ? (
              <PipelineInputSetFormWrapper
                inputSets={inputSets}
                executionView={executionView}
                executionIdentifier={executionIdentifier}
                hasRuntimeInputs={hasRuntimeInputs}
                hasCodebaseInputs={hasCodebaseInputs}
              />
            ) : null}
          </>
        )}
      </FormikForm>
    </div>
  )
}

export interface PipelineInputSetFormWrapperProps {
  executionView?: boolean
  executionIdentifier?: string
  hasRuntimeInputs?: boolean
  hasCodebaseInputs?: boolean
  inputSets?: ResponseInputs | null
}

function PipelineInputSetFormWrapper(props: PipelineInputSetFormWrapperProps): React.ReactElement | null {
  const { executionView, hasRuntimeInputs, hasCodebaseInputs, executionIdentifier, inputSets } = props

  if (hasRuntimeInputs || hasCodebaseInputs || executionView) {
    return (
      <>
        <PipelineInputSetFormV1
          inputSets={inputSets}
          hasRuntimeInputs={hasRuntimeInputs}
          hasCodebaseInputs={hasCodebaseInputs}
          readonly={executionView}
          viewType={StepViewType.DeploymentForm}
          isRunPipelineForm
          executionIdentifier={executionIdentifier}
          disableRuntimeInputConfigureOptions
        />
      </>
    )
  }

  return null
}
