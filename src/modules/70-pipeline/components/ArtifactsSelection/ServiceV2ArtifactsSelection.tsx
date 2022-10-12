/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { RUNTIME_INPUT_VALUE, shouldShowError, useToaster } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import { useParams } from 'react-router-dom'

import produce from 'immer'
import get from 'lodash-es/get'
import set from 'lodash-es/set'

import { Dialog, IDialogProps, Classes } from '@blueprintjs/core'
import type { IconProps } from '@harness/icons'
import { defaultTo, isEmpty, merge, unset } from 'lodash-es'
import {
  useGetConnectorListV2,
  PageConnectorResponse,
  SidecarArtifactWrapper,
  PrimaryArtifact,
  ArtifactConfig,
  SidecarArtifact,
  ServiceDefinition,
  ArtifactListConfig,
  ArtifactSource
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
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useCache } from '@common/hooks/useCache'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
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

export default function ServiceV2ArtifactsSelection({
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
  const [artifactContext, setArtifactContext] = useState(ModalViewFor.PRIMARY)
  const [artifactIndex, setEditIndex] = useState(0)
  const [fetchedConnectorResponse, setFetchedConnectorResponse] = useState<PageConnectorResponse | undefined>()

  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const { expressions } = useVariablesExpression()

  const { CUSTOM_ARTIFACT_NG, NG_GOOGLE_ARTIFACT_REGISTRY } = useFeatureFlags()
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
      deploymentType === ServiceDeploymentType.Kubernetes &&
      NG_GOOGLE_ARTIFACT_REGISTRY &&
      !allowedArtifactTypes[deploymentType]?.includes(ENABLED_ARTIFACT_TYPES.GoogleArtifactRegistry)
    ) {
      allowedArtifactTypes[deploymentType].push(ENABLED_ARTIFACT_TYPES.GoogleArtifactRegistry)
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

  const artifacts = useMemo((): ArtifactListConfig => {
    if (isReadonlyServiceMode) {
      const serviceData = getCache(getServiceCacheId) as ServiceDefinition
      return serviceData?.spec?.artifacts as ArtifactListConfig
    }
    return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts', {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReadonlyServiceMode, stage])

  const artifactsList = useMemo(() => {
    if (!isEmpty(artifacts)) {
      if (artifactContext === ModalViewFor.PRIMARY) {
        return artifacts.primary?.sources
      }
      return artifacts.sidecars
    }
  }, [artifactContext, artifacts, artifacts?.primary, artifacts?.sidecars, stage])

  const getArtifactsPath = useCallback((type: ModalViewFor) => {
    if (type === ModalViewFor.PRIMARY) {
      return 'primary.sources'
    }
    return 'sidecars'
  }, [])

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
    [artifactContext, selectedArtifact, connectorView, artifactIndex, expressions, allowableTypes, isEditMode]
  )

  const getPrimaryConnectorList = useCallback((): Array<{ scope: Scope; identifier: string }> => {
    return defaultTo(
      artifacts?.primary?.sources?.map((data: ArtifactSource) => ({
        scope: getScopeFromValue(data?.spec?.connectorRef),
        identifier: getIdentifierFromValue(data?.spec?.connectorRef)
      })),
      []
    )
  }, [artifacts?.primary?.sources])

  const getSidecarConnectorList = useCallback((): Array<{ scope: Scope; identifier: string }> => {
    return defaultTo(
      artifacts?.sidecars?.map((data: SidecarArtifactWrapper) => ({
        scope: getScopeFromValue(data?.sidecar?.spec?.connectorRef),
        identifier: getIdentifierFromValue(data?.sidecar?.spec?.connectorRef)
      })),
      []
    )
  }, [artifacts?.sidecars])

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
  }, [fetchConnectors, getPrimaryConnectorList, getRBACErrorMessage, getSidecarConnectorList, showError])

  useDeepCompareEffect(() => {
    refetchConnectorList()
  }, [stage])

  const setTelemetryEvent = useCallback((): void => {
    const isCreateMode = artifactIndex === artifactsList?.length

    let telemetryEventName
    if (isCreateMode) {
      telemetryEventName =
        artifactContext === ModalViewFor.PRIMARY
          ? ArtifactActions.SavePrimaryArtifactOnPipelinePage
          : ArtifactActions.SaveSidecarArtifactOnPipelinePage
    } else {
      telemetryEventName =
        artifactContext === ModalViewFor.PRIMARY
          ? ArtifactActions.UpdatePrimaryArtifactOnPipelinePage
          : ArtifactActions.UpdateSidecarArtifactOnPipelinePage
    }
    trackEvent(telemetryEventName, {})
  }, [artifactIndex, artifactsList?.length, trackEvent, artifactContext])

  const setPrimaryArtifactData = useCallback(
    (artifactObj: PrimaryArtifact): void => {
      const artifactObject = get(artifacts, getArtifactsPath(artifactContext))
      if (artifactObject?.length) {
        artifactObject.splice(artifactIndex, 1, artifactObj)
      } else {
        set(artifacts, 'primary.primaryArtifactRef', RUNTIME_INPUT_VALUE)
        set(artifacts, 'primary.sources', [artifactObj])
      }
    },
    [artifactContext, artifactIndex, artifacts, getArtifactsPath]
  )

  const setSidecarArtifactData = useCallback(
    (artifactObj: PrimaryArtifact): void => {
      const artifactObject = get(artifacts, getArtifactsPath(artifactContext))
      if (artifactObject?.length) {
        artifactObject.splice(artifactIndex, 1, { sidecar: artifactObj })
      } else {
        set(artifacts, 'sidecars', [{ sidecar: artifactObj }])
      }
    },
    [artifactContext, artifactIndex, artifacts, getArtifactsPath]
  )

  const addArtifact = useCallback(
    (artifactObj: ArtifactConfig): void => {
      merge(artifactObj, { type: ENABLED_ARTIFACT_TYPES[selectedArtifact as ArtifactType] })

      if (artifactContext === ModalViewFor.PRIMARY) {
        setPrimaryArtifactData(artifactObj as ArtifactSource)
      } else {
        setSidecarArtifactData(artifactObj as SidecarArtifact)
      }
      if (stage) {
        const newStage = produce(stage, draft => {
          set(draft, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts', artifacts)
        }).stage
        if (newStage) {
          updateStage(newStage)
        }
      }
      setTelemetryEvent()
      hideConnectorModal()
      setSelectedArtifact(null)
      refetchConnectorList()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [artifactContext, artifacts, refetchConnectorList, selectedArtifact, stage]
  )

  const removeArtifactObject = (type: ModalViewFor, index: number): void => {
    const artifactObject = get(artifacts, getArtifactsPath(type))
    artifactObject.splice(index, 1)

    setSelectedArtifact(null)
    if (stage) {
      const newStage = produce(stage, draft => {
        set(
          draft,
          `stage.spec.serviceConfig.serviceDefinition.spec.artifacts.${getArtifactsPath(type)}`,
          artifactObject
        )
        if (type === ModalViewFor.PRIMARY && !artifactObject.length) {
          unset(draft, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts.primary.primaryArtifactRef')
        }
      }).stage
      if (newStage) {
        updateStage(newStage)
      }
    }
  }

  const getLastStepInitialData = useCallback((): any => {
    if (artifactContext === ModalViewFor.PRIMARY) {
      return (artifactsList as ArtifactSource[])?.[artifactIndex]
    } else {
      return (artifactsList as SidecarArtifactWrapper[])?.[artifactIndex]?.sidecar
    }
  }, [artifactContext, artifactsList, artifactIndex])

  const getArtifactInitialValues = useMemo((): InitialArtifactDataType => {
    let spec, artifactType
    if (artifactContext === ModalViewFor.PRIMARY) {
      artifactType = (artifactsList as ArtifactSource[])?.[artifactIndex]?.type
      spec = (artifactsList as ArtifactSource[])?.[artifactIndex]?.spec
    } else {
      artifactType = (artifactsList as SidecarArtifactWrapper[])?.[artifactIndex]?.sidecar?.type
      spec = (artifactsList as SidecarArtifactWrapper[])?.[artifactIndex]?.sidecar?.spec
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
  }, [artifactContext, artifactsList, artifactIndex, selectedArtifact])

  const addNewArtifact = (viewType: ModalViewFor): void => {
    setArtifactContext(viewType)
    setConnectorView(false)
    const artifactObject = get(artifacts, getArtifactsPath(viewType))
    setEditIndex(defaultTo(artifactObject?.length, 0))
    showConnectorModal()
    refetchConnectorList()
  }

  const editArtifact = (viewType: ModalViewFor, type?: ArtifactType, index?: number): void => {
    setArtifactContext(viewType)
    setConnectorView(false)
    setSelectedArtifact(type as ArtifactType)
    setEditIndex(index as number)
    showConnectorModal()
    refetchConnectorList()
  }

  const getIconProps = useMemo((): IconProps | undefined => {
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

  const artifactLastStepProps = useMemo((): ImagePathProps<
    ImagePathTypes &
      AmazonS3InitialValuesType &
      JenkinsArtifactType &
      GoogleArtifactRegistryInitialValuesType &
      CustomArtifactSource &
      GithubPackageRegistryInitialValuesType &
      Nexus2InitialValuesType
  > => {
    return {
      key: getString('connectors.stepFourName'),
      name: getString('connectors.stepFourName'),
      context: artifactContext,
      expressions,
      allowableTypes,
      initialValues: getLastStepInitialData(),
      handleSubmit: (data: any) => {
        addArtifact(data)
      },
      artifactIdentifiers: defaultTo(
        artifactsList?.map((item: ArtifactSource | SidecarArtifactWrapper) =>
          artifactContext === ModalViewFor.PRIMARY
            ? (item as ArtifactSource).identifier
            : ((item as SidecarArtifactWrapper).sidecar?.identifier as string)
        ),
        ['']
      ),
      isReadonly: readonly,
      selectedArtifact,
      selectedDeploymentType: deploymentType,
      isMultiArtifactSource: true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    artifactContext,
    expressions,
    allowableTypes,
    getLastStepInitialData,
    artifactsList,
    selectedArtifact,
    deploymentType
  ])

  const getLabels = useMemo((): ConnectorRefLabelType => {
    return {
      firstStepName: getString('connectors.specifyArtifactRepoType'),
      secondStepName: `${selectedArtifact && getString(ArtifactTitleIdByType[selectedArtifact])} ${getString(
        'repository'
      )}`
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArtifact])

  /******************************************************************Connector Steps************************************************************** */
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
  const delegateStepProps = {
    name: getString('delegate.DelegateselectionLabel'),
    isEditMode,
    setIsEditMode,
    connectorInfo: undefined
  }

  const connectivityStepProps = {
    gitDetails: { repoIdentifier, branch, getDefaultFromOtherRepo: true },
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
  /******************************************************************Connector Steps************************************************************** */

  const getLastSteps = useCallback((): JSX.Element => {
    switch (selectedArtifact) {
      case ENABLED_ARTIFACT_TYPES.Gcr:
        return <GCRImagePath {...artifactLastStepProps} />
      case ENABLED_ARTIFACT_TYPES.Ecr:
        return <ECRArtifact {...artifactLastStepProps} />
      case ENABLED_ARTIFACT_TYPES.Nexus3Registry:
        return <Nexus3Artifact {...artifactLastStepProps} />
      case ENABLED_ARTIFACT_TYPES.Nexus2Registry:
        return <Nexus2Artifact {...artifactLastStepProps} />
      case ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry:
        return <Artifactory {...artifactLastStepProps} />
      case ENABLED_ARTIFACT_TYPES.AmazonS3:
        return <AmazonS3 {...artifactLastStepProps} />
      case ENABLED_ARTIFACT_TYPES.CustomArtifact:
        return <CustomArtifact {...artifactLastStepProps} />
      case ENABLED_ARTIFACT_TYPES.Acr:
        return <ACRArtifact {...artifactLastStepProps} />
      case ENABLED_ARTIFACT_TYPES.Jenkins:
        return <JenkinsArtifact {...artifactLastStepProps} />
      case ENABLED_ARTIFACT_TYPES.GoogleArtifactRegistry:
        return <GoogleArtifactRegistry {...artifactLastStepProps} />
      case ENABLED_ARTIFACT_TYPES.GithubPackageRegistry:
        return <GithubPackageRegistry {...artifactLastStepProps} />
      case ENABLED_ARTIFACT_TYPES.DockerRegistry:
      default:
        return <DockerRegistryArtifact {...artifactLastStepProps} />
    }
  }, [artifactLastStepProps, selectedArtifact])

  const changeArtifactType = useCallback((selected: ArtifactType | null): void => {
    setSelectedArtifact(selected)
  }, [])

  const handleConnectorViewChange = useCallback((isConnectorView: boolean): void => {
    setConnectorView(isConnectorView)
    setIsEditMode(false)
  }, [])

  const getOptionalConfigurationSteps = useCallback((): JSX.Element | null => {
    switch (selectedArtifact) {
      case ENABLED_ARTIFACT_TYPES.CustomArtifact:
        return (
          <CustomArtifactOptionalConfiguration
            {...artifactLastStepProps}
            name={'Optional Configuration'}
            key={'Optional_Configuration'}
          />
        )
      default:
        return null
    }
  }, [artifactLastStepProps, selectedArtifact])

  const renderExistingArtifact = (): JSX.Element => {
    return (
      <ArtifactWizard
        artifactInitialValue={getArtifactInitialValues}
        iconsProps={getIconProps}
        types={allowedArtifactTypes[deploymentType]}
        expressions={expressions}
        allowableTypes={allowableTypes}
        lastSteps={getLastSteps()}
        labels={getLabels}
        isReadonly={readonly}
        selectedArtifact={selectedArtifact}
        changeArtifactType={changeArtifactType}
        getOptionalConfigurationSteps={getOptionalConfigurationSteps()}
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
    )
  }

  return (
    <ArtifactListView
      stage={stage}
      primaryArtifact={artifacts?.primary?.sources as ArtifactSource[]}
      sideCarArtifact={artifacts?.sidecars}
      addNewArtifact={addNewArtifact}
      editArtifact={editArtifact}
      removeArtifactSource={index => removeArtifactObject(ModalViewFor.PRIMARY, index)}
      removeSidecar={index => removeArtifactObject(ModalViewFor.SIDECAR, index)}
      fetchedConnectorResponse={fetchedConnectorResponse}
      accountId={accountId}
      refetchConnectors={refetchConnectorList}
      isReadonly={readonly}
      isSidecarAllowed={isSidecarAllowed(deploymentType, readonly)}
      isMultiArtifactSource
    />
  )
}
