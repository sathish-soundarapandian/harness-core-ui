/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { get, set, merge } from 'lodash-es'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import produce from 'immer'
import { Dialog, IDialogProps, Classes } from '@blueprintjs/core'
import { shouldShowError, useToaster } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Color } from '@harness/design-system'
import type { IconProps } from '@harness/icons'

import {
  useGetConnectorListV2,
  PageConnectorResponse,
  SidecarArtifactWrapper,
  PrimaryArtifact,
  StageElementConfig,
  ArtifactConfig,
  SidecarArtifact
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { GitQueryParams, PipelineType } from '@common/interfaces/RouteInterfaces'
import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { useDeepCompareEffect, useQueryParams } from '@common/hooks'
import type { Scope } from '@common/interfaces/SecretsInterface'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { ArtifactActions } from '@common/constants/TrackingConstants'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@connectors/constants'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { DeploymentStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import {
  ArtifactConnectorStepDataToLastStep,
  useArtifactSelectionLastSteps
} from '@pipeline/components/ArtifactsSelection/hooks/useArtifactSelectionLastSteps'
import { useGetLastStepConnectorValue } from '@pipeline/hooks/useGetLastStepConnectorValue'
import ArtifactWizard from './ArtifactWizard/ArtifactWizard'
import ArtifactListView from './ArtifactListView/ArtifactListView'
import type {
  ArtifactsSelectionProps,
  InitialArtifactDataType,
  ConnectorRefLabelType,
  ArtifactType,
  ImagePathProps,
  ImagePathTypes,
  AmazonS3InitialValuesType,
  JenkinsArtifactType,
  GoogleArtifactRegistryInitialValuesType,
  CustomArtifactSource,
  GithubPackageRegistryInitialValuesType,
  Nexus2InitialValuesType,
  AzureArtifactsInitialValues,
  GoogleCloudStorageInitialValuesType,
  GoogleCloudSourceRepositoriesInitialValuesType
} from './ArtifactInterface'
import {
  ENABLED_ARTIFACT_TYPES,
  ArtifactIconByType,
  ArtifactTitleIdByType,
  allowedArtifactTypes,
  ModalViewFor,
  isAllowedCustomArtifactDeploymentTypes,
  isSidecarAllowed,
  isAllowedAzureArtifactDeploymentTypes,
  showArtifactStoreStepDirectly,
  isAllowedBambooArtifactDeploymentTypes,
  getInitialSelectedArtifactValue
} from './ArtifactHelper'
import { useVariablesExpression } from '../PipelineStudio/PiplineHooks/useVariablesExpression'
import { showConnectorStep } from './ArtifactUtils'
import css from './ArtifactsSelection.module.scss'

export default function ArtifactsSelection({
  isPropagating = false,
  deploymentType,
  readonly,
  availableArtifactTypes
}: ArtifactsSelectionProps): React.ReactElement | null {
  const {
    state: {
      selectionState: { selectedStageId }
    },
    getStageFromPipeline,
    updateStage,
    allowableTypes
  } = usePipelineContext()

  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactType | null>(
    getInitialSelectedArtifactValue(deploymentType, availableArtifactTypes)
  )
  const [connectorView, setConnectorView] = useState(false)
  const [context, setModalContext] = useState(ModalViewFor.PRIMARY)
  const [sidecarIndex, setEditIndex] = useState(0)
  const [fetchedConnectorResponse, setFetchedConnectorResponse] = useState<PageConnectorResponse | undefined>()

  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const { expressions } = useVariablesExpression()

  const {
    CUSTOM_ARTIFACT_NG,
    AZURE_ARTIFACTS_NG,
    AZURE_WEBAPP_NG_JENKINS_ARTIFACTS,
    CDS_SERVICE_CONFIG_LAST_STEP,
    BAMBOO_ARTIFACT_NG
  } = useFeatureFlags()
  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')

  useEffect(() => {
    if (
      CUSTOM_ARTIFACT_NG &&
      !allowedArtifactTypes[deploymentType]?.includes(ENABLED_ARTIFACT_TYPES.CustomArtifact) &&
      isAllowedCustomArtifactDeploymentTypes(deploymentType)
    ) {
      allowedArtifactTypes[deploymentType].push(ENABLED_ARTIFACT_TYPES.CustomArtifact)
    }
    if (
      isAllowedAzureArtifactDeploymentTypes(deploymentType) &&
      AZURE_ARTIFACTS_NG &&
      !allowedArtifactTypes[deploymentType]?.includes(ENABLED_ARTIFACT_TYPES.AzureArtifacts)
    ) {
      allowedArtifactTypes[deploymentType].push(ENABLED_ARTIFACT_TYPES.AzureArtifacts)
    }
    if (
      [ServiceDeploymentType.AzureWebApp, ServiceDeploymentType.TAS].includes(
        deploymentType as ServiceDeploymentType
      ) &&
      AZURE_WEBAPP_NG_JENKINS_ARTIFACTS &&
      !allowedArtifactTypes[deploymentType]?.includes(ENABLED_ARTIFACT_TYPES.Jenkins)
    ) {
      allowedArtifactTypes[deploymentType].push(ENABLED_ARTIFACT_TYPES.Jenkins)
    }
    if (
      BAMBOO_ARTIFACT_NG &&
      isAllowedBambooArtifactDeploymentTypes(deploymentType) &&
      !allowedArtifactTypes[deploymentType]?.includes(ENABLED_ARTIFACT_TYPES.Bamboo)
    ) {
      allowedArtifactTypes[deploymentType].push(ENABLED_ARTIFACT_TYPES.Bamboo)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentType])

  const { accountId, orgIdentifier, projectIdentifier } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      accountId: string
    }>
  >()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const defaultQueryParams = {
    pageIndex: 0,
    pageSize: 10,
    searchTerm: '',
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    includeAllConnectorsAvailableAtScope: true
  }
  const { mutate: fetchConnectors } = useGetConnectorListV2({
    queryParams: defaultQueryParams
  })

  const getArtifactsPath = useCallback((): any => {
    if (isPropagating) {
      return get(stage, 'stage.spec.serviceConfig.stageOverrides.artifacts', [])
    }
    return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts', {})
  }, [isPropagating, stage])

  const getPrimaryArtifactPath = useCallback((): PrimaryArtifact => {
    if (isPropagating) {
      return get(stage, 'stage.spec.serviceConfig.stageOverrides.artifacts.primary', null)
    }

    return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts.primary', null)
  }, [isPropagating, stage])

  const getSidecarPath = useCallback((): SidecarArtifactWrapper[] => {
    if (isPropagating) {
      return get(stage, 'stage.spec.serviceConfig.stageOverrides.artifacts.sidecars', [])
    }
    return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts.sidecars', [])
  }, [isPropagating, stage])

  const artifacts = getArtifactsPath()

  const primaryArtifact = getPrimaryArtifactPath()
  const sideCarArtifact = getSidecarPath()

  const checkIfArtifactEditMode = () => {
    return (
      (context === ModalViewFor.PRIMARY && !!primaryArtifact?.type) ||
      (context === ModalViewFor.SIDECAR && sidecarIndex < sideCarArtifact.length)
    )
  }

  const [isArtifactEditMode, setIsArtifactEditMode] = useState(checkIfArtifactEditMode())

  useEffect(() => {
    setIsArtifactEditMode(checkIfArtifactEditMode())
  }, [context, primaryArtifact, sideCarArtifact, sideCarArtifact.length, sidecarIndex])

  const DIALOG_PROPS: IDialogProps = {
    isOpen: true,
    usePortal: true,
    autoFocus: true,
    canEscapeKeyClose: false,
    canOutsideClickClose: false,
    enforceFocus: false,
    title: '',
    style: { width: 1120, height: 550, borderLeft: 'none', paddingBottom: 0, position: 'relative' }
  }

  const getPrimaryConnectorList = useCallback((): Array<{ scope: Scope; identifier: string }> => {
    return primaryArtifact?.type
      ? [
          {
            scope: getScopeFromValue(primaryArtifact?.spec?.connectorRef),
            identifier: getIdentifierFromValue(primaryArtifact?.spec?.connectorRef)
          }
        ]
      : []
  }, [primaryArtifact?.spec?.connectorRef, primaryArtifact?.type])

  const getSidecarConnectorList = useCallback((): Array<{ scope: Scope; identifier: string }> => {
    return sideCarArtifact?.length
      ? sideCarArtifact.map((data: SidecarArtifactWrapper) => ({
          scope: getScopeFromValue(data?.sidecar?.spec?.connectorRef),
          identifier: getIdentifierFromValue(data?.sidecar?.spec?.connectorRef)
        }))
      : []
  }, [sideCarArtifact])

  const refetchConnectorList = useCallback(async (): Promise<void> => {
    try {
      const primaryConnectorList = getPrimaryConnectorList()
      const sidecarConnectorList = getSidecarConnectorList()
      const connectorIdentifiers = [...primaryConnectorList, ...sidecarConnectorList].map(item => item.identifier)
      if (connectorIdentifiers.length) {
        const response = await fetchConnectors({ filterType: 'Connector', connectorIdentifiers })
        if (response?.data) {
          setFetchedConnectorResponse(response?.data)
        }
      }
    } catch (e) {
      if (shouldShowError(e)) {
        showError(getRBACErrorMessage(e))
      }
    }
  }, [fetchConnectors, getPrimaryConnectorList, getSidecarConnectorList, showError])

  useDeepCompareEffect(() => {
    refetchConnectorList()
  }, [stage])

  const setTelemetryEvent = useCallback((): void => {
    const isCreateMode = context === ModalViewFor.PRIMARY ? !primaryArtifact : sidecarIndex === sideCarArtifact.length

    let telemetryEventName
    if (isCreateMode) {
      telemetryEventName =
        context === ModalViewFor.PRIMARY
          ? ArtifactActions.SavePrimaryArtifactOnPipelinePage
          : ArtifactActions.SaveSidecarArtifactOnPipelinePage
    } else {
      telemetryEventName =
        context === ModalViewFor.PRIMARY
          ? ArtifactActions.UpdatePrimaryArtifactOnPipelinePage
          : ArtifactActions.UpdateSidecarArtifactOnPipelinePage
    }
    trackEvent(telemetryEventName, {})
  }, [context, primaryArtifact, sideCarArtifact?.length, sidecarIndex, trackEvent])

  const setPrimaryArtifactData = useCallback(
    (artifactObj: PrimaryArtifact): void => {
      if (isPropagating) {
        artifacts['primary'] = { ...artifactObj }
      } else {
        artifacts['primary'] = { ...artifactObj }
      }
    },
    [artifacts, isPropagating]
  )

  const setSidecarArtifactData = useCallback(
    (artifactObj: SidecarArtifact): void => {
      if (sideCarArtifact?.length) {
        sideCarArtifact.splice(sidecarIndex, 1, { sidecar: artifactObj })
      } else {
        sideCarArtifact.push({ sidecar: artifactObj })
      }
    },
    [sideCarArtifact, sidecarIndex]
  )

  const updateStageData = useCallback((): StageElementWrapper<DeploymentStageElementConfig> | undefined => {
    return produce(stage, draft => {
      if (context === ModalViewFor.PRIMARY) {
        if (isPropagating && draft?.stage?.spec?.serviceConfig?.stageOverrides?.artifacts) {
          set(draft, 'stage.spec.serviceConfig.stageOverrides.artifacts', artifacts)
        } else {
          set(draft!, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts', artifacts)
        }
      }
      if (context === ModalViewFor.SIDECAR) {
        if (isPropagating && draft?.stage?.spec?.serviceConfig?.stageOverrides?.artifacts) {
          set(draft, 'stage.spec.serviceConfig.stageOverrides.artifacts.sidecars', sideCarArtifact)
        } else {
          set(draft!, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts.sidecars', sideCarArtifact)
        }
      }
    })
  }, [artifacts, context, isPropagating, sideCarArtifact, stage])

  const addArtifact = useCallback(
    (artifactObj: ArtifactConfig): void => {
      merge(artifactObj, { type: ENABLED_ARTIFACT_TYPES[selectedArtifact as ArtifactType] })

      if (context === ModalViewFor.PRIMARY) {
        setPrimaryArtifactData(artifactObj as PrimaryArtifact)
      } else {
        setSidecarArtifactData(artifactObj as SidecarArtifact)
      }
      const updatedStage = updateStageData()

      setTelemetryEvent()
      updateStage(updatedStage?.stage as StageElementConfig)
      hideConnectorModal()
      setSelectedArtifact(null)
      refetchConnectorList()
    },
    [
      context,
      refetchConnectorList,
      selectedArtifact,
      setPrimaryArtifactData,
      setSidecarArtifactData,
      setTelemetryEvent,
      updateStage,
      updateStageData
    ]
  )

  const getLastStepInitialData = useCallback((): any => {
    if (context === ModalViewFor.PRIMARY) {
      return primaryArtifact
    } else {
      return sideCarArtifact?.[sidecarIndex]?.sidecar
    }
  }, [context, primaryArtifact, sideCarArtifact, sidecarIndex])

  const getArtifactInitialValues = useCallback((): InitialArtifactDataType => {
    let spec, artifactType
    if (context === ModalViewFor.PRIMARY) {
      artifactType = primaryArtifact?.type
      spec = primaryArtifact?.spec
    } else {
      artifactType = sideCarArtifact?.[sidecarIndex]?.sidecar?.type
      spec = sideCarArtifact?.[sidecarIndex]?.sidecar?.spec
    }
    if (!spec) {
      return {
        submittedArtifact: selectedArtifact,
        connectorId: undefined
      }
    }
    return {
      submittedArtifact: artifactType,
      connectorId: spec?.connectorRef
    }
  }, [context, primaryArtifact?.spec, primaryArtifact?.type, selectedArtifact, sideCarArtifact, sidecarIndex])

  const initialValues = getLastStepInitialData()
  const initialConnectorRef = initialValues?.spec?.connectorRef

  const { selectedConnector } = useGetLastStepConnectorValue({
    connectorList: fetchedConnectorResponse?.content,
    initialConnectorRef,
    isEditMode: isArtifactEditMode
  })

  const addNewArtifact = (viewType: number): void => {
    setModalContext(viewType)
    setConnectorView(false)

    if (viewType === ModalViewFor.SIDECAR) {
      setEditIndex(sideCarArtifact?.length || 0)
    }
    setSelectedArtifact(getInitialSelectedArtifactValue(deploymentType, availableArtifactTypes))
    showConnectorModal()
    refetchConnectorList()
  }

  const editArtifact = (viewType: number, type?: ArtifactType, index?: number): void => {
    setModalContext(viewType)
    setConnectorView(false)
    setSelectedArtifact(type as ArtifactType)

    if (viewType === ModalViewFor.SIDECAR && index !== undefined) {
      setEditIndex(index)
    }
    showConnectorModal()
    refetchConnectorList()
  }

  const removePrimary = (): void => {
    delete artifacts.primary
    primaryArtifact.spec = {}
    setSelectedArtifact(null)
    const updatedStage = produce(stage, draft => {
      if (isPropagating && draft?.stage?.spec?.serviceConfig?.stageOverrides?.artifacts) {
        draft.stage.spec.serviceConfig.stageOverrides.artifacts = artifacts
      } else if (draft?.stage?.spec?.serviceConfig?.serviceDefinition?.spec.artifacts) {
        draft.stage.spec.serviceConfig.serviceDefinition.spec.artifacts = artifacts
      }
    })
    updateStage(updatedStage?.stage as StageElementConfig)
  }

  const removeSidecar = (index: number): void => {
    sideCarArtifact.splice(index, 1)
    const updatedStage = produce(stage, draft => {
      if (isPropagating && draft?.stage?.spec?.serviceConfig?.stageOverrides?.artifacts) {
        draft.stage.spec.serviceConfig.stageOverrides.artifacts.sidecars = sideCarArtifact
      } else if (draft?.stage?.spec?.serviceConfig?.serviceDefinition?.spec.artifacts?.sidecars) {
        draft.stage.spec.serviceConfig.serviceDefinition.spec.artifacts.sidecars = sideCarArtifact
      }
    })
    updateStage(updatedStage?.stage as StageElementConfig)
  }

  const getIconProps = useCallback((): IconProps | undefined => {
    if (selectedArtifact) {
      const iconProps: IconProps = {
        name: ArtifactIconByType[selectedArtifact]
      }
      if (
        selectedArtifact === ENABLED_ARTIFACT_TYPES.DockerRegistry ||
        selectedArtifact === ENABLED_ARTIFACT_TYPES.CustomArtifact ||
        selectedArtifact === ENABLED_ARTIFACT_TYPES.Acr
      ) {
        iconProps.color = Color.WHITE
      }
      return iconProps
    }
  }, [selectedArtifact])

  const artifactLastStepProps = React.useMemo((): ImagePathProps<
    ImagePathTypes &
      AmazonS3InitialValuesType &
      JenkinsArtifactType &
      GoogleArtifactRegistryInitialValuesType &
      CustomArtifactSource &
      GithubPackageRegistryInitialValuesType &
      Nexus2InitialValuesType &
      AzureArtifactsInitialValues &
      GoogleCloudStorageInitialValuesType &
      GoogleCloudSourceRepositoriesInitialValuesType
  > => {
    return {
      key: getString('connectors.stepFourName'),
      name: getString('connectors.stepFourName'),
      context,
      expressions,
      allowableTypes,
      initialValues: getLastStepInitialData(),
      handleSubmit: (data: any) => {
        addArtifact(data)
      },
      artifactIdentifiers: sideCarArtifact?.map((item: SidecarArtifactWrapper) => item.sidecar?.identifier as string),
      isReadonly: readonly,
      selectedArtifact,
      selectedDeploymentType: deploymentType
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    addArtifact,
    allowableTypes,
    context,
    expressions,
    getLastStepInitialData,
    readonly,
    selectedArtifact,
    sideCarArtifact,
    getString
  ])

  const artifactPrevStepData = React.useMemo((): {
    editArtifactModePrevStepData: ArtifactConnectorStepDataToLastStep
  } => {
    return {
      editArtifactModePrevStepData: {
        submittedArtifact: initialValues?.type,
        connectorId: selectedConnector
      }
    }
  }, [initialValues, selectedConnector])

  const artifactSelectionLastSteps = useArtifactSelectionLastSteps({
    selectedArtifact,
    artifactLastStepProps,
    artifactPrevStepData,
    isArtifactEditMode,
    selectedConnector: selectedConnector
  })

  const getLabels = useCallback((): ConnectorRefLabelType => {
    return {
      firstStepName: getString('connectors.specifyArtifactRepoType'),
      secondStepName: `${selectedArtifact && getString(ArtifactTitleIdByType[selectedArtifact])} ${getString(
        'repository'
      )}`
    }
  }, [getString, selectedArtifact])

  const connectorDetailStepProps = {
    name: getString('overview'),
    isEditMode,
    gitDetails: { repoIdentifier, branch, getDefaultFromOtherRepo: true }
  }
  const authenticationStepProps = {
    identifier: CONNECTOR_CREDENTIALS_STEP_IDENTIFIER,
    isEditMode,
    setIsEditMode,
    accountId,
    orgIdentifier,
    projectIdentifier,
    connectorInfo: undefined
  }
  const connectivityStepProps = {
    gitDetails: { repoIdentifier, branch, getDefaultFromOtherRepo: true },
    isEditMode,
    setIsEditMode,
    connectorInfo: undefined
  }
  const delegateStepProps = {
    name: getString('delegate.DelegateselectionLabel'),
    isEditMode,
    setIsEditMode,
    connectorInfo: undefined
  }
  const ConnectorTestConnectionProps = {
    name: getString('connectors.stepThreeName'),
    connectorInfo: undefined,
    isStep: true,
    isLastStep: false
  }

  const changeArtifactType = useCallback((selectedArtifactType: ArtifactType | null): void => {
    setSelectedArtifact(selectedArtifactType)
  }, [])

  const handleConnectorViewChange = useCallback((isConnectorView: boolean): void => {
    setConnectorView(isConnectorView)
    setIsEditMode(false)
  }, [])

  // This function decides which step to show first when artifact wizard is opened
  const getArtifactWizardInitialStepNumber = (): number => {
    // In edit mode, show 2nd or 3rd step depending on how many steps are there in total
    if (isArtifactEditMode && showConnectorStep(selectedArtifact as ArtifactType) && CDS_SERVICE_CONFIG_LAST_STEP) {
      return 3
    }
    if (isArtifactEditMode && !showConnectorStep(selectedArtifact as ArtifactType) && CDS_SERVICE_CONFIG_LAST_STEP) {
      return 2
    }
    // For create mode, if we need to show 2nd step directly
    if (showArtifactStoreStepDirectly(selectedArtifact)) {
      return 2
    }
    return 1
  }

  const renderExistingArtifact = (): JSX.Element => {
    return (
      <div>
        <ArtifactWizard
          artifactInitialValue={getArtifactInitialValues()}
          iconsProps={getIconProps()}
          types={availableArtifactTypes ?? allowedArtifactTypes[deploymentType]}
          expressions={expressions}
          allowableTypes={allowableTypes}
          lastSteps={artifactSelectionLastSteps}
          labels={getLabels()}
          isReadonly={readonly}
          selectedArtifact={selectedArtifact}
          changeArtifactType={changeArtifactType}
          newConnectorView={connectorView}
          newConnectorProps={{
            auth: authenticationStepProps,
            connector: connectorDetailStepProps,
            connectivity: connectivityStepProps,
            delegate: delegateStepProps,
            verify: ConnectorTestConnectionProps
          }}
          handleViewChange={handleConnectorViewChange}
          showConnectorStep={showConnectorStep(selectedArtifact as ArtifactType)}
          artifactWizardInitialStep={getArtifactWizardInitialStepNumber()}
          showArtifactSelectionStep
        />
      </div>
    )
  }

  const [showConnectorModal, hideConnectorModal] = useModalHook(
    () => (
      <Dialog
        onClose={() => {
          hideConnectorModal()
          setConnectorView(false)
          setIsEditMode(false)
          setSelectedArtifact(null)
        }}
        {...DIALOG_PROPS}
        className={cx(css.modal, Classes.DIALOG)}
      >
        {renderExistingArtifact()}
      </Dialog>
    ),
    [
      context,
      selectedArtifact,
      connectorView,
      primaryArtifact,
      sidecarIndex,
      expressions,
      allowableTypes,
      isEditMode,
      artifactLastStepProps
    ]
  )

  return (
    <ArtifactListView
      deploymentType={deploymentType}
      stage={stage}
      primaryArtifact={primaryArtifact}
      sideCarArtifact={sideCarArtifact}
      addNewArtifact={addNewArtifact}
      editArtifact={editArtifact}
      removePrimary={removePrimary}
      removeSidecar={removeSidecar}
      fetchedConnectorResponse={fetchedConnectorResponse}
      accountId={accountId}
      refetchConnectors={refetchConnectorList}
      isReadonly={readonly}
      isSidecarAllowed={isSidecarAllowed(deploymentType, readonly)}
    />
  )
}
