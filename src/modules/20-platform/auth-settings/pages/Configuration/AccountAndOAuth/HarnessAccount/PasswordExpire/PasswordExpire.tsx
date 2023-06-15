/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { Dispatch, SetStateAction } from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import {
  Layout,
  Text,
  Container,
  Switch,
  Collapse,
  Button,
  ButtonVariation,
  useConfirmationDialog
} from '@harness/uicore'
import { Color, Intent } from '@harness/design-system'
import type { LoginSettings } from 'services/cd-ng'
import { usePasswordExpirationModal } from '@auth-settings/modals/PasswordExpiration/usePasswordExpiration'
import { usePutLoginSettings } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/components'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import cssConfiguration from '@auth-settings/pages/Configuration/Configuration.module.scss'
import cssHarnessAccount from '@auth-settings/pages/Configuration/AccountAndOAuth/HarnessAccount/HarnessAccount.module.scss'

interface Props {
  loginSettings: LoginSettings
  refetchAuthSettings: () => void
  canEdit: boolean
  setUpdating: Dispatch<SetStateAction<boolean>>
}

const PasswordExpire: React.FC<Props> = ({ loginSettings, refetchAuthSettings, canEdit, setUpdating }) => {
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { showSuccess, showError } = useToaster()
  const passwordExpirationSettings = loginSettings.passwordExpirationPolicy

  const onSuccess = (): void => {
    refetchAuthSettings()
  }

  const { openPasswordExpirationModal } = usePasswordExpirationModal({
    onSuccess,
    loginSettings
  })

  const { mutate: updateLoginSettings, loading: updatingLoginSettings } = usePutLoginSettings({
    loginSettingsId: loginSettings.uuid,
    queryParams: {
      accountIdentifier: accountId
    }
  })

  React.useEffect(() => {
    setUpdating(updatingLoginSettings)
  }, [updatingLoginSettings, setUpdating])

  const { openDialog: confirmPasswordExpirySettings } = useConfirmationDialog({
    titleText: getString('authSettings.disablePasswordExpiration'),
    contentText: getString('authSettings.confirmDisablePasswordExpiration'),
    confirmButtonText: getString('confirm'),
    cancelButtonText: getString('cancel'),
    intent: Intent.WARNING,
    onCloseDialog: async isConfirmed => {
      /* istanbul ignore else */ if (isConfirmed) {
        try {
          const response = await updateLoginSettings({
            ...loginSettings,
            passwordExpirationPolicy: {
              ...passwordExpirationSettings,
              enabled: false
            }
          })

          /* istanbul ignore else */ if (response) {
            refetchAuthSettings()
            showSuccess(getString('authSettings.passwordExpirationDisabled'), 5000)
          }
        } catch (e) {
          /* istanbul ignore next */ showError(getRBACErrorMessage(e), 5000)
        }
      }
    }
  })

  const onChangePasswordExpiry = (e: React.FormEvent<HTMLInputElement>): void => {
    const enable = e.currentTarget.checked
    const currentState = passwordExpirationSettings.enabled

    if (!currentState && enable) {
      openPasswordExpirationModal(false)
      return
    }

    /* istanbul ignore else */ if (currentState && !enable) {
      confirmPasswordExpirySettings()
    }
  }

  const list = [
    {
      label: getString('authSettings.daysBeforePasswordExpires'),
      value: passwordExpirationSettings.daysBeforePasswordExpires
    },
    {
      label: getString('authSettings.daysBeforeUserNotified'),
      value: passwordExpirationSettings.daysBeforeUserNotifiedOfPasswordExpiration
    }
  ]

  return (
    <Collapse
      isOpen={passwordExpirationSettings.enabled}
      collapseHeaderClassName={cx(cssConfiguration.collapseHeaderClassName, cssHarnessAccount.collapseIcon)}
      collapseClassName={cssConfiguration.collapseClassName}
      collapsedIcon="main-chevron-down"
      expandedIcon="main-chevron-up"
      heading={
        <Switch
          label={getString('authSettings.periodicallyExpirePassword')}
          checked={passwordExpirationSettings.enabled}
          onChange={onChangePasswordExpiry}
          disabled={!canEdit || updatingLoginSettings}
          font={{ weight: 'semi-bold', size: 'normal' }}
          color={Color.GREY_800}
          data-testid="toggle-password-expire"
        />
      }
    >
      <Layout.Vertical
        spacing="small"
        padding={{ left: 'xxxlarge', top: 'medium', bottom: 'medium', right: 'medium' }}
        margin={{ bottom: 'large' }}
        className={cssHarnessAccount.passwordChecksDiv}
      >
        <div className={cssHarnessAccount.editIcon}>
          <Button
            variation={ButtonVariation.ICON}
            icon="Edit"
            onClick={() => openPasswordExpirationModal(true)}
            data-testid="update-password-expire-settings"
            disabled={!canEdit}
          />
        </div>
        <Text margin={{ bottom: 'xsmall' }} color={Color.BLACK}>
          {getString('authSettings.periodicallyExpirePasswordNote')}
        </Text>
        {list.map(({ label, value }) => (
          <Container flex={{ justifyContent: 'flex-start' }} key={label}>
            <Text color={Color.GREY_800} icon="dot">
              {label}:
            </Text>
            <Text color={Color.GREY_800} font={{ weight: 'bold' }} padding={{ left: 'xsmall' }}>
              {value}
            </Text>
          </Container>
        ))}
      </Layout.Vertical>
    </Collapse>
  )
}

export default PasswordExpire
