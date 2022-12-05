/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, isEmpty, merge, noop, omit } from 'lodash-es'
import {
  Layout,
  NestedAccordionProvider,
  Text,
  PageHeader,
  PageBody,
  VisualYamlSelectedView as SelectedView,
  VisualYamlToggle
} from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import type { InputSetResponse, PipelineInfoConfig } from 'services/pipeline-ng'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import {
  useGetTemplateFromPipeline,
  useGetPipeline,
  useCreateInputSetForPipeline,
  useGetInputSetForPipeline,
  useUpdateInputSetForPipeline,
  ResponseInputSetResponse,
  useGetMergeInputSetFromPipelineTemplateWithListInput,
  ResponsePMSPipelineResponseDTO,
  ResponseInputSetTemplateWithReplacedExpressionsResponse
} from 'services/pipeline-ng'

import { useToaster } from '@common/exports'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import type {
  GitQueryParams,
  InputSetGitQueryParams,
  InputSetPathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { useStrings } from 'framework/strings'
import { AppStoreContext } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { useMutateAsGet, useQueryParams } from '@common/hooks'
import type { GitContextProps } from '@common/components/GitContextForm/GitContextForm'
import { parse } from '@common/utils/YamlHelperMethods'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { StoreMetadata, StoreType } from '@common/constants/GitSyncTypes'
import type { InputSetDTO, InputSetType, Pipeline, InputSet } from '@pipeline/utils/types'
import { isInputSetInvalid } from '@pipeline/utils/inputSetUtils'
import NoEntityFound from '@pipeline/pages/utils/NoEntityFound/NoEntityFound'
import { clearRuntimeInput } from '@pipeline/utils/runPipelineUtils'
import GitPopover from '../GitPopover/GitPopover'
import FormikInputSetForm from './FormikInputSetForm'
import { useSaveInputSet } from './useSaveInputSet'
import css from './InputSetForm.module.scss'

const getDefaultInputSet = (
  template: PipelineInfoConfig,
  orgIdentifier: string,
  projectIdentifier: string
): InputSetDTO => ({
  name: '',
  identifier: '',
  description: undefined,
  orgIdentifier,
  projectIdentifier,
  pipeline: template,
  repo: '',
  branch: ''
})

export interface InputSetFormProps {
  executionView?: boolean

  // Props to support embedding InputSetForm (create new) in a modal
  // @see src/modules/70-pipeline/components/InputSetForm/NewInputSetModal.tsx
  inputSetInitialValue?: InputSetDTO
  isNewInModal?: boolean
  className?: string
  onCancel?: () => void
  onCreateSuccess?: (response: ResponseInputSetResponse) => void
}

const getInputSet = (
  orgIdentifier: string,
  projectIdentifier: string,
  inputSetResponse: ResponseInputSetResponse | null,
  template: ResponseInputSetTemplateWithReplacedExpressionsResponse | null,
  mergeTemplate?: string,
  isGitSyncEnabled = false
): InputSetDTO | InputSetType => {
  if (inputSetResponse?.data) {
    const inputSetObj = inputSetResponse?.data

    const parsedInputSetObj = parse<InputSet>(defaultTo(inputSetObj?.inputSetYaml, ''))
    /*
      Context of the below if block
      We need to populate existing values of input set in the form.
      The values are to be filled come from 'merge' API i.e. mergeTemplate object
      But if the merge API fails (due to invalid input set or any other reason) - we populate the value from the input set response recevied (parsedInputSetObj).
    */
    const parsedPipelineWithValues = mergeTemplate
      ? defaultTo(parse<Pipeline>(defaultTo(mergeTemplate, ''))?.pipeline, {} as PipelineInfoConfig)
      : parsedInputSetObj?.inputSet?.pipeline

    if (isGitSyncEnabled && parsedInputSetObj && parsedInputSetObj.inputSet) {
      return {
        name: parsedInputSetObj.inputSet.name,
        tags: parsedInputSetObj.inputSet.tags,
        identifier: parsedInputSetObj.inputSet.identifier,
        description: parsedInputSetObj.inputSet.description,
        orgIdentifier: parsedInputSetObj.inputSet.orgIdentifier,
        projectIdentifier: parsedInputSetObj.inputSet.projectIdentifier,
        pipeline: clearRuntimeInput(parsedPipelineWithValues),
        gitDetails: defaultTo(inputSetObj.gitDetails, {}),
        inputSetErrorWrapper: defaultTo(inputSetObj.inputSetErrorWrapper, {}),
        entityValidityDetails: defaultTo(inputSetObj.entityValidityDetails, {}),
        outdated: inputSetObj.outdated
      }
    }
    return {
      name: inputSetObj.name,
      tags: inputSetObj.tags,
      identifier: defaultTo(inputSetObj.identifier, ''),
      description: inputSetObj?.description,
      orgIdentifier,
      projectIdentifier,
      pipeline: clearRuntimeInput(parsedPipelineWithValues),
      gitDetails: defaultTo(inputSetObj.gitDetails, {}),
      inputSetErrorWrapper: defaultTo(inputSetObj.inputSetErrorWrapper, {}),
      entityValidityDetails: defaultTo(inputSetObj.entityValidityDetails, {}),
      outdated: inputSetObj.outdated
    }
  }
  return getDefaultInputSet(
    clearRuntimeInput(parse<Pipeline>(defaultTo(template?.data?.inputSetTemplateYaml, ''))?.pipeline),
    orgIdentifier,
    projectIdentifier
  )
}

export function InputSetForm(props: InputSetFormProps): React.ReactElement {
  const { executionView, inputSetInitialValue, isNewInModal, className, onCancel, onCreateSuccess = noop } = props
  const { getString } = useStrings()
  const [isEdit, setIsEdit] = React.useState(false)
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier, inputSetIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { repoIdentifier, branch, inputSetRepoIdentifier, inputSetBranch, connectorRef, repoName, storeType } =
    useQueryParams<InputSetGitQueryParams>()
  const {
    isGitSyncEnabled: isGitSyncEnabledForProject,
    gitSyncEnabledOnlyForFF,
    supportingGitSimplification
  } = React.useContext(AppStoreContext)
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const [inputSetUpdateResponse, setInputSetUpdateResponse] = React.useState<ResponseInputSetResponse>()
  const [filePath, setFilePath] = React.useState<string>()
  const {
    refetch: refetchTemplate,
    data: template,
    loading: loadingTemplate
  } = useMutateAsGet(useGetTemplateFromPipeline, {
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch,
      parentEntityConnectorRef: connectorRef,
      parentEntityRepoName: repoName
    },
    body: {
      stageIdentifiers: []
    },
    lazy: true
  })

  const [selectedView, setSelectedView] = React.useState<SelectedView>(SelectedView.VISUAL)
  const [yamlHandler, setYamlHandler] = React.useState<YamlBuilderHandlerBinding | undefined>()
  const [formErrors, setFormErrors] = React.useState<Record<string, any>>({})
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()

  const {
    data: inputSetResponse,
    refetch,
    loading: loadingInputSet,
    error: inputSetError
  } = useGetInputSetForPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      ...(isGitSyncEnabled
        ? {
            pipelineRepoID: repoIdentifier,
            pipelineBranch: branch
          }
        : {}),
      repoIdentifier: isGitSyncEnabled ? inputSetRepoIdentifier : repoName,
      branch: isGitSyncEnabled ? inputSetBranch : branch
    },
    inputSetIdentifier: defaultTo(inputSetIdentifier, ''),
    lazy: true
  })

  const [mergeTemplate, setMergeTemplate] = React.useState<string>()
  const { mutate: mergeInputSet, loading: loadingMerge } = useGetMergeInputSetFromPipelineTemplateWithListInput({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      pipelineIdentifier,
      pipelineRepoID: repoIdentifier,
      pipelineBranch: branch,
      repoIdentifier: isGitSyncEnabled ? inputSetRepoIdentifier : repoName,
      branch: isGitSyncEnabled ? inputSetBranch : branch,
      parentEntityConnectorRef: connectorRef,
      parentEntityRepoName: repoIdentifier
    }
  })

  const { mutate: createInputSet, loading: createInputSetLoading } = useCreateInputSetForPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      pipelineRepoID: repoIdentifier,
      pipelineBranch: branch
    },
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })
  const { mutate: updateInputSet, loading: updateInputSetLoading } = useUpdateInputSetForPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      pipelineRepoID: repoIdentifier,
      pipelineBranch: branch
    },
    inputSetIdentifier: '',
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })

  const {
    data: pipeline,
    loading: loadingPipeline,
    refetch: refetchPipeline
  } = useGetPipeline({
    pipelineIdentifier,
    lazy: true,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch,
      getTemplatesResolvedPipeline: true,
      parentEntityConnectorRef: connectorRef,
      parentEntityRepoName: repoName
    }
  })

  const { handleSubmit } = useSaveInputSet({
    createInputSet,
    updateInputSet,
    inputSetResponse,
    isEdit,
    setFormErrors,
    onCreateSuccess
  })

  const inputSet: InputSetDTO | InputSetType = React.useMemo(() => {
    if (inputSetUpdateResponse) {
      return getInputSet(
        orgIdentifier,
        projectIdentifier,
        inputSetUpdateResponse,
        template,
        mergeTemplate,
        isGitSyncEnabled
      )
    }
    return getInputSet(orgIdentifier, projectIdentifier, inputSetResponse, template, mergeTemplate, isGitSyncEnabled)
  }, [
    mergeTemplate,
    inputSetResponse?.data,
    template?.data?.inputSetTemplateYaml,
    isGitSyncEnabled,
    inputSetUpdateResponse
  ])

  const [disableVisualView, setDisableVisualView] = React.useState(inputSet.entityValidityDetails?.valid === false)

  const formikRef = React.useRef<FormikProps<InputSetDTO & GitContextProps & StoreMetadata>>()

  const inputSetUpdateResponseHandler = (responseData: InputSetResponse): void => {
    setInputSetUpdateResponse({
      data: {
        ...responseData,
        inputSetYaml: responseData?.inputSetYaml
      }
    })
  }

  React.useEffect(() => {
    if (!isEmpty(inputSet)) setFilePath(getFilePath(inputSet))
    if (!isInputSetInvalid(inputSet)) {
      setSelectedView(SelectedView.VISUAL)
    } else {
      setSelectedView(SelectedView.YAML)
    }
  }, [inputSet, inputSet.entityValidityDetails?.valid])

  React.useEffect(() => {
    if (inputSet.entityValidityDetails?.valid === false || inputSet.outdated) {
      setDisableVisualView(true)
    } else {
      setDisableVisualView(false)
    }
  }, [inputSet.entityValidityDetails?.valid, inputSet.outdated])

  React.useEffect(() => {
    if (inputSetIdentifier !== '-1' && !isNewInModal) {
      setIsEdit(true)
      refetch({ pathParams: { inputSetIdentifier: inputSetIdentifier } })
      refetchTemplate()
      refetchPipeline()
    } else {
      refetchTemplate()
      refetchPipeline()

      setIsEdit(false)
    }
  }, [inputSetIdentifier])
  React.useEffect(() => {
    if (!loadingInputSet && inputSetResponse && !isInputSetInvalid(inputSet)) {
      // Merge only if inputset is valid
      mergeInputSet({ inputSetReferences: [inputSetIdentifier] })
        .then(response => {
          setMergeTemplate(response.data?.pipelineYaml)
        })
        .catch(e => {
          setMergeTemplate(undefined)
          showError(getRBACErrorMessage(e), undefined, 'pipeline.get.template')
        })
    }
  }, [inputSetIdentifier, loadingInputSet])

  useDocumentTitle(
    isNewInModal
      ? document.title
      : [
          defaultTo(
            parse<Pipeline>(defaultTo(pipeline?.data?.yamlPipeline, ''))?.pipeline?.name,
            getString('pipelines')
          ),
          isEdit ? defaultTo(inputSetResponse?.data?.name, '') : getString('inputSets.newInputSetLabel')
        ]
  )

  const getFilePath = React.useCallback(
    (inputSetYamlVisual: InputSetDTO) => {
      if (inputSet.gitDetails?.filePath) {
        return inputSet.gitDetails?.filePath
      }
      if (filePath) {
        return filePath
      }
      return inputSetYamlVisual.identifier ? `.harness/${inputSetYamlVisual.identifier}.yaml` : ''
    },
    [inputSet, filePath]
  )

  const handleModeSwitch = React.useCallback(
    (view: SelectedView) => {
      if (view === SelectedView.VISUAL) {
        const yaml = defaultTo(yamlHandler?.getLatestYaml(), '')
        const inputSetYamlVisual = parse<InputSet>(yaml).inputSet
        if (inputSetYamlVisual) {
          inputSet.name = inputSetYamlVisual.name
          inputSet.identifier = inputSetYamlVisual.identifier
          inputSet.description = inputSetYamlVisual.description
          inputSet.pipeline = inputSetYamlVisual.pipeline

          formikRef.current?.setValues({
            ...omit(inputSet, 'gitDetails', 'entityValidityDetails', 'outdated', 'inputSetErrorWrapper'),
            repo: defaultTo(repoIdentifier || repoName, ''),
            branch: defaultTo(branch, ''),
            connectorRef: defaultTo(connectorRef, ''),
            repoName: defaultTo(repoName, ''),
            storeType: defaultTo(storeType, StoreType.INLINE),
            filePath: getFilePath(inputSetYamlVisual)
          })
          setFilePath(getFilePath(inputSetYamlVisual))
        }
      } else {
        setFilePath(formikRef.current?.values.filePath)
      }
      setSelectedView(view)
    },
    [yamlHandler?.getLatestYaml, inputSet]
  )

  const child = React.useCallback(
    () => (
      <FormikInputSetForm
        inputSet={isNewInModal && inputSetInitialValue ? merge(inputSet, inputSetInitialValue) : inputSet}
        template={template}
        pipeline={pipeline}
        resolvedTemplatesPipelineYaml={pipeline?.data?.resolvedTemplatesPipelineYaml}
        handleSubmit={handleSubmit}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        yamlHandler={yamlHandler}
        setYamlHandler={setYamlHandler}
        formikRef={formikRef}
        selectedView={selectedView}
        executionView={executionView}
        isEdit={isEdit}
        isGitSyncEnabled={isGitSyncEnabled}
        supportingGitSimplification={supportingGitSimplification}
        className={className}
        onCancel={onCancel}
        filePath={filePath}
        inputSetUpdateResponseHandler={inputSetUpdateResponseHandler}
      />
    ),
    [
      inputSet,
      template,
      pipeline,
      pipeline?.data?.resolvedTemplatesPipelineYaml,
      handleSubmit,
      formErrors,
      setFormErrors,
      yamlHandler,
      setYamlHandler,
      formikRef,
      selectedView,
      executionView,
      isEdit,
      isGitSyncEnabled,
      updateInputSetLoading,
      filePath
    ]
  )

  if (executionView) {
    return child()
  }

  if (supportingGitSimplification && !loadingInputSet && inputSetError) {
    return (
      <NoEntityFound identifier={inputSetIdentifier} entityType={'inputSet'} errorObj={inputSetError.data as Error} />
    )
  }

  if (loadingInputSet || loadingPipeline || loadingTemplate || loadingMerge) {
    return <ContainerSpinner height={'100vh'} flex={{ align: 'center-center' }} />
  }

  return (
    <InputSetFormWrapper
      loading={!isGitSyncEnabled && (createInputSetLoading || updateInputSetLoading)}
      isEdit={isEdit}
      selectedView={selectedView}
      handleModeSwitch={handleModeSwitch}
      inputSet={inputSet}
      pipeline={pipeline}
      isGitSyncEnabled={isGitSyncEnabled}
      disableVisualView={disableVisualView}
    >
      {child()}
    </InputSetFormWrapper>
  )
}

export interface InputSetFormWrapperProps {
  isEdit: boolean
  children: React.ReactNode
  selectedView: SelectedView
  loading: boolean
  handleModeSwitch(mode: SelectedView): void
  inputSet: InputSetDTO
  pipeline: ResponsePMSPipelineResponseDTO | null
  isGitSyncEnabled?: boolean
  disableVisualView: boolean
}

export function InputSetFormWrapper(props: InputSetFormWrapperProps): React.ReactElement {
  const {
    isEdit,
    children,
    selectedView,
    handleModeSwitch,
    loading,
    inputSet,
    pipeline,
    isGitSyncEnabled,
    disableVisualView
  } = props
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier, module } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { connectorRef, repoIdentifier, repoName, branch, storeType } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()

  return (
    <React.Fragment>
      <GitSyncStoreProvider>
        <PageHeader
          className={css.pageHeaderStyles}
          title={
            <Layout.Horizontal width="42%">
              <Text lineClamp={1} color={Color.GREY_800} font={{ weight: 'bold', variation: FontVariation.H4 }}>
                {isEdit
                  ? getString('inputSets.editTitle', { name: inputSet.name })
                  : getString('inputSets.newInputSetLabel')}
              </Text>
              {isGitSyncEnabled && isEdit && (
                <GitPopover
                  data={defaultTo(inputSet.gitDetails, {})}
                  iconProps={{ margin: { left: 'small', top: 'xsmall' } }}
                />
              )}
              <div className={css.optionBtns}>
                <VisualYamlToggle
                  selectedView={selectedView}
                  onChange={nextMode => {
                    handleModeSwitch(nextMode)
                  }}
                  disableToggle={disableVisualView}
                  disableToggleReasonIcon={'danger-icon'}
                  showDisableToggleReason={true}
                />
              </div>
            </Layout.Horizontal>
          }
          breadcrumbs={
            <NGBreadcrumbs
              links={[
                {
                  url: routes.toPipelines({ orgIdentifier, projectIdentifier, accountId, module }),
                  label: getString('pipelines')
                },
                {
                  url: routes.toInputSetList({
                    orgIdentifier,
                    projectIdentifier,
                    accountId,
                    pipelineIdentifier,
                    module,
                    connectorRef,
                    repoIdentifier: isGitSyncEnabled ? pipeline?.data?.gitDetails?.repoIdentifier : repoIdentifier,
                    repoName,
                    branch: isGitSyncEnabled ? pipeline?.data?.gitDetails?.branch : branch,
                    storeType
                  }),
                  label: defaultTo(parse<Pipeline>(defaultTo(pipeline?.data?.yamlPipeline, ''))?.pipeline.name, '')
                }
              ]}
            />
          }
        />
      </GitSyncStoreProvider>
      <PageBody loading={loading}>{children}</PageBody>
    </React.Fragment>
  )
}

export function EnhancedInputSetForm(props: InputSetFormProps): React.ReactElement {
  return (
    <NestedAccordionProvider>
      <InputSetForm {...props} />
    </NestedAccordionProvider>
  )
}
