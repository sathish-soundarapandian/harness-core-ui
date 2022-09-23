/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { Dispatch, SetStateAction } from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { Radio, Container, Layout, Collapse, Text, useConfirmationDialog } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import type { AuthenticationSettingsResponse } from 'services/cd-ng'
import { useUpdateAuthMechanism } from 'services/cd-ng'
import { useToaster } from '@common/components'
import HarnessAccount from '@auth-settings/pages/Configuration/AccountAndOAuth/HarnessAccount/HarnessAccount'
import PublicOAuthProviders from '@auth-settings/pages/Configuration/AccountAndOAuth/OAuthProviders/PublicOAuthProviders'
import { getForgotPasswordURL } from 'framework/utils/SessionUtils'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { AuthenticationMechanisms } from '@rbac/utils/utils'
import cssConfiguration from '@auth-settings/pages/Configuration/Configuration.module.scss'

interface Props {
  authSettings: AuthenticationSettingsResponse
  refetchAuthSettings: () => void
  canEdit: boolean
  setUpdating: Dispatch<SetStateAction<boolean>>
}

const AccountAndOAuth: React.FC<Props> = ({ authSettings, refetchAuthSettings, canEdit, setUpdating }) => {
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { showSuccess, showError } = useToaster()
  const userPasswordOrOauthEnabled =
    authSettings.authenticationMechanism === AuthenticationMechanisms.USER_PASSWORD ||
    /* istanbul ignore next */ authSettings.authenticationMechanism === AuthenticationMechanisms.OAUTH

  const { mutate: updateAuthMechanism, loading: updatingAuthMechanism } = useUpdateAuthMechanism({})

  React.useEffect(() => {
    setUpdating(updatingAuthMechanism)
  }, [updatingAuthMechanism, setUpdating])

  const submitUserPasswordUpdate = async (
    authenticationMechanism: keyof typeof AuthenticationMechanisms,
    message: string
  ): Promise<void> => {
    try {
      const response = await updateAuthMechanism(undefined, {
        queryParams: {
          accountIdentifier: accountId,
          authenticationMechanism: authenticationMechanism
        }
      })

      /* istanbul ignore else */ if (response) {
        refetchAuthSettings()
        showSuccess(message, 5000)
      }
    } catch (e) {
      /* istanbul ignore next */ showError(getRBACErrorMessage(e), 5000)
    }
  }

  const { openDialog: enableAccountAndOauthLogin } = useConfirmationDialog({
    titleText: getString('authSettings.enableHarnessAccountOrOauthLogin'),
    contentText: (
      <React.Fragment>
        <Text color={Color.BLACK} padding={{ bottom: 'xlarge' }}>
          {getString('authSettings.changeLoginToHarnessAccountOrOauth')}
        </Text>
        <Text inline color={Color.BLACK} font={{ weight: 'semi-bold', size: 'normal' }}>
          {getString('common.note')}
        </Text>
        <Text inline color={Color.BLACK} font={{ size: 'normal' }}>
          : {getString('authSettings.changeLoginToHarnessAccountOrOauthDescription')}{' '}
        </Text>
        <a href={getForgotPasswordURL()} target="_blank" rel="noreferrer">
          {getString('common.link')}
        </a>
        .
      </React.Fragment>
    ),
    confirmButtonText: getString('confirm'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: isConfirmed => {
      /* istanbul ignore else */ if (isConfirmed) {
        submitUserPasswordUpdate(
          AuthenticationMechanisms.USER_PASSWORD,
          getString('authSettings.accountOrOAuthLoginEnabledSuccessfully')
        )
      }
    }
  })

  return (
    <Container margin="xlarge" background={Color.WHITE}>
      <Collapse
        isOpen={userPasswordOrOauthEnabled}
        collapseHeaderClassName={cx(cssConfiguration.collapseHeaderClassName, cssConfiguration.height60)}
        collapseClassName={cssConfiguration.collapseClassName}
        collapsedIcon="main-chevron-down"
        expandedIcon="main-chevron-up"
        heading={
          <Container margin={{ left: 'xlarge' }}>
            <Radio
              label={getString('authSettings.accountOrOAuthLogin')}
              font={{ weight: 'bold', size: 'normal' }}
              color={Color.GREY_900}
              checked={userPasswordOrOauthEnabled}
              disabled={!canEdit || updatingAuthMechanism}
              onChange={enableAccountAndOauthLogin}
            />
          </Container>
        }
      >
        <Layout.Vertical spacing="large" margin={{ left: 'xxlarge', right: 'xxlarge' }}>
          <HarnessAccount
            authSettings={authSettings}
            refetchAuthSettings={refetchAuthSettings}
            submitUserPasswordUpdate={submitUserPasswordUpdate}
            updatingAuthMechanism={updatingAuthMechanism}
            canEdit={canEdit}
            setUpdating={setUpdating}
          />
          <PublicOAuthProviders
            authSettings={authSettings}
            refetchAuthSettings={refetchAuthSettings}
            canEdit={canEdit}
            setUpdating={setUpdating}
          />
          <Container height={10} />
        </Layout.Vertical>
      </Collapse>
    </Container>
  )
}

export default AccountAndOAuth
