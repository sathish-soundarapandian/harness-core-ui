import { Button, ButtonSize, ButtonVariation, Card } from '@harness/uicore'
import React, { useState } from 'react'
import cx from 'classnames'
import { Classes, IDialogProps, Dialog } from '@blueprintjs/core'
import type { StageElementConfig } from 'services/cd-ng'

import ReleaseRepoWizard from './ReleaseRepoWizard'
import type { ManifestStores } from '../ManifestSelection/ManifestInterface'
import css from './ReleaseRepo.module.scss'

const DIALOG_PROPS: IDialogProps = {
  isOpen: true,
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: false,
  canOutsideClickClose: false,
  enforceFocus: false,
  style: { width: 1175, minHeight: 640, borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }
}

function ReleaseRepoListView({
  updateStage,
  stage
}: {
  updateStage: (stage: StageElementConfig) => Promise<void>
  stage: any
}): React.ReactElement {
  const [showServiceRepoModal, setShowServiceRepoModal] = useState(false)
  const [connectorView, setConnectorView] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  // const [manifestStore, setManifestStore] = useState('')

  // const getDeploymentType = (): ServiceDeploymentType => {
  //   return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.manifests')
  // }

  // const listOfManifests = useMemo(() => {
  //   if (!isReadonly && isReadOnlyServiceMode) {
  //     const serviceData = selectedServiceResponse?.data?.service as ServiceResponseDTO
  //     if (!isEmpty(serviceData?.yaml)) {
  //       const parsedYaml = yamlParse<NGServiceConfig>(defaultTo(serviceData.yaml, ''))
  //       const serviceInfo = parsedYaml.service?.serviceDefinition
  //       return serviceInfo?.spec.manifests
  //     }
  //     return []
  //   }
  //   if (isPropagating) {
  //     return get(stage, 'stage.spec.serviceConfig.stageOverrides.manifests', [])
  //   }

  //   return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.manifests', [])
  // }, [isPropagating, isReadonly, isReadOnlyServiceMode, selectedServiceResponse?.data?.service])

  const handleConnectorViewChange = (isConnectorView: boolean): void => {
    setConnectorView(isConnectorView)
    setIsEditMode(false)
  }
  const handleStoreChange = (store?: ManifestStores): void => {
    setManifestStore(store || '')
  }
  return (
    <Card id={'releaseRepoManifests'} className={css.sectionCard}>
      <div className={cx(css.tabSubHeading, 'ng-tooltip-native')} data-tooltip-id={'release-repo-manifests'}>
        Release Repo Manifests
      </div>

      <Button
        size={ButtonSize.SMALL}
        icon="plus"
        minimal
        variation={ButtonVariation.LINK}
        onClick={() => {
          setShowServiceRepoModal(true)
        }}
      >
        Add Release Repo Manifest File
      </Button>
      {showServiceRepoModal ? (
        <Dialog
          onClose={() => {
            setShowServiceRepoModal(false)
          }}
          {...DIALOG_PROPS}
          className={cx(css.modal, Classes.DIALOG)}
        >
          <div className={css.wizardDialog}>
            <ReleaseRepoWizard
              newConnectorView={connectorView}
              handleConnectorViewChange={handleConnectorViewChange}
              isEditMode={isEditMode}
              handleStoreChange={handleStoreChange}
              handleSubmit={updateStage}
              stage={stage}
              onClose={() => {
                setShowServiceRepoModal(false)
              }}
            />
          </div>
          <Button
            minimal
            icon="cross"
            onClick={() => {
              setShowServiceRepoModal(false)
            }}
            className={css.crossIcon}
          />
        </Dialog>
      ) : null}
    </Card>
  )
}

export default ReleaseRepoListView
