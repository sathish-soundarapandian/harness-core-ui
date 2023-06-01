/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AllowedTypes, Button, PageSpinner, StepProps, StepWizard } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { defaultTo, get, noop } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { ManifestWizard } from '@pipeline/components/ManifestSelection/ManifestWizard/ManifestWizard'
import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper } from 'services/cd-ng'
import {
  getBuildPayload,
  isGitTypeManifestStore,
  ManifestStoreMap,
  ManifestToConnectorMap
} from '@pipeline/components/ManifestSelection/Manifesthelper'
import OpenShiftParamWithGit from '@pipeline/components/ManifestSelection/ManifestWizardSteps/OpenShiftParam/OSWithGit'
import KustomizePatchDetails from '@pipeline/components/ManifestSelection/ManifestWizardSteps/KustomizePatchesDetails/KustomizePatchesDetails'
import InheritFromManifest from '@pipeline/components/ManifestSelection/ManifestWizardSteps/InheritFromManifest/InheritFromManifest'
import HarnessFileStore from '@pipeline/components/ManifestSelection/ManifestWizardSteps/HarnessFileStore/HarnessFileStore'
import CustomRemoteManifest from '@pipeline/components/ManifestSelection/ManifestWizardSteps/CustomRemoteManifest/CustomRemoteManifest'
import K8sValuesManifest from '@pipeline/components/ManifestSelection/ManifestWizardSteps/K8sValuesManifest/K8sValuesManifest'
import { CommonManifestDetails } from '@pipeline/components/ManifestSelection/ManifestWizardSteps/CommonManifestDetails/CommonManifestDetails'
import type {
  CommonManifestLastStepPrevStepData,
  CustomRemoteManifestManifestLastStepPrevStepData,
  HarnessFileStoreManifestLastStepPrevStepData,
  InheritFromManifestLastStepPrevStepData,
  KustomizePatchManifestLastStepPrevStepData,
  ManifestLastStepProps,
  ManifestTypes,
  OpenShiftParamManifestLastStepPrevStepData,
  TASManifestLastStepPrevStepData,
  TASWithHarnessStoreManifestLastStepPrevStepData,
  HelmRepoOverrideManifestLastStepPrevStepData,
  ManifestStores
} from '@pipeline/components/ManifestSelection/ManifestInterface'
import {
  getConnectorPath,
  getListOfDisabledManifestTypes
} from '@pipeline/components/ManifestSelection/ManifestWizardSteps/ManifestUtils'
import TasManifest from '@pipeline/components/ManifestSelection/ManifestWizardSteps/TasManifest/TasManifest'
import TASWithHarnessStore from '@pipeline/components/ManifestSelection/ManifestWizardSteps/TASWithHarnessStore/TASWithHarnessStore'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import DelegateSelectorStep from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import ConnectorTestConnection from '@connectors/common/ConnectorTestConnection/ConnectorTestConnection'
import StepAWSAuthentication from '@connectors/components/CreateConnector/AWSConnector/StepAuth/StepAWSAuthentication'
import GcpAuthentication from '@connectors/components/CreateConnector/GcpConnector/StepAuth/GcpAuthentication'
import GitDetailsStep from '@connectors/components/CreateConnector/commonSteps/GitDetailsStep'
import StepGitAuthentication from '@connectors/components/CreateConnector/GitConnector/StepAuth/StepGitAuthentication'
import StepGithubAuthentication from '@connectors/components/CreateConnector/GithubConnector/StepAuth/StepGithubAuthentication'
import StepBitbucketAuthentication from '@connectors/components/CreateConnector/BitbucketConnector/StepAuth/StepBitbucketAuthentication'
import StepGitlabAuthentication from '@connectors/components/CreateConnector/GitlabConnector/StepAuth/StepGitlabAuthentication'
import { Connectors, CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@connectors/constants'
import {
  buildAWSPayload,
  buildGcpPayload,
  buildHelmPayload,
  buildOCIHelmPayload
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import { useQueryParams } from '@common/hooks'
import type { EnvironmentPathProps, GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import StepHelmAuth from '@connectors/components/CreateConnector/HelmRepoConnector/StepHelmRepoAuth'
import HelmRepoOverrideManifest from '@pipeline/components/ManifestSelection/ManifestWizardSteps/HelmRepoOverrideManifest/HelmRepoOverrideManifest'
import { useGetLastStepConnectorValue } from '@pipeline/hooks/useGetLastStepConnectorValue'
import {
  OverrideManifestTypes,
  OverrideManifestStores,
  OverrideManifestStoreMap,
  ManifestLabels,
  ManifestIcons,
  OverrideManifests,
  OverrideManifestStoresTypes,
  getAllowedOverrideManifests,
  AllowedManifestOverrideTypes,
  TASOverrideManifests
} from '@cd/components/EnvironmentsV2/EnvironmentDetails/ServiceOverrides/ServiceManifestOverride/ServiceManifestOverrideUtils'

import css from '@cd/components/EnvironmentsV2/EnvironmentDetails/ServiceOverrides/ServiceManifestOverride/ServiceManifestOverride.module.scss'

interface ManifestVariableOverrideProps {
  manifestOverrides: ManifestConfigWrapper[]
  isReadonly: boolean
  handleManifestOverrideSubmit: (val: ManifestConfigWrapper, index: number) => void
  expressions: string[]
  allowableTypes: AllowedTypes
  fromEnvConfigPage?: boolean
  serviceType?: string
}
const DIALOG_PROPS: IDialogProps = {
  isOpen: true,
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: false,
  canOutsideClickClose: false,
  enforceFocus: false,
  style: { width: 1175, minHeight: 640, borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }
}
export default function useManifestOverride({
  manifestOverrides,
  handleManifestOverrideSubmit,
  isReadonly,
  expressions,
  allowableTypes,
  serviceType
}: ManifestVariableOverrideProps): {
  createNewManifestOverride(): void
  editManifestOverride(manifestType: OverrideManifestTypes, store: OverrideManifestStoresTypes, index: number): void
} {
  const [selectedManifest, setSelectedManifest] = useState<OverrideManifestTypes | null>(null)
  const [manifestStore, setManifestStore] = useState('')
  const [connectorView, setConnectorView] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [manifestIndex, setEditIndex] = useState(0)
  const [isManifestEditMode, setIsManifestEditMode] = useState(manifestIndex < manifestOverrides.length)

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps & EnvironmentPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()
  const { CDS_TAS_NG } = useFeatureFlags()

  useEffect(() => {
    setIsManifestEditMode(manifestIndex < manifestOverrides.length)
  }, [manifestOverrides, manifestOverrides.length, manifestIndex])

  const createNewManifestOverride = (): void => {
    setEditIndex(manifestOverrides.length)
    showModal()
  }

  const editManifestOverride = (
    manifestType: OverrideManifestTypes,
    store: OverrideManifestStoresTypes,
    index: number
  ): void => {
    setSelectedManifest(manifestType)
    setManifestStore(store)
    setEditIndex(index)
    showModal()
  }

  const handleConnectorViewChange = (isConnectorView: boolean): void => {
    setConnectorView(isConnectorView)
  }

  const changeManifestType = (selectedManifestType: OverrideManifestTypes | null): void => {
    setSelectedManifest(selectedManifestType)
  }
  const handleStoreChange = (store?: OverrideManifestStoresTypes): void => {
    setManifestStore(store || '')
  }

  const getInitValues = (manifest: ManifestConfigWrapper) => {
    if (!manifest) return null
    else
      switch (manifest?.manifest?.type) {
        case OverrideManifests.HelmRepoOverride:
          return get(manifest, 'manifest.spec')
        default:
          return get(manifest, 'manifest.spec.store.spec')
      }
  }
  const getStore = (manifest: ManifestConfigWrapper): ManifestStores => {
    switch (manifest?.manifest?.type) {
      case OverrideManifests.HelmRepoOverride:
        return manifest?.manifest?.spec?.type
      default:
        return manifest?.manifest?.spec?.store?.type
    }
  }
  const getConnectorRef = (manifest: ManifestConfigWrapper): string => {
    switch (manifest?.manifest?.type) {
      case OverrideManifests.HelmRepoOverride:
        return manifest?.manifest?.spec?.connectorRef
      default:
        return getConnectorPath(manifest?.manifest?.spec?.store?.type, manifest?.manifest)
    }
  }
  const getInitialValues = useCallback((): {
    store: OverrideManifestStoresTypes | string
    selectedManifest: OverrideManifestTypes | null
    connectorRef: string | undefined
  } => {
    const initValues = getInitValues(manifestOverrides[manifestIndex])

    if (initValues) {
      const values = {
        ...initValues,
        store: getStore(manifestOverrides[manifestIndex]),
        connectorRef: getConnectorRef(manifestOverrides[manifestIndex]),
        selectedManifest: get(manifestOverrides[manifestIndex], 'manifest.type', null)
      }
      return values
    }
    return {
      store: manifestStore,
      connectorRef: undefined,
      selectedManifest: selectedManifest
    }
  }, [manifestOverrides, manifestIndex, manifestStore, selectedManifest])

  const getLastStepInitialData = useCallback((): ManifestConfig => {
    const initValues = get(manifestOverrides[manifestIndex], 'manifest', null)
    if (
      (initValues?.type && initValues?.type !== selectedManifest) ||
      (get(initValues, 'spec.store.type') !== manifestStore && get(initValues, 'spec.type') !== manifestStore)
    ) {
      return null as unknown as ManifestConfig
    }
    return initValues as ManifestConfig
  }, [manifestIndex, manifestOverrides, manifestStore, selectedManifest])

  const handleSubmit = useCallback(
    (manifestObj: ManifestConfigWrapper): void => {
      hideModal()
      setSelectedManifest(null)
      setManifestStore('')
      handleManifestOverrideSubmit(manifestObj, manifestIndex)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleManifestOverrideSubmit, manifestIndex]
  )

  const initialValues = getLastStepInitialData()
  const initialConnectorRef = defaultTo(getConnectorRef({ manifest: initialValues }), undefined) as any

  const { selectedConnector, fetchingConnector } = useGetLastStepConnectorValue({
    initialConnectorRef,
    isEditMode: isManifestEditMode
  })
  const lastStepProps = useCallback((): ManifestLastStepProps => {
    const manifestDetailsProps: ManifestLastStepProps = {
      key: getString('pipeline.manifestType.manifestDetails'),
      name: getString('pipeline.manifestType.manifestDetails'),
      expressions,
      allowableTypes,
      stepName: getString('pipeline.manifestType.manifestDetails'),
      initialValues: getLastStepInitialData(),
      handleSubmit: handleSubmit,
      selectedManifest,
      manifestIdsList: manifestOverrides.map((item: ManifestConfigWrapper) => item.manifest?.identifier as string),
      isReadonly
    }
    return manifestDetailsProps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getLastStepInitialData, handleSubmit, selectedManifest, manifestOverrides])

  const prevStepProps = useCallback((): { editManifestModePrevStepData: ConnectorConfigDTO } => {
    return {
      editManifestModePrevStepData: {
        ...getInitialValues(),
        connectorRef: selectedConnector
      }
    }
  }, [getInitialValues, selectedConnector])

  const shouldPassPrevStepData = (): boolean => {
    return isManifestEditMode && !!selectedConnector
  }

  const getLastSteps = useCallback((): Array<React.ReactElement<StepProps<ConnectorConfigDTO>>> => {
    const arr: Array<React.ReactElement<StepProps<ConnectorConfigDTO>>> = []
    let manifestDetailStep = null
    const isGitTypeStores = isGitTypeManifestStore(manifestStore as OverrideManifestStoresTypes)

    if (isManifestEditMode && fetchingConnector) {
      manifestDetailStep = <PageSpinner />
    } else {
      switch (true) {
        case selectedManifest === OverrideManifests.OpenshiftParam && isGitTypeStores:
          manifestDetailStep = (
            <OpenShiftParamWithGit
              {...lastStepProps()}
              {...((shouldPassPrevStepData() ? prevStepProps() : {}) as OpenShiftParamManifestLastStepPrevStepData)}
            />
          )
          break
        case selectedManifest === OverrideManifests.KustomizePatches && isGitTypeStores:
          manifestDetailStep = (
            <KustomizePatchDetails
              {...lastStepProps()}
              {...((shouldPassPrevStepData() ? prevStepProps() : {}) as KustomizePatchManifestLastStepPrevStepData)}
            />
          )
          break
        case [OverrideManifests.Values, OverrideManifests.OpenshiftParam, OverrideManifests.KustomizePatches].includes(
          selectedManifest as OverrideManifestTypes
        ) && manifestStore === OverrideManifestStores.InheritFromManifest:
          manifestDetailStep = (
            <InheritFromManifest
              {...lastStepProps()}
              {...((shouldPassPrevStepData() ? prevStepProps() : {}) as InheritFromManifestLastStepPrevStepData)}
            />
          )
          break
        case [
          OverrideManifests.Values,
          OverrideManifests.OpenshiftParam,
          OverrideManifests.KustomizePatches,
          OverrideManifests.TasVars,
          OverrideManifests.TasAutoScaler
        ].includes(selectedManifest as OverrideManifestTypes) && manifestStore === OverrideManifestStores.Harness:
          manifestDetailStep = (
            <HarnessFileStore
              {...lastStepProps()}
              {...((shouldPassPrevStepData() ? prevStepProps() : {}) as HarnessFileStoreManifestLastStepPrevStepData)}
            />
          )
          break
        case [
          OverrideManifests.Values,
          OverrideManifests.OpenshiftParam,
          OverrideManifests.TasManifest,
          OverrideManifests.TasVars,
          OverrideManifests.TasAutoScaler
        ].includes(selectedManifest as OverrideManifestTypes) && manifestStore === OverrideManifestStores.CustomRemote:
          manifestDetailStep = (
            <CustomRemoteManifest
              {...lastStepProps()}
              {...((isManifestEditMode ? prevStepProps() : {}) as CustomRemoteManifestManifestLastStepPrevStepData)}
            />
          )
          break
        case selectedManifest === OverrideManifests.Values && isGitTypeStores:
          manifestDetailStep = (
            <K8sValuesManifest
              {...lastStepProps()}
              {...((shouldPassPrevStepData() ? prevStepProps() : {}) as CommonManifestLastStepPrevStepData)}
            />
          )
          break
        case selectedManifest === OverrideManifests.TasManifest && manifestStore === OverrideManifestStores.Harness:
          manifestDetailStep = (
            <TASWithHarnessStore
              {...lastStepProps()}
              {...((shouldPassPrevStepData()
                ? prevStepProps()
                : {}) as TASWithHarnessStoreManifestLastStepPrevStepData)}
            />
          )
          break

        case selectedManifest === OverrideManifests.TasManifest:
          manifestDetailStep = (
            <TasManifest
              {...lastStepProps()}
              {...((shouldPassPrevStepData() ? prevStepProps() : {}) as TASManifestLastStepPrevStepData)}
            />
          )
          break
        case selectedManifest === OverrideManifests.HelmRepoOverride:
          manifestDetailStep = (
            <HelmRepoOverrideManifest
              {...lastStepProps()}
              {...((shouldPassPrevStepData() ? prevStepProps() : {}) as HelmRepoOverrideManifestLastStepPrevStepData)}
            />
          )
          break
        default:
          manifestDetailStep = (
            <CommonManifestDetails
              {...lastStepProps()}
              {...((shouldPassPrevStepData() ? prevStepProps() : {}) as CommonManifestLastStepPrevStepData)}
            />
          )
          break
      }
    }

    arr.push(manifestDetailStep)
    return arr
  }, [
    manifestStore,
    selectedManifest,
    lastStepProps,
    prevStepProps,
    selectedConnector,
    isManifestEditMode,
    fetchingConnector
  ])

  const getLabels = (): { firstStepName: string; secondStepName: string } => {
    return {
      firstStepName: getString('pipeline.manifestType.specifyManifestRepoType'),
      secondStepName: `${getString('common.specify')} ${
        selectedManifest && getString(ManifestLabels[selectedManifest])
      } ${getString('store')}`
    }
  }

  const allowedOverrideManifestTypes = React.useMemo((): ManifestTypes[] => {
    if (serviceType) {
      return serviceType === ServiceDeploymentType.TAS ? TASOverrideManifests : AllowedManifestOverrideTypes
    } else {
      // Environment Configurations
      return getAllowedOverrideManifests({ CDS_TAS_NG })
    }
  }, [CDS_TAS_NG, serviceType])

  const connectorDetailStepProps = {
    type: ManifestToConnectorMap[manifestStore],
    name: getString('overview'),
    isEditMode,
    gitDetails: { repoIdentifier, branch, getDefaultFromOtherRepo: true }
  }
  const delegateSelectorStepProps = {
    name: getString('delegate.DelegateselectionLabel'),
    isEditMode,
    setIsEditMode,
    connectorInfo: undefined
  }
  const ConnectorTestConnectionProps = {
    name: getString('connectors.stepThreeName'),
    connectorInfo: undefined,
    isStep: true,
    isLastStep: false,
    type: ManifestToConnectorMap[manifestStore]
  }
  const gitTypeStoreAuthenticationProps = {
    name: getString('credentials'),
    isEditMode,
    setIsEditMode,
    accountId,
    orgIdentifier,
    projectIdentifier,
    connectorInfo: undefined,
    onConnectorCreated: noop
  }
  const authenticationStepProps = {
    ...gitTypeStoreAuthenticationProps,
    identifier: CONNECTOR_CREDENTIALS_STEP_IDENTIFIER
  }

  const getNewConnectorSteps = useCallback((): JSX.Element => {
    const buildPayload = getBuildPayload(ManifestToConnectorMap[manifestStore])
    switch (manifestStore) {
      case ManifestStoreMap.Http:
      case ManifestStoreMap.OciHelmChart:
        return (
          <StepWizard title={getString('connectors.createNewConnector')}>
            <ConnectorDetailsStep {...connectorDetailStepProps} />
            <StepHelmAuth {...authenticationStepProps} isOCIHelm={manifestStore === ManifestStoreMap.OciHelmChart} />
            <DelegateSelectorStep
              {...delegateSelectorStepProps}
              buildPayload={manifestStore === ManifestStoreMap.Http ? buildHelmPayload : buildOCIHelmPayload}
            />
            <ConnectorTestConnection {...ConnectorTestConnectionProps} />
          </StepWizard>
        )
      case ManifestStoreMap.S3:
        return (
          <StepWizard iconProps={{ size: 37 }} title={getString('connectors.createNewConnector')}>
            <ConnectorDetailsStep {...connectorDetailStepProps} />
            <StepAWSAuthentication {...authenticationStepProps} />
            <DelegateSelectorStep {...delegateSelectorStepProps} buildPayload={buildAWSPayload} />
            <ConnectorTestConnection {...ConnectorTestConnectionProps} />
          </StepWizard>
        )
      case ManifestStoreMap.Gcs:
        return (
          <StepWizard iconProps={{ size: 37 }} title={getString('connectors.createNewConnector')}>
            <ConnectorDetailsStep {...connectorDetailStepProps} />
            <GcpAuthentication {...authenticationStepProps} />
            <DelegateSelectorStep {...delegateSelectorStepProps} buildPayload={buildGcpPayload} />
            <ConnectorTestConnection {...ConnectorTestConnectionProps} />
          </StepWizard>
        )
      default:
        return (
          <StepWizard title={getString('connectors.createNewConnector')}>
            <ConnectorDetailsStep {...connectorDetailStepProps} />
            <GitDetailsStep
              type={ManifestToConnectorMap[manifestStore]}
              name={getString('details')}
              isEditMode={isEditMode}
              connectorInfo={undefined}
            />
            {ManifestToConnectorMap[manifestStore] === Connectors.GIT ? (
              <StepGitAuthentication {...gitTypeStoreAuthenticationProps} />
            ) : null}
            {ManifestToConnectorMap[manifestStore] === Connectors.GITHUB ? (
              <StepGithubAuthentication {...gitTypeStoreAuthenticationProps} />
            ) : null}
            {ManifestToConnectorMap[manifestStore] === Connectors.BITBUCKET ? (
              <StepBitbucketAuthentication {...gitTypeStoreAuthenticationProps} />
            ) : null}
            {ManifestToConnectorMap[manifestStore] === Connectors.GITLAB ? (
              <StepGitlabAuthentication {...authenticationStepProps} />
            ) : null}
            <DelegateSelectorStep {...delegateSelectorStepProps} buildPayload={buildPayload} />
            <ConnectorTestConnection {...ConnectorTestConnectionProps} />
          </StepWizard>
        )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectorView, manifestStore, isEditMode])

  const [showModal, hideModal] = useModalHook(() => {
    const onClose = (): void => {
      hideModal()
      setManifestStore('')
      setSelectedManifest(null)
    }
    return (
      <Dialog onClose={onClose} {...DIALOG_PROPS}>
        <div className={css.createConnectorWizard}>
          <ManifestWizard
            types={allowedOverrideManifestTypes}
            manifestStoreTypes={OverrideManifestStoreMap[selectedManifest as OverrideManifestTypes]}
            labels={getLabels()}
            selectedManifest={selectedManifest}
            newConnectorView={connectorView}
            expressions={expressions}
            allowableTypes={allowableTypes}
            changeManifestType={changeManifestType}
            handleStoreChange={handleStoreChange}
            initialValues={getInitialValues()}
            lastSteps={getLastSteps()}
            newConnectorSteps={getNewConnectorSteps()}
            handleConnectorViewChange={handleConnectorViewChange}
            iconsProps={{
              name: ManifestIcons[selectedManifest as OverrideManifestTypes]
            }}
            isReadonly={isReadonly}
            listOfDisabledManifestTypes={getListOfDisabledManifestTypes(manifestOverrides)}
            existingManifestOverrides={manifestOverrides}
            isEditMode={isManifestEditMode}
          />
        </div>
        <Button minimal icon="cross" onClick={onClose} className={css.crossIcon} />
      </Dialog>
    )
  }, [
    selectedManifest,
    manifestIndex,
    manifestStore,
    expressions.length,
    expressions,
    allowableTypes,
    connectorView,
    isManifestEditMode,
    getLastSteps,
    getInitialValues
  ])

  return {
    createNewManifestOverride,
    editManifestOverride
  }
}
