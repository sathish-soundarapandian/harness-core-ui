/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { Dispatch, SetStateAction } from 'react'
import { useParams } from 'react-router-dom'
import { Collapse, Text, Container, Card, Switch, useConfirmationDialog } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useToaster } from '@common/components'
import { useStrings } from 'framework/strings'
import type { AuthenticationSettingsResponse, OAuthSettings } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useUpdateOauthProviders, useUpdateAuthMechanism, useRemoveOauthMechanism } from 'services/cd-ng'
import { OAuthProviders, Providers } from '@common/constants/OAuthProviders'
import { useFeature } from '@common/hooks/useFeatures'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import FeatureSwitch from '@rbac/components/Switch/Switch'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { AuthenticationMechanisms } from '@rbac/utils/utils'
import css from './PublicOAuthProviders.module.scss'
import cssConfiguration from '@auth-settings/pages/Configuration/Configuration.module.scss'

interface Props {
  authSettings: AuthenticationSettingsResponse
  refetchAuthSettings: () => void
  canEdit: boolean
  setUpdating: Dispatch<SetStateAction<boolean>>
}

const PublicOAuthProviders: React.FC<Props> = ({ authSettings, refetchAuthSettings, canEdit, setUpdating }) => {
  const { accountId } = useParams<AccountPathProps>()
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const { showError, showSuccess, showWarning } = useToaster()

  const { enabled: featureEnabled } = useFeature({
    featureRequest: {
      featureName: FeatureIdentifier.OAUTH_SUPPORT
    }
  })
  const samlOrLdapSettings = authSettings.ngAuthSettings?.find(
    settings =>
      settings.settingsType === AuthenticationMechanisms.SAML || settings.settingsType === AuthenticationMechanisms.LDAP
  )

  const oauthSettings: OAuthSettings | undefined = authSettings.ngAuthSettings?.find(
    settings => settings.settingsType === AuthenticationMechanisms.OAUTH
  )

  const oauthEnabled =
    !!oauthSettings &&
    (authSettings.authenticationMechanism === AuthenticationMechanisms.USER_PASSWORD ||
      authSettings.authenticationMechanism === AuthenticationMechanisms.OAUTH) &&
    !samlOrLdapSettings

  const { mutate: updateOAuthProviders, loading: updatingOauthProviders } = useUpdateOauthProviders({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: deleteOAuthProviders, loading: deletingOauthProviders } = useRemoveOauthMechanism({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: updateAuthMechanism, loading: updatingAuthMechanism } = useUpdateAuthMechanism({})

  React.useEffect(() => {
    setUpdating(updatingOauthProviders || deletingOauthProviders || updatingAuthMechanism)
  }, [updatingOauthProviders, deletingOauthProviders, updatingAuthMechanism, setUpdating])

  const { openDialog: confirmOAuthDisable } = useConfirmationDialog({
    titleText: getString('authSettings.disableOAuthLogin'),
    contentText: getString('authSettings.confirmDisableOAuthLogin'),
    confirmButtonText: getString('confirm'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async isConfirmed => {
      /* istanbul ignore else */ if (isConfirmed) {
        try {
          const response = await updateAuthMechanism(undefined, {
            queryParams: {
              accountIdentifier: accountId,
              authenticationMechanism: AuthenticationMechanisms.USER_PASSWORD
            }
          })

          /* istanbul ignore else */ if (response) {
            try {
              const deleted = await deleteOAuthProviders('' as any)

              /* istanbul ignore else */ if (deleted) {
                refetchAuthSettings()
                showSuccess(getString('authSettings.publicOAuthLoginDisabled'), 5000)
              }
            } catch (e) {
              /* istanbul ignore next */ showError(getRBACErrorMessage(e), 5000)
            }
          }
        } catch (e) {
          /* istanbul ignore next */ showError(getRBACErrorMessage(e), 5000)
        }
      }
    }
  })

  const toggleOAuthProviders = async (e: React.FormEvent<HTMLInputElement>): Promise<void> => {
    const enable = e.currentTarget.checked

    if (samlOrLdapSettings) {
      showWarning(getString('authSettings.pleaseRemoveSAMLOrLDAPToEnableOauth'))
      return
    }

    if (!oauthEnabled && enable) {
      try {
        const response = await updateOAuthProviders({
          allowedProviders: OAuthProviders.map(provider => provider.type) as Providers[],
          settingsType: AuthenticationMechanisms.OAUTH
        })
        /* istanbul ignore else */ if (response) {
          try {
            const authMechanismUpdated = await updateAuthMechanism(undefined, {
              queryParams: {
                accountIdentifier: accountId,
                authenticationMechanism: AuthenticationMechanisms.OAUTH
              }
            })

            /* istanbul ignore else */ if (authMechanismUpdated) {
              refetchAuthSettings()
              showSuccess(getString('authSettings.publicOAuthLoginEnabled'), 5000)
            }
          } catch (err) {
            /* istanbul ignore next */ showError(getRBACErrorMessage(err), 5000)
          }
        }
      } catch (err) {
        /* istanbul ignore next */ showError(getRBACErrorMessage(err), 5000)
      }
    } /* istanbul ignore else */ else if (oauthEnabled && !enable) {
      confirmOAuthDisable()
    }
  }

  const handleOAuthChange = async (e: React.FormEvent<HTMLInputElement>): Promise<void> => {
    const { value, checked } = e.currentTarget

    if (oauthSettings?.allowedProviders?.length === 1 && !checked) {
      showWarning(getString('authSettings.keepAtLeastOneProviderEnabled'))
      return
    }

    let allowedProviders: Providers[]

    if (oauthSettings?.allowedProviders?.includes(value as Providers)) {
      allowedProviders = oauthSettings.allowedProviders.filter(provider => provider !== value)
    } else {
      allowedProviders = [...(oauthSettings?.allowedProviders || []), value as Providers]
    }

    try {
      const response = await updateOAuthProviders({
        allowedProviders,
        settingsType: AuthenticationMechanisms.OAUTH
      })

      /* istanbul ignore else */ if (response) {
        refetchAuthSettings()
        showSuccess(getString('authSettings.oauthSettingsHaveBeenUpdated'), 5000)
      }
    } catch (err) {
      /* istanbul ignore next */ showError(getRBACErrorMessage(err), 5000)
    }
  }

  const loading = updatingOauthProviders || updatingAuthMechanism || deletingOauthProviders

  return (
    <Collapse
      isOpen={oauthEnabled && featureEnabled}
      collapseHeaderClassName={cssConfiguration.collapseHeaderClassName}
      collapseClassName={cssConfiguration.collapseClassName}
      collapsedIcon="main-chevron-down"
      expandedIcon="main-chevron-up"
      heading={
        <FeatureSwitch
          featureProps={{ featureRequest: { featureName: FeatureIdentifier.OAUTH_SUPPORT } }}
          label={getString('authSettings.usePublicOAuth')}
          font={{ weight: 'semi-bold', size: 'normal' }}
          color={Color.GREY_800}
          checked={oauthEnabled}
          onChange={toggleOAuthProviders}
          disabled={
            !featureEnabled ||
            !canEdit ||
            loading ||
            authSettings.authenticationMechanism === AuthenticationMechanisms.SAML
          }
          data-testid="toggle-oauth-providers"
        />
      }
    >
      {oauthSettings && (
        <Container className={css.container} margin={{ bottom: 'large' }}>
          {OAuthProviders.sort((a, b) => a.name.localeCompare(b.name)).map(provider => {
            return (
              <Card key={provider.type} className={css.card}>
                <Switch
                  labelElement={
                    <Text icon={provider.iconName} iconProps={{ size: 25 }} color={Color.BLACK}>
                      {provider.name}
                    </Text>
                  }
                  value={provider.type}
                  checked={oauthSettings?.allowedProviders?.includes(provider.type as Providers)}
                  onChange={handleOAuthChange}
                  disabled={!featureEnabled || !canEdit || loading}
                  className={css.switch}
                  data-testid={`toggle-oauth-${provider.type.toLowerCase()}`}
                />
              </Card>
            )
          })}
        </Container>
      )}
    </Collapse>
  )
}

export default PublicOAuthProviders
