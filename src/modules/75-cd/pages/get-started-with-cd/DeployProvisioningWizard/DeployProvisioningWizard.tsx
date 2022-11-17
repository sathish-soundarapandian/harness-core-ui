/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
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
  useToaster
} from '@harness/uicore'

import { Color, Intent } from '@harness/design-system'
import { defaultTo, get } from 'lodash-es'
import { useHistory, useParams } from 'react-router-dom'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { createPipelineV2Promise, ResponsePipelineSaveResponse } from 'services/pipeline-ng'
import { Status } from '@common/utils/Constants'
import routes from '@common/RouteDefinitions'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { StringUtils } from '@common/exports'
import type { UserRepoResponse } from 'services/cd-ng'
import { useQueryParams } from '@common/hooks'
import { WizardStep, StepStatus, DeployProvisiongWizardStepId, DeployProvisioningWizardProps } from './Constants'
import { SelectDeploymentType, SelectDeploymentTypeRefInstance } from '../SelectWorkload/SelectDeploymentType'
import type { SelectInfrastructureRefInstance } from '../SelectInfrastructure/SelectInfrastructure'
import { DelegateSelectorWizard } from '../DelegateSelectorWizard/DelegateSelectorWizard'
import { ConfigureService } from '../ConfigureService/ConfigureService'
import {
  DEFAULT_PIPELINE_NAME,
  DEFAULT_PIPELINE_PAYLOAD,
  DOCUMENT_URL,
  getUniqueEntityIdentifier,
  PipelineRefPayload
} from '../CDOnboardingUtils'
import { useCDOnboardingContext } from '../CDOnboardingStore'
import RunPipelineSummary from '../RunPipelineSummary/RunPipelineSummary'
import css from './DeployProvisioningWizard.module.scss'
const WizardStepOrder = [
  DeployProvisiongWizardStepId.SelectDeploymentType,
  DeployProvisiongWizardStepId.DelegateSelector,
  DeployProvisiongWizardStepId.ConfigureService,
  DeployProvisiongWizardStepId.RunPipeline
]

export const DeployProvisioningWizard: React.FC<DeployProvisioningWizardProps> = props => {
  const { lastConfiguredWizardStepId = DeployProvisiongWizardStepId.ConfigureService } = props
  const { getString } = useStrings()
  const [disableBtn, setDisableBtn] = useState<boolean>(false)
  const [currentWizardStepId, setCurrentWizardStepId] =
    useState<DeployProvisiongWizardStepId>(lastConfiguredWizardStepId)
  const {
    state: { service: serviceData, selectedSectionId, infrastructure, environment },
    setSelectedSectionId
  } = useCDOnboardingContext()

  const query = useQueryParams()

  const history = useHistory()
  const { showError } = useToaster()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const SelectDeploymentTypeRef = React.useRef<SelectDeploymentTypeRefInstance | null>(null)
  const configureServiceRef = React.useRef<SelectInfrastructureRefInstance | null>(null)

  const [showPageLoader, setShowPageLoader] = useState<boolean>(false)

  const [wizardStepStatus, setWizardStepStatus] = useState<Map<DeployProvisiongWizardStepId, StepStatus>>(
    new Map<DeployProvisiongWizardStepId, StepStatus>([
      [DeployProvisiongWizardStepId.SelectDeploymentType, StepStatus.InProgress],
      [DeployProvisiongWizardStepId.DelegateSelector, StepStatus.ToDo],
      [DeployProvisiongWizardStepId.ConfigureService, StepStatus.ToDo],
      [DeployProvisiongWizardStepId.RunPipeline, StepStatus.ToDo]
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
    const sectionId = (query as any).sectionId || ''
    if (sectionId?.length && WizardStepOrder.includes(sectionId)) {
      updateStepStatusFromContextTab(sectionId)
    } else {
      setSelectedSectionId(DeployProvisiongWizardStepId.SelectDeploymentType)
      updateStepStatus([DeployProvisiongWizardStepId.SelectDeploymentType], StepStatus.InProgress)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSectionId])

  const deletionContentText = React.useMemo(
    () => (
      <Text color={Color.BLACK} padding="medium">
        {`${getString('cd.getStartedWithCD.delegateRequiredWarning')} `}
        <a rel="noreferrer" target="_blank" href={DOCUMENT_URL}>
          {getString('pipeline.createPipeline.learnMore')}
        </a>
      </Text>
    ),
    [getString]
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

  const { openDialog: showDelegateRequiredWarning } = useConfirmationDialog({
    contentText: deletionContentText,
    titleText: getString('cd.getStartedWithCD.delegateNotConnected'),
    confirmButtonText: getString('continue'),
    cancelButtonText: getString('cancel'),
    intent: Intent.WARNING,
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        setDisableBtn(true)
        setSelectedSectionId(DeployProvisiongWizardStepId.ConfigureService)
        setCurrentWizardStepId(DeployProvisiongWizardStepId.ConfigureService)
        updateStepStatus(
          [DeployProvisiongWizardStepId.SelectDeploymentType, DeployProvisiongWizardStepId.DelegateSelector],
          StepStatus.Success
        )
        updateStepStatus([DeployProvisiongWizardStepId.ConfigureService], StepStatus.InProgress)
        updateStepStatus([DeployProvisiongWizardStepId.RunPipeline], StepStatus.ToDo)
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
        return ''
      }
      const uniquePipelineId = getUniqueEntityIdentifier(repoName)
      const payload = DEFAULT_PIPELINE_PAYLOAD
      payload.pipeline.name = `${getString('buildText')}_${StringUtils.getIdentifierFromName(repoName)}`
      payload.pipeline.identifier = `${getString(
        'pipelineSteps.deploy.create.deployStageName'
      )}_${StringUtils.getIdentifierFromName(uniquePipelineId)}` // pipeline identifier cannot have spaces
      payload.pipeline.projectIdentifier = projectIdentifier
      payload.pipeline.orgIdentifier = orgIdentifier
      payload.pipeline.stages[0].stage.spec.deploymentType = deploymentType
      payload.pipeline.stages[0].stage.spec.service.serviceRef = serviceRef
      payload.pipeline.stages[0].stage.spec.environment.environmentRef = environmentRef
      payload.pipeline.stages[0].stage.spec.environment.infrastructureDefinitions[0].identifier = infraStructureRef

      try {
        return yamlStringify(payload)
      } catch (e) {
        // Ignore error
        return ''
      }
    },
    [getString, projectIdentifier, orgIdentifier]
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
            history.push(
              routes.toPipelineStudio({
                accountId: accountId,
                module: 'cd',
                orgIdentifier,
                projectIdentifier,
                pipelineIdentifier: createPipelineResponse?.data?.identifier,
                stageId: getString('buildText')
              })
            )
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
    history.push(routes.toGetStartedWithCD({ accountId, orgIdentifier, projectIdentifier, module: 'cd' }))
  }

  const WizardSteps: Map<DeployProvisiongWizardStepId, WizardStep> = new Map([
    [
      DeployProvisiongWizardStepId.SelectDeploymentType,
      {
        stepRender: (
          <SelectDeploymentType
            ref={SelectDeploymentTypeRef}
            onSuccess={() => {
              setDisableBtn(true)
              setSelectedSectionId(DeployProvisiongWizardStepId.DelegateSelector)
              setCurrentWizardStepId(DeployProvisiongWizardStepId.DelegateSelector)
              updateStepStatus([DeployProvisiongWizardStepId.SelectDeploymentType], StepStatus.Success)
              updateStepStatus([DeployProvisiongWizardStepId.DelegateSelector], StepStatus.InProgress)
              updateStepStatus([DeployProvisiongWizardStepId.ConfigureService], StepStatus.ToDo)
              updateStepStatus([DeployProvisiongWizardStepId.RunPipeline], StepStatus.ToDo)
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
        stepFooterLabel: 'cd.getStartedWithCD.configureEnvironment'
      }
    ],
    [
      DeployProvisiongWizardStepId.DelegateSelector,
      {
        stepRender: (
          <>
            <DelegateSelectorWizard
              disableNextBtn={() => setDisableBtn(true)}
              enableNextBtn={() => setDisableBtn(false)}
            />
          </>
        ),
        onClickBack: () => {
          setSelectedSectionId(DeployProvisiongWizardStepId.SelectDeploymentType)
          setCurrentWizardStepId(DeployProvisiongWizardStepId.SelectDeploymentType)
          updateStepStatus([DeployProvisiongWizardStepId.DelegateSelector], StepStatus.ToDo)
        },
        onClickNext: async () => {
          showDelegateRequiredWarning()
        },

        stepFooterLabel: 'cd.getStartedWithCD.configureService'
      }
    ],
    [
      DeployProvisiongWizardStepId.ConfigureService,
      {
        stepRender: (
          <ConfigureService
            onSuccess={() => {
              setSelectedSectionId(DeployProvisiongWizardStepId.RunPipeline)
              setCurrentWizardStepId(DeployProvisiongWizardStepId.RunPipeline)
              updateStepStatus(
                [
                  DeployProvisiongWizardStepId.SelectDeploymentType,
                  DeployProvisiongWizardStepId.DelegateSelector,
                  DeployProvisiongWizardStepId.ConfigureService
                ],
                StepStatus.Success
              )
              updateStepStatus([DeployProvisiongWizardStepId.RunPipeline], StepStatus.InProgress)
            }}
            ref={configureServiceRef}
            disableNextBtn={() => setDisableBtn(true)}
            enableNextBtn={() => setDisableBtn(false)}
          />
        ),
        onClickBack: () => {
          setSelectedSectionId(DeployProvisiongWizardStepId.DelegateSelector)
          setCurrentWizardStepId(DeployProvisiongWizardStepId.DelegateSelector)
          updateStepStatus([DeployProvisiongWizardStepId.ConfigureService], StepStatus.ToDo)
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
      DeployProvisiongWizardStepId.RunPipeline,
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
                  DeployProvisiongWizardStepId.DelegateSelector,
                  DeployProvisiongWizardStepId.ConfigureService,
                  DeployProvisiongWizardStepId.RunPipeline
                ],
                StepStatus.Success
              )
            }}
          />
        ),
        onClickBack: () => {
          setCurrentWizardStepId(DeployProvisiongWizardStepId.ConfigureService)
          updateStepStatus([DeployProvisiongWizardStepId.RunPipeline], StepStatus.ToDo)
        },
        stepFooterLabel: 'common.createPipeline'
      }
    ]
  ])

  const { stepRender, onClickBack, onClickNext, stepFooterLabel } = WizardSteps.get(currentWizardStepId) ?? {}

  const buttonLabel = stepFooterLabel ? `${getString('next')}: ${getString(stepFooterLabel)}` : getString('next')

  const onwizardStepClick = (name: DeployProvisiongWizardStepId): void => {
    wizardStepStatus.get(name) !== StepStatus.ToDo && setCurrentWizardStepId(name)
  }
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
            progressMap={
              new Map([
                [
                  0,
                  {
                    StepStatus: defaultTo(
                      wizardStepStatus.get(DeployProvisiongWizardStepId.SelectDeploymentType),
                      'TODO'
                    ),
                    StepName: getString('cd.getStartedWithCD.selectDeploymentType'),
                    onClick: () => onwizardStepClick(DeployProvisiongWizardStepId.SelectDeploymentType)
                  }
                ],
                [
                  1,
                  {
                    StepStatus: defaultTo(wizardStepStatus.get(DeployProvisiongWizardStepId.DelegateSelector), 'TODO'),
                    StepName: getString('cd.getStartedWithCD.configureEnvironment'),
                    onClick: () => onwizardStepClick(DeployProvisiongWizardStepId.DelegateSelector)
                  }
                ],
                [
                  2,
                  {
                    StepStatus: defaultTo(wizardStepStatus.get(DeployProvisiongWizardStepId.ConfigureService), 'TODO'),
                    StepName: getString('cd.getStartedWithCD.configureService'),
                    onClick: () => onwizardStepClick(DeployProvisiongWizardStepId.ConfigureService)
                  }
                ],
                [
                  3,
                  {
                    StepStatus: defaultTo(wizardStepStatus.get(DeployProvisiongWizardStepId.RunPipeline), 'TODO'),
                    StepName: getString('runPipeline'),
                    onClick: () => onwizardStepClick(DeployProvisiongWizardStepId.RunPipeline)
                  }
                ]
              ])
            }
            textClassName={css.stepWizardText}
            barWidth={160}
          />
          <Button
            minimal
            icon="cross"
            iconProps={{ size: 18 }}
            onClick={showOnboaringExitWarning}
            style={{ position: 'absolute', right: 'var(--spacing-large)', top: 'var(--spacing-large)' }}
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
          {currentWizardStepId !== DeployProvisiongWizardStepId.RunPipeline && (
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
