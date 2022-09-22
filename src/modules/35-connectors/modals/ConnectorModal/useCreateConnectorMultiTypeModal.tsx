/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Button, Text, Card, Icon, Layout } from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import cx from 'classnames'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { useStrings } from 'framework/strings'
import type { IGitContextFormProps } from '@common/components/GitContextForm/GitContextForm'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, StageActions } from '@common/constants/TrackingConstants'
import useCreateConnectorModal, { ConnectorModaldata, UseCreateConnectorModalProps } from './useCreateConnectorModal'
import wizardCss from '../../components/CreateConnectorWizard/CreateConnectorWizard.module.scss'
import css from './useCreateConnectorMultiTypeModal.module.scss'
export interface UseCreateConnectorMultiTypeModalProps {
  types: ConnectorInfoDTO['type'][]
  onSuccess?: UseCreateConnectorModalProps['onSuccess']
  onClose?: () => void
}

export interface UseCreateConnectorMultiTypeModalReturn {
  openConnectorMultiTypeModal: (connector?: ConnectorModaldata) => void
  hideConnectorMultiTypeModal: () => void
}

const modalProps: IDialogProps = {
  isOpen: true,
  enforceFocus: false,
  style: {
    width: 1175,
    minHeight: 640,
    borderLeft: 0,
    paddingBottom: 0,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#0278D5',
    padding: '150px 140px',
    justifyContent: 'center'
  }
}

const useCreateConnectorMultiTypeModal = (
  props: UseCreateConnectorMultiTypeModalProps
): UseCreateConnectorMultiTypeModalReturn => {
  const { getString } = useStrings()
  const [gitDetails, setGitDetails] = useState<IGitContextFormProps | undefined>()

  const handleClose = (): void => {
    props.onClose?.()
    hideModal()
  }

  const { openConnectorModal } = useCreateConnectorModal({
    onSuccess: props.onSuccess,
    onClose: handleClose
  })

  const handleSelect = (type: ConnectorInfoDTO['type']): void => {
    hideModal()
    openConnectorModal(false, type, { gitDetails: gitDetails })
    trackEvent(StageActions.SelectConnectorType, {
      category: Category.STAGE,
      type
    })
  }
  const { trackEvent } = useTelemetry()
  React.useEffect(() => {
    trackEvent(StageActions.LoadSelectConnectorTypeView, {
      category: Category.STAGE
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog {...modalProps} className={css.modal}>
        <Text font={{ size: 'large', weight: 'semi-bold' }} color="white" margin={{ bottom: 'small' }}>
          Select your Connector type
        </Text>
        <Text font={{ size: 'normal', weight: 'semi-bold' }} color="white" margin={{ bottom: 'xxlarge' }}>
          Start by selecting your connector type
        </Text>
        <Layout.Horizontal spacing="medium" className={css.cardsWrapper}>
          {props.types.map(type => (
            <div key={type} className={css.card}>
              <Card interactive={true} elevation={0} selected={false} onClick={() => handleSelect(type)}>
                <Icon name={getConnectorIconByType(type)} size={20} />
              </Card>
              <Text
                color="white"
                margin={{ top: 'small' }}
                style={{ textAlign: 'center', width: 90, overflowWrap: 'normal', wordBreak: 'keep-all' }}
              >
                {getString(getConnectorTitleIdByType(type))}
              </Text>
            </div>
          ))}
        </Layout.Horizontal>
        <Button
          className={cx(wizardCss.crossIcon, css.white)}
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={handleClose}
        />
      </Dialog>
    ),
    [props.types]
  )

  return {
    openConnectorMultiTypeModal: (connector?: ConnectorModaldata) => {
      setGitDetails(connector?.gitDetails)
      showModal()
    },
    hideConnectorMultiTypeModal: hideModal
  }
}

export default useCreateConnectorMultiTypeModal
