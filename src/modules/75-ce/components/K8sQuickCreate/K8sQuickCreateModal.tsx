/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useModalHook } from '@harness/use-modal'
import { Button, StepWizard, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Classes, IDialogProps, Dialog } from '@blueprintjs/core'
import cx from 'classnames'

import { useStrings } from 'framework/strings'
import { CONNECTOR_MODAL_MIN_WIDTH } from '@connectors/constants'
import DialogExtention from '@connectors/common/ConnectorExtention/DialogExtention'

import Overview from './steps/Overview'
import DownloadYaml from './steps/DownloadYaml'
import TestConnection from './steps/TestConnection'

import css from './K8sQuickCreateModal.module.scss'

interface UseK8sQuickCreateModalProps {
  onClose: () => void
}

const useK8sQuickCreateModal = ({ onClose }: UseK8sQuickCreateModalProps) => {
  const { getString } = useStrings()

  const modalProps: IDialogProps = {
    isOpen: true,
    enforceFocus: false,
    style: {
      width: 'auto',
      minWidth: CONNECTOR_MODAL_MIN_WIDTH,
      minHeight: 680,
      borderLeft: 0,
      paddingBottom: 0,
      position: 'relative',
      overflow: 'auto'
    }
  }

  const handleClose = /* istanbul ignore next */ (): void => {
    onClose()
    closeModal()
  }

  const [openModal, closeModal] = useModalHook(
    () => (
      <Dialog {...modalProps} onClose={closeModal} className={cx(css.modal, Classes.DIALOG)}>
        <DialogExtention>
          <StepWizard
            icon="step-kubernetes"
            iconProps={{ size: 50 }}
            title={
              <div className={css.titleCtn}>
                <Text color={Color.GREY_100} font={{ variation: FontVariation.H4 }}>
                  {getString('pipelineSteps.kubernetesInfraStep.kubernetesConnector')}
                </Text>
                <Text
                  icon="upgrade-bolt"
                  color={Color.GREY_100}
                  font={{ variation: FontVariation.SMALL_SEMI }}
                  style={{ opacity: 0.6 }}
                >
                  {getString('ce.k8sQuickCreate.quickCreate')}
                </Text>
              </div>
            }
            className={css.stepWizard}
          >
            <Overview name={getString('overview')} />
            <DownloadYaml name={getString('ce.k8sQuickCreate.downloadAndApplyYaml')} />
            <TestConnection name={getString('ce.k8sQuickCreate.createAndTest')} closeModal={handleClose} />
          </StepWizard>
        </DialogExtention>
        <Button minimal icon="cross" iconProps={{ size: 18 }} onClick={handleClose} className={css.crossIcon} />
      </Dialog>
    ),
    []
  )

  return [openModal, closeModal]
}

export default useK8sQuickCreateModal
