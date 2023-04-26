/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React from 'react'
import { Button, Layout, Text, shouldShowError, useConfirmationDialog } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useDisableTwoFactorAuth } from 'services/cd-ng'
import { useToaster } from '@common/exports'
import { useQueryParams } from '@common/hooks'
import { useEnableTwoFactorAuthModal } from '@user-profile/modals/EnableTwoFactorAuth/useEnableTwoFactorAuthModal'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import FeatureSwitch from '@rbac/components/Switch/Switch'
import css from './TwoFactorAuthentication.module.scss'

interface Props {
  twoFactorAuthenticationDisabled: boolean
}

const TwoFactorAuthentication: React.FC<Props> = ({ twoFactorAuthenticationDisabled }) => {
  const { getString } = useStrings()
  const { openTwoFactorModal } = useQueryParams<{ openTwoFactorModal?: string }>()
  const { showSuccess, showError } = useToaster()
  const { currentUserInfo, updateAppStore } = useAppStore()
  const { mutate: disableTwoFactorAuth } = useDisableTwoFactorAuth({})

  const { openEnableTwoFactorAuthModal } = useEnableTwoFactorAuthModal()

  const { openDialog: disableTwoFactorAuthDialog } = useConfirmationDialog({
    titleText: getString('userProfile.twoFactor.disableTitle'),
    contentText: getString('userProfile.twoFactor.disableText'),
    confirmButtonText: getString('common.disable'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async (isConfirmed: boolean) => {
      /* istanbul ignore else */ if (isConfirmed) {
        try {
          const disabled = await disableTwoFactorAuth('' as any, { headers: { 'content-type': 'application/json' } })
          /* istanbul ignore else */ if (disabled) {
            showSuccess(getString('userProfile.twoFactor.disableSuccess'))
            updateAppStore({ currentUserInfo: disabled.data })
          }
        } catch (e) {
          /* istanbul ignore next */ if (shouldShowError(e)) {
            showError(e.data.message || e.message)
          }
        }
      }
    }
  })

  React.useEffect(() => {
    /* istanbul ignore else */ if (openTwoFactorModal === 'true') {
      openEnableTwoFactorAuthModal(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openTwoFactorModal])

  return (
    <>
      <Layout.Horizontal spacing="small" className={css.twoFactorAuth}>
        <FeatureSwitch
          featureProps={{ featureRequest: { featureName: FeatureIdentifier.TWO_FACTOR_AUTH_SUPPORT } }}
          className={css.switch}
          data-testid={'TwoFactorAuthSwitch'}
          checked={currentUserInfo.twoFactorAuthenticationEnabled}
          disabled={twoFactorAuthenticationDisabled}
          onChange={event => {
            if (event.currentTarget.checked) {
              openEnableTwoFactorAuthModal(false)
            } else {
              disableTwoFactorAuthDialog()
            }
          }}
        />
        <Text color={Color.BLACK} font={{ weight: 'semi-bold' }}>
          {getString('userProfile.twofactorAuth')}
        </Text>
      </Layout.Horizontal>

      {currentUserInfo.twoFactorAuthenticationEnabled ? (
        <Button icon="reset" minimal onClick={() => openEnableTwoFactorAuthModal(true)} />
      ) : null}
    </>
  )
}

export default TwoFactorAuthentication
