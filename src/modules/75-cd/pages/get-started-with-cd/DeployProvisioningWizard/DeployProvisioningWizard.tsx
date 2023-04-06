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
  Text
} from '@harness/uicore'
import { Color, Intent } from '@harness/design-system'
import { defaultTo, get, noop } from 'lodash-es'
import { useHistory, useParams } from 'react-router-dom'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { CDOnboardingActions } from '@common/constants/TrackingConstants'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import type { RepositoriesRepoAppDetailsResponse } from 'services/gitops'
import { useUpdateQueryParams } from '@common/hooks'
import { ResourceCategory } from '@rbac/interfaces/ResourceType'
import { WizardStep, StepStatus, DeployProvisiongWizardStepId, DeployProvisioningWizardProps } from './Constants'
import { SelectDeploymentType, SelectDeploymentTypeRefInstance } from '../SelectWorkload/SelectDeploymentType'
import type { SelectInfrastructureRefInstance } from '../SelectInfrastructure/SelectInfrastructure'
import { DelegateSelectorRefInstance, DelegateSelectorWizard } from '../DelegateSelectorWizard/DelegateSelectorWizard'
import { Configure } from '../ConfigureService/ConfigureService'
import { DOCUMENT_URL, getTelemetryDeploymentType } from '../CDOnboardingUtils'
import { useCDOnboardingContext } from '../CDOnboardingStore'
import RunPipelineSummary from '../RunPipelineSummary/RunPipelineSummary'
import { ConfigureGitops } from '../ConfigureGitops/ConfigureGitops'
import { GitOpsAgent } from '../GitOpsAgent/GitOpsAgent'
import { Deploy } from '../Deploy/Deploy'
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
  const { lastConfiguredWizardStepId = DeployProvisiongWizardStepId.SelectDeploymentType } = props
  const {
    state: { service: serviceData, agent: agentData }
  } = useCDOnboardingContext()

  const { getString } = useStrings()
  const { trackEvent, trackPage } = useTelemetry()
  const history = useHistory()
  const { updateQueryParams } = useUpdateQueryParams()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const selectedDeploymentType: string | undefined = get(serviceData, 'serviceDefinition.type')
  const [appDetails, setAppDetails] = React.useState<RepositoriesRepoAppDetailsResponse>()

  const [selectedSectionId, setSelectedSectionId] = React.useState<DeployProvisiongWizardStepId>(
    DeployProvisiongWizardStepId.SelectDeploymentType
  )

  const [disableBtn, setDisableBtn] = React.useState<boolean>(false)
  const [currentWizardStepId, setCurrentWizardStepId] =
    React.useState<DeployProvisiongWizardStepId>(lastConfiguredWizardStepId)
  const [showPageLoader, setShowPageLoader] = React.useState<boolean>(false)

  const SelectDeploymentTypeRef = React.useRef<SelectDeploymentTypeRefInstance | null>(null)
  const delegateSelectorRef = React.useRef<DelegateSelectorRefInstance | null>(null)
  const configureServiceRef = React.useRef<SelectInfrastructureRefInstance | null>(null)

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
    trackPage(getString('cd.getStartedWithCD.cdWizardEventName', { eventName: currentWizardStepId as string }), {})
    const prefix =
      selectedDeploymentType === ServiceDeploymentType.KubernetesGitops ? `${ResourceCategory.GITOPS}_` : ''
    updateQueryParams({
      sectionId: `${prefix}${currentWizardStepId}`
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWizardStepId])

  React.useEffect(() => {
    if (selectedSectionId?.length && WizardStepOrder.includes(selectedSectionId)) {
      updateStepStatusFromContextTab(selectedSectionId)
    } else {
      setSelectedSectionId(DeployProvisiongWizardStepId.SelectDeploymentType)
      updateStepStatus([DeployProvisiongWizardStepId.SelectDeploymentType], StepStatus.InProgress)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSectionId])

  const deletionContentText = (
    <Text color={Color.BLACK} padding="medium">
      {`${getString('cd.getStartedWithCD.delegateRequiredWarning')} `}
      <a rel="noreferrer" target="_blank" href={DOCUMENT_URL}>
        {getString('pipeline.createPipeline.learnMore')}
      </a>
    </Text>
  )

  const deployment_type = React.useMemo(() => {
    return getTelemetryDeploymentType(selectedDeploymentType)
  }, [selectedDeploymentType])

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
    trackEvent(CDOnboardingActions.MoveToServiceSelection, { deployment_type })
  }

  const { openDialog: showDelegateRequiredWarning } = useConfirmationDialog({
    contentText: deletionContentText,
    titleText: getString('cd.getStartedWithCD.delegateNotConnected'),
    confirmButtonText: getString('continue'),
    cancelButtonText: getString('cancel'),
    intent: Intent.WARNING,
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        trackEvent(CDOnboardingActions.MoveToServiceSelection, { is_delegate_connected: false, deployment_type })
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

  const closeCDWizard = (): void => {
    trackEvent(CDOnboardingActions.ExitCDOnboarding, { deployment_type })
    history.push(routes.toGetStartedWithCD({ accountId, orgIdentifier, projectIdentifier, module: 'cd' }))
  }

  const firstStep = [
    DeployProvisiongWizardStepId.SelectDeploymentType,
    {
      stepRender: (
        <SelectDeploymentType
          ref={SelectDeploymentTypeRef}
          onSuccess={(deploymentType: string) => {
            setDisableBtn(true)
            setSelectedSectionId(DeployProvisiongWizardStepId.Connect)
            setCurrentWizardStepId(DeployProvisiongWizardStepId.Connect)
            updateStepStatus([DeployProvisiongWizardStepId.Connect], StepStatus.InProgress)
            updateStepStatus([DeployProvisiongWizardStepId.SelectDeploymentType], StepStatus.Success)
            updateStepStatus([DeployProvisiongWizardStepId.Configure], StepStatus.ToDo)
            updateStepStatus([DeployProvisiongWizardStepId.Deploy], StepStatus.ToDo)
            trackEvent(CDOnboardingActions.MovetoConnectStep, {
              deployment_type: getTelemetryDeploymentType(deploymentType)
            })
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
      stepFooterLabel: 'common.connect'
    }
  ]

  const WizardStepsgitOpsEnabled: any = [
    [
      DeployProvisiongWizardStepId.Connect,
      {
        stepRender: (
          <GitOpsAgent
            onBack={() => {
              setSelectedSectionId(DeployProvisiongWizardStepId.SelectDeploymentType)
              setCurrentWizardStepId(DeployProvisiongWizardStepId.SelectDeploymentType)
              updateStepStatus([DeployProvisiongWizardStepId.Connect], StepStatus.ToDo)
              trackEvent(CDOnboardingActions.MoveBackToSelectDeploymentType, { deployment_type })
            }}
            onNext={() => {
              setDisableBtn(true)
              setSelectedSectionId(DeployProvisiongWizardStepId.Configure)
              setCurrentWizardStepId(DeployProvisiongWizardStepId.Configure)
              updateStepStatus(
                [DeployProvisiongWizardStepId.SelectDeploymentType, DeployProvisiongWizardStepId.Connect],
                StepStatus.Success
              )
              updateStepStatus([DeployProvisiongWizardStepId.Configure], StepStatus.InProgress)
              updateStepStatus([DeployProvisiongWizardStepId.Deploy], StepStatus.ToDo)
              trackEvent(CDOnboardingActions.MoveToConfigureStep, { deployment_type })
            }}
          />
        ),
        showFooter: false,
        onClickBack: noop,
        onClickNext: noop,
        stepFooterLabel: 'connectors.ceAws.curExtention.stepB.step1.p1'
      }
    ],
    [
      DeployProvisiongWizardStepId.Configure,
      {
        stepRender: (
          <ConfigureGitops
            setAppDetails={setAppDetails}
            disableNextBtn={() => setDisableBtn(true)}
            enableNextBtn={() => setDisableBtn(false)}
            ref={delegateSelectorRef}
            prevStepData={{
              agent: agentData?.identifier,
              scope: 'account'
            }}
          />
        ),
        onClickBack: () => {
          setSelectedSectionId(DeployProvisiongWizardStepId.Connect)
          setCurrentWizardStepId(DeployProvisiongWizardStepId.Connect)
          updateStepStatus([DeployProvisiongWizardStepId.Configure], StepStatus.ToDo)
          trackEvent(CDOnboardingActions.MoveBacktoConnectStep, { deployment_type })
        },
        onClickNext: () => {
          setSelectedSectionId(DeployProvisiongWizardStepId.Deploy)
          setCurrentWizardStepId(DeployProvisiongWizardStepId.Deploy)
          updateStepStatus([DeployProvisiongWizardStepId.Deploy], StepStatus.ToDo)
          updateStepStatus([DeployProvisiongWizardStepId.Configure], StepStatus.Success)
          trackEvent(CDOnboardingActions.MovetoDeployStep, { deployment_type })
        },
        stepFooterLabel: 'review'
      }
    ],
    [
      DeployProvisiongWizardStepId.Deploy,
      {
        stepRender: (
          <Deploy
            appDetails={appDetails}
            onBack={() => {
              setCurrentWizardStepId(DeployProvisiongWizardStepId.Configure)
              updateStepStatus([DeployProvisiongWizardStepId.Deploy], StepStatus.ToDo)
              trackEvent(CDOnboardingActions.MoveBacktoConfigureStep, { deployment_type })
            }}
            setSelectedSectionId={setSelectedSectionId}
          />
        ),
        showFooter: false,
        onClickBack: noop,
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
          trackEvent(CDOnboardingActions.MoveBackToSelectDeploymentType, { deployment_type })
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
              updateStepStatus([DeployProvisiongWizardStepId.Deploy], StepStatus.InProgress)
              trackEvent(CDOnboardingActions.MoveToPipelineSummary, { deployment_type })
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
          trackEvent(CDOnboardingActions.MoveBacktoConnectStep, { deployment_type })
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
            setLoader={setShowPageLoader}
            onSuccess={() => {
              setShowPageLoader(true)
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

  const {
    stepRender,
    onClickBack,
    onClickNext,
    stepFooterLabel,
    showFooter = true
  } = WizardSteps.get(currentWizardStepId) ?? {}

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
        <hr className={css.divider} />
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
      {showFooter ? (
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
      ) : null}
    </Layout.Vertical>
  ) : null
}
