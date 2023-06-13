/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Dispatch, FormEvent, SetStateAction } from 'react'
import cx from 'classnames'
import type { GetDataError } from 'restful-react'
import { get, isEmpty } from 'lodash-es'
import { FormikForm, Layout, Text } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import type {
  Error,
  Failure,
  PipelineInfoConfig,
  ResponseMessage,
  ResponsePMSPipelineResponseDTO
} from 'services/pipeline-ng'
import { ErrorHandler } from '@common/components/ErrorHandler/ErrorHandler'
import SelectExistingInputsOrProvideNew from './SelectExistingOrProvide'
import { InputSetSelector } from '../InputSetSelector/InputSetSelector'
import type { InputSetValue } from '../InputSetSelector/utils'
import { PipelineInputSetForm } from '../PipelineInputSetForm/PipelineInputSetForm'
import { StepViewType } from '../AbstractSteps/Step'
import type { StageSelectionData } from '../../utils/runPipelineUtils'
import css from './RunPipelineForm.module.scss'

export type ExistingProvide = 'existing' | 'provide'

export interface VisualViewProps {
  executionView?: boolean
  existingProvide: ExistingProvide
  setExistingProvide: Dispatch<SetStateAction<ExistingProvide>>
  setRunClicked: Dispatch<SetStateAction<boolean>>
  selectedInputSets?: InputSetValue[]
  pipelineIdentifier: string
  executionIdentifier?: string
  hasRuntimeInputs: boolean
  template: PipelineInfoConfig
  templateError?: GetDataError<Failure | Error> | null
  pipeline?: PipelineInfoConfig
  resolvedPipeline?: PipelineInfoConfig
  currentPipeline?: {
    pipeline?: PipelineInfoConfig
  }
  getTemplateError: any
  submitForm(): void
  hasInputSets: boolean
  setSelectedInputSets: Dispatch<SetStateAction<InputSetValue[] | undefined>>
  selectedStageData: StageSelectionData
  pipelineResponse: ResponsePMSPipelineResponseDTO | null
  invalidInputSetReferences: string[]
  loadingInputSets: boolean
  onReconcile: (identifier: string) => void
  reRunInputSetYaml?: string
}

export default function VisualView(props: VisualViewProps): React.ReactElement {
  const {
    executionView,
    existingProvide,
    setExistingProvide,
    selectedInputSets,
    pipelineIdentifier,
    executionIdentifier,
    hasRuntimeInputs,
    template,
    templateError,
    pipeline,
    currentPipeline,
    getTemplateError,
    resolvedPipeline,
    setRunClicked,
    submitForm,
    hasInputSets,
    setSelectedInputSets,
    selectedStageData,
    pipelineResponse,
    invalidInputSetReferences,
    loadingInputSets,
    onReconcile,
    reRunInputSetYaml
  } = props
  const { getString } = useStrings()

  const checkIfRuntimeInputsNotPresent = (): JSX.Element | string | undefined => {
    if (executionView && isEmpty(template)) {
      const templateErrorObj = templateError?.data as Error
      if (!isEmpty(templateErrorObj?.responseMessages)) {
        return <ErrorHandler responseMessages={templateErrorObj?.responseMessages as ResponseMessage[]} />
      }
      return getString('pipeline.inputSets.noRuntimeInputsWhileExecution')
    } else if (!executionView && resolvedPipeline && currentPipeline && !hasRuntimeInputs && !getTemplateError) {
      /*
      We don't have any runtime inputs required for running this pipeline
        - if API doesn't fail and
        - the inputSetTemplateYaml is not present
      */
      return getString('runPipelineForm.noRuntimeInput')
    }
  }

  const showInputSetSelector = (): boolean => {
    return !!(pipeline && currentPipeline && hasRuntimeInputs && existingProvide === 'existing' && hasInputSets)
  }

  const showPipelineInputSetForm = (): boolean => {
    return !!(existingProvide === 'provide' || selectedInputSets?.length || executionView) && !loadingInputSets
  }

  const showVoidPipelineInputSetForm = (): boolean => {
    return !!(existingProvide === 'existing' && selectedInputSets?.length)
  }

  const onExistingProvideRadioChange = (ev: FormEvent<HTMLInputElement>): void => {
    const existingProvideValue = ev.currentTarget.checked ? 'existing' : 'provide'
    setExistingProvide(existingProvideValue)
  }

  const noRuntimeInputs = checkIfRuntimeInputsNotPresent()

  return (
    <div
      className={cx(executionView ? css.runModalFormContentExecutionView : css.runModalFormContent, {
        [css.noRuntimeInput]: (template as any)?.data?.replacedExpressions?.length > 0 && noRuntimeInputs
      })}
      data-testid="runPipelineVisualView"
      onKeyDown={ev => {
        if (ev.key === 'Enter') {
          ev.preventDefault()
          ev.stopPropagation()
          setRunClicked(true)

          if ((!selectedInputSets || selectedInputSets.length === 0) && existingProvide === 'existing') {
            setExistingProvide('provide')
          } else {
            submitForm()
          }
        }
      }}
    >
      <FormikForm>
        {noRuntimeInputs ? (
          <Layout.Horizontal padding="medium" margin="medium">
            <Text>{noRuntimeInputs}</Text>
          </Layout.Horizontal>
        ) : (
          <>
            {/* Do not show input set selector on rerun / execution input-set view */}
            {!executionView && !reRunInputSetYaml && (
              <Layout.Vertical
                className={css.pipelineHeader}
                padding={{ top: 'xlarge', left: 'xlarge', right: 'xlarge' }}
              >
                <SelectExistingInputsOrProvideNew
                  existingProvide={existingProvide}
                  onExistingProvideRadioChange={onExistingProvideRadioChange}
                  hasInputSets={hasInputSets}
                />
                {showInputSetSelector() ? (
                  <GitSyncStoreProvider>
                    <InputSetSelector
                      pipelineIdentifier={pipelineIdentifier}
                      onChange={inputsets => {
                        setSelectedInputSets(inputsets)
                      }}
                      value={selectedInputSets}
                      pipelineGitDetails={get(pipelineResponse, 'data.gitDetails')}
                      invalidInputSetReferences={invalidInputSetReferences}
                      loadingMergeInputSets={loadingInputSets}
                      onReconcile={onReconcile}
                      reRunInputSetYaml={reRunInputSetYaml}
                    />
                  </GitSyncStoreProvider>
                ) : null}
              </Layout.Vertical>
            )}
            {showPipelineInputSetForm() ? (
              <PipelineInputSetFormWrapper
                executionView={executionView}
                currentPipeline={currentPipeline}
                executionIdentifier={executionIdentifier}
                hasRuntimeInputs={hasRuntimeInputs}
                template={template}
                resolvedPipeline={resolvedPipeline}
                selectedStageData={selectedStageData}
                showDivider={!executionView && !reRunInputSetYaml}
              />
            ) : null}
            {showVoidPipelineInputSetForm() ? <div className={css.noPipelineInputSetForm} /> : null}
          </>
        )}
      </FormikForm>
    </div>
  )
}

export interface PipelineInputSetFormWrapperProps {
  executionView?: boolean
  executionIdentifier?: string
  currentPipeline?: {
    pipeline?: PipelineInfoConfig
  }
  hasRuntimeInputs?: boolean
  template: PipelineInfoConfig
  resolvedPipeline?: PipelineInfoConfig
  selectedStageData: StageSelectionData
  maybeContainerClassOverride?: string
  showDivider?: boolean
}

function PipelineInputSetFormWrapper(props: PipelineInputSetFormWrapperProps): React.ReactElement | null {
  const {
    executionView,
    currentPipeline,
    hasRuntimeInputs,
    template,
    executionIdentifier,
    resolvedPipeline,
    selectedStageData,
    showDivider
  } = props

  if (currentPipeline?.pipeline && resolvedPipeline && (hasRuntimeInputs || executionView)) {
    return (
      <>
        {showDivider && (
          <div className={css.dividerWrapper} data-testid={'inputSetFormDivider'}>
            <div className={css.divider} />
          </div>
        )}
        <PipelineInputSetForm
          originalPipeline={resolvedPipeline}
          template={template}
          readonly={executionView}
          path=""
          viewType={StepViewType.DeploymentForm}
          isRunPipelineForm
          executionIdentifier={executionIdentifier}
          maybeContainerClass={css.inputSetFormRunPipeline}
          selectedStageData={selectedStageData}
          disableRuntimeInputConfigureOptions
        />
      </>
    )
  }

  return null
}
