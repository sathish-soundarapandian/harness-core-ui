/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { Dispatch, SetStateAction } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { Card, Text, useConfirmationDialog } from '@harness/uicore'
import { Color, Intent } from '@harness/design-system'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useToaster } from '@common/components'
import { useSetTwoFactorAuthAtAccountLevel } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import FeatureSwitch from '@rbac/components/Switch/Switch'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import css from './TwoFactorAuthentication.module.scss'

interface Props {
  twoFactorEnabled: boolean
  onSuccess: () => void
  canEdit: boolean
  setUpdating: Dispatch<SetStateAction<boolean>>
}

const TwoFactorAuthentication: React.FC<Props> = ({ twoFactorEnabled, onSuccess, canEdit, setUpdating }) => {
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const history = useHistory()
  const { currentUserInfo } = useAppStore()
  const { showSuccess, showError } = useToaster()

  const { mutate: updateTwoFactorAuthentication, loading: updatingTwoFactorAuthentication } =
    useSetTwoFactorAuthAtAccountLevel({
      queryParams: {
        accountIdentifier: accountId
      }
    })

  React.useEffect(() => {
    setUpdating(updatingTwoFactorAuthentication)
  }, [updatingTwoFactorAuthentication, setUpdating])

  const submitUpdateTwoFactorAuthentication = async (
    adminOverrideTwoFactorEnabled: boolean,
    message: string
  ): Promise<void> => {
    try {
      const response = await updateTwoFactorAuthentication({
        adminOverrideTwoFactorEnabled
      })

      /* istanbul ignore else */ if (response) {
        onSuccess()
        showSuccess(message, 5000)
      }
    } catch (e) {
      /* istanbul ignore next */ showError(getRBACErrorMessage(e), 5000)
    }
  }

  const { openDialog: confirmRedirect } = useConfirmationDialog({
    titleText: getString('authSettings.enforceTwoFA'),
    contentText: getString('authSettings.yourAccountWillBeLockedOut'),
    confirmButtonText: getString('authSettings.goToSettings'),
    cancelButtonText: getString('cancel'),
    intent: Intent.WARNING,
    onCloseDialog: isConfirmed => {
      /* istanbul ignore else */ if (isConfirmed) {
        history.push({
          pathname: routes.toUserProfile({ accountId }),
          search: 'openTwoFactorModal=true'
        })
      }
    }
  })

  const { openDialog: confirm2FAEnable } = useConfirmationDialog({
    titleText: getString('authSettings.enforceTwoFA'),
    contentText: (
      <React.Fragment>
        <Text color={Color.BLACK}>{getString('authSettings.doYouWantToEnforceTwoFAForAllMembers')}</Text>
        <ol type="1" className={css.listItem}>
          <li>{getString('authSettings.newMembersWillNeedToSetUpTwoFADuringSignup')}</li>
          <li>{getString('authSettings.existingMembersWillReceiveAnEmailWithQRCode')}</li>
        </ol>
      </React.Fragment>
    ),
    confirmButtonText: getString('confirm'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: isConfirmed => {
      /* istanbul ignore else */ if (isConfirmed) {
        submitUpdateTwoFactorAuthentication(true, getString('authSettings.twoFAEnforcementEnabled'))
      }
    }
  })

  const { openDialog: confirm2FADisable } = useConfirmationDialog({
    titleText: getString('authSettings.disableTwoFAEnforcement'),
    contentText: getString('authSettings.sureToDisableTwoFAEnforcement'),
    confirmButtonText: getString('confirm'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: isConfirmed => {
      /* istanbul ignore else */ if (isConfirmed) {
        submitUpdateTwoFactorAuthentication(false, getString('authSettings.twoFAEnforcementDisabled'))
      }
    }
  })

  const onChange2FASetting = (e: React.FormEvent<HTMLInputElement>): void => {
    const enable = e.currentTarget.checked
    const isTwoFactorAuthEnabledForCurrentUser = currentUserInfo.twoFactorAuthenticationEnabled

    if (!twoFactorEnabled && !isTwoFactorAuthEnabledForCurrentUser && enable) {
      confirmRedirect()
      return
    }

    if (!twoFactorEnabled && isTwoFactorAuthEnabledForCurrentUser && enable) {
      confirm2FAEnable()
      return
    }

    /* istanbul ignore else */ if (twoFactorEnabled && !enable) {
      confirm2FADisable()
    }
  }

  return (
    <Card className={css.twoFactorAuthentication}>
      <FeatureSwitch
        featureProps={{ featureRequest: { featureName: FeatureIdentifier.TWO_FACTOR_AUTH_SUPPORT } }}
        label={getString('authSettings.enforceTwoFA')}
        checked={twoFactorEnabled}
        font={{ weight: 'semi-bold', size: 'normal' }}
        color={Color.GREY_800}
        onChange={onChange2FASetting}
        disabled={!canEdit || updatingTwoFactorAuthentication}
        data-testid="twoFA-toggle"
      />
    </Card>
  )
}

export default TwoFactorAuthentication
