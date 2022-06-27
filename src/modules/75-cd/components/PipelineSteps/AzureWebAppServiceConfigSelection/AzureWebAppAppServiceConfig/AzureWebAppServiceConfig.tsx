/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Layout, Button, ButtonSize, ButtonVariation, MultiTypeInputType } from '@wings-software/uicore'
// import { useStrings } from 'framework/strings'
import cx from 'classnames'

import { Classes, Dialog, IDialogProps } from '@blueprintjs/core'
import { useModalHook } from '@harness/use-modal'
import type { StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import type { PipelineInfoConfig, ServiceDefinition, StageElementConfig } from 'services/cd-ng'
import type { ManifestTypes } from '@pipeline/components/ManifestSelection/ManifestInterface'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { allowedManifestTypes } from '@pipeline/components/ManifestSelection/Manifesthelper'

import css from './AzureWebAppServiceConfig.module.scss'

export enum ModalViewOption {
  APPLICATIONSETTING = 0,
  CONNECTIONSTRING = 1
}
export interface AzureWebAppListViewProps {
  // addNewApplicationSetting: () => void
  // addNewConnectionString: () => void
  pipeline: PipelineInfoConfig
  updateStage: (stage: StageElementConfig) => Promise<void>
  stage: StageElementWrapper | undefined
  isPropagating?: boolean
  isReadonly: boolean
  deploymentType: ServiceDefinition['type']
  allowableTypes: MultiTypeInputType[]
}

export const DIALOG_PROPS: IDialogProps = {
  isOpen: true,
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: false,
  canOutsideClickClose: false,
  enforceFocus: false,
  style: { width: 1175, minHeight: 640, borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }
}

function AzureWebAppListView({
  // updateStage,
  // stage,
  // isPropagating,
  deploymentType,
  // isReadonly,
  allowableTypes
}: AzureWebAppListViewProps): JSX.Element {
  // const { getString } = useStrings()

  //for selecting which modal to open
  // const [selectedOption, setSelectedOption] = useState(1)

  const [selectedManifest, setSelectedManifest] = useState<ManifestTypes | null>(null)
  const [connectorView, setConnectorView] = useState(false)
  const [manifestStore, setManifestStore] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  const [manifestIndex, setEditIndex] = useState(0)

  const { expressions } = useVariablesExpression()

  const addNewManifest = (): void => {
    setEditIndex(0) //todo

    setSelectedManifest(
      allowedManifestTypes[deploymentType]?.length === 1 ? allowedManifestTypes[deploymentType][0] : null
    )
    showConnectorModal()
  }

  const [showConnectorModal, hideConnectorModal] = useModalHook(() => {
    const onClose = (): void => {
      setConnectorView(false)
      hideConnectorModal()
      setManifestStore('')
      setIsEditMode(false)
      setSelectedManifest(null)
    }

    return (
      <Dialog onClose={onClose} {...DIALOG_PROPS} className={cx(css.modal, Classes.DIALOG)}>
        <div className={css.createConnectorWizard}>
          {
            //todo redirect to conditional modal view
            /*
          selectedOption? Application View : Connection Strings
          */
          }
        </div>
        <Button minimal icon="cross" onClick={onClose} className={css.crossIcon} />
      </Dialog>
    )
  }, [
    selectedManifest,
    connectorView,
    manifestIndex,
    manifestStore,
    expressions.length,
    expressions,
    allowableTypes,
    isEditMode
  ])

  return (
    <Layout.Vertical style={{ width: '100%' }}>
      <Layout.Vertical spacing={'medium'} flex={{ alignItems: 'flex-start' }}>
        <Button
          className={css.addNew}
          id="add-applicationSetting"
          size={ButtonSize.SMALL}
          variation={ButtonVariation.LINK}
          onClick={() => {
            addNewManifest()
            // setSelectedOption(ModalViewOption.APPLICATIONSETTING)
          }}
          text={'+ Add Application Settings'}
        />
        <Button
          className={css.addNew}
          id="add-connectionString"
          size={ButtonSize.SMALL}
          variation={ButtonVariation.LINK}
          onClick={() => {
            addNewManifest()
            // setSelectedOption(ModalViewOption.CONNECTIONSTRING)
          }}
          text={'+ Add Connection Strings'}
        />
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default AzureWebAppListView
