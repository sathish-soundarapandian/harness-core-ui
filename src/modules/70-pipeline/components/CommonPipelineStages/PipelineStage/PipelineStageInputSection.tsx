/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FormEvent, useCallback, useEffect, useMemo, useRef, useState, useContext } from 'react'
import cx from 'classnames'
import { Formik, Layout, PageSpinner, FormikForm, Container, Text } from '@harness/uicore'
import { isEmpty, defaultTo, get, set, debounce, noop, memoize, remove, isUndefined } from 'lodash-es'
import type { FormikErrors, FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import produce from 'immer'
import {
  InputSetSummaryResponse,
  PipelineConfig,
  PipelineInfoConfig,
  useGetPipeline,
  useGetTemplateFromPipeline,
  useGetMergeInputSetFromPipelineTemplateWithListInput
} from 'services/pipeline-ng'
import type { GitQueryParams, PipelineType, RunPipelineQueryParams } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { clearRuntimeInput, StageSelectionData, mergeTemplateWithInputSetData } from '@pipeline/utils/runPipelineUtils'
import { stringify, yamlParse, parse } from '@common/utils/YamlHelperMethods'
import type { InputSetDTO, Pipeline } from '@pipeline/utils/types'
import { useDeepCompareEffect } from '@common/hooks/useDeepCompareEffect'
import type { StoreMetadata } from '@common/constants/GitSyncTypes'
import { InputSetSelector } from '@pipeline/components/InputSetSelector/InputSetSelector'
import type { ExistingProvide } from '@pipeline/components/RunPipelineModal/VisualView'
import { PipelineInputSetFormInternal } from '@pipeline/components/PipelineInputSetForm/PipelineInputSetForm'
import SelectExistingInputsOrProvideNew from '@pipeline/components/RunPipelineModal/SelectExistingOrProvide'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { validatePipeline } from '@pipeline/components/PipelineStudio/StepUtil'
import {
  PipelineVariablesContextProvider,
  usePipelineVariables
} from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import type { InputSetSelectorProps } from '@pipeline/components/InputSetSelector/InputSetSelector'
import { useQueryParams } from '@common/hooks'
import type { InputSetValue } from '@pipeline/components/InputSetSelector/utils'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { PipelineStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import { getInputSetReference } from '@pipeline/components/OverlayInputSetForm/OverlayInputSetUtils'
import { getsMergedTemplateInputYamlPromise } from 'services/template-ng'
import { useMutateAsGet } from '@common/hooks/useMutateAsGet'
import { replaceDefaultValues } from '@pipeline/utils/templateUtils'
import ErrorsStripBinded from '@pipeline/components/ErrorsStrip/ErrorsStripBinded'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { PipelineStageTabs } from './utils'
import css from './PipelineStageAdvancedSpecifications.module.scss'

const memoizedParse = memoize(parse)

function PipelineInputSetFormBasic(): React.ReactElement {
  const { accountId, branch, repoIdentifier, connectorRef } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      pipelineIdentifier: string
      accountId: string
    }> &
      GitQueryParams
  >()
  const {
    state: {
      selectionState: { selectedStageId = '' },
      pipeline: pipelineFromContext
    },
    allowableTypes,
    updateStage,
    getStageFromPipeline
  } = usePipelineContext()

  const selectedStage = getStageFromPipeline<PipelineStageElementConfig>(selectedStageId).stage
  const pipelineIdentifier = get(selectedStage?.stage as PipelineStageElementConfig, 'spec.pipeline', '')
  const projectIdentifier = get(selectedStage?.stage as PipelineStageElementConfig, 'spec.project', '')
  const orgIdentifier = get(selectedStage?.stage as PipelineStageElementConfig, 'spec.org', '')

  const { inputSetType, inputSetValue, inputSetLabel, inputSetRepoIdentifier, inputSetBranch } = useQueryParams<
    GitQueryParams & RunPipelineQueryParams
  >()

  const inputSetSelected = useMemo((): InputSetValue[] => {
    if (inputSetType) {
      const inputSetsSelected: InputSetValue[] = [
        {
          type: inputSetType as InputSetSummaryResponse['inputSetType'],
          value: inputSetValue ?? '',
          label: inputSetLabel ?? '',
          gitDetails: {
            repoIdentifier: inputSetRepoIdentifier,
            branch: inputSetBranch
          }
        }
      ]
      return inputSetsSelected
    }
    return []
  }, [inputSetType, inputSetValue, inputSetLabel, inputSetRepoIdentifier, inputSetBranch])

  const [formErrors, setFormErrors] = useState<FormikErrors<InputSetDTO>>({})
  const formikRef = useRef<FormikProps<PipelineInfoConfig>>()
  const { getString } = useStrings()
  const {
    setPipeline: updatePipelineInVariablesContext,
    setSelectedInputSetsContext,
    selectedInputSetsContext
  } = usePipelineVariables()
  const [existingProvide, setExistingProvide] = useState<ExistingProvide>('existing')
  const [inputTabFormValues, setInputTabFormValues] = React.useState<PipelineInfoConfig | undefined>(
    pipelineFromContext
  )
  const [loadingMergedTemplateInputs, setLoadingMergedTemplateInputs] = React.useState<boolean>(false)
  const tempPipelineInputs = useRef<PipelineInfoConfig | undefined>(undefined)
  const [selectedInputSets, setSelectedInputSets] = useState<InputSetSelectorProps['value']>(selectedInputSetsContext)
  const [invalidInputSetReferences, setInvalidInputSetReferences] = useState<Array<string>>([])
  const { subscribeForm, unSubscribeForm } = useContext(StageErrorContext)

  const { data: pipelineResponse, loading: loadingPipeline } = useGetPipeline({
    pipelineIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch,
      getTemplatesResolvedPipeline: true,
      parentEntityConnectorRef: connectorRef,
      parentEntityRepoName: repoIdentifier
    }
  })

  const pipeline: PipelineInfoConfig | undefined = useMemo(
    () => yamlParse<PipelineConfig>(defaultTo(pipelineResponse?.data?.yamlPipeline, ''))?.pipeline,
    [pipelineResponse?.data?.yamlPipeline]
  )

  const resolvedPipeline: PipelineInfoConfig | undefined = useMemo(
    () => yamlParse<PipelineConfig>(defaultTo(pipelineResponse?.data?.resolvedTemplatesPipelineYaml, ''))?.pipeline,
    [pipelineResponse?.data?.resolvedTemplatesPipelineYaml]
  )

  const { data: inputSetYamlResponse, loading: loadingTemplate } = useMutateAsGet(useGetTemplateFromPipeline, {
    body: {
      stageIdentifiers: []
    },
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      branch,
      repoIdentifier,
      parentEntityConnectorRef: connectorRef,
      parentEntityRepoName: repoIdentifier
    }
  })

  const { data: inputSetData, loading: loadingInputSetsData } = useMutateAsGet(
    useGetMergeInputSetFromPipelineTemplateWithListInput,
    {
      body: {
        inputSetReferences: selectedInputSets?.map(row => row.value),
        stageIdentifiers: []
      },
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        pipelineRepoID: repoIdentifier,
        pipelineBranch: branch,
        repoIdentifier,
        branch,
        getDefaultFromOtherRepo: true
      }
    }
  )

  useEffect(() => {
    if (inputSetData?.data?.errorResponse) {
      setSelectedInputSets([])
    }
    setInvalidInputSetReferences(get(inputSetData?.data, 'inputSetErrorWrapper.invalidInputSetReferences', []))
  }, [inputSetData?.data, inputSetData?.data?.errorResponse])

  const onReconcile = (identifier: string): void => {
    remove(invalidInputSetReferences, id => id === identifier)
    setInvalidInputSetReferences(invalidInputSetReferences)
  }

  const inputSetTemplate = useMemo((): Pipeline => {
    if (inputSetYamlResponse?.data?.inputSetTemplateYaml) {
      const parsedRunPipelineYaml = memoizedParse<Pipeline>(inputSetYamlResponse.data.inputSetTemplateYaml).pipeline
      return { pipeline: parsedRunPipelineYaml }
    }
    return {} as Pipeline
  }, [inputSetYamlResponse?.data?.inputSetTemplateYaml])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceUpdateStage = useCallback(
    debounce(
      (changedStage?: PipelineStageElementConfig) =>
        changedStage ? updateStage(changedStage) : /* istanbul ignore next */ Promise.resolve(),
      300
    ),
    [updateStage]
  )

  const hasInputSets = !!inputSetYamlResponse?.data?.hasInputSets
  const loadingInputSets = loadingTemplate || loadingInputSetsData || loadingMergedTemplateInputs
  const hasRuntimeInputs = !!inputSetYamlResponse?.data?.inputSetTemplateYaml

  useEffect(() => {
    subscribeForm({
      tab: PipelineStageTabs.INPUTS,
      form: formikRef as React.MutableRefObject<FormikProps<unknown> | null>
    })
    return () =>
      unSubscribeForm({
        tab: PipelineStageTabs.INPUTS,
        form: formikRef as React.MutableRefObject<FormikProps<unknown> | null>
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setSelectedInputSets(inputSetSelected)
    setSelectedInputSetsContext?.(inputSetSelected)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputSetSelected])

  useDeepCompareEffect(() => {
    if (resolvedPipeline) {
      updatePipelineInVariablesContext(resolvedPipeline)
    }
  }, [resolvedPipeline])

  const selectedInputSetReferences: string[] | undefined = React.useMemo(() => {
    return selectedInputSets?.map(getInputSetReference)
  }, [selectedInputSets])

  const updateInputTabFormValues = (newFormValues?: PipelineInfoConfig): void => {
    const updatedStage = produce(selectedStage?.stage as PipelineStageElementConfig, draft => {
      if (!hasInputSets || existingProvide === 'provide') {
        set(draft, 'spec.pipelineInputs.pipeline', replaceDefaultValues(newFormValues))
        delete draft?.spec?.inputSetReferences
      } else {
        set(draft, 'spec.inputSetReferences', defaultTo(selectedInputSetReferences, []))
        delete draft?.spec?.pipelineInputs
      }
    })
    setInputTabFormValues(replaceDefaultValues(newFormValues) as PipelineInfoConfig)
    updateStage(updatedStage)
  }

  const getFormErrors = async (
    latestPipeline: { pipeline: PipelineInfoConfig },
    latestYamlTemplate: PipelineInfoConfig,
    orgPipeline: PipelineInfoConfig | undefined,
    selectedStages: StageSelectionData | undefined
  ): Promise<FormikErrors<InputSetDTO>> => {
    let errors = formErrors
    function validateErrors(): Promise<FormikErrors<InputSetDTO>> {
      return new Promise(resolve => {
        const validatedErrors =
          (validatePipeline({
            pipeline: { ...clearRuntimeInput(latestPipeline.pipeline) },
            template: latestYamlTemplate,
            originalPipeline: orgPipeline,
            resolvedPipeline,
            getString,
            viewType: StepViewType.DeploymentForm,
            selectedStageData: selectedStages
          }) as any) || formErrors
        resolve(validatedErrors)
      })
    }
    if (latestPipeline?.pipeline && latestYamlTemplate && orgPipeline) {
      errors = await validateErrors()
      setFormErrors({ ...errors })
    }
    return errors
  }

  useEffect(() => {
    if (
      hasRuntimeInputs &&
      !isUndefined(selectedInputSets) &&
      selectedInputSets.length > 0 &&
      inputSetData?.data?.pipelineYaml
    ) {
      const parsedInputSets = memoizedParse<Pipeline>(inputSetData.data.pipelineYaml).pipeline
      const mergeTemplateInputSetData = mergeTemplateWithInputSetData({
        templatePipeline: { pipeline: inputSetTemplate.pipeline },
        inputSetPortion: { pipeline: parsedInputSets },
        allValues: { pipeline: defaultTo(resolvedPipeline, {} as PipelineInfoConfig) },
        shouldUseDefaultValues: true
      })
      updateInputTabFormValues(mergeTemplateInputSetData?.pipeline)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInputSets, inputSetData?.data])

  const handleValidation = async (values: Pipeline | PipelineInfoConfig): Promise<FormikErrors<InputSetDTO>> => {
    let tempPipeline: PipelineInfoConfig

    if ((values as Pipeline)?.pipeline) {
      tempPipeline = (values as Pipeline).pipeline
    } else {
      tempPipeline = values as PipelineInfoConfig
    }

    const inputTabFormErrors = await getFormErrors(
      { pipeline: tempPipeline } as Required<Pipeline>,
      defaultTo(inputSetTemplate?.pipeline, {} as PipelineInfoConfig),
      pipeline,
      {} as StageSelectionData
    )
    const stageData = produce(selectedStage, (draft: StageElementWrapper<PipelineStageElementConfig>) => {
      set(draft, 'stage.spec.pipelineInputs.pipeline', tempPipeline)
    })
    debounceUpdateStage(stageData?.stage)

    return inputTabFormErrors
  }

  useDeepCompareEffect(() => {
    if (!isEmpty(inputSetTemplate.pipeline)) {
      setLoadingMergedTemplateInputs(true)
      try {
        getsMergedTemplateInputYamlPromise({
          body: {
            oldTemplateInputs: stringify(defaultTo(selectedStage?.stage?.spec?.pipelineInputs?.pipeline, '')),
            newTemplateInputs: stringify(inputSetTemplate.pipeline)
          },
          queryParams: {
            accountIdentifier: accountId
          }
        }).then(response => {
          if (response && response.status === 'SUCCESS') {
            setLoadingMergedTemplateInputs(false)
            updateInputTabFormValues(parse(get(response, 'data.mergedTemplateInputs', '')))
          } else {
            throw response
          }
        })
      } catch (error) {
        setLoadingMergedTemplateInputs(false)
        updateInputTabFormValues(inputSetTemplate.pipeline)
      }
    }
  }, [inputSetTemplate])

  if (loadingPipeline) {
    return <PageSpinner />
  }

  const currentPipeline = { pipeline: get(formikRef.current, 'values') }

  const showInputSetSelector = (): boolean => {
    return !!(pipeline && currentPipeline && hasRuntimeInputs && existingProvide === 'existing')
  }

  const showPipelineInputSetForm = (): boolean => {
    return (
      !!(
        (existingProvide === 'provide' || selectedInputSets?.length) &&
        currentPipeline?.pipeline &&
        resolvedPipeline
      ) &&
      hasRuntimeInputs &&
      !loadingInputSets
    )
  }

  const showVoidPipelineInputSetForm = (): boolean => {
    return !!(existingProvide === 'existing' && selectedInputSets?.length)
  }

  const handleExistingProvideRadioChange = (ev: FormEvent<HTMLInputElement>): void => {
    const existingProvideValue = (ev.target as HTMLInputElement).value as ExistingProvide
    setExistingProvide(existingProvideValue)
    let stageData = undefined
    switch (existingProvideValue) {
      case 'existing': {
        stageData = produce(selectedStage, (draft: StageElementWrapper<PipelineStageElementConfig>) => {
          set(draft, 'stage.spec.inputSetReferences', selectedInputSetReferences)
          tempPipelineInputs.current = draft?.stage?.spec?.pipelineInputs?.pipeline as PipelineInfoConfig
          delete draft?.stage?.spec?.pipelineInputs
        })
        break
      }
      case 'provide': {
        stageData = produce(selectedStage, (draft: StageElementWrapper<PipelineStageElementConfig>) => {
          set(draft, 'stage.spec.pipelineInputs.pipeline', defaultTo(tempPipelineInputs.current, inputTabFormValues))
          delete draft?.stage?.spec?.inputSetReferences
        })
        break
      }
    }
    debounceUpdateStage(stageData?.stage)
  }

  const noRuntimeInputs =
    resolvedPipeline && currentPipeline && !hasRuntimeInputs ? getString('runPipelineForm.noRuntimeInput') : undefined

  return (
    <Container>
      <Formik<PipelineInfoConfig>
        initialValues={inputTabFormValues as PipelineInfoConfig}
        formName="inputTabPipelineStageForm"
        validate={handleValidation}
        enableReinitialize={true}
        onSubmit={noop}
      >
        {(formik: FormikProps<PipelineInfoConfig>) => {
          const { values } = formik
          formikRef.current = formik
          window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: PipelineStageTabs.INPUTS }))

          if (hasRuntimeInputs && isEmpty(values)) {
            return <PageSpinner />
          }

          return (
            <FormikForm>
              {noRuntimeInputs ? (
                <Layout.Horizontal padding="medium" margin="medium">
                  <Text>{noRuntimeInputs}</Text>
                </Layout.Horizontal>
              ) : (
                <>
                  {hasInputSets ? (
                    <>
                      <Layout.Vertical className={css.pipelineHeader}>
                        <SelectExistingInputsOrProvideNew
                          existingProvide={existingProvide}
                          onExistingProvideRadioChange={handleExistingProvideRadioChange}
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
                              reRunInputSetYaml={''}
                              usePortal={true}
                            />
                          </GitSyncStoreProvider>
                        ) : null}
                      </Layout.Vertical>
                    </>
                  ) : null}
                  {showPipelineInputSetForm() ? (
                    <>
                      {existingProvide === 'existing' ? <div className={css.divider} /> : null}
                      <PipelineInputSetFormInternal
                        originalPipeline={resolvedPipeline as PipelineInfoConfig}
                        template={defaultTo(inputSetTemplate?.pipeline, {} as PipelineInfoConfig)}
                        readonly={existingProvide === 'existing'}
                        path=""
                        viewType={StepViewType.TemplateUsage}
                        maybeContainerClass={existingProvide === 'provide' ? css.inputSetFormRunPipeline : ''}
                        selectedStageData={{} as StageSelectionData}
                        allowableTypes={allowableTypes}
                      />
                    </>
                  ) : null}
                  {showVoidPipelineInputSetForm() ? <div className={css.noPipelineInputSetForm} /> : null}
                </>
              )}
            </FormikForm>
          )
        }}
      </Formik>
    </Container>
  )
}

export function PipelineStageInputSection({
  children,
  storeMetadata
}: React.PropsWithChildren<{
  storeMetadata?: StoreMetadata
}>): React.ReactElement {
  const scrollRef = useRef<HTMLDivElement | null>(null)

  return (
    <div className={cx(css.stageSection, css.editStageGrid)}>
      <ErrorsStripBinded domRef={scrollRef as React.MutableRefObject<HTMLElement | undefined>} />
      <div className={css.contentSection} ref={scrollRef}>
        <PipelineVariablesContextProvider storeMetadata={storeMetadata}>
          <PipelineInputSetFormBasic />
        </PipelineVariablesContextProvider>
        <Container margin={{ top: 'xxlarge' }} className={css.navigationButtons}>
          {children}
        </Container>
      </div>
    </div>
  )
}
