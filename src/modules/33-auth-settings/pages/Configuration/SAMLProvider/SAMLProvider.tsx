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
  Radio,
  Container,
  Collapse,
  Card,
  Text,
  Button,
  Popover,
  ButtonVariation,
  Utils,
  useConfirmationDialog
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Menu, MenuItem } from '@blueprintjs/core'
import { useToaster } from '@common/components'
import { useStrings, String } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import type { AuthenticationSettingsResponse, SAMLSettings } from 'services/cd-ng'
import { useDeleteSamlMetaData, useUpdateAuthMechanism, useGetSamlLoginTest } from 'services/cd-ng'
import { useSAMLProviderModal } from '@auth-settings/modals/SAMLProvider/useSAMLProvider'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { PermissionRequest } from '@auth-settings/pages/Configuration/Authentication'
import { useFeature } from '@common/hooks/useFeatures'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { FeatureWarningTooltip } from '@common/components/FeatureWarning/FeatureWarningWithTooltip'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { AuthenticationMechanisms } from '@rbac/utils/utils'
import css from './SAMLProvider.module.scss'
import cssConfiguration from '@auth-settings/pages/Configuration/Configuration.module.scss'

interface Props {
  authSettings: AuthenticationSettingsResponse
  refetchAuthSettings: () => void
  permissionRequest: PermissionRequest
  canEdit: boolean
  setUpdating: Dispatch<SetStateAction<boolean>>
}

const SAMLProvider: React.FC<Props> = ({
  authSettings,
  refetchAuthSettings,
  permissionRequest,
  canEdit,
  setUpdating
}) => {
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { accountId } = useParams<AccountPathProps>()
  const [childWindow, setChildWindow] = React.useState<Window | null>(null)
  const samlEnabled = authSettings.authenticationMechanism === AuthenticationMechanisms.SAML
  const samlSettings = authSettings.ngAuthSettings?.find(
    settings => settings.settingsType === AuthenticationMechanisms.SAML
  ) as SAMLSettings | undefined
  const { PL_ENABLE_JIT_USER_PROVISION } = useFeatureFlags()
  const { enabled: featureEnabled } = useFeature({
    featureRequest: {
      featureName: FeatureIdentifier.SAML_SUPPORT
    }
  })
  const onSuccess = (): void => {
    refetchAuthSettings()
  }

  const { openSAMlProvider } = useSAMLProviderModal({ onSuccess })

  const {
    data: samlLoginTestData,
    loading: fetchingSamlLoginTestData,
    error: samlLoginTestDataError,
    refetch: getSamlLoginTestData
  } = useGetSamlLoginTest({
    queryParams: {
      accountId: accountId
    },
    lazy: true
  })

  const { mutate: deleteSamlSettings, loading: deletingSamlSettings } = useDeleteSamlMetaData({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: updateAuthMechanismToSaml, loading: updatingAuthMechanismToSaml } = useUpdateAuthMechanism({
    queryParams: {
      accountIdentifier: accountId,
      authenticationMechanism: AuthenticationMechanisms.SAML
    }
  })

  React.useEffect(() => {
    setUpdating(updatingAuthMechanismToSaml || deletingSamlSettings)
  }, [updatingAuthMechanismToSaml, deletingSamlSettings, setUpdating])

  const { openDialog: confirmSamlSettingsDelete } = useConfirmationDialog({
    titleText: getString('authSettings.deleteSamlProvider'),
    contentText: (
      <String
        stringID="authSettings.deleteSamlProviderDescription"
        useRichText={true}
        vars={{ displayName: samlSettings?.displayName }}
      />
    ),
    confirmButtonText: getString('confirm'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async isConfirmed => {
      /* istanbul ignore else */ if (isConfirmed) {
        try {
          const deleted = await deleteSamlSettings('' as any)
          /* istanbul ignore else */ if (deleted) {
            refetchAuthSettings()
            showSuccess(getString('authSettings.samlProviderDeleted'), 5000)
          }
        } catch (e) {
          /* istanbul ignore next */ showError(getRBACErrorMessage(e), 5000)
        }
      }
    }
  })

  const testSamlProvider = async (): Promise<void> => {
    if (samlLoginTestData?.resource?.ssorequest?.idpRedirectUrl) {
      localStorage.setItem('samlTestResponse', 'testing')
      const win = window.open(samlLoginTestData.resource.ssorequest.idpRedirectUrl)
      const localStorageUpdate = (): void => {
        const samlTestResponse = localStorage.getItem('samlTestResponse')
        /* istanbul ignore else */ if (samlTestResponse === 'true' || samlTestResponse === 'false') {
          if (samlTestResponse === 'true') {
            showSuccess(getString('authSettings.samlTestSuccessful'), 5000)
          } else {
            showError(getString('authSettings.samlTestFailed'), 5000)
          }
          win?.close()
          setChildWindow(null)
          localStorage.removeItem('samlTestResponse')
          window.removeEventListener('storage', localStorageUpdate)
        }
      }
      window.addEventListener('storage', localStorageUpdate)
      win?.focus()
      setChildWindow(win)
    } else {
      /* istanbul ignore next */ showError(samlLoginTestDataError?.message, 5000)
    }
  }

  React.useEffect(() => {
    /* istanbul ignore else */ if (samlLoginTestData || samlLoginTestDataError) {
      testSamlProvider()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [samlLoginTestData, samlLoginTestDataError])

  const { openDialog: enableSamlProvide } = useConfirmationDialog({
    titleText: getString('authSettings.enableSamlProvider'),
    contentText: getString('authSettings.enableSamlProviderDescription'),
    confirmButtonText: getString('confirm'),
    customButtons: (
      <Container flex width="100%">
        <Button
          className={css.leftMarginAuto}
          variation={ButtonVariation.SECONDARY}
          text={getString('test')}
          disabled={!!childWindow || fetchingSamlLoginTestData}
          onClick={() => {
            getSamlLoginTestData()
          }}
        />
      </Container>
    ),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async isConfirmed => {
      if (isConfirmed) {
        try {
          const response = await updateAuthMechanismToSaml(undefined)

          /* istanbul ignore else */ if (response) {
            refetchAuthSettings()
            showSuccess(getString('authSettings.samlLoginEnabled'), 5000)
          }
        } catch (e) {
          /* istanbul ignore next */ showError(getRBACErrorMessage(e), 5000)
        }
      }
    }
  })

  return (
    <Container margin="xlarge" background={Color.WHITE}>
      {samlSettings ? (
        <Collapse
          isOpen={samlEnabled && featureEnabled}
          collapseHeaderClassName={cx(cssConfiguration.collapseHeaderClassName, cssConfiguration.height60)}
          collapseClassName={cssConfiguration.collapseClassName}
          collapsedIcon="main-chevron-down"
          expandedIcon="main-chevron-up"
          heading={
            <Utils.WrapOptionalTooltip
              tooltip={
                !featureEnabled ? <FeatureWarningTooltip featureName={FeatureIdentifier.SAML_SUPPORT} /> : undefined
              }
            >
              <Container margin={{ left: 'xlarge' }}>
                <Radio
                  checked={samlEnabled}
                  font={{ weight: 'bold', size: 'normal' }}
                  color={Color.GREY_900}
                  label={getString('authSettings.loginViaSAML')}
                  onChange={enableSamlProvide}
                  disabled={!featureEnabled || !canEdit || updatingAuthMechanismToSaml}
                />
              </Container>
            </Utils.WrapOptionalTooltip>
          }
        >
          <Container padding={{ bottom: 'large' }}>
            <Card className={css.card}>
              <Text color={Color.GREY_800} font={{ weight: 'bold' }} width="25%">
                {samlSettings.displayName}
              </Text>
              <Text color={Color.GREY_800} width="45%">
                {samlSettings.authorizationEnabled ? (
                  <span>
                    {getString('authSettings.authorizationEnabledFor')}
                    <Text font={{ weight: 'semi-bold' }} color={Color.GREY_800} inline>
                      {samlSettings.groupMembershipAttr}
                    </Text>
                  </span>
                ) : (
                  getString('authSettings.authorizationNotEnabled')
                )}
              </Text>
              <Text color={Color.GREY_800} width="30%">
                {PL_ENABLE_JIT_USER_PROVISION && (
                  <>
                    {`${getString('authSettings.jitProvisioning')}: `}
                    <Text font={{ weight: 'semi-bold' }} color={Color.GREY_800} inline>
                      {samlSettings.jitEnabled ? getString('enabledLabel') : getString('common.disabled')}
                    </Text>
                  </>
                )}
              </Text>
              <Button
                text={getString('test')}
                variation={ButtonVariation.SECONDARY}
                disabled={!!childWindow || fetchingSamlLoginTestData}
                onClick={() => {
                  getSamlLoginTestData()
                }}
              />
              <Popover
                interactionKind="click"
                position="left-top"
                content={
                  <Menu>
                    <MenuItem
                      text={getString('edit')}
                      onClick={() => openSAMlProvider(samlSettings)}
                      disabled={!canEdit}
                    />
                    <RbacMenuItem
                      text={getString('delete')}
                      onClick={confirmSamlSettingsDelete}
                      permission={{
                        ...permissionRequest,
                        permission: PermissionIdentifier.DELETE_AUTHSETTING
                      }}
                      disabled={deletingSamlSettings}
                    />
                  </Menu>
                }
              >
                <Button minimal icon="Options" data-testid="provider-button" variation={ButtonVariation.ICON} />
              </Popover>
            </Card>
          </Container>
        </Collapse>
      ) : (
        <Utils.WrapOptionalTooltip
          tooltip={!featureEnabled ? <FeatureWarningTooltip featureName={FeatureIdentifier.SAML_SUPPORT} /> : undefined}
        >
          <Card className={css.cardWithRadioBtn}>
            <Container margin={{ left: 'xlarge', top: 'xsmall' }}>
              <Radio
                checked={samlEnabled}
                font={{ weight: 'semi-bold', size: 'normal' }}
                onClick={() => openSAMlProvider()}
                color={Color.PRIMARY_7}
                label={getString('authSettings.plusSAMLProvider')}
                disabled={!featureEnabled || !canEdit}
              />
            </Container>
          </Card>
        </Utils.WrapOptionalTooltip>
      )}
    </Container>
  )
}

export default SAMLProvider
