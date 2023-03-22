/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useState } from 'react'
import type { FormikProps } from 'formik'
import { MultiTypeInputType, shouldShowError, useToaster } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { Dialog, IDialogProps, Classes } from '@blueprintjs/core'
import type { IconProps } from '@harness/icons'
import { merge, noop } from 'lodash-es'
import { PageConnectorResponse, PrimaryArtifact, useGetConnectorListV2 } from 'services/cd-ng'
import { CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@connectors/constants'
import type { GitQueryParams, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'

import { useQueryParams } from '@common/hooks'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { ArtifactActions } from '@common/constants/TrackingConstants'
import type { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { getIdentifierFromValue } from '@common/components/EntityReference/EntityReference'
import {
  ArtifactIconByType,
  ArtifactTitleIdByType,
  ENABLED_ARTIFACT_TYPES
} from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { getTriggerArtifactInitialSpec } from '@triggers/components/Triggers/ArtifactTrigger/TriggersWizardPageUtils'
import type { ArtifactTriggerConfig, NGTriggerSourceV2 } from 'services/pipeline-ng'
import ArtifactWizard from '@pipeline/components/ArtifactsSelection/ArtifactWizard/ArtifactWizard'
import { showConnectorStep } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'

import { GCRImagePath } from './ArtifactRepository/ArtifactLastSteps/GCRImagePath/GCRImagePath'
import { ECRArtifact } from './ArtifactRepository/ArtifactLastSteps/ECRArtifact/ECRArtifact'
import NexusArtifact from './ArtifactRepository/ArtifactLastSteps/NexusArtifact/NexusArtifact'
import Artifactory from './ArtifactRepository/ArtifactLastSteps/Artifactory/Artifactory'
import { AmazonS3 } from './ArtifactRepository/ArtifactLastSteps/AmazonS3Artifact/AmazonS3'
import { ACRArtifact } from './ArtifactRepository/ArtifactLastSteps/ACRArtifact/ACRArtifact'
import { DockerRegistryArtifact } from './ArtifactRepository/ArtifactLastSteps/DockerRegistryArtifact/DockerRegistryArtifact'
import ArtifactListView from './ArtifactListView/ArtifactListView'
import type {
  ArtifactTriggerSpec,
  ArtifactType,
  ConnectorRefLabelType,
  ImagePathProps,
  InitialArtifactDataType
} from './ArtifactInterface'
import { CustomArtifact } from './ArtifactRepository/ArtifactLastSteps/CustomArtifact/CustomArtifact'
import { GithubPackageRegistry } from './ArtifactRepository/ArtifactLastSteps/GithubPackageRegistry/GithubPackageRegistry'
import { GoogleArtifactRegistry } from './ArtifactRepository/ArtifactLastSteps/GoogleArtifactRegistry/GoogleArtifactRegistry'
import { JenkinsArtifact } from './ArtifactRepository/ArtifactLastSteps/JenkinsArtifact/JenkinsArtifact'
import { AzureArtifacts } from './ArtifactRepository/ArtifactLastSteps/AzureArtifacts/AzureArtifacts'
import { AmazonMachineImage } from './ArtifactRepository/ArtifactLastSteps/AmazonMachineImage/AmazonMachineImage'
import { GoogleCloudStorage } from './ArtifactRepository/ArtifactLastSteps/GoogleCloudStorage/GoogleCloudStorage'
import css from '@pipeline/components/ArtifactsSelection/ArtifactsSelection.module.scss'

interface ArtifactsSelectionProps {
  formikProps: FormikProps<any>
}

export default function ArtifactsSelection({ formikProps }: ArtifactsSelectionProps): React.ReactElement | null {
  const { spec: triggerSpec } = (formikProps.values?.source ?? {}) as Omit<Required<NGTriggerSourceV2>, 'pollInterval'>
  const { type: artifactType, spec } = triggerSpec
  const artifactSpec = spec as ArtifactTriggerSpec
  const selectedArtifactType = artifactType as Required<ArtifactTriggerConfig>['type']
  const [isEditMode, setIsEditMode] = useState(false)
  const [connectorView, setConnectorView] = useState(false)
  const [fetchedConnectorResponse, setFetchedConnectorResponse] = useState<PageConnectorResponse | undefined>()
  const [primaryArtifact, setPrimaryArtifact] = useState<PrimaryArtifact>(triggerSpec as PrimaryArtifact)

  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const { expressions } = useVariablesExpression()

  const { accountId, orgIdentifier, projectIdentifier } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      accountId: string
    }>
  >()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

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

  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()

  const refetchConnectorList = async (): Promise<void> => {
    try {
      const response = await fetchConnectors({
        filterType: 'Connector',
        connectorIdentifiers: [getIdentifierFromValue(artifactSpec.connectorRef as string)]
      })
      /* istanbul ignore else */
      if (response.data) {
        const { data: connectorResponse } = response
        setFetchedConnectorResponse(connectorResponse)
      }
    } catch (e) {
      /* istanbul ignore else */
      if (shouldShowError(e)) {
        showError(getRBACErrorMessage(e as RBACError))
      }
    }
  }

  useEffect(() => {
    refetchConnectorList()
  }, [artifactSpec.connectorRef])

  const [showConnectorModal, hideConnectorModal] = useModalHook(
    () => (
      <Dialog
        onClose={() => {
          hideConnectorModal()
          setConnectorView(false)
          setIsEditMode(false)
        }}
        {...DIALOG_PROPS}
        className={cx(css.modal, Classes.DIALOG)}
      >
        <ArtifactWizard
          types={[selectedArtifactType]}
          labels={getLabels()}
          expressions={[]}
          allowableTypes={[MultiTypeInputType.FIXED]}
          selectedArtifact={selectedArtifactType}
          changeArtifactType={noop}
          handleViewChange={handleConnectorViewChange}
          artifactInitialValue={getArtifactInitialValues()}
          newConnectorView={connectorView}
          newConnectorProps={{
            auth: authenticationStepProps,
            connector: connectorDetailStepProps,
            connectivity: connectivityStepProps,
            delegate: delegateStepProps,
            verify: ConnectorTestConnectionProps
          }}
          lastSteps={getLastSteps()}
          iconsProps={getIconProps()}
          showConnectorStep={showConnectorStep(selectedArtifactType as ArtifactType)}
          isReadonly={false}
          artifactWizardInitialStep={1}
          showArtifactSelectionStep={false}
        />
      </Dialog>
    ),
    [selectedArtifactType, connectorView, formikProps]
  )

  const setTelemetryEvent = useCallback((): void => {
    trackEvent(ArtifactActions.SavePrimaryArtifactOnPipelinePage, {})
  }, [trackEvent])

  const addArtifact = async (artifactObj: ArtifactTriggerSpec): Promise<void> => {
    const { type, spec: _triggerSpec } = formikProps.values.source ?? {}
    const { type: _artifactType } = _triggerSpec ?? {}

    const values = {
      ...formikProps.values,
      source: {
        type,
        spec: {
          type: _artifactType,
          spec: artifactObj
        }
      }
    }

    await formikProps.setValues(values)

    setPrimaryArtifact(values?.source?.spec)

    setTelemetryEvent()
    hideConnectorModal()
  }

  const getArtifactInitialValues = useCallback((): InitialArtifactDataType => {
    return {
      submittedArtifact: selectedArtifactType,
      connectorId: artifactSpec?.connectorRef
    }
  }, [selectedArtifactType, artifactSpec])

  const addNewArtifact = (): void => {
    setConnectorView(false)
    showConnectorModal()
  }

  const editArtifact = (): void => {
    setConnectorView(false)
    showConnectorModal()
  }

  const deleteArtifact = async (): Promise<void> => {
    const initialSpec = getTriggerArtifactInitialSpec(selectedArtifactType)
    const { source: artifactSource } = formikProps.values
    const { spec: _artifactSpec } = artifactSource ?? {}

    merge(_artifactSpec?.spec, initialSpec)

    await formikProps.setValues(merge(formikProps.values, artifactSource))
    setPrimaryArtifact({} as PrimaryArtifact)
  }

  const getIconProps = useCallback((): IconProps => {
    const _artifactType = selectedArtifactType as ArtifactType
    const iconProps: IconProps = {
      name: ArtifactIconByType[_artifactType]
    }
    if (
      selectedArtifactType === ENABLED_ARTIFACT_TYPES.DockerRegistry ||
      selectedArtifactType === ENABLED_ARTIFACT_TYPES.Acr
    ) {
      iconProps.color = Color.WHITE
    }
    return iconProps
  }, [selectedArtifactType])

  const getLastStepName = (): { key: string; name: string } => {
    return {
      key: getString('connectors.stepFourName'),
      name: getString('connectors.stepFourName')
    }
  }

  const artifactLastStepProps = useCallback((): ImagePathProps<ArtifactTriggerSpec> => {
    return {
      ...getLastStepName(),
      initialValues: artifactSpec,
      handleSubmit: (data: ArtifactTriggerSpec) => {
        addArtifact(data)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addArtifact, expressions, selectedArtifactType, getString])

  const getLabels = useCallback((): ConnectorRefLabelType => {
    return {
      firstStepName: getString('connectors.specifyArtifactRepoType'),
      secondStepName: `${selectedArtifactType && getString(ArtifactTitleIdByType[selectedArtifactType])} ${getString(
        'repository'
      )}`
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArtifactType])

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
    switch (selectedArtifactType) {
      case 'Gcr':
        return <GCRImagePath {...artifactLastStepProps()} />
      case 'Ecr':
        return <ECRArtifact {...artifactLastStepProps()} />
      case 'Nexus3Registry':
        return <NexusArtifact {...artifactLastStepProps()} />
      case 'ArtifactoryRegistry':
        return <Artifactory {...artifactLastStepProps()} />
      case 'AmazonS3':
        return <AmazonS3 {...artifactLastStepProps()} />
      case 'GithubPackageRegistry':
        return <GithubPackageRegistry {...artifactLastStepProps()} />
      case 'GoogleArtifactRegistry':
        return <GoogleArtifactRegistry {...artifactLastStepProps()} />
      case 'Acr':
        return <ACRArtifact {...artifactLastStepProps()} />
      case 'AzureArtifacts':
        return <AzureArtifacts {...artifactLastStepProps()} />
      case 'CustomArtifact':
        return <CustomArtifact {...artifactLastStepProps()} />
      case 'Jenkins':
        return <JenkinsArtifact {...artifactLastStepProps()} />
      case 'DockerRegistry':
        return <DockerRegistryArtifact {...artifactLastStepProps()} />
      case 'AmazonMachineImage':
        return <AmazonMachineImage {...artifactLastStepProps()} />
      case 'GoogleCloudStorage':
        return <GoogleCloudStorage {...artifactLastStepProps()} />
      default:
        return <></>
    }
  }, [artifactLastStepProps, selectedArtifactType])

  const handleConnectorViewChange = useCallback((isConnectorView: boolean): void => {
    setConnectorView(isConnectorView)
    setIsEditMode(false)
  }, [])

  return (
    <ArtifactListView
      primaryArtifact={primaryArtifact}
      addNewArtifact={addNewArtifact}
      editArtifact={editArtifact}
      deleteArtifact={deleteArtifact}
      fetchedConnectorResponse={fetchedConnectorResponse}
      accountId={accountId}
    />
  )
}
