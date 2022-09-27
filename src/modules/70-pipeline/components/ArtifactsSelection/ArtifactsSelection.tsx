/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { shouldShowError, useToaster } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import { useParams } from 'react-router-dom'

import produce from 'immer'
import get from 'lodash-es/get'
import set from 'lodash-es/set'

import { Dialog, IDialogProps, Classes } from '@blueprintjs/core'
import type { IconProps } from '@harness/icons'
import { merge } from 'lodash-es'
import {
  useGetConnectorListV2,
  PageConnectorResponse,
  SidecarArtifactWrapper,
  PrimaryArtifact,
  StageElementConfig,
  ArtifactConfig,
  SidecarArtifact,
  ServiceDefinition
} from 'services/cd-ng'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@connectors/constants'
import type { GitQueryParams, PipelineType } from '@common/interfaces/RouteInterfaces'
import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { useStrings } from 'framework/strings'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { useDeepCompareEffect, useQueryParams } from '@common/hooks'
import type { Scope } from '@common/interfaces/SecretsInterface'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { ArtifactActions } from '@common/constants/TrackingConstants'
import type { DeploymentStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useCache } from '@common/hooks/useCache'
import ArtifactWizard from './ArtifactWizard/ArtifactWizard'
import { DockerRegistryArtifact } from './ArtifactRepository/ArtifactLastSteps/DockerRegistryArtifact/DockerRegistryArtifact'
import { ECRArtifact } from './ArtifactRepository/ArtifactLastSteps/ECRArtifact/ECRArtifact'
import { GCRImagePath } from './ArtifactRepository/ArtifactLastSteps/GCRImagePath/GCRImagePath'
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
  Nexus2InitialValuesType
} from './ArtifactInterface'
import {
  ENABLED_ARTIFACT_TYPES,
  ArtifactIconByType,
  ArtifactTitleIdByType,
  allowedArtifactTypes,
  ModalViewFor,
  isAllowedCustomArtifactDeploymentTypes,
  isSidecarAllowed
} from './ArtifactHelper'
import { useVariablesExpression } from '../PipelineStudio/PiplineHooks/useVariablesExpression'
import { Nexus3Artifact } from './ArtifactRepository/ArtifactLastSteps/NexusArtifact/NexusArtifact'
import Artifactory from './ArtifactRepository/ArtifactLastSteps/Artifactory/Artifactory'
import {
  CustomArtifact,
  CustomArtifactOptionalConfiguration
} from './ArtifactRepository/ArtifactLastSteps/CustomArtifact/CustomArtifact'
import { showConnectorStep } from './ArtifactUtils'
import { ACRArtifact } from './ArtifactRepository/ArtifactLastSteps/ACRArtifact/ACRArtifact'
import { AmazonS3 } from './ArtifactRepository/ArtifactLastSteps/AmazonS3Artifact/AmazonS3'
import { JenkinsArtifact } from './ArtifactRepository/ArtifactLastSteps/JenkinsArtifact/JenkinsArtifact'
import { GoogleArtifactRegistry } from './ArtifactRepository/ArtifactLastSteps/GoogleArtifactRegistry/GoogleArtifactRegistry'
import { GithubPackageRegistry } from './ArtifactRepository/ArtifactLastSteps/GithubPackageRegistry/GithubPackageRegistry'
import { Nexus2Artifact } from './ArtifactRepository/ArtifactLastSteps/Nexus2Artifact/Nexus2Artifact'
import css from './ArtifactsSelection.module.scss'

export default function ArtifactsSelection({
  isPropagating = false,
  deploymentType,
  isReadonlyServiceMode,
  readonly
}: ArtifactsSelectionProps): React.ReactElement | null {
  const {
    state: {
      pipeline,
      selectionState: { selectedStageId }
    },
    getStageFromPipeline,
    updateStage,
    allowableTypes
  } = usePipelineContext()

  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactType | null>(null)
  const [connectorView, setConnectorView] = useState(false)
  const [context, setModalContext] = useState(ModalViewFor.PRIMARY)
  const [sidecarIndex, setEditIndex] = useState(0)
  const [fetchedConnectorResponse, setFetchedConnectorResponse] = useState<PageConnectorResponse | undefined>()

  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const { expressions } = useVariablesExpression()

  const { CUSTOM_ARTIFACT_NG, NG_GOOGLE_ARTIFACT_REGISTRY, GITHUB_PACKAGES, AZURE_WEBAPP_NG_S3_ARTIFACTS } =
    useFeatureFlags()
  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')
  const getServiceCacheId = `${pipeline.identifier}-${selectedStageId}-service`
  const { getCache } = useCache([getServiceCacheId])

  useEffect(() => {
    if (
      CUSTOM_ARTIFACT_NG &&
      !allowedArtifactTypes[deploymentType]?.includes(ENABLED_ARTIFACT_TYPES.CustomArtifact) &&
      isAllowedCustomArtifactDeploymentTypes(deploymentType)
    ) {
      allowedArtifactTypes[deploymentType].push(ENABLED_ARTIFACT_TYPES.CustomArtifact)
    }
    if (
      deploymentType === 'Kubernetes' &&
      GITHUB_PACKAGES &&
      !allowedArtifactTypes[deploymentType]?.includes(ENABLED_ARTIFACT_TYPES.GithubPackageRegistry)
    ) {
      allowedArtifactTypes[deploymentType].push(ENABLED_ARTIFACT_TYPES.GithubPackageRegistry)
    }
    if (
      ['Kubernetes', 'CustomDeployment'].includes(deploymentType) &&
      NG_GOOGLE_ARTIFACT_REGISTRY &&
      !allowedArtifactTypes[deploymentType]?.includes(ENABLED_ARTIFACT_TYPES.GoogleArtifactRegistry)
    ) {
      allowedArtifactTypes[deploymentType].push(ENABLED_ARTIFACT_TYPES.GoogleArtifactRegistry)
    }

    if (
      deploymentType === 'AzureWebApp' &&
      AZURE_WEBAPP_NG_S3_ARTIFACTS &&
      !allowedArtifactTypes[deploymentType]?.includes(ENABLED_ARTIFACT_TYPES.AmazonS3)
    ) {
      allowedArtifactTypes[deploymentType].push(ENABLED_ARTIFACT_TYPES.AmazonS3)
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
    if (isReadonlyServiceMode) {
      const serviceData = getCache(getServiceCacheId) as ServiceDefinition
      return serviceData?.spec?.artifacts
    }

    if (isPropagating) {
      return get(stage, 'stage.spec.serviceConfig.stageOverrides.artifacts', [])
    }
    return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts', {})
  }, [isPropagating, isReadonlyServiceMode, stage])

  const getPrimaryArtifactPath = useCallback((): PrimaryArtifact => {
    if (isReadonlyServiceMode) {
      const serviceData = getCache(getServiceCacheId)
      return get(serviceData, 'spec.artifacts.primary', null)
    }
    if (isPropagating) {
      return get(stage, 'stage.spec.serviceConfig.stageOverrides.artifacts.primary', null)
    }

    return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts.primary', null)
  }, [isPropagating, isReadonlyServiceMode, stage])

  const getSidecarPath = useCallback((): SidecarArtifactWrapper[] => {
    if (isReadonlyServiceMode) {
      const serviceData = getCache(getServiceCacheId)
      return get(serviceData, 'spec.artifacts.sidecars', null) || []
    }
    if (isPropagating) {
      return get(stage, 'stage.spec.serviceConfig.stageOverrides.artifacts.sidecars', [])
    }
    return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts.sidecars', [])
  }, [isPropagating, isReadonlyServiceMode, stage])

  const artifacts = getArtifactsPath()

  const primaryArtifact = getPrimaryArtifactPath()
  const sideCarArtifact = getSidecarPath()

  const DIALOG_PROPS: IDialogProps = {
    isOpen: true,
    usePortal: true,
    autoFocus: true,
    canEscapeKeyClose: false,
    canOutsideClickClose: false,
    enforceFocus: false,
    title: '',
    style: { width: 1100, height: 550, borderLeft: 'none', paddingBottom: 0, position: 'relative' }
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
    [context, selectedArtifact, connectorView, primaryArtifact, sidecarIndex, expressions, allowableTypes, isEditMode]
  )

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
      hideConnectorModal,
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

  const addNewArtifact = (viewType: number): void => {
    setModalContext(viewType)
    setConnectorView(false)

    if (viewType === ModalViewFor.SIDECAR) {
      setEditIndex(sideCarArtifact?.length || 0)
    }
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

  const getLastStepName = () => {
    switch (selectedArtifact) {
      case ENABLED_ARTIFACT_TYPES.CustomArtifact:
        return {
          key: getString('pipeline.artifactsSelection.artifactDetails'),
          name: getString('pipeline.artifactsSelection.artifactDetails')
        }
      default:
        return {
          key: getString('connectors.stepFourName'),
          name: getString('connectors.stepFourName')
        }
    }
  }

  const artifactLastStepProps = useCallback((): ImagePathProps<
    ImagePathTypes &
      AmazonS3InitialValuesType &
      JenkinsArtifactType &
      GoogleArtifactRegistryInitialValuesType &
      CustomArtifactSource &
      GithubPackageRegistryInitialValuesType &
      Nexus2InitialValuesType
  > => {
    return {
      ...getLastStepName(),
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

  const getLabels = useCallback((): ConnectorRefLabelType => {
    return {
      firstStepName: getString('connectors.specifyArtifactRepoType'),
      secondStepName: `${selectedArtifact && getString(ArtifactTitleIdByType[selectedArtifact])} ${getString(
        'repository'
      )}`
    }
  }, [selectedArtifact])

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

  const getLastSteps = useCallback((): JSX.Element => {
    switch (selectedArtifact) {
      case ENABLED_ARTIFACT_TYPES.Gcr:
        return <GCRImagePath {...artifactLastStepProps()} />
      case ENABLED_ARTIFACT_TYPES.Ecr:
        return <ECRArtifact {...artifactLastStepProps()} />
      case ENABLED_ARTIFACT_TYPES.Nexus3Registry:
        return <Nexus3Artifact {...artifactLastStepProps()} />
      case ENABLED_ARTIFACT_TYPES.Nexus2Registry:
        return <Nexus2Artifact {...artifactLastStepProps()} />
      case ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry:
        return <Artifactory {...artifactLastStepProps()} />
      case ENABLED_ARTIFACT_TYPES.AmazonS3:
        return <AmazonS3 {...artifactLastStepProps()} />
      case ENABLED_ARTIFACT_TYPES.CustomArtifact:
        return <CustomArtifact {...artifactLastStepProps()} />
      case ENABLED_ARTIFACT_TYPES.Acr:
        return <ACRArtifact {...artifactLastStepProps()} />
      case ENABLED_ARTIFACT_TYPES.Jenkins:
        return <JenkinsArtifact {...artifactLastStepProps()} />
      case ENABLED_ARTIFACT_TYPES.GoogleArtifactRegistry:
        return <GoogleArtifactRegistry {...artifactLastStepProps()} />
      case ENABLED_ARTIFACT_TYPES.GithubPackageRegistry:
        return <GithubPackageRegistry {...artifactLastStepProps()} />
      case ENABLED_ARTIFACT_TYPES.DockerRegistry:
      default:
        return <DockerRegistryArtifact {...artifactLastStepProps()} />
    }
  }, [artifactLastStepProps, selectedArtifact])

  const getOptionalConfigurationSteps = useCallback((): JSX.Element | null => {
    switch (selectedArtifact) {
      case ENABLED_ARTIFACT_TYPES.CustomArtifact:
        return (
          <CustomArtifactOptionalConfiguration
            {...artifactLastStepProps()}
            name={'Optional Configuration'}
            key={'Optional_Configuration'}
          />
        )
      default:
        return null
    }
  }, [artifactLastStepProps, selectedArtifact])

  const changeArtifactType = useCallback((selected: ArtifactType | null): void => {
    setSelectedArtifact(selected)
  }, [])

  const handleConnectorViewChange = useCallback((isConnectorView: boolean): void => {
    setConnectorView(isConnectorView)
    setIsEditMode(false)
  }, [])

  const renderExistingArtifact = (): JSX.Element => {
    return (
      <div>
        <ArtifactWizard
          artifactInitialValue={getArtifactInitialValues()}
          iconsProps={getIconProps()}
          types={allowedArtifactTypes[deploymentType]}
          expressions={expressions}
          allowableTypes={allowableTypes}
          lastSteps={getLastSteps()}
          getOptionalConfigurationSteps={getOptionalConfigurationSteps()}
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
        />
      </div>
    )
  }

  return (
    <ArtifactListView
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
