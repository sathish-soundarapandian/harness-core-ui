import { Button, ButtonSize, ButtonVariation, Card } from '@harness/uicore'
import React, { useState } from 'react'
import cx from 'classnames'
import { Classes, IDialogProps, Dialog } from '@blueprintjs/core'

import ReleaseRepoWizard from './ReleaseRepoWizard'

import css from './ReleaseRepo.module.scss'
import type { ManifestStores } from '../ManifestSelection/ManifestInterface'

const DIALOG_PROPS: IDialogProps = {
  isOpen: true,
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: false,
  canOutsideClickClose: false,
  enforceFocus: false,
  style: { width: 1175, minHeight: 640, borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }
}

function ServiceRepoListView(): React.ReactElement {
  const [showServiceRepoModal, setShowServiceRepoModal] = useState(false)
  const [connectorView, setConnectorView] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [manifestStore, setManifestStore] = useState('')

  const handleConnectorViewChange = (isConnectorView: boolean): void => {
    setConnectorView(isConnectorView)
    setIsEditMode(false)
  }
  const handleStoreChange = (store?: ManifestStores): void => {
    setManifestStore(store || '')
  }
  return (
    <Card id={'serviceRepos'} className={css.sectionCard}>
      <div className={cx(css.tabSubHeading, 'ng-tooltip-native')} data-tooltip-id={'service-repos'}>
        Service Repos
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
        Add Service Repo
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

export default ServiceRepoListView
