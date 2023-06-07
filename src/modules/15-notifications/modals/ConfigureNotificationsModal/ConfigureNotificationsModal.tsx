/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button } from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'
import { Dialog } from '@blueprintjs/core'

import {
  NotificationType,
  EmailNotificationConfiguration,
  SlackNotificationConfiguration,
  PagerDutyNotificationConfiguration,
  MSTeamsNotificationConfiguration
} from '@notifications/interfaces/Notifications'

import ConfigureEmailNotifications from './views/ConfigureEmailNotifications/ConfigureEmailNotifications'
import ConfigureSlackNotifications from './views/ConfigureSlackNotifications/ConfigureSlackNotifications'
import ConfigurePagerDutyNotifications from './views/ConfigurePagerDutyNotifications/ConfigurePagerDutyNotifications'
import ConfigureMSTeamsNotifications from './views/ConfigureMSTeamsNotifications/ConfigureMSTeamsNotifications'

import css from './ConfigureNotificationsModal.module.scss'

type FormSuccess = (
  notificationConfiguration:
    | EmailNotificationConfiguration
    | SlackNotificationConfiguration
    | PagerDutyNotificationConfiguration
    | MSTeamsNotificationConfiguration
) => void

export interface UseConfigureNotificationsModalProps {
  type: NotificationType
  onSuccess: FormSuccess
}

export interface UseConfigureNotificationsModalReturn {
  showModal: () => void
  hideModal: () => void
}

interface ModalBodyProps {
  type: NotificationType
  onSuccess: FormSuccess
  hideModal: () => void
}

const ModalBody: React.FC<ModalBodyProps> = ({ type, onSuccess, hideModal }) => {
  switch (type) {
    case NotificationType.Email:
      return <ConfigureEmailNotifications onSuccess={onSuccess} hideModal={hideModal} />
    case NotificationType.Slack:
      return <ConfigureSlackNotifications onSuccess={onSuccess} hideModal={hideModal} />
    case NotificationType.PagerDuty:
      return <ConfigurePagerDutyNotifications onSuccess={onSuccess} hideModal={hideModal} />
    case NotificationType.MsTeams:
      return <ConfigureMSTeamsNotifications onSuccess={onSuccess} hideModal={hideModal} />
    default:
      return null
  }
}

const useConfigureNotificationsModal = (
  props: UseConfigureNotificationsModalProps
): UseConfigureNotificationsModalReturn => {
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={() => {
          hideModal()
        }}
        className={css.dialog}
      >
        <ModalBody type={props.type} onSuccess={props.onSuccess} hideModal={hideModal} />
        <Button minimal icon="cross" iconProps={{ size: 18 }} onClick={hideModal} className={css.crossIcon} />
      </Dialog>
    ),
    []
  )

  return {
    showModal,
    hideModal
  }
}

export default useConfigureNotificationsModal
