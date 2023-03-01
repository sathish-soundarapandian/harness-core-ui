/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Dialog, Classes } from '@blueprintjs/core'
import {
  Button,
  Formik,
  Layout,
  NestedAccordionProvider,
  ButtonVariation,
  PageSpinner,
  OverlaySpinner
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useModalHook } from '@harness/use-modal'
import cx from 'classnames'
import { useHistory } from 'react-router-dom'
import { isEmpty, defaultTo } from 'lodash-es'
import type { FormikErrors, FormikProps } from 'formik'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import {
  PipelineV1InfoConfig,
  ResponseJsonNode,
  useGetPipeline,
  usePostPipelineExecuteWithInputSetYaml,
  useRePostPipelineExecuteWithInputSetYaml,
  useDebugPipelineExecuteWithInputSetYaml
} from 'services/pipeline-ng'
import { useToaster } from '@common/exports'
import routes from '@common/RouteDefinitions'
import type {
  ExecutionPathProps,
  GitQueryParams,
  InputSetGitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacButton from '@rbac/components/Button/Button'
import { getFeaturePropsForRunPipelineButton } from '@pipeline/utils/runPipelineUtils'
import { useQueryParams } from '@common/hooks'
import { yamlStringify, yamlParse } from '@common/utils/YamlHelperMethods'
import { PipelineActions } from '@common/constants/TrackingConstants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import type { InputSetDTO } from '@pipeline/utils/types'
import { StoreMetadata, StoreType } from '@common/constants/GitSyncTypes'
import { getErrorsList } from '@pipeline/utils/errorUtils'
import { useShouldDisableDeployment } from 'services/cd-ng'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { PreFlightCheckModal } from '../../../components/PreFlightCheckModal/PreFlightCheckModal'
import { PipelineVariablesContextProvider } from '../../../components/PipelineVariablesContext/PipelineVariablesContext'
import { PipelineInvalidRequestContent } from '../../../components/RunPipelineModal/PipelineInvalidRequestContent'
import RunModalHeaderV1 from './RunModalHeaderV1'
import CheckBoxActions from '../../../components/RunPipelineModal/CheckBoxActions'
import VisualViewV1 from './VisualViewV1'
import { useInputSetsV1, InputsYaml } from './useInputSetsV1'
import { ActiveFreezeWarning } from '../../../components/RunPipelineModal/ActiveFreezeWarning'
import css from '../../../components/RunPipelineModal/RunPipelineForm.module.scss'

export interface RunPipelineFormV1Props extends PipelineType<PipelinePathProps & GitQueryParams> {
  onClose?: () => void
  executionView?: boolean
  mockData?: ResponseJsonNode
  executionIdentifier?: string
  source: ExecutionPathProps['source']
  storeMetadata?: StoreMetadata
  isDebugMode?: boolean
}

function RunPipelineFormV1Basic({
  pipelineIdentifier,
  accountId,
  orgIdentifier,
  projectIdentifier,
  onClose,
  module,
  executionView,
  branch,
  source,
  repoIdentifier,
  connectorRef,
  storeType,
  executionIdentifier,
  isDebugMode
}: RunPipelineFormV1Props & InputSetGitQueryParams): React.ReactElement {
  const { PIE_NG_GITX_CACHING: isGitCacheEnabled } = useFeatureFlags()
  const [skipPreFlightCheck, setSkipPreFlightCheck] = useState<boolean>(false)
  const [notifyOnlyMe, setNotifyOnlyMe] = useState<boolean>(false)
  const [formErrors] = useState<FormikErrors<InputSetDTO>>({})
  const { trackEvent } = useTelemetry()
  const { showError, showSuccess, showWarning } = useToaster()
  const formikRef = React.useRef<FormikProps<InputsYaml>>()
  const history = useHistory()
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()
  const { supportingGitSimplification } = useAppStore()
  const [runClicked, setRunClicked] = useState(false)
  const [resolvedPipeline, setResolvedPipeline] = useState<PipelineV1InfoConfig | undefined>()
  const formRefDom = React.useRef<HTMLElement | undefined>()
  const valuesPipelineRef = useRef<PipelineV1InfoConfig>()
  const { executionId } = useQueryParams<{ executionId?: string }>()
  const pipelineExecutionId = executionIdentifier ?? executionId
  const isRerunPipeline = !isEmpty(pipelineExecutionId)
  const formTitleText = isDebugMode
    ? getString('pipeline.execution.actions.reRunInDebugMode')
    : isRerunPipeline
    ? getString('pipeline.execution.actions.rerunPipeline')
    : getString('runPipeline')

  const { data: shouldDisableDeploymentData, loading: loadingShouldDisableDeployment } = useShouldDisableDeployment({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

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
    },
    requestOptions: { headers: { ...(isGitCacheEnabled ? { 'Load-From-Cache': 'true' } : {}) } }
  })

  const pipeline = React.useMemo(
    () => yamlParse<PipelineV1InfoConfig>(defaultTo(pipelineResponse?.data?.yamlPipeline, '')),
    [pipelineResponse?.data?.yamlPipeline]
  )

  const {
    inputSets,
    inputSetYaml,
    hasRuntimeInputs,
    hasCodebaseInputs,
    loading: loadingInputSets,
    error: inputSetsError
  } = useInputSetsV1({
    accountId,
    projectIdentifier,
    orgIdentifier,
    pipelineIdentifier,
    branch,
    repoIdentifier,
    connectorRef
  })

  useEffect(() => {
    setResolvedPipeline(
      yamlParse<PipelineV1InfoConfig>(defaultTo(pipelineResponse?.data?.resolvedTemplatesPipelineYaml, ''))
    )
  }, [pipelineResponse?.data?.resolvedTemplatesPipelineYaml])

  useEffect(() => {
    if (inputSetsError) {
      showError(getRBACErrorMessage(inputSetsError))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputSetsError])

  const { mutate: runPipeline, loading: runPipelineLoading } = usePostPipelineExecuteWithInputSetYaml({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      moduleType: module || '',
      repoIdentifier,
      branch,
      notifyOnlyUser: notifyOnlyMe,
      parentEntityConnectorRef: connectorRef,
      parentEntityRepoName: repoIdentifier
    },
    identifier: pipelineIdentifier,
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    }
  })

  const { mutate: reRunPipeline, loading: reRunPipelineLoading } = useRePostPipelineExecuteWithInputSetYaml({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      moduleType: module || '',
      repoIdentifier,
      branch,
      parentEntityConnectorRef: connectorRef,
      parentEntityRepoName: repoIdentifier
    },
    identifier: pipelineIdentifier,
    originalExecutionId: defaultTo(pipelineExecutionId, ''),
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    }
  })

  const { mutate: runPipelineInDebugMode, loading: reRunDebugModeLoading } = useDebugPipelineExecuteWithInputSetYaml({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      moduleType: module || ''
    },
    identifier: pipelineIdentifier,
    originalExecutionId: defaultTo(pipelineExecutionId, ''),
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    }
  })

  const [showPreflightCheckModal, hidePreflightCheckModal] = useModalHook(() => {
    return (
      <Dialog
        className={cx(css.preFlightCheckModal, Classes.DIALOG)}
        enforceFocus={false}
        isOpen
        onClose={hidePreflightCheckModal}
      >
        <PreFlightCheckModal
          module={module}
          accountId={accountId}
          orgIdentifier={orgIdentifier}
          projectIdentifier={projectIdentifier}
          pipelineIdentifier={pipelineIdentifier}
          branch={branch}
          repoIdentifier={repoIdentifier}
          onCloseButtonClick={hidePreflightCheckModal}
          onContinuePipelineClick={() => {
            hidePreflightCheckModal()
            handleRunPipeline(valuesPipelineRef.current, true)
          }}
        />
      </Dialog>
    )
  }, [notifyOnlyMe])

  const isExecutingPipeline = runPipelineLoading || reRunPipelineLoading || reRunDebugModeLoading

  const handleRunPipeline = useCallback(
    async (valuesPipelineInputs, forceSkipFlightCheck = false) => {
      if (Object.keys(formErrors).length) {
        return
      }

      valuesPipelineRef.current = valuesPipelineInputs
      if (!skipPreFlightCheck && !forceSkipFlightCheck) {
        // Not skipping pre-flight check - open the new modal
        showPreflightCheckModal()
        return
      }
      try {
        let response
        const finalYaml = isEmpty(valuesPipelineInputs) ? '' : yamlStringify(valuesPipelineInputs)

        if (isDebugMode) {
          response = await runPipelineInDebugMode(finalYaml as any)
        } else if (isRerunPipeline) {
          response = await reRunPipeline(finalYaml as any)
        } else {
          response = await runPipeline(finalYaml as any)
        }
        const data = response.data
        const governanceMetadata = data?.planExecution?.governanceMetadata

        if (response.status === 'SUCCESS') {
          if (onClose) {
            onClose()
          }
          if (response.data) {
            showSuccess(getString('runPipelineForm.pipelineRunSuccessFully'))
            history.push({
              pathname: routes.toExecutionPipelineView({
                orgIdentifier,
                pipelineIdentifier,
                projectIdentifier,
                executionIdentifier: defaultTo(data?.planExecution?.uuid, ''),
                accountId,
                module,
                source
              }),
              search:
                supportingGitSimplification && storeType === StoreType.REMOTE
                  ? `connectorRef=${connectorRef}&repoName=${repoIdentifier}&branch=${branch}&storeType=${storeType}`
                  : undefined,
              state: {
                shouldShowGovernanceEvaluations:
                  governanceMetadata?.status === 'error' || governanceMetadata?.status === 'warning',
                governanceMetadata
              }
            })
            trackEvent(PipelineActions.StartedExecution, { module })
          }
        }
      } catch (error: any) {
        showWarning(defaultTo(getRBACErrorMessage(error), getString('runPipelineForm.runPipelineFailed')))
      }

      return valuesPipelineInputs
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      runPipeline,
      showWarning,
      showSuccess,
      pipelineIdentifier,
      history,
      orgIdentifier,
      module,
      projectIdentifier,
      onClose,
      accountId,
      skipPreFlightCheck,
      formErrors,
      notifyOnlyMe
    ]
  )

  const shouldShowPageSpinner = (): boolean => {
    return loadingPipeline || loadingInputSets
  }

  if (shouldShowPageSpinner()) {
    return <PageSpinner />
  }

  let runPipelineFormContent: React.ReactElement | null = null

  if (inputSetsError?.message) {
    runPipelineFormContent = <PipelineInvalidRequestContent onClose={onClose} getTemplateError={inputSetsError} />
  } else {
    runPipelineFormContent = (
      <>
        <Formik
          initialValues={defaultTo(inputSetYaml, {})}
          formName="runPipeline"
          onSubmit={values => {
            // DO NOT return from here, causing the Formik form to handle loading state inconsistently
            handleRunPipeline(values, false)
          }}
        >
          {formik => {
            const { submitForm, values, setFormikState } = formik
            formikRef.current = formik

            // The values are updated in next tick.
            // Due to this, some fields do not work properly.
            // We need to delay the render in such scenario
            if (hasRuntimeInputs && isEmpty(values)) {
              return <PageSpinner />
            }

            return (
              <OverlaySpinner show={isExecutingPipeline}>
                <Layout.Vertical
                  ref={ref => {
                    formRefDom.current = ref as HTMLElement
                  }}
                >
                  <RunModalHeaderV1
                    runClicked={runClicked}
                    executionView={executionView}
                    pipelineResponse={pipelineResponse}
                    formRefDom={formRefDom}
                    formErrors={formErrors}
                    runModalHeaderTitle={formTitleText}
                  />
                  <VisualViewV1
                    inputSets={inputSets}
                    inputSetsError={inputSetsError}
                    executionView={executionView}
                    executionIdentifier={pipelineExecutionId}
                    submitForm={submitForm}
                    setRunClicked={setRunClicked}
                    loadingInputSets={loadingInputSets}
                    hasRuntimeInputs={hasRuntimeInputs}
                    hasCodebaseInputs={hasCodebaseInputs}
                    resolvedPipeline={resolvedPipeline}
                    connectorRef={connectorRef}
                    repoIdentifier={repoIdentifier}
                    formik={formik}
                  />
                  <CheckBoxActions
                    executionView={executionView}
                    notifyOnlyMe={notifyOnlyMe}
                    skipPreFlightCheck={skipPreFlightCheck}
                    setSkipPreFlightCheck={setSkipPreFlightCheck}
                    setNotifyOnlyMe={setNotifyOnlyMe}
                    storeType={storeType as StoreType}
                  />
                  <ActiveFreezeWarning data={shouldDisableDeploymentData?.data} />
                  {executionView ? null : (
                    <Layout.Horizontal
                      padding={{ left: 'xlarge', right: 'xlarge', top: 'large', bottom: 'large' }}
                      flex={{ justifyContent: 'space-between', alignItems: 'center' }}
                      className={css.footer}
                    >
                      <Layout.Horizontal className={cx(css.actionButtons)}>
                        <RbacButton
                          variation={ButtonVariation.PRIMARY}
                          intent="success"
                          type="submit"
                          text={formTitleText}
                          onClick={event => {
                            event.stopPropagation()
                            setRunClicked(true)
                            // _formSubmitCount is custom state var used to track submitCount.
                            // enableReinitialize prop resets the submitCount, so error checks fail.
                            setFormikState(prevState => ({ ...prevState, _formSubmitCount: 1 }))
                            submitForm()
                          }}
                          featuresProps={getFeaturePropsForRunPipelineButton({
                            modules: ['ci'],
                            getString
                          })}
                          permission={{
                            resource: {
                              resourceIdentifier: pipelineIdentifier as string,
                              resourceType: ResourceType.PIPELINE
                            },
                            permission: PermissionIdentifier.EXECUTE_PIPELINE
                          }}
                          disabled={
                            (getErrorsList(formErrors).errorCount > 0 && runClicked) ||
                            loadingShouldDisableDeployment ||
                            loadingInputSets
                          }
                        />
                        <div className={css.secondaryButton}>
                          <Button
                            variation={ButtonVariation.TERTIARY}
                            id="cancel-runpipeline"
                            text={getString('cancel')}
                            margin={{ left: 'medium' }}
                            background={Color.GREY_50}
                            onClick={() => {
                              if (onClose) {
                                onClose()
                              }
                            }}
                          />
                        </div>
                      </Layout.Horizontal>
                    </Layout.Horizontal>
                  )}
                </Layout.Vertical>
              </OverlaySpinner>
            )
          }}
        </Formik>
      </>
    )
  }
  return executionView ? (
    <div className={css.runFormExecutionView}>{runPipelineFormContent}</div>
  ) : (
    <RunPipelineFormWrapper
      accountId={accountId}
      orgIdentifier={orgIdentifier}
      pipelineIdentifier={pipelineIdentifier}
      projectIdentifier={projectIdentifier}
      module={module}
      pipeline={pipeline}
    >
      {runPipelineFormContent}
    </RunPipelineFormWrapper>
  )
}

export interface RunPipelineFormV1WrapperProps extends PipelineType<PipelinePathProps> {
  children: React.ReactNode
  pipeline?: PipelineV1InfoConfig
}
export function RunPipelineFormWrapper(props: RunPipelineFormV1WrapperProps): React.ReactElement {
  const { children } = props

  return (
    <React.Fragment>
      <div className={css.runForm}>{children}</div>
    </React.Fragment>
  )
}

export function RunPipelineFormV1(props: RunPipelineFormV1Props & InputSetGitQueryParams): React.ReactElement {
  return (
    <NestedAccordionProvider>
      {props.executionView ? (
        <RunPipelineFormV1Basic {...props} />
      ) : (
        <PipelineVariablesContextProvider storeMetadata={props.storeMetadata}>
          <RunPipelineFormV1Basic {...props} />
        </PipelineVariablesContextProvider>
      )}
    </NestedAccordionProvider>
  )
}
