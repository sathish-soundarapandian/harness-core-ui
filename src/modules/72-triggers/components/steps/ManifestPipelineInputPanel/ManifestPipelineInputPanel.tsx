/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import {
  Container,
  FormInput,
  Layout,
  Text,
  NestedAccordionProvider,
  HarnessDocTooltip,
  PageSpinner
} from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { merge, cloneDeep, isEmpty, defaultTo, get, debounce, remove } from 'lodash-es'
import type { FormikProps } from 'formik'
import { InputSetSelector, InputSetSelectorProps } from '@pipeline/components/InputSetSelector/InputSetSelector'
import {
  PipelineInfoConfig,
  StageElementWrapperConfig,
  useGetTemplateFromPipeline,
  getInputSetForPipelinePromise,
  useGetMergeInputSetFromPipelineTemplateWithListInput,
  InputSetResponse,
  ResponseInputSetResponse
} from 'services/pipeline-ng'
import { PipelineInputSetForm } from '@pipeline/components/PipelineInputSetForm/PipelineInputSetForm'
import { isCloneCodebaseEnabledAtLeastOneStage } from '@pipeline/utils/CIUtils'
import { useStrings } from 'framework/strings'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useMutateAsGet, useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import type { InputSetValue } from '@pipeline/components/InputSetSelector/utils'
import { clearRuntimeInput, mergeTemplateWithInputSetData } from '@pipeline/utils/runPipelineUtils'
import { memoizedParse } from '@common/utils/YamlHelperMethods'
import type { InputSetDTO, Pipeline } from '@pipeline/utils/types'
import NewInputSetModal from '@pipeline/components/InputSetForm/NewInputSetModal'
import {
  ciCodebaseBuild,
  ciCodebaseBuildPullRequest,
  filterArtifactIndex,
  getFilteredStage,
  TriggerTypes,
  eventTypes,
  getTriggerInputSetsBranchQueryParameter,
  getErrorMessage,
  TriggerGitEventTypes,
  TriggerGitEvent,
  ciCodebaseBuildIssueComment
} from '@triggers/components/Triggers/ManifestTrigger/ManifestWizardPageUtils'
import css from '@triggers/pages/triggers/views/WebhookPipelineInputPanel.module.scss'

interface ManifestPipelineInputPanelProps {
  formikProps?: any
  isEdit?: boolean
  gitAwareForTriggerEnabled?: boolean
}

const applyArtifactToPipeline = (newPipelineObject: any, formikProps: FormikProps<any>): PipelineInfoConfig => {
  const artifactIndex = filterArtifactIndex({
    runtimeData: newPipelineObject?.stages,
    stageId: formikProps?.values?.stageId,
    artifactId: formikProps?.values?.selectedArtifact?.identifier,
    isManifest: false
  })
  const filteredStage = getFilteredStage(newPipelineObject?.stages, formikProps?.values?.stageId)
  if (artifactIndex >= 0) {
    const selectedArtifact = {
      sidecar: {
        type: formikProps?.values?.selectedArtifact?.type,
        spec: {
          ...formikProps?.values?.selectedArtifact?.spec
        }
      }
    }

    const filteredStageArtifacts =
      filteredStage.stage?.spec?.serviceConfig?.serviceDefinition?.spec?.artifacts?.sidecars
    filteredStageArtifacts[artifactIndex] = selectedArtifact
  } else if (artifactIndex < 0) {
    const selectedArtifact = {
      type: formikProps?.values?.selectedArtifact?.type,
      spec: {
        ...formikProps?.values?.selectedArtifact?.spec
      }
    }

    const filteredStageArtifacts = defaultTo(
      filteredStage.stage?.spec?.serviceConfig?.serviceDefinition?.spec?.artifacts,
      {}
    )
    filteredStageArtifacts.primary = selectedArtifact
  }
  return newPipelineObject
}
// Selected Artifact is applied to inputYaml on Pipeline Input Panel in KubernetesManifests.tsx
// This is to apply the selected artifact values
// to the applied input sets pipeline stage values
const applySelectedArtifactToPipelineObject = (
  pipelineObj: PipelineInfoConfig,
  formikProps: FormikProps<any>
): PipelineInfoConfig => {
  // Cloning or making into a new object
  // so the original pipeline is not effected
  const newPipelineObject = { ...pipelineObj }
  if (!newPipelineObject) {
    return {} as PipelineInfoConfig
  }

  const { triggerType } = formikProps.values

  if (triggerType === TriggerTypes.MANIFEST) {
    const artifactIndex = filterArtifactIndex({
      runtimeData: newPipelineObject?.stages,
      stageId: formikProps?.values?.stageId,
      artifactId: formikProps?.values?.selectedArtifact?.identifier,
      isManifest: true
    })
    if (artifactIndex >= 0) {
      const filteredStage =
        (newPipelineObject?.stages || []).find(
          (stage: StageElementWrapperConfig) => stage.stage?.identifier === formikProps?.values?.stageId
        ) || {}

      const selectedArtifact = {
        manifest: {
          type: formikProps?.values?.selectedArtifact?.type,
          spec: {
            ...formikProps?.values?.selectedArtifact?.spec
          }
        }
      }

      const filteredStageManifests = (filteredStage.stage?.spec as any)?.serviceConfig?.serviceDefinition?.spec
        ?.manifests
      filteredStageManifests[artifactIndex] = selectedArtifact
    }
  } else if (triggerType === TriggerTypes.ARTIFACT && newPipelineObject) {
    return applyArtifactToPipeline(newPipelineObject, formikProps)
  }
  return newPipelineObject
}

const getPipelineWithInjectedWithCloneCodebase = ({
  event,
  pipeline,
  isPipelineFromTemplate
}: {
  event: string
  pipeline: PipelineInfoConfig
  isPipelineFromTemplate: boolean
}): any => {
  if (isPipelineFromTemplate) {
    const pipelineFromTemplate = { ...(pipeline || {}) }
    if (pipelineFromTemplate?.template?.templateInputs?.properties?.ci?.codebase?.build) {
      pipelineFromTemplate.template.templateInputs.properties.ci.codebase.build =
        event === eventTypes.PULL_REQUEST ? ciCodebaseBuildPullRequest : ciCodebaseBuild
    }

    return pipelineFromTemplate
  }
  if (event === eventTypes.PULL_REQUEST) {
    return {
      ...pipeline,
      properties: {
        ci: {
          codebase: {
            build: ciCodebaseBuildPullRequest
          }
        }
      }
    }
  } else {
    return {
      ...pipeline,
      properties: {
        ci: {
          codebase: {
            build: ciCodebaseBuild
          }
        }
      }
    }
  }
}

function WebhookPipelineInputPanelForm({
  formikProps,
  isEdit,
  gitAwareForTriggerEnabled
}: ManifestPipelineInputPanelProps): React.ReactElement {
  const {
    values: { inputSetSelected, pipeline, resolvedPipeline },
    values
  } = formikProps

  const { getString } = useStrings()
  const ciCodebaseBuildValue = formikProps.values?.pipeline?.properties?.ci?.codebase?.build
  const { repoIdentifier, branch, connectorRef, repoName, storeType } = useQueryParams<GitQueryParams>()
  const [selectedInputSets, setSelectedInputSets] = useState<InputSetSelectorProps['value']>(inputSetSelected)
  const [hasEverRendered, setHasEverRendered] = useState(
    typeof ciCodebaseBuildValue === 'object' && !isEmpty(ciCodebaseBuildValue)
  )
  const [mergingInputSets, setMergingInputSets] = useState<boolean>(false)
  const [invalidInputSetIds, setInvalidInputSetIds] = useState<Array<string>>([])

  const { orgIdentifier, accountId, projectIdentifier, pipelineIdentifier, triggerIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
    pipelineIdentifier: string
    triggerIdentifier: string
  }>()

  const { data: template, loading } = useMutateAsGet(useGetTemplateFromPipeline, {
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      branch,
      parentEntityConnectorRef: connectorRef,
      parentEntityRepoName: repoName
    },
    body: {
      stageIdentifiers: []
    }
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

  const { mutate: mergeInputSet, error: mergeInputSetError } = useGetMergeInputSetFromPipelineTemplateWithListInput({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      pipelineIdentifier,
      branch: gitAwareForTriggerEnabled ? inputSetSelectedBranch : branch
    }
  })

  useEffect(() => {
    const shouldInjectCloneCodebase = isCloneCodebaseEnabledAtLeastOneStage(resolvedPipeline)

    if (
      !gitAwareForTriggerEnabled &&
      !hasEverRendered &&
      shouldInjectCloneCodebase &&
      !isEdit &&
      formikProps?.values?.triggerType !== TriggerTypes.SCHEDULE
    ) {
      const formikValues = cloneDeep(formikProps.values)
      const isPipelineFromTemplate = !!formikValues?.pipeline?.template
      const newPipelineObject = getPipelineWithInjectedWithCloneCodebase({
        event: formikValues.event,
        pipeline: formikValues.pipeline,
        isPipelineFromTemplate
      })

      const mergedPipeline = mergeTemplateWithInputSetData({
        inputSetPortion: { pipeline: newPipelineObject },
        templatePipeline: { pipeline: newPipelineObject },
        allValues: { pipeline: resolvedPipeline },
        shouldUseDefaultValues: triggerIdentifier === 'new'
      })
      formikProps.setValues({
        ...formikValues,
        pipeline: mergedPipeline.pipeline
      })
    }

    setHasEverRendered(true)
  }, [
    formikProps,
    hasEverRendered,
    resolvedPipeline?.properties?.ci?.codebase,
    resolvedPipeline?.stages,
    resolvedPipeline,
    triggerIdentifier,
    isEdit,
    gitAwareForTriggerEnabled
  ])

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

  useEffect(() => {
    setInputSetError(getErrorMessage(mergeInputSetError) || '')
  }, [mergeInputSetError])

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

  useEffect(() => {
    if (template?.data?.inputSetTemplateYaml && selectedInputSets && selectedInputSets.length > 0) {
      const pipelineObject = memoizedParse<Pipeline>(template?.data?.inputSetTemplateYaml)
      const fetchData = async (): Promise<void> => {
        const data = await mergeInputSet({
          inputSetReferences: selectedInputSets.map(item => item.value as string)
        })
        if (!data?.data?.errorResponse && data?.data?.pipelineYaml) {
          const parsedInputSets = clearRuntimeInput(memoizedParse<Pipeline>(data.data.pipelineYaml).pipeline)

          const newPipelineObject = clearRuntimeInput(
            merge(pipeline, applySelectedArtifactToPipelineObject(pipelineObject.pipeline, formikProps))
          )

          const mergedPipeline = mergeTemplateWithInputSetData({
            inputSetPortion: { pipeline: parsedInputSets },
            templatePipeline: { pipeline: newPipelineObject },
            allValues: { pipeline: resolvedPipeline },
            shouldUseDefaultValues: triggerIdentifier === 'new'
          })

          formikProps.setValues({
            ...values,
            inputSetSelected: selectedInputSets,
            pipeline: mergedPipeline.pipeline
          })
        } else if (data?.data?.errorResponse) {
          setSelectedInputSets([])
        }
        setInvalidInputSetIds(get(data?.data, 'inputSetErrorWrapper.invalidInputSetReferences', []))
      }
      setMergingInputSets(true)
      try {
        fetchData()
          .then(() => setMergingInputSets(false))
          .catch(() => setMergingInputSets(false))
      } catch (e) {
        setMergingInputSets(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    template?.data?.inputSetTemplateYaml,
    selectedInputSets?.length,
    selectedInputSets,
    accountId,
    projectIdentifier,
    orgIdentifier,
    pipelineIdentifier,
    resolvedPipeline
  ])
  const pipelineReferenceBranchPlaceHolder = useMemo(() => {
    if (formikProps?.values?.triggerType === TriggerTypes.WEBHOOK) {
      return ciCodebaseBuild.spec.branch
    }
    return getString('common.branchName')
  }, [formikProps?.values?.triggerType, formikProps?.values?.event, getString])

  const showPipelineInputSetSelector = useMemo(
    () => !isEmpty(pipeline) && !!template?.data?.inputSetTemplateYaml,
    [pipeline, template?.data?.inputSetTemplateYaml]
  )

  const showPipelineInputSetForm = useMemo(() => {
    // With GitX enabled, only show when at least one input set is selected
    if (gitAwareForTriggerEnabled) {
      return showPipelineInputSetSelector && !!selectedInputSets?.length
    }

    return showPipelineInputSetSelector
  }, [showPipelineInputSetSelector, gitAwareForTriggerEnabled, selectedInputSets])

  // When Pipeline Reference Branch is changed (by typing new value), re-merge Input Sets
  const reevaluateInputSetMerge = useCallback(
    debounce(() => {
      if (selectedInputSets?.length) {
        setSelectedInputSets([].concat(selectedInputSets as []))
      }
    }, 1000),
    [selectedInputSets]
  )
  const [showNewInputSetModal, setShowNewInputSetModal] = useState(false)
  const inputSetInitialValue = useMemo(() => {
    const event = formikProps?.values?.event
    return TriggerGitEventTypes.includes(event) && !!pipeline?.properties?.ci?.codebase
      ? ({
          pipeline: {
            properties: {
              ci: {
                codebase: {
                  build: {
                    ...(event === TriggerGitEvent.PUSH ? ciCodebaseBuild : undefined),
                    ...(event === TriggerGitEvent.ISSUE_COMMENT ? ciCodebaseBuildIssueComment : undefined),
                    ...(event === TriggerGitEvent.PULL_REQUEST ? ciCodebaseBuildPullRequest : undefined)
                  }
                }
              }
            }
          }
        } as unknown as InputSetDTO)
      : undefined
  }, [formikProps, pipeline?.properties?.ci?.codebase])
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
      {loading && !isPipelineBranchNameInFocus() ? (
        <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
          <PageSpinner />
        </div>
      ) : template?.data?.inputSetTemplateYaml || gitAwareForTriggerEnabled ? (
        <div className={css.inputsetGrid}>
          <div className={css.inputSetContent}>
            {showPipelineInputSetSelector && (
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
                      if (gitAwareForTriggerEnabled) {
                        formikProps.setValues({
                          ...formikProps.values,
                          inputSetRefs: (value || []).map(v => v.value),
                          inputSetSelected: value
                        })
                      }
                    }}
                    value={selectedInputSets}
                    selectedValueClass={css.inputSetSelectedValue}
                    selectedRepo={gitAwareForTriggerEnabled ? repoName : repoIdentifier}
                    selectedBranch={inputSetSelectedBranch}
                    showNewInputSet={gitAwareForTriggerEnabled}
                    onNewInputSetClick={() => setShowNewInputSetModal(true)}
                    invalidInputSetReferences={invalidInputSetIds}
                    loadingMergeInputSets={mergingInputSets}
                    onReconcile={onReconcile}
                  />
                </GitSyncStoreProvider>
                {inputSetError && <Text intent="danger">{inputSetError}</Text>}
                <div className={css.divider} />
                {showNewInputSetModal && (
                  <NewInputSetModal
                    inputSetInitialValue={inputSetInitialValue}
                    isModalOpen={showNewInputSetModal}
                    closeModal={() => setShowNewInputSetModal(false)}
                    onCreateSuccess={onNewInputSetSuccess}
                  />
                )}
              </div>
            )}
            {gitAwareForTriggerEnabled && (
              <Container padding={{ top: 'medium' }}>
                <Text
                  color={Color.BLACK_100}
                  font={{ weight: 'semi-bold' }}
                  inline={true}
                  data-tooltip-id="pipelineReferenceBranch"
                >
                  {getString('triggers.pipelineReferenceBranch')}
                  <HarnessDocTooltip tooltipId="pipelineReferenceBranch" useStandAlone={true} />
                </Text>
                <Container className={cx(css.refBranchOuter, css.halfWidth)}>
                  <FormInput.Text
                    name="pipelineBranchName"
                    placeholder={pipelineReferenceBranchPlaceHolder}
                    inputGroup={{
                      onInput: reevaluateInputSetMerge
                    }}
                  />
                </Container>
                <div className={css.divider} />
              </Container>
            )}
            {showPipelineInputSetForm &&
              template?.data?.inputSetTemplateYaml &&
              !mergingInputSets &&
              isEmpty(invalidInputSetIds) && (
                <PipelineInputSetForm
                  originalPipeline={resolvedPipeline}
                  template={defaultTo(
                    memoizedParse<Pipeline>(template?.data?.inputSetTemplateYaml)?.pipeline,
                    {} as PipelineInfoConfig
                  )}
                  path="pipeline"
                  viewType={StepViewType.InputSet}
                  maybeContainerClass={css.pipelineInputSetForm}
                  viewTypeMetadata={{ isTrigger: true }}
                  readonly={gitAwareForTriggerEnabled}
                  gitAwareForTriggerEnabled={gitAwareForTriggerEnabled}
                />
              )}
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

const ManifestPipelineInputPanel: React.FC<ManifestPipelineInputPanelProps> = props => {
  return (
    <NestedAccordionProvider>
      <WebhookPipelineInputPanelForm {...props} />
    </NestedAccordionProvider>
  )
}
export default ManifestPipelineInputPanel
