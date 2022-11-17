/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { Dispatch, SetStateAction } from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { Layout, Text, Switch, Collapse, Button, ButtonVariation, useConfirmationDialog } from '@harness/uicore'
import { Color, Intent } from '@harness/design-system'
import type { LoginSettings } from 'services/cd-ng'
import { useToaster } from '@common/components'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { usePasswordStrengthModal } from '@auth-settings/modals/PasswordStrength/usePasswordStrength'
import { usePutLoginSettings } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import cssConfiguration from '@auth-settings/pages/Configuration/Configuration.module.scss'
import cssHarnessAccount from '@auth-settings/pages/Configuration/AccountAndOAuth/HarnessAccount/HarnessAccount.module.scss'

interface Props {
  loginSettings: LoginSettings
  refetchAuthSettings: () => void
  canEdit: boolean
  setUpdating: Dispatch<SetStateAction<boolean>>
}

const PasswordStrength: React.FC<Props> = ({ loginSettings, refetchAuthSettings, canEdit, setUpdating }) => {
  const { accountId } = useParams<AccountPathProps>()
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const passwordStrengthSettings = loginSettings.passwordStrengthPolicy

  const onSuccess = (): void => {
    refetchAuthSettings()
  }

  const { openPasswordStrengthModal } = usePasswordStrengthModal({ onSuccess, loginSettings })

  const { mutate: updateLoginSettings, loading: updatingLoginSettings } = usePutLoginSettings({
    loginSettingsId: loginSettings.uuid,
    queryParams: {
      accountIdentifier: accountId
    }
  })

  React.useEffect(() => {
    setUpdating(updatingLoginSettings)
  }, [updatingLoginSettings, setUpdating])

  const { openDialog: confirmPasswordStrengthSettings } = useConfirmationDialog({
    titleText: getString('authSettings.disablePasswordStrength'),
    contentText: getString('authSettings.confirmDisablePasswordStrength'),
    confirmButtonText: getString('confirm'),
    cancelButtonText: getString('cancel'),
    intent: Intent.WARNING,
    onCloseDialog: async isConfirmed => {
      /* istanbul ignore else */ if (isConfirmed) {
        try {
          const response = await updateLoginSettings({
            ...loginSettings,
            passwordStrengthPolicy: {
              ...passwordStrengthSettings,
              enabled: false
            }
          })

          /* istanbul ignore else */ if (response) {
            refetchAuthSettings()
            showSuccess(getString('authSettings.passwordStrengthDisabled'), 5000)
          }
        } catch (e) {
          /* istanbul ignore next */ showError(getRBACErrorMessage(e), 5000)
        }
      }
    }
  })

  const onChangePasswordStrength = (e: React.FormEvent<HTMLInputElement>): void => {
    const enable = e.currentTarget.checked
    const currentState = passwordStrengthSettings.enabled

    if (!currentState && enable) {
      openPasswordStrengthModal(false)
      return
    }

    /* istanbul ignore else */ if (currentState && !enable) {
      confirmPasswordStrengthSettings()
    }
  }

  const list = [
    getString('authSettings.atLeastNChars', {
      minNumberOfCharacters: passwordStrengthSettings.minNumberOfCharacters
    }),
    passwordStrengthSettings.minNumberOfUppercaseCharacters
      ? getString('authSettings.haveOneUppercase')
      : /* istanbul ignore next */ '',
    passwordStrengthSettings.minNumberOfLowercaseCharacters
      ? getString('authSettings.haveOneLowercase')
      : /* istanbul ignore next */ '',
    passwordStrengthSettings.minNumberOfDigits ? getString('authSettings.haveOneDigit') : /* istanbul ignore next */ '',
    passwordStrengthSettings.minNumberOfSpecialCharacters
      ? getString('authSettings.haveOneSpecialChar')
      : /* istanbul ignore next */ ''
  ].filter(item => item)

  return (
    <Collapse
      isOpen={passwordStrengthSettings.enabled}
      collapseHeaderClassName={cx(cssConfiguration.collapseHeaderClassName, cssHarnessAccount.collapseIcon)}
      collapseClassName={cssConfiguration.collapseClassName}
      collapsedIcon="main-chevron-down"
      expandedIcon="main-chevron-up"
      heading={
        <Switch
          label={getString('authSettings.enforcePasswordStrength')}
          checked={passwordStrengthSettings.enabled}
          onChange={onChangePasswordStrength}
          disabled={!canEdit || updatingLoginSettings}
          font={{ weight: 'semi-bold', size: 'normal' }}
          color={Color.GREY_800}
          data-testid="toggle-password-strength"
        />
      }
    >
      <Layout.Vertical
        spacing="small"
        padding={{ left: 'xxxlarge', top: 'medium', bottom: 'medium' }}
        margin={{ bottom: 'large' }}
        className={cssHarnessAccount.passwordChecksDiv}
      >
        <div className={cssHarnessAccount.editIcon}>
          <Button
            variation={ButtonVariation.ICON}
            icon="Edit"
            onClick={() => openPasswordStrengthModal(true)}
            data-testid="updatePasswordSettings"
            disabled={!canEdit}
          />
        </div>
        <Text margin={{ bottom: 'xsmall' }} color={Color.BLACK}>
          {getString('authSettings.passwordMustFulfillReq')}
        </Text>
        {list.map(listItem => (
          <Text color={Color.GREY_800} icon="dot" key={listItem}>
            {listItem}
          </Text>
        ))}
      </Layout.Vertical>
    </Collapse>
  )
}

export default PasswordStrength
