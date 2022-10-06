/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, StepWizard } from '@harness/uicore'
import { Dialog, Classes, IDialogProps } from '@blueprintjs/core'
import { useModalHook } from '@harness/use-modal'
import cx from 'classnames'

import { useStrings } from 'framework/strings'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import DialogExtention from '@connectors/common/ConnectorExtention/DialogExtention'
import { CONNECTOR_MODAL_MIN_WIDTH } from '@connectors/constants'

import CreateSecret from './steps/CreateSecret'
import InstallComponents from './steps/InstallComponents'

import css from './AutoStoppingModal.module.scss'

interface AutoStoppingModalProps {
  connector: ConnectorInfoDTO
  onClose: () => void
}

export const useAutoStoppingModal = ({ connector, onClose }: AutoStoppingModalProps) => {
  const { getString } = useStrings()

  const modalProps: IDialogProps = {
    isOpen: true,
    enforceFocus: false,
    style: {
      width: 'auto',
      minWidth: CONNECTOR_MODAL_MIN_WIDTH,
      minHeight: 640,
      borderLeft: 0,
      paddingBottom: 0,
      position: 'relative',
      overflow: 'auto'
    }
  }

  const [openModal, closeModal] = useModalHook(
    () => (
      <Dialog {...modalProps} onClose={closeModal} className={cx(css.modal, Classes.DIALOG)}>
        <DialogExtention>
          <StepWizard
            icon="autostopping"
            iconProps={{ size: 70 }}
            title={getString('ce.cloudIntegration.enableAutoStopping')}
            className={css.stepWizard}
          >
            <CreateSecret
              name={getString('ce.cloudIntegration.autoStoppingModal.createSecret.title')}
              connector={connector}
            />
            <InstallComponents
              name={getString('ce.cloudIntegration.autoStoppingModal.installComponents.title')}
              closeModal={() => {
                closeModal()
                onClose()
              }}
            />
          </StepWizard>
          <Button
            minimal
            icon="cross"
            iconProps={{ size: 18 }}
            onClick={
              /* istanbul ignore next */ () => {
                closeModal()
                onClose()
              }
            }
            className={css.crossIcon}
          />
        </DialogExtention>
      </Dialog>
    ),
    []
  )

  return [openModal, closeModal]
}
