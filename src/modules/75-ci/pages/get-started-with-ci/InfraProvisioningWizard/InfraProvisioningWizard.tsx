/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { get, set, isNull, isUndefined, omitBy } from 'lodash-es'
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
  generateYamlPromise,
  ResponseConnectorResponse,
  ResponseMessage,
  ResponseScmConnectorResponse,
  ResponseString,
  useCreateDefaultScmConnector,
  UserRepoResponse,
  useUpdateConnector
} from 'services/cd-ng'
import {
  createPipelineV2Promise,
  NGTriggerConfigV2,
  ResponseNGTriggerResponse,
  ResponsePipelineSaveResponse,
  createTriggerPromise,
  PipelineInfoConfig
} from 'services/pipeline-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { yamlStringify, parse } from '@common/utils/YamlHelperMethods'
import { Status } from '@common/utils/Constants'
import { Connectors } from '@connectors/constants'
import {
  eventTypes,
  clearNullUndefined,
  ciCodebaseBuild,
  ciCodebaseBuildPullRequest
} from '@triggers/pages/triggers/utils/TriggersWizardPageUtils'
import type { TriggerConfigDTO } from '@triggers/pages/triggers/interface/TriggersWizardInterface'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { CIOnboardingActions } from '@common/constants/TrackingConstants'
import { StoreType } from '@common/constants/GitSyncTypes'
import { getScopedValueFromDTO, ScopedValueObjectDTO } from '@common/components/EntityReference/EntityReference.types'
import { defaultValues as CodebaseDefaultValues } from '@pipeline/components/PipelineInputSetForm/CICodebaseInputSetForm'
import { BuildTabs } from '@ci/components/PipelineStudio/CIPipelineStagesUtils'
import {
  InfraProvisioningWizardProps,
  WizardStep,
  InfraProvisiongWizardStepId,
  StepStatus,
  OAUTH2_USER_NAME,
  Hosting,
  GitAuthenticationMethod,
  NonGitOption,
  getCloudPipelinePayloadWithoutCodebase,
  getCIStarterPipelineV1
} from './Constants'
import { SelectGitProvider, SelectGitProviderRef } from './SelectGitProvider'
import { SelectRepository, SelectRepositoryRef } from './SelectRepository'
import {
  ConfigurePipeline,
  ConfigurePipelineRef,
  ImportPipelineYAMLInterface,
  PipelineConfigurationOption,
  SavePipelineToRemoteInterface,
  StarterConfigIdToOptionMap,
  StarterConfigurations
} from './ConfigurePipeline'
import {
  getPRTriggerActions,
  getFullRepoName,
  getPayloadForPipelineCreation,
  addDetailsToPipeline,
  getScmConnectorPrefix,
  updateUrlAndRepoInGitRepoConnector as updateUrlAndRepoInGitConnector,
  DefaultCIPipelineName
} from '../../../utils/HostedBuildsUtils'
import css from './InfraProvisioningWizard.module.scss'

export const InfraProvisioningWizard: React.FC<InfraProvisioningWizardProps> = props => {
  const {
    lastConfiguredWizardStepId = InfraProvisiongWizardStepId.SelectGitProvider,
    precursorData,
    enableFieldsForTesting
  } = props
  const { preSelectedGitConnector, connectorsEligibleForPreSelection, secretForPreSelectedConnector } =
    precursorData || {}
  const { getString } = useStrings()
  const [disableBtn, setDisableBtn] = useState<boolean>(false)
  const [currentWizardStepId, setCurrentWizardStepId] =
    useState<InfraProvisiongWizardStepId>(lastConfiguredWizardStepId)
  const [showError, setShowError] = useState<boolean>(false)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const history = useHistory()
  const [pageLoader, setPageLoader] = useState<{ show: boolean; message?: string }>({ show: false })
  const [configuredGitConnector, setConfiguredGitConnector] = useState<ConnectorInfoDTO>()
  const selectGitProviderRef = React.useRef<SelectGitProviderRef | null>(null)
  const selectRepositoryRef = React.useRef<SelectRepositoryRef | null>(null)
  const configurePipelineRef = React.useRef<ConfigurePipelineRef | null>(null)
  const { setShowGetStartedTabInMainMenu } = useSideNavContext()
  const { showError: showErrorToaster } = useToaster()
  const [buttonLabel, setButtonLabel] = useState<string>('')
  const { trackEvent } = useTelemetry()
  const [generatedYAMLAsJSON, setGeneratedYAMLAsJSON] = useState<PipelineInfoConfig>({ name: '', identifier: '-1' })

  const { CIE_HOSTED_VMS, CI_YAML_VERSIONING } = useFeatureFlags()

  useEffect(() => {
    setCurrentWizardStepId(lastConfiguredWizardStepId)
  }, [lastConfiguredWizardStepId])

  useEffect(() => {
    setConfiguredGitConnector(selectGitProviderRef.current?.validatedConnector)
  }, [selectGitProviderRef.current?.validatedConnector])

  useEffect(() => {
    setConfiguredGitConnector(preSelectedGitConnector)
    if (preSelectedGitConnector) {
      updateStepStatus([InfraProvisiongWizardStepId.SelectGitProvider], StepStatus.Success)
    }
  }, [preSelectedGitConnector])

  const { mutate: createSCMConnector } = useCreateDefaultScmConnector({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: updateConnector } = useUpdateConnector({
    queryParams: { accountIdentifier: accountId }
  })

  useEffect(() => {
    if (
      configuredGitConnector &&
      configurePipelineRef.current?.configuredOption &&
      StarterConfigIdToOptionMap[configurePipelineRef.current?.configuredOption.id] ===
        PipelineConfigurationOption.GenerateYAML
    ) {
      setDisableBtn(true)
      try {
        generateYamlPromise({
          queryParams: {
            accountIdentifier: accountId,
            projectIdentifier,
            orgIdentifier,
            connectorIdentifier: getScopedValueFromDTO(configuredGitConnector)
          }
        }).then((response: ResponseString) => {
          const { status, data } = response || {}
          if (status === Status.SUCCESS && data) {
            setGeneratedYAMLAsJSON(
              set(
                parse<PipelineInfoConfig>(data),
                'name',
                `${DefaultCIPipelineName}_${new Date().getTime().toString()}`
              )
            )
          }
          setDisableBtn(false)
        })
      } catch (e) {
        setDisableBtn(false)
      }
    }
  }, [
    configuredGitConnector,
    accountId,
    projectIdentifier,
    orgIdentifier,
    configurePipelineRef.current?.configuredOption
  ])

  const constructPipelinePayloadWithCodebase = React.useCallback(
    (repository: UserRepoResponse): string => {
      const { name: repoName, namespace } = repository
      if (!repoName || !namespace || !configuredGitConnector?.identifier) {
        return ''
      }
      try {
        const { id, pipelineYaml = '', name = '' } = configurePipelineRef.current?.configuredOption || {}
        return yamlStringify(
          getPayloadForPipelineCreation({
            pipelineYaml,
            pipelineName: name,
            configuredGitConnector,
            isUsingAStarterPipeline: id ? StarterConfigurations.includes(StarterConfigIdToOptionMap[id]) : false,
            isUsingHostedVMsInfra: CIE_HOSTED_VMS,
            orgIdentifier,
            projectIdentifier,
            repository,
            getString
          })
        )
      } catch (e) {
        // Ignore error
      }
      return ''
    },
    [projectIdentifier, orgIdentifier, configuredGitConnector?.identifier, configurePipelineRef]
  )

  const constructPipelinePayloadWithoutCodebase = React.useCallback((): string => {
    const UNIQUE_PIPELINE_ID = new Date().getTime().toString()
    const payload = addDetailsToPipeline({
      originalPipeline: getCloudPipelinePayloadWithoutCodebase(),
      name: `${getString('buildText')} ${getString('common.pipeline').toLowerCase()}`,
      identifier: `${getString('buildText')}_${getString('common.pipeline').toLowerCase()}_${UNIQUE_PIPELINE_ID}`,
      projectIdentifier,
      orgIdentifier
    })
    try {
      return yamlStringify(payload)
    } catch (e) {
      // Ignore error
    }
    return ''
  }, [getString, projectIdentifier, orgIdentifier])

  const constructTriggerPayload = React.useCallback(
    ({
      pipelineId,
      eventType,
      shouldSavePipelineToGit
    }: {
      pipelineId: string
      eventType: string
      shouldSavePipelineToGit: boolean
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
                connectorRef: configuredGitConnector?.identifier
                  ? `${getScmConnectorPrefix(configuredGitConnector)}${configuredGitConnector.identifier}`
                  : null,
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
        ...(shouldSavePipelineToGit
          ? { pipelineBranchName: CodebaseDefaultValues.branch }
          : { inputYaml: yamlStringify(omitBy(omitBy(pipelineInput, isUndefined), isNull)) })
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

  const getPipelineAndTriggerSetupPromise = useCallback(
    (isGitSaveRetry?: boolean): Promise<void> | undefined => {
      const { type: connectorType } = configuredGitConnector || {}
      const { branch, storeInGit, yamlPath, defaultBranch } = configurePipelineRef.current
        ?.values as SavePipelineToRemoteInterface
      const shouldSavePipelineToGit =
        (connectorType && [Connectors.GITHUB, Connectors.BITBUCKET].includes(connectorType) && storeInGit) || false
      const connectorRef = getScopedValueFromDTO(configuredGitConnector as ScopedValueObjectDTO)
      const gitParams = {
        storeType: StoreType.REMOTE,
        connectorRef,
        branch,
        repoName: selectRepositoryRef.current?.repository?.name
      }
      if (selectRepositoryRef.current?.repository) {
        const { configuredOption } = configurePipelineRef.current || {}
        return createPipelineV2Promise({
          body: CI_YAML_VERSIONING
            ? yamlStringify(
                configuredOption &&
                  StarterConfigIdToOptionMap[configuredOption.id] === PipelineConfigurationOption.GenerateYAML
                  ? generatedYAMLAsJSON
                  : getCIStarterPipelineV1
              )
            : constructPipelinePayloadWithCodebase(selectRepositoryRef.current.repository),
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            ...(shouldSavePipelineToGit && {
              ...gitParams,
              filePath: yamlPath,
              commitMsg: `${getString('common.addedEntityLabel', {
                entity: getString('common.pipeline').toLowerCase()
              })} ${yamlPath}`,
              ...(isGitSaveRetry && { isNewBranch: isGitSaveRetry, baseBranch: defaultBranch })
            })
          },
          requestOptions: { headers: { 'Content-Type': 'application/yaml' } }
        }).then((createPipelineResponse: ResponsePipelineSaveResponse) => {
          const { status } = createPipelineResponse
          if (status === Status.SUCCESS && createPipelineResponse?.data?.identifier) {
            const commonQueryParams = {
              accountIdentifier: accountId,
              orgIdentifier,
              projectIdentifier,
              targetIdentifier: createPipelineResponse?.data?.identifier
            }
            // Create PR trigger
            createTriggerPromise({
              body: yamlStringify({
                trigger: clearNullUndefined(
                  constructTriggerPayload({
                    pipelineId: createPipelineResponse?.data?.identifier,
                    eventType:
                      configuredGitConnector?.type &&
                      [Connectors.GITHUB, Connectors.BITBUCKET].includes(configuredGitConnector?.type)
                        ? eventTypes.PULL_REQUEST
                        : eventTypes.MERGE_REQUEST,
                    shouldSavePipelineToGit
                  }) || {}
                )
              }) as any,
              queryParams: commonQueryParams
            })
              .then((createPRTriggerResponse: ResponseNGTriggerResponse) => {
                if (createPRTriggerResponse.status === Status.SUCCESS) {
                  // If PR trigger is created succesfully, then
                  // create a Push trigger
                  createTriggerPromise({
                    body: yamlStringify({
                      trigger: clearNullUndefined(
                        constructTriggerPayload({
                          pipelineId: createPipelineResponse?.data?.identifier || '',
                          eventType: eventTypes.PUSH,
                          shouldSavePipelineToGit
                        }) || {}
                      )
                    }) as any,
                    queryParams: commonQueryParams
                  })
                    .then((createPushTriggerResponse: ResponseNGTriggerResponse) => {
                      if (createPushTriggerResponse.status === Status.SUCCESS) {
                        wrapUpAPIOperation()
                        setShowGetStartedTabInMainMenu(false)
                        if (createPipelineResponse?.data?.identifier) {
                          history.push(
                            routes.toPipelineStudioV1({
                              accountId: accountId,
                              module: 'ci',
                              orgIdentifier,
                              projectIdentifier,
                              pipelineIdentifier: createPipelineResponse?.data?.identifier,
                              stageId: getString('buildText'),
                              sectionId: BuildTabs.EXECUTION,
                              ...(shouldSavePipelineToGit ? gitParams : {})
                            })
                          )
                        }
                      }
                    })
                    .catch(triggerCreationError => {
                      showErrorToaster(triggerCreationError?.data?.message)
                      wrapUpAPIOperation()
                    })
                }
              })
              .catch(triggerCreationError => {
                showErrorToaster(triggerCreationError?.data?.message)
                wrapUpAPIOperation()
              })
          } else {
            throw createPipelineResponse
          }
        })
      }
    },
    [
      selectRepositoryRef.current?.repository,
      configuredGitConnector,
      accountId,
      projectIdentifier,
      orgIdentifier,
      generatedYAMLAsJSON,
      configurePipelineRef.current,
      CI_YAML_VERSIONING
    ]
  )

  const initiateAPIOperation = useCallback((loaderMessage: string): void => {
    setDisableBtn(true)
    setPageLoader({ show: true, message: loaderMessage })
  }, [])

  const wrapUpAPIOperation = useCallback((err?: unknown): void => {
    if (err) {
      showErrorToaster((err as Error)?.message)
    }
    setDisableBtn(false)
    setPageLoader({ show: false })
  }, [])

  const setupPipelineWithCodebaseAndTriggers = React.useCallback((): void => {
    const { type: connectorType } = configuredGitConnector || {}
    const { storeInGit, createBranchIfNotExists, branch } = configurePipelineRef.current
      ?.values as SavePipelineToRemoteInterface
    const shouldSavePipelineToGit =
      (connectorType && [Connectors.GITHUB, Connectors.BITBUCKET].includes(connectorType) && storeInGit) || false
    if (selectRepositoryRef.current?.repository) {
      let setupPipelineAndTriggerPromise = getPipelineAndTriggerSetupPromise()
      if (setupPipelineAndTriggerPromise) {
        try {
          // if pipeline is being saved to Git and create branch if not specified is selected, we will attempt to save pipeline to Git twice
          // Once to directly save pipeline to the specified branch with git param isNewBranch as "false"
          // If above fails, save pipeline to the specified branch with git param isNewBranch as "true" and pass default branch of the repo as base branch
          if (shouldSavePipelineToGit && createBranchIfNotExists) {
            setupPipelineAndTriggerPromise.catch(_e => {
              const isBranchNotFoundOnGit =
                ((get(_e, 'responseMessages') as ResponseMessage[]) || []).filter(
                  (item: ResponseMessage) =>
                    item.code === 'SCM_BAD_REQUEST' && item.message === `Branch ${branch} not found`
                ).length > 0
              if (isBranchNotFoundOnGit) {
                // Attempt pipeline save to git to new branch if only specified by user and if the branch specified doesn't exist on Git
                setupPipelineAndTriggerPromise = getPipelineAndTriggerSetupPromise(true)
                if (setupPipelineAndTriggerPromise) {
                  setupPipelineAndTriggerPromise.catch(e => {
                    wrapUpAPIOperation(e)
                  })
                }
              } else {
                wrapUpAPIOperation(_e)
              }
            })
          } else {
            setupPipelineAndTriggerPromise.catch(err => {
              wrapUpAPIOperation(err)
            })
          }
        } catch (e) {
          wrapUpAPIOperation()
        }
      }
    }
  }, [selectRepositoryRef.current?.repository, configuredGitConnector, generatedYAMLAsJSON])

  const setupPipelineWithoutCodebaseAndTriggers = React.useCallback((): void => {
    try {
      createPipelineV2Promise({
        body: constructPipelinePayloadWithoutCodebase(),
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier
        },
        requestOptions: { headers: { 'Content-Type': 'application/yaml' } }
      }).then((createPipelineResponse: ResponsePipelineSaveResponse) => {
        const { status } = createPipelineResponse
        if (status === Status.SUCCESS && createPipelineResponse?.data?.identifier) {
          wrapUpAPIOperation()
          setShowGetStartedTabInMainMenu(false)
          if (createPipelineResponse?.data?.identifier) {
            history.push(
              routes.toPipelineStudioV1({
                accountId: accountId,
                module: 'ci',
                orgIdentifier,
                projectIdentifier,
                pipelineIdentifier: createPipelineResponse?.data?.identifier,
                stageId: getString('buildText'),
                sectionId: BuildTabs.EXECUTION
              })
            )
          }
        }
      })
    } catch (e) {
      wrapUpAPIOperation()
    }
  }, [
    constructPipelinePayloadWithoutCodebase,
    accountId,
    orgIdentifier,
    projectIdentifier,
    setShowGetStartedTabInMainMenu,
    history,
    getString
  ])

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
            updateFooterLabel={setButtonLabel}
          />
        ),
        onClickNext: () => {
          const { values, setFieldTouched, validate, validatedConnector } = selectGitProviderRef.current || {}
          const { gitProvider, gitAuthenticationMethod } = values || {}
          if (!gitProvider) {
            setFieldTouched?.('gitProvider', true)
            return
          }
          if (!gitAuthenticationMethod && gitProvider?.type !== NonGitOption.OTHER) {
            setFieldTouched?.('gitAuthenticationMethod', true)
            return
          }
          // For non-OAuth auth mechanism, auth fields in the form should validate to proceed here, for OAuth no form validation is needed
          if ((gitAuthenticationMethod === GitAuthenticationMethod.OAuth && validatedConnector) || validate?.()) {
            setCurrentWizardStepId(InfraProvisiongWizardStepId.SelectRepository)
            setShowError(false)
            updateStepStatus([InfraProvisiongWizardStepId.SelectGitProvider], StepStatus.Success)
            updateStepStatus([InfraProvisiongWizardStepId.SelectRepository], StepStatus.InProgress)
          } else if (gitProvider?.type === NonGitOption.OTHER) {
            setShowError(false)
            initiateAPIOperation(getString('ci.getStartedWithCI.settingUpCIPipeline'))
            setupPipelineWithoutCodebaseAndTriggers()
          }
        },
        stepFooterLabel: `${getString('next')}: ${getString('common.selectRepository')}`
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
            updateFooterLabel={setButtonLabel}
          />
        ),
        onClickBack: () => {
          setCurrentWizardStepId(InfraProvisiongWizardStepId.SelectGitProvider)
          updateStepStatus([InfraProvisiongWizardStepId.SelectGitProvider], StepStatus.InProgress)
          updateStepStatus([InfraProvisiongWizardStepId.SelectRepository], StepStatus.ToDo)
        },
        onClickNext: () => {
          try {
            trackEvent(CIOnboardingActions.ConfigurePipelineClicked, {})
            const { repository, enableCloneCodebase } = selectRepositoryRef.current || {}
            if (enableCloneCodebase && repository && configuredGitConnector?.spec) {
              initiateAPIOperation(getString('ci.getStartedWithCI.updatingGitConnectorWithRepo'))
              if (selectGitProviderRef.current?.values?.gitAuthenticationMethod !== GitAuthenticationMethod.OAuth) {
                if (preSelectedGitConnector) {
                  // The pre-selected connector shouldn't be modified
                  updateStepStatus([InfraProvisiongWizardStepId.SelectRepository], StepStatus.Success)
                  setCurrentWizardStepId(InfraProvisiongWizardStepId.ConfigurePipeline)
                  wrapUpAPIOperation()
                } else {
                  createSCMConnector({
                    connector: set(
                      // Inline-created git connector url needs to be suffixed with repository name, if not already present,
                      // otherwise default branch fetch in next step fails
                      updateUrlAndRepoInGitConnector(configuredGitConnector, selectRepositoryRef?.current?.repository),
                      'spec.authentication.spec.spec.username',
                      get(configuredGitConnector, 'spec.authentication.spec.spec.username') ?? OAUTH2_USER_NAME
                    ),
                    secret: preSelectedGitConnector
                      ? secretForPreSelectedConnector
                      : selectGitProviderRef?.current?.validatedSecret
                  })
                    .then((scmConnectorResponse: ResponseScmConnectorResponse) => {
                      if (scmConnectorResponse.status === Status.SUCCESS) {
                        updateStepStatus([InfraProvisiongWizardStepId.SelectRepository], StepStatus.Success)
                        setCurrentWizardStepId(InfraProvisiongWizardStepId.ConfigurePipeline)
                        wrapUpAPIOperation()
                      }
                    })
                    .catch(scmCtrErr => {
                      showErrorToaster(scmCtrErr?.data?.message)
                      wrapUpAPIOperation()
                    })
                }
              } else {
                if (preSelectedGitConnector) {
                  // The pre-selected connector shouldn't be modified
                  updateStepStatus([InfraProvisiongWizardStepId.SelectRepository], StepStatus.Success)
                  setCurrentWizardStepId(InfraProvisiongWizardStepId.ConfigurePipeline)
                  setShowError(false)
                } else {
                  updateConnector({
                    // Inline-created git connector url needs to be suffixed with repository name, if not already present,
                    connector:
                      // otherwise default branch fetch in next step fails
                      updateUrlAndRepoInGitConnector(configuredGitConnector, selectRepositoryRef?.current?.repository)
                  })
                    .then((oAuthConnectoResponse: ResponseConnectorResponse) => {
                      if (oAuthConnectoResponse.status === Status.SUCCESS) {
                        updateStepStatus([InfraProvisiongWizardStepId.SelectRepository], StepStatus.Success)
                        setCurrentWizardStepId(InfraProvisiongWizardStepId.ConfigurePipeline)
                        setShowError(false)
                      }
                    })
                    .catch(oAuthCtrErr => {
                      showErrorToaster(oAuthCtrErr?.data?.message)
                      wrapUpAPIOperation()
                    })
                }
              }
            } else if (!enableCloneCodebase) {
              setShowError(false)
              initiateAPIOperation(getString('ci.getStartedWithCI.settingUpCIPipeline'))
              setupPipelineWithoutCodebaseAndTriggers()
            } else {
              setShowError(true)
            }
          } catch (e) {
            // ignore error
          }
        },
        stepFooterLabel: `${getString('next')}: ${getString('ci.getStartedWithCI.configurePipeline')}`
      }
    ],
    [
      InfraProvisiongWizardStepId.ConfigurePipeline,
      {
        stepRender: (
          <ConfigurePipeline
            ref={configurePipelineRef}
            configuredGitConnector={configuredGitConnector}
            repoName={
              selectRepositoryRef.current?.repository ? getFullRepoName(selectRepositoryRef.current.repository) : ''
            }
            showError={showError}
            disableNextBtn={() => setDisableBtn(true)}
            enableNextBtn={() => setDisableBtn(false)}
            enableForTesting={enableFieldsForTesting}
          />
        ),
        onClickBack: () => {
          setCurrentWizardStepId(InfraProvisiongWizardStepId.SelectRepository)
          updateStepStatus([InfraProvisiongWizardStepId.SelectRepository], StepStatus.ToDo)
          updateStepStatus([InfraProvisiongWizardStepId.ConfigurePipeline], StepStatus.ToDo)
        },
        onClickNext: () => {
          const { configuredOption, values, showValidationErrors } = configurePipelineRef.current || {}
          if (configuredOption?.name) {
            try {
              trackEvent(CIOnboardingActions.CreatePipelineClicked, {
                selectedStarterPipeline: StarterConfigIdToOptionMap[configuredOption.id]
              })
            } catch (e) {
              // ignore error
            }
          }

          if (!configuredOption) {
            setShowError(true)
            return
          }

          if (
            [PipelineConfigurationOption.StarterPipeline, PipelineConfigurationOption.GenerateYAML].includes(
              StarterConfigIdToOptionMap[configuredOption.id]
            )
          ) {
            const { branch, yamlPath, pipelineName } = (values as SavePipelineToRemoteInterface) || {}
            if (!branch || !yamlPath || !pipelineName) {
              showValidationErrors?.()
              return
            }
          } else if (
            StarterConfigIdToOptionMap[configuredOption.id] === PipelineConfigurationOption.ChooseExistingYAML
          ) {
            const { branch, yamlPath } = (values as ImportPipelineYAMLInterface) || {}
            if (!branch || !yamlPath) {
              showValidationErrors?.()
              return
            }
          }
          initiateAPIOperation(getString('ci.getStartedWithCI.settingUpCIPipeline'))
          setupPipelineWithCodebaseAndTriggers()
        },
        stepFooterLabel: getString('ci.getStartedWithCI.createPipeline')
      }
    ]
  ])

  const { stepRender, onClickBack, onClickNext, stepFooterLabel } = WizardSteps.get(currentWizardStepId) ?? {}

  useEffect(() => {
    if (stepFooterLabel) {
      setButtonLabel(stepFooterLabel)
    }
  }, [stepFooterLabel])

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
              [1, { StepStatus: wizardStepStatus.get(InfraProvisiongWizardStepId.SelectRepository) || 'TODO' }],
              [2, { StepStatus: wizardStepStatus.get(InfraProvisiongWizardStepId.ConfigurePipeline) || 'TODO' }]
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
      {pageLoader.show ? <PageSpinner message={pageLoader.message} /> : null}
    </Layout.Vertical>
  ) : null
}
