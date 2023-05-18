/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import type { FormikProps } from 'formik'
import { MultiTypeInputType } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { Dialog, IDialogProps, Classes } from '@blueprintjs/core'
import type { IconProps } from '@harness/icons'
import { noop } from 'lodash-es'
import { CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@connectors/constants'
import type { GitQueryParams, PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'

import { useQueryParams } from '@common/hooks'
import {
  ArtifactIconByType,
  ArtifactTitleIdByType,
  ENABLED_ARTIFACT_TYPES
} from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import {
  getArtifactTriggerSpecSource,
  isArtifactAdded
} from '@triggers/components/Triggers/ArtifactTrigger/TriggersWizardPageUtils'
import type { NGTriggerSourceV2 } from 'services/pipeline-ng'
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
  ArtifactTriggerSpecWrapper,
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
import { BambooArtifact } from './ArtifactRepository/ArtifactLastSteps/BambooArtifact/BambooArtifact'

import css from '@pipeline/components/ArtifactsSelection/ArtifactsSelection.module.scss'

interface ArtifactsSelectionProps {
  formikProps: FormikProps<any>
}

export default function ArtifactsSelection({ formikProps }: ArtifactsSelectionProps): React.ReactElement | null {
  const { spec: triggerSpec } = (formikProps.values?.source ?? {}) as Omit<Required<NGTriggerSourceV2>, 'pollInterval'>
  const { type: artifactType, sources = [] } = triggerSpec
  const filteredArtifactSpecSources = sources.filter((artifactSpecSource: ArtifactTriggerSpecWrapper) =>
    isArtifactAdded(artifactType, artifactSpecSource.spec)
  )
  const selectedArtifactType = artifactType as Required<ArtifactType>
  const [isEditMode, setIsEditMode] = useState(false)
  const [connectorView, setConnectorView] = useState(false)
  const [artifactSpecSources, setArtifactSpecSources] = useState<ArtifactTriggerSpecWrapper[]>(
    filteredArtifactSpecSources as ArtifactTriggerSpecWrapper[]
  )
  const [isNewArtifact, setIsNewArtifact] = useState(false)
  const [currentEditArtifactIndex, setCurrentEditArtifactIndex] = useState(0)

  const { getString } = useStrings()

  const { accountId, orgIdentifier, projectIdentifier } = useParams<PipelineType<ProjectPathProps>>()
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
    [selectedArtifactType, connectorView, formikProps, isNewArtifact, currentEditArtifactIndex]
  )

  const setFormikValues = (updatedArtifacts: ArtifactTriggerSpecWrapper[]): void => {
    const { type, spec } = formikProps.values.source ?? {}
    const values = {
      ...formikProps.values,
      source: {
        type,
        spec: {
          ...spec,
          sources: updatedArtifacts
        }
      }
    }

    formikProps.setValues(values)

    setArtifactSpecSources(updatedArtifacts)
  }

  const addArtifact = (artifactObj: ArtifactTriggerSpec): void => {
    const updatedArtifacts = isNewArtifact
      ? [...artifactSpecSources, { spec: artifactObj }]
      : artifactSpecSources.map((artifact, index) =>
          index === currentEditArtifactIndex ? { spec: artifactObj } : artifact
        )

    setFormikValues(updatedArtifacts)

    hideConnectorModal()
  }

  const getArtifactInitialValues = useCallback((): InitialArtifactDataType => {
    return {
      submittedArtifact: selectedArtifactType,
      connectorId: isNewArtifact ? undefined : artifactSpecSources[currentEditArtifactIndex].spec?.connectorRef
    }
  }, [selectedArtifactType, isNewArtifact, artifactSpecSources, currentEditArtifactIndex])

  const addNewArtifact = (): void => {
    setIsNewArtifact(true)
    setConnectorView(false)
    showConnectorModal()
  }

  const editArtifact = (currentArtifactIndex: number): void => {
    setCurrentEditArtifactIndex(currentArtifactIndex)
    setIsNewArtifact(false)
    setConnectorView(false)
    showConnectorModal()
  }

  const deleteArtifact = (currentArtifactIndex: number): void => {
    const updatedArtifacts = [
      ...artifactSpecSources.slice(0, currentArtifactIndex),
      ...artifactSpecSources.slice(currentArtifactIndex + 1)
    ]

    setFormikValues(updatedArtifacts)
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

  const getArtifactLastStepProps = useCallback((): ImagePathProps<ArtifactTriggerSpec> => {
    const initialValues = isNewArtifact
      ? getArtifactTriggerSpecSource(selectedArtifactType) ?? artifactSpecSources[currentEditArtifactIndex].spec
      : artifactSpecSources[currentEditArtifactIndex].spec

    return {
      key: getString('connectors.stepFourName'),
      name: getString('connectors.stepFourName'),
      initialValues,
      handleSubmit: (data: ArtifactTriggerSpec) => {
        addArtifact(data)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addArtifact, selectedArtifactType, isNewArtifact, artifactSpecSources, currentEditArtifactIndex])

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
        return <GCRImagePath {...getArtifactLastStepProps()} />
      case 'Ecr':
        return <ECRArtifact {...getArtifactLastStepProps()} />
      case 'Nexus3Registry':
        return <NexusArtifact {...getArtifactLastStepProps()} />
      case 'ArtifactoryRegistry':
        return <Artifactory {...getArtifactLastStepProps()} />
      case 'AmazonS3':
        return <AmazonS3 {...getArtifactLastStepProps()} />
      case 'GithubPackageRegistry':
        return <GithubPackageRegistry {...getArtifactLastStepProps()} />
      case 'GoogleArtifactRegistry':
        return <GoogleArtifactRegistry {...getArtifactLastStepProps()} />
      case 'Acr':
        return <ACRArtifact {...getArtifactLastStepProps()} />
      case 'AzureArtifacts':
        return <AzureArtifacts {...getArtifactLastStepProps()} />
      case 'CustomArtifact':
        return <CustomArtifact {...getArtifactLastStepProps()} />
      case 'Jenkins':
        return <JenkinsArtifact {...getArtifactLastStepProps()} />
      case 'DockerRegistry':
        return <DockerRegistryArtifact {...getArtifactLastStepProps()} />
      case 'AmazonMachineImage':
        return <AmazonMachineImage {...getArtifactLastStepProps()} />
      case 'GoogleCloudStorage':
        return <GoogleCloudStorage {...getArtifactLastStepProps()} />
      case 'Bamboo':
        return <BambooArtifact {...getArtifactLastStepProps()} />
      default:
        return <></>
    }
  }, [getArtifactLastStepProps, selectedArtifactType])

  const handleConnectorViewChange = useCallback((isConnectorView: boolean): void => {
    setConnectorView(isConnectorView)
    setIsEditMode(false)
  }, [])

  return (
    <ArtifactListView
      artifactSpecSources={artifactSpecSources}
      artifactType={artifactType}
      addNewArtifact={addNewArtifact}
      editArtifact={editArtifact}
      deleteArtifact={deleteArtifact}
    />
  )
}
