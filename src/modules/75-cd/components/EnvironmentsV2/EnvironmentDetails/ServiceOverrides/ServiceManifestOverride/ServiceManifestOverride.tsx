/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import {
  AllowedTypesWithRunTime,
  Button,
  ButtonSize,
  ButtonVariation,
  Layout,
  MultiTypeInputType,
  StepProps
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { get, noop } from 'lodash-es'
import { useStrings } from 'framework/strings'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ManifestWizard } from '@pipeline/components/ManifestSelection/ManifestWizard/ManifestWizard'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper } from 'services/cd-ng'
import { isGitTypeManifestStore } from '@pipeline/components/ManifestSelection/Manifesthelper'
import OpenShiftParamWithGit from '@pipeline/components/ManifestSelection/ManifestWizardSteps/OpenShiftParam/OSWithGit'
import KustomizePatchDetails from '@pipeline/components/ManifestSelection/ManifestWizardSteps/KustomizePatchesDetails/KustomizePatchesDetails'
import InheritFromManifest from '@pipeline/components/ManifestSelection/ManifestWizardSteps/InheritFromManifest/InheritFromManifest'
import HarnessFileStore from '@pipeline/components/ManifestSelection/ManifestWizardSteps/HarnessFileStore/HarnessFileStore'
import CustomRemoteManifest from '@pipeline/components/ManifestSelection/ManifestWizardSteps/CustomRemoteManifest/CustomRemoteManifest'
import K8sValuesManifest from '@pipeline/components/ManifestSelection/ManifestWizardSteps/K8sValuesManifest/K8sValuesManifest'
import { CommonManifestDetails } from '@pipeline/components/ManifestSelection/ManifestWizardSteps/CommonManifestDetails/CommonManifestDetails'
import type { ManifestLastStepProps } from '@pipeline/components/ManifestSelection/ManifestInterface'
import { getConnectorPath } from '@pipeline/components/ManifestSelection/ManifestWizardSteps/ManifestUtils'
import {
  AllowedManifestOverrideTypes,
  OverrideManifestTypes,
  OverrideManifestStores,
  OverrideManifestStoreMap,
  ManifestLabels,
  ManifestIcons,
  OverrideManifests,
  OverrideManifestStoresTypes
} from './ServiceManifestOverrideUtils'
import ServiceManifestOverridesList from './ServiceManifestOverridesList'
import css from './ServiceManifestOverride.module.scss'

interface ManifestVariableOverrideProps {
  manifestOverrides: ManifestConfigWrapper[]
  isReadonly: boolean
  handleManifestOverrideSubmit: (val: ManifestConfigWrapper, index: number) => void
  removeManifestConfig: (index: number) => void
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
function ServiceManifestOverride({
  manifestOverrides,
  handleManifestOverrideSubmit,
  removeManifestConfig,
  isReadonly
}: ManifestVariableOverrideProps): React.ReactElement {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const allowableTypes: AllowedTypesWithRunTime[] = [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ]
  const [selectedManifest, setSelectedManifest] = useState<OverrideManifestTypes | null>(null)
  const [manifestStore, setManifestStore] = useState('')
  const [manifestIndex, setEditIndex] = useState(0)

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

  const changeManifestType = (selected: OverrideManifestTypes | null): void => {
    setSelectedManifest(selected)
  }
  const handleStoreChange = (store?: OverrideManifestStoresTypes): void => {
    setManifestStore(store || '')
  }

  const getInitialValues = (): {
    store: OverrideManifestStoresTypes | string
    selectedManifest: OverrideManifestTypes | null
    connectorRef: string | undefined
  } => {
    const initValues = get(manifestOverrides[manifestIndex], 'manifest.spec.store.spec', null)
    if (initValues) {
      const values = {
        ...initValues,
        store: manifestOverrides[manifestIndex]?.manifest?.spec?.store?.type,
        connectorRef: getConnectorPath(
          manifestOverrides[manifestIndex]?.manifest?.spec?.store?.type,
          manifestOverrides[manifestIndex].manifest
        ),
        selectedManifest: get(manifestOverrides[manifestIndex], 'manifest.type', null)
      }
      return values
    }
    return {
      store: manifestStore,
      connectorRef: undefined,
      selectedManifest: selectedManifest
    }
  }
  const getLastStepInitialData = useCallback((): ManifestConfig => {
    const initValues = get(manifestOverrides[manifestIndex], 'manifest', null)
    if (initValues?.type && initValues?.type !== selectedManifest) {
      return null as unknown as ManifestConfig
    }
    return initValues as ManifestConfig
  }, [manifestIndex, manifestOverrides, selectedManifest])

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

  const getLastSteps = useCallback((): Array<React.ReactElement<StepProps<ConnectorConfigDTO>>> => {
    const arr: Array<React.ReactElement<StepProps<ConnectorConfigDTO>>> = []
    let manifestDetailStep = null
    const isGitTypeStores = isGitTypeManifestStore(manifestStore as OverrideManifestStoresTypes)

    switch (true) {
      case selectedManifest === OverrideManifests.OpenshiftParam && isGitTypeStores:
        manifestDetailStep = <OpenShiftParamWithGit {...lastStepProps()} />
        break
      case selectedManifest === OverrideManifests.KustomizePatches && isGitTypeStores:
        manifestDetailStep = <KustomizePatchDetails {...lastStepProps()} />
        break
      case [OverrideManifests.Values, OverrideManifests.OpenshiftParam, OverrideManifests.KustomizePatches].includes(
        selectedManifest as OverrideManifestTypes
      ) && manifestStore === OverrideManifestStores.InheritFromManifest:
        manifestDetailStep = <InheritFromManifest {...lastStepProps()} />
        break
      case [OverrideManifests.Values, OverrideManifests.OpenshiftParam, OverrideManifests.KustomizePatches].includes(
        selectedManifest as OverrideManifestTypes
      ) && manifestStore === OverrideManifestStores.Harness:
        manifestDetailStep = <HarnessFileStore {...lastStepProps()} />
        break
      case [OverrideManifests.Values, OverrideManifests.OpenshiftParam].includes(
        selectedManifest as OverrideManifestTypes
      ) && manifestStore === OverrideManifestStores.CustomRemote:
        manifestDetailStep = <CustomRemoteManifest {...lastStepProps()} />
        break
      case selectedManifest === OverrideManifests.Values && isGitTypeStores:
        manifestDetailStep = <K8sValuesManifest {...lastStepProps()} />
        break
      default:
        manifestDetailStep = <CommonManifestDetails {...lastStepProps()} />
        break
    }
    arr.push(manifestDetailStep)
    return arr
  }, [manifestStore, selectedManifest, lastStepProps])

  const getLabels = (): { firstStepName: string; secondStepName: string } => {
    return {
      firstStepName: getString('pipeline.manifestType.specifyManifestRepoType'),
      secondStepName: `${getString('common.specify')} ${
        selectedManifest && getString(ManifestLabels[selectedManifest])
      } ${getString('store')}`
    }
  }
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
            types={AllowedManifestOverrideTypes}
            manifestStoreTypes={OverrideManifestStoreMap[selectedManifest as OverrideManifestTypes]}
            labels={getLabels()}
            selectedManifest={selectedManifest}
            newConnectorView={false}
            expressions={expressions}
            allowableTypes={allowableTypes}
            changeManifestType={changeManifestType}
            handleStoreChange={handleStoreChange}
            initialValues={getInitialValues()}
            lastSteps={getLastSteps()}
            iconsProps={{
              name: ManifestIcons[selectedManifest as OverrideManifestTypes]
            }}
            isReadonly={isReadonly}
            handleConnectorViewChange={noop}
          />
        </div>
        <Button minimal icon="cross" onClick={onClose} className={css.crossIcon} />
      </Dialog>
    )
  }, [selectedManifest, expressions.length, expressions, allowableTypes])

  return (
    <Layout.Vertical flex={{ alignItems: 'flex-start' }}>
      <ServiceManifestOverridesList
        manifestOverridesList={manifestOverrides}
        isReadonly={isReadonly}
        editManifestOverride={editManifestOverride}
        removeManifestConfig={removeManifestConfig}
      />
      <RbacButton
        size={ButtonSize.SMALL}
        variation={ButtonVariation.LINK}
        text={getString('common.plusNewName', { name: getString('common.override') })}
        onClick={createNewManifestOverride}
        permission={{
          resource: {
            resourceType: ResourceType.ENVIRONMENT
          },
          permission: PermissionIdentifier.EDIT_ENVIRONMENT
        }}
      />
    </Layout.Vertical>
  )
}

export default ServiceManifestOverride
