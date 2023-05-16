/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Text, NestedAccordionProvider, HarnessDocTooltip, PageSpinner } from '@harness/uicore'
import { get, remove } from 'lodash-es'
import { InputSetSelector, InputSetSelectorProps } from '@pipeline/components/InputSetSelector/InputSetSelector'
import { getInputSetForPipelinePromise, InputSetResponse, ResponseInputSetResponse } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import type { InputSetValue } from '@pipeline/components/InputSetSelector/utils'

import NewInputSetModal from '@pipeline/components/InputSetForm/NewInputSetModal'
import { useInputSetsV1 } from '@pipeline/v1/components/RunPipelineModalV1/useInputSetsV1'
import { getTriggerInputSetsBranchQueryParameter } from '@triggers/components/Triggers/utils'
import { getErrorMessage } from '../../utils/TriggersWizardPageUtils'
import css from '../WebhookPipelineInputPanel.module.scss'

interface WebhookPipelineInputPanelPropsInterface {
  formikProps?: any
  gitAwareForTriggerEnabled?: boolean
}

function WebhookPipelineInputPanelFormV1({
  formikProps,
  gitAwareForTriggerEnabled
}: WebhookPipelineInputPanelPropsInterface): React.ReactElement {
  const {
    values: { inputSetSelected, pipeline }
  } = formikProps

  const { getString } = useStrings()
  const { repoIdentifier, branch, connectorRef, repoName, storeType } = useQueryParams<GitQueryParams>()
  const [selectedInputSets, setSelectedInputSets] = useState<InputSetSelectorProps['value']>(inputSetSelected)
  const [invalidInputSetIds, setInvalidInputSetIds] = useState<Array<string>>([])

  const { orgIdentifier, accountId, projectIdentifier, pipelineIdentifier } = useParams<PipelinePathProps>()

  const {
    hasRuntimeInputs,
    hasCodebaseInputs,
    isLoading: loadingInputSets
  } = useInputSetsV1({
    accountId,
    projectIdentifier,
    orgIdentifier,
    pipelineIdentifier,
    branch,
    repoIdentifier,
    connectorRef
  })

  const inputSetSelectedBranch = useMemo(() => {
    return getTriggerInputSetsBranchQueryParameter({
      gitAwareForTriggerEnabled,
      pipelineBranchName: formikProps?.values?.pipelineBranchName,
      branch
    })
  }, [gitAwareForTriggerEnabled, branch, formikProps?.values?.pipelineBranchName])

  const onReconcile = (inpSetId: string): void => {
    remove(invalidInputSetIds, id => id === inpSetId)
    setInvalidInputSetIds(invalidInputSetIds)
  }

  const inputSetQueryParams = useMemo(
    () => ({
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      repoIdentifier,
      connectorRef,
      repoName,
      storeType,
      branch: getTriggerInputSetsBranchQueryParameter({
        gitAwareForTriggerEnabled,
        pipelineBranchName: formikProps?.values?.pipelineBranchName,
        branch
      })
    }),
    [
      accountId,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      repoIdentifier,
      formikProps?.values?.pipelineBranchName,
      connectorRef,
      repoName,
      storeType,
      branch,
      gitAwareForTriggerEnabled
    ]
  )

  useEffect(() => {
    setSelectedInputSets(inputSetSelected)
  }, [inputSetSelected])

  const [fetchInputSetsInProgress, setFetchInputSetsInProgress] = useState(false)
  const [inputSetError, setInputSetError] = useState('')

  useEffect(
    function fetchInputSetsFromInputSetRefs() {
      async function fetchInputSets(): Promise<void> {
        setInputSetError('')

        const inputSetRefs = formikProps?.values?.inputSetRefs
        const inputSetRefsLength = formikProps?.values?.inputSetRefs?.length
        const selectedInputSetsLength = selectedInputSets?.length

        if (
          inputSetRefsLength &&
          selectedInputSetsLength &&
          inputSetRefsLength === selectedInputSetsLength &&
          inputSetRefs?.every((ref: string) => selectedInputSets?.find(item => item.value === ref))
        ) {
          // No need to fetch input sets if they are fetched already
          return
        }

        Promise.all(
          inputSetRefs.map(async (inputSetIdentifier: string): Promise<any> => {
            const data = await getInputSetForPipelinePromise({
              inputSetIdentifier,
              queryParams: inputSetQueryParams
            })

            return data
          })
        )
          .then(results => {
            const error = (results || []).find(result => get(result, 'status') === 'ERROR')
            if (error) {
              if (!inputSetSelected) {
                formikProps.setValues({
                  ...formikProps.values,
                  inputSetSelected: []
                })
              }
              setInputSetError(getErrorMessage(error))
            } else if (results?.length) {
              const inputSets = (results as unknown as { data: InputSetResponse }[]).map(
                ({ data: { identifier, name, gitDetails } }) => ({
                  label: name,
                  value: identifier,
                  type: 'INPUT_SET',
                  gitDetails
                })
              )

              setSelectedInputSets(inputSets as InputSetValue[])
            }
          })
          .catch(exception => {
            setInputSetError(getErrorMessage(exception))
          })
          .finally(() => {
            setFetchInputSetsInProgress(false)
          })
      }

      if (!fetchInputSetsInProgress && !inputSetSelected && formikProps?.values?.inputSetRefs?.length) {
        setFetchInputSetsInProgress(true)
        fetchInputSets()
      }
    },
    [
      formikProps?.values?.inputSetRefs,
      inputSetSelected,
      inputSetQueryParams,
      fetchInputSetsInProgress,
      selectedInputSets,
      formikProps
    ]
  )

  const showPipelineInputSetSelector = useMemo(
    () => hasRuntimeInputs || hasCodebaseInputs,
    [pipeline, hasRuntimeInputs, hasCodebaseInputs]
  )

  const [showNewInputSetModal, setShowNewInputSetModal] = useState(false)
  const onNewInputSetSuccess = useCallback(
    (response: ResponseInputSetResponse) => {
      const inputSet = response.data as InputSetResponse
      const _inputSetSelected = (selectedInputSets || []).concat({
        label: inputSet.name as string,
        value: inputSet.identifier as string,
        type: 'INPUT_SET',
        gitDetails: inputSet.gitDetails
      })

      setInputSetError('')
      setSelectedInputSets(_inputSetSelected)

      formikProps.setValues({
        ...formikProps.values,
        inputSetSelected: _inputSetSelected,
        inputSetRefs: _inputSetSelected.map(_inputSet => _inputSet.value)
      })
    },
    [formikProps, selectedInputSets]
  )

  useEffect(() => {
    setInputSetError(formikProps?.errors?.inputSetRefs)
  }, [setInputSetError, formikProps?.errors?.inputSetRefs])

  // Don't show spinner when fetching is triggered by typing from
  // Pipeline Reference. Giving users a better experience
  const isPipelineBranchNameInFocus = (): boolean =>
    !!gitAwareForTriggerEnabled &&
    !!document.activeElement &&
    document.activeElement === document.querySelector('input[name="pipelineBranchName"]')

  return (
    <Layout.Vertical className={css.webhookPipelineInputContainer} spacing="large" padding="none">
      {loadingInputSets && !isPipelineBranchNameInFocus() ? (
        <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
          <PageSpinner />
        </div>
      ) : hasRuntimeInputs || hasCodebaseInputs || gitAwareForTriggerEnabled ? (
        <div className={css.inputsetGrid}>
          <div className={css.inputSetContent}>
            {showPipelineInputSetSelector ? (
              <div className={css.pipelineInputRow}>
                <Text className={css.formContentTitle} inline={true} data-tooltip-id="pipelineInputLabel">
                  {getString('triggers.pipelineInputLabel')}
                  <HarnessDocTooltip tooltipId="pipelineInputLabel" useStandAlone={true} />
                </Text>

                <GitSyncStoreProvider>
                  <InputSetSelector
                    pipelineIdentifier={pipelineIdentifier}
                    onChange={value => {
                      setInputSetError('')
                      setSelectedInputSets(value)
                      formikProps.setValues({
                        ...formikProps.values,
                        inputSetRefs: (value || []).map(v => v.value),
                        inputSetSelected: value
                      })
                    }}
                    value={selectedInputSets}
                    selectedValueClass={css.inputSetSelectedValue}
                    selectedRepo={gitAwareForTriggerEnabled ? repoName : repoIdentifier}
                    selectedBranch={inputSetSelectedBranch}
                    showNewInputSet={true}
                    onNewInputSetClick={() => setShowNewInputSetModal(true)}
                    invalidInputSetReferences={invalidInputSetIds}
                    onReconcile={onReconcile}
                  />
                </GitSyncStoreProvider>
                {inputSetError ? <Text intent="danger">{inputSetError}</Text> : null}
                <div className={css.divider} />
                {showNewInputSetModal && (
                  <NewInputSetModal
                    isModalOpen={showNewInputSetModal}
                    closeModal={() => setShowNewInputSetModal(false)}
                    onCreateSuccess={onNewInputSetSuccess}
                    isSimplifiedYAML
                  />
                )}
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <Layout.Vertical padding={{ left: 'small', right: 'small' }} margin="large" spacing="large">
          <Text className={css.formContentTitle} inline={true} tooltipProps={{ dataTooltipId: 'pipelineInputLabel' }}>
            {getString('triggers.pipelineInputLabel')}
          </Text>
          <Layout.Vertical className={css.formContent}>
            <Text>{getString('pipeline.pipelineInputPanel.noRuntimeInputs')}</Text>
          </Layout.Vertical>
        </Layout.Vertical>
      )}
    </Layout.Vertical>
  )
}

const WebhookPipelineInputPanelV1: React.FC<WebhookPipelineInputPanelPropsInterface> = props => {
  return (
    <NestedAccordionProvider>
      <WebhookPipelineInputPanelFormV1 {...props} />
    </NestedAccordionProvider>
  )
}
export default WebhookPipelineInputPanelV1
