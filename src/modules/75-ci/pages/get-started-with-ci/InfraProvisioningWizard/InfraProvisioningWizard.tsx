/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Container, Button, ButtonVariation, Layout, MultiStepProgressIndicator } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useSideNavContext } from 'framework/SideNavStore/SideNavContext'
import routes from '@common/RouteDefinitions'
import { ResponseSetupStatus, useGetDelegateInstallStatus, useProvisionResourcesForCI } from 'services/cd-ng'
import { createPipelineV2Promise, ResponsePipelineSaveResponse } from 'services/pipeline-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { DEFAULT_PIPELINE_PAYLOAD } from '@common/utils/CIConstants'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { InfraProvisioningCarousel } from '../InfraProvisioningCarousel/InfraProvisioningCarousel'
import {
  InfraProvisioningWizardProps,
  WizardStep,
  InfraProvisiongWizardStepId,
  StepStatus,
  GitAuthenticationMethod,
  BuildLocation,
  ProvisioningStatus,
  Hosting
} from './Constants'
import { SelectBuildLocation, SelectBuildLocationRef } from './SelectBuildLocation'
import { SelectGitProvider, SelectGitProviderRef } from './SelectGitProvider'
import { SelectRepository, SelectRepositoryRef } from './SelectRepository'

import css from './InfraProvisioningWizard.module.scss'

const DELEGATE_INSTALLATION_REFETCH_DELAY = 10000

export const InfraProvisioningWizard: React.FC<InfraProvisioningWizardProps> = props => {
  const { lastConfiguredWizardStepId = InfraProvisiongWizardStepId.SelectBuildLocation } = props
  const { getString } = useStrings()
  const [showDialog, setShowDialog] = useState<boolean>(false)
  const [disable, setDisable] = useState<boolean>(false)
  const [currentWizardStepId, setCurrentWizardStepId] =
    useState<InfraProvisiongWizardStepId>(lastConfiguredWizardStepId)
  const selectBuildLocationRef = React.useRef<SelectBuildLocationRef | null>(null)
  const selectGitProviderRef = React.useRef<SelectGitProviderRef | null>(null)
  const selectRepositoryRef = React.useRef<SelectRepositoryRef | null>(null)
  const [showError, setShowError] = useState<boolean>(false)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const history = useHistory()
  const [startPolling, setStartPolling] = useState<boolean>(false)
  const [ciProvisioningStatus, setCIProvisioningStatus] = useState<ProvisioningStatus>()
  const { setShowGetStartedTab } = useSideNavContext()

  const { mutate: startProvisioning } = useProvisionResourcesForCI({
    queryParams: {
      accountIdentifier: accountId
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  })

  const { refetch: fetchProvisioningStatus, data: provisioningStatus } = useGetDelegateInstallStatus({
    queryParams: {
      accountIdentifier: accountId
    },
    lazy: true
  })

  useEffect(() => {
    const { status, data } = provisioningStatus || {}
    if (status === ProvisioningStatus[ProvisioningStatus.SUCCESS]) {
      setCIProvisioningStatus(ProvisioningStatus.SUCCESS)
    }
    if (data === ProvisioningStatus[ProvisioningStatus.SUCCESS]) {
      setStartPolling(false)
    }
  }, [provisioningStatus])

  useEffect(() => {
    if (startPolling) {
      const timerId = setInterval(fetchProvisioningStatus, DELEGATE_INSTALLATION_REFETCH_DELAY)
      return () => clearInterval(timerId)
    }
  })

  const [wizardStepStatus, setWizardStepStatus] = useState<Map<InfraProvisiongWizardStepId, StepStatus>>(
    new Map<InfraProvisiongWizardStepId, StepStatus>([
      [InfraProvisiongWizardStepId.SelectBuildLocation, StepStatus.ToDo],
      [InfraProvisiongWizardStepId.SelectGitProvider, StepStatus.ToDo],
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

  const constructPipelinePayload = React.useCallback(() => {
    const payload = { ...DEFAULT_PIPELINE_PAYLOAD }
    payload.pipeline.projectIdentifier = projectIdentifier
    payload.pipeline.orgIdentifier = orgIdentifier
    try {
      return yamlStringify(payload)
    } catch (e) {
      // Ignore error
    }
  }, [projectIdentifier, orgIdentifier])

  const goToSelectGitProviderStepAfterBuildLocationSelection = React.useCallback(() => {
    updateStepStatus([InfraProvisiongWizardStepId.SelectBuildLocation], StepStatus.Success)
    updateStepStatus([InfraProvisiongWizardStepId.SelectGitProvider], StepStatus.InProgress)
    setCurrentWizardStepId(InfraProvisiongWizardStepId.SelectGitProvider)
  }, [])

  const WizardSteps: Map<InfraProvisiongWizardStepId, WizardStep> = new Map([
    [
      InfraProvisiongWizardStepId.SelectBuildLocation,
      {
        stepRender: (
          <SelectBuildLocation
            ref={selectBuildLocationRef}
            selectedHosting={selectBuildLocationRef.current?.hosting}
            selectedBuildLocation={selectBuildLocationRef.current?.buildLocation}
            provisioningStatus={ciProvisioningStatus}
          />
        ),
        onClickNext: () => {
          if (selectBuildLocationRef.current?.buildLocation.location === BuildLocation.HostedByHarness) {
            setShowDialog(true)
            setCIProvisioningStatus(ProvisioningStatus.IN_PROGRESS)
            updateStepStatus([InfraProvisiongWizardStepId.SelectBuildLocation], StepStatus.InProgress)
            startProvisioning()
              .then((startProvisioningResponse: ResponseSetupStatus) => {
                const { status: startProvisioningStatus, data: startProvisioningData } = startProvisioningResponse
                if (
                  startProvisioningStatus === ProvisioningStatus[ProvisioningStatus.SUCCESS] &&
                  startProvisioningData === ProvisioningStatus[ProvisioningStatus.SUCCESS]
                ) {
                  fetchProvisioningStatus()
                  setStartPolling(true)
                } else {
                  setCIProvisioningStatus(ProvisioningStatus.FAILURE)
                }
              })
              .catch(() => {
                setCIProvisioningStatus(ProvisioningStatus.FAILURE)
              })
          } else {
            goToSelectGitProviderStepAfterBuildLocationSelection()
          }
        },
        stepFooterLabel: 'ci.getStartedWithCI.configInfra'
      }
    ],
    [
      InfraProvisiongWizardStepId.SelectGitProvider,
      {
        stepRender: (
          <SelectGitProvider
            ref={selectGitProviderRef}
            disableNextBtn={() => setDisable(true)}
            enableNextBtn={() => setDisable(false)}
            selectedHosting={selectBuildLocationRef.current?.hosting}
          />
        ),
        onClickNext: () => {
          const { values, setFieldTouched } = selectGitProviderRef.current || {}
          const { accessToken, gitProvider, gitAuthenticationMethod } = values || {}
          if (!gitProvider) {
            setFieldTouched?.('gitProvider', true)
            return
          }
          if (!gitAuthenticationMethod) {
            setFieldTouched?.('gitAuthenticationMethod', true)
            return
          }
          if (!accessToken) {
            setFieldTouched?.('accessToken', true)
          }
          if (
            selectBuildLocationRef.current?.hosting === Hosting.SaaS &&
            ((gitAuthenticationMethod === GitAuthenticationMethod.AccessToken && accessToken && gitProvider) ||
              (gitAuthenticationMethod === GitAuthenticationMethod.OAuth && gitProvider))
          ) {
            setCurrentWizardStepId(InfraProvisiongWizardStepId.SelectRepository)
            updateStepStatus([InfraProvisiongWizardStepId.SelectGitProvider], StepStatus.Success)
            updateStepStatus([InfraProvisiongWizardStepId.SelectRepository], StepStatus.InProgress)
          }
        },
        onClickBack: () => {
          setDisable(false)
          setCurrentWizardStepId(InfraProvisiongWizardStepId.SelectBuildLocation)
          updateStepStatus(
            [InfraProvisiongWizardStepId.SelectBuildLocation, InfraProvisiongWizardStepId.SelectGitProvider],
            StepStatus.ToDo
          )
        },
        stepFooterLabel: 'ci.getStartedWithCI.selectRepo'
      }
    ],
    [
      InfraProvisiongWizardStepId.SelectRepository,
      {
        stepRender: <SelectRepository ref={selectRepositoryRef} showError={showError} />,
        onClickBack: () => {
          setCurrentWizardStepId(InfraProvisiongWizardStepId.SelectGitProvider)
          updateStepStatus(
            [InfraProvisiongWizardStepId.SelectGitProvider, InfraProvisiongWizardStepId.SelectRepository],
            StepStatus.ToDo
          )
        },
        onClickNext: () => {
          const shouldShowError = !selectRepositoryRef.current?.repository.name
          setShowError(shouldShowError)
          if (!shouldShowError) {
            updateStepStatus([InfraProvisiongWizardStepId.SelectRepository], StepStatus.Success)
            setDisable(true)
            createPipelineV2Promise({
              body: constructPipelinePayload() || '',
              queryParams: {
                accountIdentifier: accountId,
                orgIdentifier,
                projectIdentifier
              },
              requestOptions: { headers: { 'Content-Type': 'application/yaml' } }
            })
              .then((createPipelineResponse: ResponsePipelineSaveResponse) => {
                setDisable(false)
                const { status, data } = createPipelineResponse
                if (status === 'SUCCESS' && data?.identifier) {
                  setShowGetStartedTab(false)
                  history.push(
                    routes.toPipelineStudio({
                      accountId: accountId,
                      module: 'ci',
                      orgIdentifier,
                      projectIdentifier,
                      pipelineIdentifier: data?.identifier
                    })
                  )
                }
              })
              .catch(() => setDisable(false))
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

  return stepRender ? (
    <Layout.Vertical
      padding={{ left: 'huge', right: 'huge', top: 'huge' }}
      flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
      height="100%"
    >
      <Layout.Vertical width="100%" height="90%">
        <Container padding={{ top: 'large', bottom: 'large' }}>
          <MultiStepProgressIndicator
            progressMap={
              new Map([
                [0, wizardStepStatus.get(InfraProvisiongWizardStepId.SelectBuildLocation) || 'TODO'],
                [1, wizardStepStatus.get(InfraProvisiongWizardStepId.SelectGitProvider) || 'TODO'],
                [2, wizardStepStatus.get(InfraProvisiongWizardStepId.SelectRepository) || 'TODO']
              ])
            }
          />
        </Container>
        {stepRender}
      </Layout.Vertical>
      {showDialog ? (
        <InfraProvisioningCarousel
          show={showDialog}
          provisioningStatus={ciProvisioningStatus}
          onClose={() => {
            setShowDialog(false)
            if (ciProvisioningStatus === ProvisioningStatus.SUCCESS) {
              goToSelectGitProviderStepAfterBuildLocationSelection()
            } else if (ciProvisioningStatus === ProvisioningStatus.FAILURE) {
              updateStepStatus([InfraProvisiongWizardStepId.SelectBuildLocation], StepStatus.Failed)
            }
          }}
        />
      ) : null}
      <Layout.Horizontal
        spacing="medium"
        padding={{ top: 'large', bottom: 'xlarge' }}
        className={css.footer}
        width="100%"
      >
        {currentWizardStepId !== InfraProvisiongWizardStepId.SelectBuildLocation ? (
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
          disabled={disable}
        />
      </Layout.Horizontal>
    </Layout.Vertical>
  ) : null
}
