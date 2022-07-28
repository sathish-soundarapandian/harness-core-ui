/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState, useMemo } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import set from 'lodash-es/set'
import get from 'lodash-es/get'
import { isNull, isUndefined, omitBy } from 'lodash-es'
import {
  Container,
  Button,
  ButtonVariation,
  Layout,
  MultiStepProgressIndicator,
  PageSpinner,
  useToaster
} from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useSideNavContext } from 'framework/SideNavStore/SideNavContext'
import routes from '@common/RouteDefinitions'
import {
  ConnectorInfoDTO,
  ResponseConnectorResponse,
  ResponseScmConnectorResponse,
  useCreateDefaultScmConnector,
  UserRepoResponse,
  useUpdateConnector
} from 'services/cd-ng'
import {
  createPipelineV2Promise,
  NGTriggerConfigV2,
  ResponseNGTriggerResponse,
  ResponsePipelineSaveResponse,
  useCreateTrigger
} from 'services/pipeline-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { Status } from '@common/utils/Constants'
import { Connectors } from '@connectors/constants'
import {
  eventTypes,
  clearNullUndefined,
  ciCodebaseBuild,
  ciCodebaseBuildPullRequest
} from '@triggers/pages/triggers/utils/TriggersWizardPageUtils'
import type { TriggerConfigDTO } from '@triggers/pages/triggers/interface/TriggersWizardInterface'
import {
  InfraProvisioningWizardProps,
  WizardStep,
  InfraProvisiongWizardStepId,
  StepStatus,
  ACCOUNT_SCOPE_PREFIX,
  DEFAULT_PIPELINE_PAYLOAD,
  OAUTH2_USER_NAME,
  getFullRepoName,
  Hosting,
  GitAuthenticationMethod
} from './Constants'
import { SelectGitProvider, SelectGitProviderRef } from './SelectGitProvider'
import { SelectRepository, SelectRepositoryRef } from './SelectRepository'
import { getPRTriggerActions } from '../../../utils/HostedBuildsUtils'
import css from './InfraProvisioningWizard.module.scss'

export const InfraProvisioningWizard: React.FC<InfraProvisioningWizardProps> = props => {
  const { lastConfiguredWizardStepId = InfraProvisiongWizardStepId.SelectGitProvider, precursorData } = props
  const { preSelectedGitConnector, connectorsEligibleForPreSelection, secretForPreSelectedConnector } =
    precursorData || {}
  const { getString } = useStrings()
  const [disableBtn, setDisableBtn] = useState<boolean>(false)
  const [currentWizardStepId, setCurrentWizardStepId] =
    useState<InfraProvisiongWizardStepId>(lastConfiguredWizardStepId)
  const [showError, setShowError] = useState<boolean>(false)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const history = useHistory()
  const [showPageLoader, setShowPageLoader] = useState<boolean>(false)
  const [configuredGitConnector, setConfiguredGitConnector] = useState<ConnectorInfoDTO>()
  const selectGitProviderRef = React.useRef<SelectGitProviderRef | null>(null)
  const selectRepositoryRef = React.useRef<SelectRepositoryRef | null>(null)
  const { setShowGetStartedTabInMainMenu } = useSideNavContext()
  const { showError: showErrorToaster } = useToaster()

  useEffect(() => {
    setCurrentWizardStepId(lastConfiguredWizardStepId)
  }, [lastConfiguredWizardStepId])

  useEffect(() => {
    if (selectGitProviderRef.current?.validatedConnector) {
      setConfiguredGitConnector(selectGitProviderRef.current?.validatedConnector)
    } else if (preSelectedGitConnector) {
      setConfiguredGitConnector(preSelectedGitConnector)
    }
  }, [selectGitProviderRef.current?.validatedConnector, preSelectedGitConnector])

  const { mutate: createTrigger } = useCreateTrigger({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      targetIdentifier: ''
    },
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })

  const { mutate: createSCMConnector } = useCreateDefaultScmConnector({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: updateConnector } = useUpdateConnector({
    queryParams: { accountIdentifier: accountId }
  })

  const constructPipelinePayload = React.useCallback(
    (repository: UserRepoResponse): string | undefined => {
      const UNIQUE_PIPELINE_ID = new Date().getTime().toString()
      const { name: repoName, namespace } = repository
      if (!repoName || !namespace || !configuredGitConnector?.identifier) {
        return
      }

      const payload = DEFAULT_PIPELINE_PAYLOAD
      payload.pipeline.name = `${getString('buildText')} ${repoName}`
      payload.pipeline.identifier = `${getString('buildText')}_${repoName.replace(/-/g, '_')}_${UNIQUE_PIPELINE_ID}` // pipeline identifier cannot have spaces
      payload.pipeline.projectIdentifier = projectIdentifier
      payload.pipeline.orgIdentifier = orgIdentifier
      payload.pipeline.properties.ci.codebase.connectorRef = `${ACCOUNT_SCOPE_PREFIX}${configuredGitConnector?.identifier}`
      payload.pipeline.properties.ci.codebase.repoName = getFullRepoName(repository)

      try {
        return yamlStringify(payload)
      } catch (e) {
        // Ignore error
      }
    },
    [projectIdentifier, orgIdentifier, configuredGitConnector?.identifier]
  )

  const constructTriggerPayload = React.useCallback(
    ({
      pipelineId,
      eventType
    }: {
      pipelineId: string
      eventType: string
    }): NGTriggerConfigV2 | TriggerConfigDTO | undefined => {
      const connectorType: ConnectorInfoDTO['type'] | undefined = configuredGitConnector?.type
      if (!connectorType) {
        return
      }
      if (!pipelineId) {
        return
      }

      const pipelineInput = {
        pipeline: {
          identifier: pipelineId,
          properties: {
            ci: {
              codebase: {
                build: [eventTypes.PULL_REQUEST, eventTypes.MERGE_REQUEST].includes(eventType)
                  ? ciCodebaseBuildPullRequest
                  : ciCodebaseBuild
              }
            }
          }
        }
      }

      return {
        name: `${eventType} ${getString('common.triggerLabel')}`,
        identifier: `${eventType}_${getString('common.triggerLabel')}`,
        enabled: true,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier: pipelineId,
        source: {
          type: 'Webhook',
          spec: {
            type: connectorType,
            spec: {
              type: eventType,
              spec: {
                connectorRef: `${ACCOUNT_SCOPE_PREFIX}${configuredGitConnector?.identifier}`,
                repoName: selectRepositoryRef.current?.repository
                  ? getFullRepoName(selectRepositoryRef.current?.repository)
                  : '',
                autoAbortPreviousExecutions: false,
                actions: [eventTypes.PULL_REQUEST, eventTypes.MERGE_REQUEST].includes(eventType)
                  ? getPRTriggerActions(connectorType)
                  : []
              }
            }
          }
        },
        inputYaml: yamlStringify(omitBy(omitBy(pipelineInput, isUndefined), isNull))
      }
    },
    [
      configuredGitConnector,
      selectGitProviderRef?.current?.values?.gitProvider,
      selectRepositoryRef.current?.repository
    ]
  )

  const [wizardStepStatus, setWizardStepStatus] = useState<Map<InfraProvisiongWizardStepId, StepStatus>>(
    new Map<InfraProvisiongWizardStepId, StepStatus>([
      [InfraProvisiongWizardStepId.SelectGitProvider, StepStatus.InProgress],
      [InfraProvisiongWizardStepId.SelectRepository, StepStatus.ToDo]
    ])
  )

  const updateStepStatus = React.useCallback((stepIds: InfraProvisiongWizardStepId[], status: StepStatus) => {
    if (Array.isArray(stepIds)) {
      setWizardStepStatus((prevState: Map<InfraProvisiongWizardStepId, StepStatus>) => {
        const clonedState = new Map(prevState)
        stepIds.forEach((item: InfraProvisiongWizardStepId) => clonedState.set(item, status))
        return clonedState
      })
    }
  }, [])

  const setupPipelineAndTriggers = React.useCallback((): void => {
    if (selectRepositoryRef.current?.repository) {
      try {
        createPipelineV2Promise({
          body: constructPipelinePayload(selectRepositoryRef.current.repository) || '',
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier
          },
          requestOptions: { headers: { 'Content-Type': 'application/yaml' } }
        })
          .then((createPipelineResponse: ResponsePipelineSaveResponse) => {
            const { status } = createPipelineResponse
            if (status === Status.SUCCESS && createPipelineResponse?.data?.identifier) {
              const commonQueryParams = {
                accountIdentifier: accountId,
                orgIdentifier,
                projectIdentifier,
                targetIdentifier: createPipelineResponse?.data?.identifier
              }

              const createPRTrigger = createTrigger(
                yamlStringify({
                  trigger: clearNullUndefined(
                    constructTriggerPayload({
                      pipelineId: createPipelineResponse?.data?.identifier,
                      eventType:
                        configuredGitConnector?.type &&
                        [Connectors.GITHUB, Connectors.BITBUCKET].includes(configuredGitConnector?.type)
                          ? eventTypes.PULL_REQUEST
                          : eventTypes.MERGE_REQUEST
                    }) || {}
                  )
                }) as any,
                { queryParams: commonQueryParams }
              )

              const createPushTrigger = createTrigger(
                yamlStringify({
                  trigger: clearNullUndefined(
                    constructTriggerPayload({
                      pipelineId: createPipelineResponse?.data?.identifier,
                      eventType: eventTypes.PUSH
                    }) || {}
                  )
                }) as any,
                { queryParams: commonQueryParams }
              )

              Promise.all([createPushTrigger, createPRTrigger])
                .then((createTriggerResponses: [ResponseNGTriggerResponse, ResponseNGTriggerResponse]) => {
                  const [createPushTriggerResponse, createPRTriggerResponse] = createTriggerResponses
                  if (
                    createPushTriggerResponse?.status === Status.SUCCESS &&
                    createPRTriggerResponse?.status === Status.SUCCESS
                  ) {
                    setDisableBtn(false)
                    setShowPageLoader(false)
                    setShowGetStartedTabInMainMenu(false)
                    if (createPipelineResponse?.data?.identifier) {
                      history.push(
                        routes.toPipelineStudio({
                          accountId: accountId,
                          module: 'ci',
                          orgIdentifier,
                          projectIdentifier,
                          pipelineIdentifier: createPipelineResponse?.data?.identifier,
                          stageId: getString('buildText')
                        })
                      )
                    }
                  }
                })
                .catch(triggerCreationError => {
                  showErrorToaster(triggerCreationError?.data?.message)
                  setDisableBtn(false)
                  setShowPageLoader(false)
                })
            } else {
              showErrorToaster((createPipelineResponse as Error)?.message)
              setDisableBtn(false)
              setShowPageLoader(false)
            }
          })
          .catch(() => {
            setDisableBtn(false)
            setShowPageLoader(false)
          })
      } catch (e) {
        setDisableBtn(false)
        setShowPageLoader(false)
      }
    }
  }, [selectRepositoryRef.current?.repository, configuredGitConnector])

  const WizardSteps: Map<InfraProvisiongWizardStepId, WizardStep> = new Map([
    [
      InfraProvisiongWizardStepId.SelectGitProvider,
      {
        stepRender: (
          <SelectGitProvider
            ref={selectGitProviderRef}
            disableNextBtn={() => setDisableBtn(true)}
            enableNextBtn={() => setDisableBtn(false)}
            selectedHosting={Hosting.SaaS}
          />
        ),
        onClickNext: () => {
          const { values, setFieldTouched, validate, validatedConnector } = selectGitProviderRef.current || {}
          const { gitProvider, gitAuthenticationMethod } = values || {}
          if (!gitProvider) {
            setFieldTouched?.('gitProvider', true)
            return
          }
          if (!gitAuthenticationMethod) {
            setFieldTouched?.('gitAuthenticationMethod', true)
            return
          }
          if ((gitAuthenticationMethod === GitAuthenticationMethod.OAuth && validatedConnector) || validate?.()) {
            setCurrentWizardStepId(InfraProvisiongWizardStepId.SelectRepository)
            updateStepStatus([InfraProvisiongWizardStepId.SelectGitProvider], StepStatus.Success)
            updateStepStatus([InfraProvisiongWizardStepId.SelectRepository], StepStatus.InProgress)
          }
        },
        stepFooterLabel: 'ci.getStartedWithCI.selectRepo'
      }
    ],
    [
      InfraProvisiongWizardStepId.SelectRepository,
      {
        stepRender: (
          <SelectRepository
            ref={selectRepositoryRef}
            showError={showError}
            validatedConnector={configuredGitConnector}
            connectorsEligibleForPreSelection={connectorsEligibleForPreSelection}
            onConnectorSelect={(connector: ConnectorInfoDTO) => {
              setConfiguredGitConnector(connector)
              setShowError(false)
            }}
            disableNextBtn={() => setDisableBtn(true)}
            enableNextBtn={() => setDisableBtn(false)}
          />
        ),
        onClickBack: () => {
          setCurrentWizardStepId(InfraProvisiongWizardStepId.SelectGitProvider)
          updateStepStatus(
            [InfraProvisiongWizardStepId.SelectGitProvider, InfraProvisiongWizardStepId.SelectRepository],
            StepStatus.ToDo
          )
        },
        onClickNext: () => {
          const selectedRepo = selectRepositoryRef.current?.repository
          if (selectedRepo && configuredGitConnector?.spec) {
            updateStepStatus([InfraProvisiongWizardStepId.SelectRepository], StepStatus.Success)
            setDisableBtn(true)
            setShowPageLoader(true)
            if (selectGitProviderRef.current?.values?.gitAuthenticationMethod !== GitAuthenticationMethod.OAuth) {
              createSCMConnector({
                connector: set(
                  set(
                    configuredGitConnector,
                    'spec.validationRepo',
                    getFullRepoName(selectRepositoryRef?.current?.repository || {})
                  ),
                  'spec.authentication.spec.spec.username',
                  get(configuredGitConnector, 'spec.authentication.spec.spec.username') ?? OAUTH2_USER_NAME
                ),
                secret: preSelectedGitConnector
                  ? secretForPreSelectedConnector
                  : selectGitProviderRef?.current?.validatedSecret
              })
                .then((scmConnectorResponse: ResponseScmConnectorResponse) => {
                  if (scmConnectorResponse.status === Status.SUCCESS) {
                    setupPipelineAndTriggers()
                  }
                })
                .catch(scmCtrErr => {
                  showErrorToaster(scmCtrErr?.data?.message)
                  setDisableBtn(false)
                  setShowPageLoader(false)
                })
            } else {
              updateConnector({
                connector: set(
                  configuredGitConnector,
                  'spec.validationRepo',
                  getFullRepoName(selectRepositoryRef?.current?.repository || {})
                )
              })
                .then((oAuthConnectoResponse: ResponseConnectorResponse) => {
                  if (oAuthConnectoResponse.status === Status.SUCCESS) {
                    setupPipelineAndTriggers()
                  }
                })
                .catch(oAuthCtrErr => {
                  showErrorToaster(oAuthCtrErr?.data?.message)
                  setDisableBtn(false)
                  setShowPageLoader(false)
                })
            }
          } else {
            setShowError(true)
          }
        },
        stepFooterLabel: 'ci.getStartedWithCI.createPipeline'
      }
    ]
  ])

  const { stepRender, onClickBack, onClickNext, stepFooterLabel } = WizardSteps.get(currentWizardStepId) ?? {}

  let buttonLabel: string
  if (stepFooterLabel) {
    if (currentWizardStepId === InfraProvisiongWizardStepId.SelectRepository) {
      buttonLabel = getString(stepFooterLabel)
    } else {
      buttonLabel = `${getString('next')}: ${getString(stepFooterLabel)}`
    }
  } else {
    buttonLabel = getString('next')
  }

  const shouldRenderBackButton = useMemo((): boolean => {
    return !(
      (preSelectedGitConnector && currentWizardStepId === InfraProvisiongWizardStepId.SelectRepository) ||
      currentWizardStepId === InfraProvisiongWizardStepId.SelectGitProvider
    )
  }, [currentWizardStepId, preSelectedGitConnector])

  return stepRender ? (
    <Layout.Vertical
      padding={{ left: 'huge', right: 'huge', top: 'huge' }}
      flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
      className={css.wizard}
    >
      <Container padding={{ top: 'large', bottom: 'large' }}>
        <MultiStepProgressIndicator
          progressMap={
            new Map([
              [0, { StepStatus: wizardStepStatus.get(InfraProvisiongWizardStepId.SelectGitProvider) || 'TODO' }],
              [1, { StepStatus: wizardStepStatus.get(InfraProvisiongWizardStepId.SelectRepository) || 'TODO' }]
            ])
          }
        />
      </Container>
      <Layout.Vertical width="100%" height="80%" className={css.main}>
        {stepRender}
      </Layout.Vertical>
      <Layout.Horizontal
        spacing="medium"
        padding={{ top: 'large', bottom: 'xlarge' }}
        className={css.footer}
        width="100%"
      >
        {shouldRenderBackButton ? (
          <Button
            variation={ButtonVariation.SECONDARY}
            text={getString('back')}
            icon="chevron-left"
            minimal
            onClick={() => onClickBack?.()}
          />
        ) : null}
        <Button
          text={buttonLabel}
          variation={ButtonVariation.PRIMARY}
          rightIcon="chevron-right"
          onClick={() => onClickNext?.()}
          disabled={disableBtn}
        />
      </Layout.Horizontal>
      {showPageLoader ? <PageSpinner message={getString('ci.getStartedWithCI.settingUpCIPipeline')} /> : null}
    </Layout.Vertical>
  ) : null
}
