/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Container,
  Button,
  ButtonVariation,
  Layout,
  MultiStepProgressIndicator,
  PageSpinner,
  useConfirmationDialog,
  Text,
  getErrorInfoFromErrorObject,
  useToaster,
  Dialog
} from '@harness/uicore'
import cx from 'classnames'
import { Color, Intent } from '@harness/design-system'
import { defaultTo, get, isEmpty } from 'lodash-es'
import { useHistory, useParams } from 'react-router-dom'
import { useModalHook } from '@harness/use-modal'
import { Classes, IDialogProps } from '@blueprintjs/core'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { createPipelineV2Promise, ResponsePipelineSaveResponse, useGetInputsetYaml } from 'services/pipeline-ng'
import { Status } from '@common/utils/Constants'
import routes from '@common/RouteDefinitions'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { StringUtils } from '@common/exports'
import type { ServiceDefinition, UserRepoResponse } from 'services/cd-ng'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { CDOnboardingActions } from '@common/constants/TrackingConstants'
import { useGetServicesData } from '@cd/components/PipelineSteps/DeployServiceEntityStep/useGetServicesData'
import { RunPipelineForm } from '@pipeline/components/RunPipelineModal/RunPipelineForm'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { WizardStep, StepStatus, DeployProvisiongWizardStepId, DeployProvisioningWizardProps } from './Constants'
import { SelectDeploymentType, SelectDeploymentTypeRefInstance } from '../SelectWorkload/SelectDeploymentType'
import type { SelectInfrastructureRefInstance } from '../SelectInfrastructure/SelectInfrastructure'
import { DelegateSelectorRefInstance, DelegateSelectorWizard } from '../DelegateSelectorWizard/DelegateSelectorWizard'
import { Configure } from '../ConfigureService/ConfigureService'
import {
  DEFAULT_PIPELINE_NAME,
  DEFAULT_PIPELINE_PAYLOAD,
  DOCUMENT_URL,
  EMPTY_STRING,
  getUniqueEntityIdentifier,
  PipelineRefPayload
} from '../CDOnboardingUtils'
import { useCDOnboardingContext } from '../CDOnboardingStore'
import RunPipelineSummary from '../RunPipelineSummary/RunPipelineSummary'
import { ConfigureGitops } from '../ConfigureGitops/ConfigureGitops'
import commonCss from '../GetStartedWithCD.module.scss'
import css from './DeployProvisioningWizard.module.scss'

// this needs to be worked upon after confirming the steps name
const WizardStepOrder = [
  DeployProvisiongWizardStepId.SelectDeploymentType,
  DeployProvisiongWizardStepId.Connect,
  DeployProvisiongWizardStepId.Configure,
  DeployProvisiongWizardStepId.Deploy
]

export const DeployProvisioningWizard: React.FC<DeployProvisioningWizardProps> = props => {
  const { lastConfiguredWizardStepId = DeployProvisiongWizardStepId.Deploy } = props
  const {
    state: { service: serviceData, infrastructure, environment }
  } = useCDOnboardingContext()

  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const history = useHistory()
  const { showError } = useToaster()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const selectedDeploymentType: string | undefined = get(serviceData, 'serviceDefinition.type')

  const [selectedSectionId, setSelectedSectionId] = React.useState<DeployProvisiongWizardStepId>(
    DeployProvisiongWizardStepId.SelectDeploymentType
  )

  const [disableBtn, setDisableBtn] = React.useState<boolean>(false)
  const [currentWizardStepId, setCurrentWizardStepId] =
    React.useState<DeployProvisiongWizardStepId>(lastConfiguredWizardStepId)
  const [serviceIdentifier, setServiceIdentifier] = React.useState<string>(EMPTY_STRING)
  const [showPageLoader, setShowPageLoader] = React.useState<boolean>(false)
  const [inputSetYaml, setInputSetYaml] = React.useState(EMPTY_STRING)

  const SelectDeploymentTypeRef = React.useRef<SelectDeploymentTypeRefInstance | null>(null)
  const delegateSelectorRef = React.useRef<DelegateSelectorRefInstance | null>(null)
  const configureServiceRef = React.useRef<SelectInfrastructureRefInstance | null>(null)

  const { servicesData, refetchServicesData } = useGetServicesData({
    gitOpsEnabled: false,
    serviceIdentifiers: [serviceIdentifier],
    deploymentType: serviceData?.serviceDefinition?.type as ServiceDefinition['type']
  })

  const { data: inputSetYAMLData, loading } = useGetInputsetYaml({
    planExecutionId: EMPTY_STRING,
    queryParams: {
      orgIdentifier,
      projectIdentifier,
      accountIdentifier: accountId
    },
    lazy: true,
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    }
  })

  // this needs to be worked upon after confirming the steps name
  const [wizardStepStatus, setWizardStepStatus] = React.useState<Map<DeployProvisiongWizardStepId, StepStatus>>(
    new Map<DeployProvisiongWizardStepId, StepStatus>([
      [DeployProvisiongWizardStepId.SelectDeploymentType, StepStatus.InProgress],
      [DeployProvisiongWizardStepId.Connect, StepStatus.ToDo],
      [DeployProvisiongWizardStepId.Configure, StepStatus.ToDo],
      [DeployProvisiongWizardStepId.Deploy, StepStatus.ToDo]
    ])
  )

  const updateStepStatusFromContextTab = (sectionId: string): void => {
    const indexAt = WizardStepOrder.findIndex(tab => tab === sectionId)
    if (indexAt > -1) {
      updateStepStatus(WizardStepOrder.slice(0, indexAt), StepStatus.Success)
      updateStepStatus([WizardStepOrder[indexAt]], StepStatus.InProgress)
      updateStepStatus(WizardStepOrder.slice(indexAt + 1), StepStatus.ToDo)
      setCurrentWizardStepId(WizardStepOrder[indexAt])
    }
  }

  React.useEffect(() => {
    if (selectedSectionId?.length && WizardStepOrder.includes(selectedSectionId)) {
      updateStepStatusFromContextTab(selectedSectionId)
    } else {
      setSelectedSectionId(DeployProvisiongWizardStepId.SelectDeploymentType)
      updateStepStatus([DeployProvisiongWizardStepId.SelectDeploymentType], StepStatus.InProgress)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSectionId])

  const serviceInputsObj = React.useMemo(() => {
    const service = servicesData.find(svc => svc.service.identifier === serviceIdentifier)

    if (isEmpty(service?.serviceInputs)) {
      return {
        serviceRef: serviceIdentifier
      }
    } else {
      return {
        serviceRef: serviceIdentifier,
        serviceInputs: { ...service?.serviceInputs }
      }
    }
  }, [serviceIdentifier, servicesData])

  function onCloseRunPipelineModal(): void {
    closeRunPipelineModal()
    setInputSetYaml(EMPTY_STRING)
  }
  const runModalProps: IDialogProps = {
    isOpen: true,
    usePortal: true,
    autoFocus: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: false,
    enforceFocus: false,
    className: cx(css.runPipelineDialog, Classes.DIALOG),
    isCloseButtonShown: false
  }

  React.useEffect(() => {
    if (inputSetYAMLData) {
      ;(inputSetYAMLData as unknown as Response).text().then(str => {
        setInputSetYaml(str)
      })
    }
  }, [inputSetYAMLData])

  const [pipelineIdentifier, setPipelineIdentifier] = React.useState<string>(EMPTY_STRING)

  const [openRunPipelineModal, closeRunPipelineModal] = useModalHook(
    () =>
      loading ? (
        <PageSpinner />
      ) : (
        <Dialog {...runModalProps}>
          <Layout.Vertical>
            <RunPipelineForm
              pipelineIdentifier={pipelineIdentifier}
              orgIdentifier={orgIdentifier}
              projectIdentifier={projectIdentifier}
              accountId={accountId}
              module={'cd'}
              inputSetYAML={inputSetYaml || EMPTY_STRING}
              source="executions"
              onClose={() => {
                onCloseRunPipelineModal()
              }}
              storeType={'INLINE'}
            />
            <Button
              aria-label="close modal"
              minimal
              icon="cross"
              iconProps={{ size: 20 }}
              onClick={() => {
                onCloseRunPipelineModal()
              }}
              className={css.crossIcon}
            />
          </Layout.Vertical>
        </Dialog>
      ),
    [loading, inputSetYaml, pipelineIdentifier]
  )

  const deletionContentText = (
    <Text color={Color.BLACK} padding="medium">
      {`${getString('cd.getStartedWithCD.delegateRequiredWarning')} `}
      <a rel="noreferrer" target="_blank" href={DOCUMENT_URL}>
        {getString('pipeline.createPipeline.learnMore')}
      </a>
    </Text>
  )

  const { openDialog: showOnboaringExitWarning } = useConfirmationDialog({
    contentText: getString('cd.getStartedWithCD.closeOnboarding.subtitle'),
    titleText: getString('cd.getStartedWithCD.closeOnboarding.title'),
    confirmButtonText: getString('confirm'),
    cancelButtonText: getString('cancel'),
    intent: Intent.WARNING,
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        closeCDWizard()
      }
    }
  })

  const moveToConfigureService = (): void => {
    setDisableBtn(true)
    setSelectedSectionId(DeployProvisiongWizardStepId.Configure)
    setCurrentWizardStepId(DeployProvisiongWizardStepId.Configure)
    updateStepStatus(
      [DeployProvisiongWizardStepId.SelectDeploymentType, DeployProvisiongWizardStepId.Connect],
      StepStatus.Success
    )
    updateStepStatus([DeployProvisiongWizardStepId.Configure], StepStatus.InProgress)
    updateStepStatus([DeployProvisiongWizardStepId.Deploy], StepStatus.ToDo)
    trackEvent(CDOnboardingActions.MoveToServiceSelection, {})
  }

  const { openDialog: showDelegateRequiredWarning } = useConfirmationDialog({
    contentText: deletionContentText,
    titleText: getString('cd.getStartedWithCD.delegateNotConnected'),
    confirmButtonText: getString('continue'),
    cancelButtonText: getString('cancel'),
    intent: Intent.WARNING,
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        moveToConfigureService()
      }
    }
  })

  const updateStepStatus = React.useCallback((stepIds: DeployProvisiongWizardStepId[], status: StepStatus) => {
    if (Array.isArray(stepIds)) {
      setWizardStepStatus((prevState: Map<DeployProvisiongWizardStepId, StepStatus>) => {
        const clonedState = new Map(prevState)
        stepIds.forEach((item: DeployProvisiongWizardStepId) => clonedState.set(item, status))
        return clonedState
      })
    }
  }, [])

  const constructPipelinePayload = React.useCallback(
    (data: PipelineRefPayload, repository = { name: DEFAULT_PIPELINE_NAME } as UserRepoResponse): string => {
      const { name: repoName } = repository
      const { serviceRef, environmentRef, infraStructureRef, deploymentType } = data

      if (!repoName || !serviceRef || !environmentRef || !infraStructureRef) {
        return EMPTY_STRING
      }
      const constructPipelineName = (name: string): string =>
        `${getString('pipelineSteps.deploy.create.deployStageName')}_${StringUtils.getIdentifierFromName(name)}`

      const uniquePipelineId = getUniqueEntityIdentifier(repoName)
      const userPipelineIdentifier = constructPipelineName(uniquePipelineId)

      const payload = DEFAULT_PIPELINE_PAYLOAD
      payload.pipeline.name = constructPipelineName(repoName)
      payload.pipeline.identifier = userPipelineIdentifier
      payload.pipeline.projectIdentifier = projectIdentifier
      payload.pipeline.orgIdentifier = orgIdentifier
      payload.pipeline.stages[0].stage.spec.deploymentType = deploymentType
      payload.pipeline.stages[0].stage.spec.service = serviceInputsObj
      payload.pipeline.stages[0].stage.spec.environment.environmentRef = environmentRef
      payload.pipeline.stages[0].stage.spec.environment.infrastructureDefinitions[0].identifier = infraStructureRef
      setPipelineIdentifier(userPipelineIdentifier)
      try {
        return yamlStringify(payload)
      } catch (e) {
        // Ignore error
        return EMPTY_STRING
      }
    },
    [getString, projectIdentifier, orgIdentifier, serviceInputsObj]
  )

  const setupPipeline = (data: PipelineRefPayload): void => {
    try {
      createPipelineV2Promise({
        body: constructPipelinePayload(data, get(serviceData, 'data.repoValues')),
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier
        },
        requestOptions: { headers: { 'Content-Type': 'application/yaml' } }
      }).then((createPipelineResponse: ResponsePipelineSaveResponse) => {
        const { status } = createPipelineResponse
        if (status === Status.SUCCESS && createPipelineResponse?.data?.identifier) {
          if (createPipelineResponse?.data?.identifier) {
            setShowPageLoader(false)
            openRunPipelineModal()
          }
        }
      })
    } catch (e: any) {
      setShowPageLoader(false)
      showError(getErrorInfoFromErrorObject(e))
      setDisableBtn(false)
    }
  }

  const closeCDWizard = (): void => {
    trackEvent(CDOnboardingActions.ExitCDOnboarding, {})
    history.push(routes.toGetStartedWithCD({ accountId, orgIdentifier, projectIdentifier, module: 'cd' }))
  }

  const firstStep = [
    DeployProvisiongWizardStepId.SelectDeploymentType,
    {
      stepRender: (
        <SelectDeploymentType
          ref={SelectDeploymentTypeRef}
          onSuccess={() => {
            setDisableBtn(true)
            setSelectedSectionId(DeployProvisiongWizardStepId.Connect)
            setCurrentWizardStepId(DeployProvisiongWizardStepId.Connect)
            updateStepStatus([DeployProvisiongWizardStepId.Connect], StepStatus.InProgress)
            updateStepStatus([DeployProvisiongWizardStepId.SelectDeploymentType], StepStatus.Success)
            updateStepStatus([DeployProvisiongWizardStepId.Configure], StepStatus.ToDo)
            updateStepStatus([DeployProvisiongWizardStepId.Deploy], StepStatus.ToDo)
            trackEvent(CDOnboardingActions.MovetoConfigureEnvironment, {})
          }}
          disableNextBtn={() => setDisableBtn(true)}
          enableNextBtn={() => setDisableBtn(false)}
        />
      ),
      onClickNext: async () => {
        const { submitForm } = SelectDeploymentTypeRef.current || {}
        try {
          submitForm?.()
        } catch (_e) {
          // catch any errors and do nothing
        }
      },
      stepFooterLabel: 'common.connectEnvironment'
    }
  ]

  const WizardStepsgitOpsEnabled: any = [
    [
      DeployProvisiongWizardStepId.Connect,
      {
        stepRender: <div>{getString('cd.getStartedWithCD.gitopsOnboardingAgentStep')}</div>,
        onClickBack: () => {
          setSelectedSectionId(DeployProvisiongWizardStepId.SelectDeploymentType)
          setCurrentWizardStepId(DeployProvisiongWizardStepId.SelectDeploymentType)
          updateStepStatus([DeployProvisiongWizardStepId.Connect], StepStatus.ToDo)
          trackEvent(CDOnboardingActions.SelectDeploymentType, {})
        },
        onClickNext: async () => {
          setDisableBtn(true)
          setSelectedSectionId(DeployProvisiongWizardStepId.Configure)
          setCurrentWizardStepId(DeployProvisiongWizardStepId.Configure)
          updateStepStatus(
            [DeployProvisiongWizardStepId.SelectDeploymentType, DeployProvisiongWizardStepId.Connect],
            StepStatus.Success
          )
          updateStepStatus([DeployProvisiongWizardStepId.Configure], StepStatus.InProgress)
          updateStepStatus([DeployProvisiongWizardStepId.Deploy], StepStatus.ToDo)
          trackEvent(CDOnboardingActions.MoveToServiceSelection, {})
        },

        stepFooterLabel: 'connectors.ceAws.curExtention.stepB.step1.p1'
      }
    ],
    [
      DeployProvisiongWizardStepId.Configure,
      {
        stepRender: <ConfigureGitops ref={delegateSelectorRef} />,
        onClickBack: () => {
          setSelectedSectionId(DeployProvisiongWizardStepId.Connect)
          setCurrentWizardStepId(DeployProvisiongWizardStepId.Connect)
          updateStepStatus([DeployProvisiongWizardStepId.Configure], StepStatus.ToDo)
          trackEvent(CDOnboardingActions.MovetoConfigureEnvironment, {})
        },
        onClickNext: async () => {
          const { submitForm } = configureServiceRef.current || {}
          try {
            submitForm?.()
          } catch (_e) {
            // catch any errors and do nothing
          }
        },
        stepFooterLabel: 'common.createPipeline'
      }
    ],
    [
      DeployProvisiongWizardStepId.Deploy,
      {
        stepRender: <div>{getString('cd.getStartedWithCD.gitopsOnboardingDeployStep')}</div>,
        onClickBack: () => {
          setCurrentWizardStepId(DeployProvisiongWizardStepId.Configure)
          updateStepStatus([DeployProvisiongWizardStepId.Deploy], StepStatus.ToDo)
        },
        stepFooterLabel: 'common.createPipeline'
      }
    ]
  ]

  const CDWizardSteps: any = [
    [
      DeployProvisiongWizardStepId.Connect,
      {
        stepRender: (
          <>
            <DelegateSelectorWizard
              disableNextBtn={() => setDisableBtn(true)}
              enableNextBtn={() => setDisableBtn(false)}
              ref={delegateSelectorRef}
            />
          </>
        ),
        onClickBack: () => {
          setSelectedSectionId(DeployProvisiongWizardStepId.SelectDeploymentType)
          setCurrentWizardStepId(DeployProvisiongWizardStepId.SelectDeploymentType)
          updateStepStatus([DeployProvisiongWizardStepId.Connect], StepStatus.ToDo)
          trackEvent(CDOnboardingActions.SelectDeploymentType, {})
        },
        onClickNext: async () => {
          const { isDelegateInstalled } = delegateSelectorRef.current || {}
          isDelegateInstalled ? moveToConfigureService() : showDelegateRequiredWarning()
        },

        stepFooterLabel: 'common.configureService'
      }
    ],
    [
      DeployProvisiongWizardStepId.Configure,
      {
        stepRender: (
          <Configure
            onSuccess={() => {
              setSelectedSectionId(DeployProvisiongWizardStepId.Deploy)
              setCurrentWizardStepId(DeployProvisiongWizardStepId.Deploy)
              updateStepStatus(
                [
                  DeployProvisiongWizardStepId.SelectDeploymentType,
                  DeployProvisiongWizardStepId.Connect,
                  DeployProvisiongWizardStepId.Configure
                ],
                StepStatus.Success
              )
              if (serviceData?.identifier) {
                setServiceIdentifier(serviceData.identifier)
                refetchServicesData()
              }
              updateStepStatus([DeployProvisiongWizardStepId.Deploy], StepStatus.InProgress)
              trackEvent(CDOnboardingActions.MoveToPipelineSummary, {})
            }}
            ref={configureServiceRef}
            disableNextBtn={() => setDisableBtn(true)}
            enableNextBtn={() => setDisableBtn(false)}
          />
        ),
        onClickBack: () => {
          setSelectedSectionId(DeployProvisiongWizardStepId.Connect)
          setCurrentWizardStepId(DeployProvisiongWizardStepId.Connect)
          updateStepStatus([DeployProvisiongWizardStepId.Configure], StepStatus.ToDo)
          trackEvent(CDOnboardingActions.MovetoConfigureEnvironment, {})
        },
        onClickNext: async () => {
          const { submitForm } = configureServiceRef.current || {}
          try {
            submitForm?.()
          } catch (_e) {
            // catch any errors and do nothing
          }
        },
        stepFooterLabel: 'common.createPipeline'
      }
    ],
    [
      DeployProvisiongWizardStepId.Deploy,
      {
        stepRender: (
          <RunPipelineSummary
            onSuccess={() => {
              setShowPageLoader(true)
              const refsData = {
                serviceRef: serviceData?.identifier as string,
                environmentRef: environment?.identifier as string,
                infraStructureRef: infrastructure?.identifier as string,
                deploymentType: serviceData?.serviceDefinition?.type as string
              }
              setupPipeline(refsData)
              updateStepStatus(
                [
                  DeployProvisiongWizardStepId.SelectDeploymentType,
                  DeployProvisiongWizardStepId.Connect,
                  DeployProvisiongWizardStepId.Configure,
                  DeployProvisiongWizardStepId.Deploy
                ],
                StepStatus.Success
              )
            }}
            setSelectedSectionId={setSelectedSectionId}
          />
        ),
        onClickBack: () => {
          setCurrentWizardStepId(DeployProvisiongWizardStepId.Configure)
          updateStepStatus([DeployProvisiongWizardStepId.Deploy], StepStatus.ToDo)
        },
        stepFooterLabel: 'common.createPipeline'
      }
    ]
  ]

  const WizardSteps: Map<DeployProvisiongWizardStepId, WizardStep> = new Map([
    firstStep,
    ...(selectedDeploymentType === ServiceDeploymentType.KubernetesGitops ? WizardStepsgitOpsEnabled : CDWizardSteps)
  ])

  const { stepRender, onClickBack, onClickNext, stepFooterLabel } = WizardSteps.get(currentWizardStepId) ?? {}

  const buttonLabel = stepFooterLabel ? `${getString('next')}: ${getString(stepFooterLabel)}` : getString('next')

  const onwizardStepClick = (name: DeployProvisiongWizardStepId): void => {
    wizardStepStatus.get(name) !== StepStatus.ToDo && setCurrentWizardStepId(name)
  }

  const multiStepProgressMap = React.useMemo(
    () =>
      new Map([
        [
          0,
          {
            StepStatus: defaultTo(
              wizardStepStatus.get(DeployProvisiongWizardStepId.SelectDeploymentType),
              StepStatus.ToDo
            ),
            StepName: getString('cd.getStartedWithCD.selectDeploymentType'),
            onClick: () => onwizardStepClick(DeployProvisiongWizardStepId.SelectDeploymentType)
          }
        ],
        [
          1,
          {
            StepStatus: defaultTo(wizardStepStatus.get(DeployProvisiongWizardStepId.Connect), StepStatus.ToDo),
            StepName: getString('common.connect'),
            onClick: () => onwizardStepClick(DeployProvisiongWizardStepId.Connect)
          }
        ],
        [
          2,
          {
            StepStatus: defaultTo(wizardStepStatus.get(DeployProvisiongWizardStepId.Configure), StepStatus.ToDo),
            StepName: getString('connectors.ceAws.curExtention.stepB.step1.p1'),
            onClick: () => onwizardStepClick(DeployProvisiongWizardStepId.Configure)
          }
        ],
        [
          3,
          {
            StepStatus: defaultTo(wizardStepStatus.get(DeployProvisiongWizardStepId.Deploy), StepStatus.ToDo),
            StepName: getString('pipelineSteps.deploy.create.deployStageName'),
            onClick: () => onwizardStepClick(DeployProvisiongWizardStepId.Deploy)
          }
        ]
      ]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getString, wizardStepStatus]
  )

  return stepRender ? (
    <Layout.Vertical
      flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
      width="100%"
      style={{ minHeight: '100vh', position: 'relative' }}
    >
      <Layout.Vertical width="100%">
        {/* header */}
        <Container className={css.header}>
          <MultiStepProgressIndicator
            progressMap={multiStepProgressMap as any}
            textClassName={css.stepWizardText}
            barWidth={230}
          />
          <Button
            minimal
            icon="cross"
            iconProps={{ size: 18 }}
            onClick={showOnboaringExitWarning}
            className={commonCss.closeWizard}
            data-testid={'close-cd-onboarding-wizard'}
          />
        </Container>
        {/* content */}
        <Layout.Vertical
          padding={{ left: 'huge', right: 'huge', top: 'huge' }}
          flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
          height="90vh"
          width="100%"
        >
          <Layout.Vertical width="100%" height="90%" className={css.main}>
            {stepRender}
          </Layout.Vertical>

          {showPageLoader ? <PageSpinner /> : null}
        </Layout.Vertical>
      </Layout.Vertical>

      {/* footer */}
      <Layout.Vertical padding={{ left: 'huge' }} className={css.footer}>
        <Layout.Horizontal spacing="medium" padding={{ top: 'medium', bottom: 'large' }} width="100%">
          {currentWizardStepId !== DeployProvisiongWizardStepId.SelectDeploymentType && (
            <Button
              variation={ButtonVariation.SECONDARY}
              text={getString('back')}
              icon="chevron-left"
              minimal
              onClick={() => onClickBack?.()}
            />
          )}
          {currentWizardStepId !== DeployProvisiongWizardStepId.Deploy && (
            <Button
              text={buttonLabel}
              variation={ButtonVariation.PRIMARY}
              rightIcon="chevron-right"
              onClick={() => onClickNext?.()}
              disabled={disableBtn}
            />
          )}
        </Layout.Horizontal>
      </Layout.Vertical>
    </Layout.Vertical>
  ) : null
}
