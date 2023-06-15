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
  useConfirmationDialog,
  Layout,
  Icon,
  Switch,
  IconName
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Menu, MenuItem } from '@blueprintjs/core'
import { isNull, omitBy } from 'lodash-es'
import { useToaster } from '@common/components'
import { useStrings, String } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import {
  AuthenticationSettingsResponse,
  SAMLSettings,
  useEnableDisableAuthenticationForSAMLSetting,
  useUpdateAuthMechanism,
  useDeleteSamlMetaDataForSamlSSOId,
  useGetSamlLoginTestV2
} from 'services/cd-ng'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { PermissionRequest } from '@auth-settings/pages/Configuration/Authentication'
import { useFeature } from '@common/hooks/useFeatures'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { FeatureWarningTooltip } from '@common/components/FeatureWarning/FeatureWarningWithTooltip'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { AuthenticationMechanisms } from '@rbac/utils/utils'
import { useSAMLProviderModalV2 } from '@auth-settings/modals/SAMLProvider/useSAMLProviderModalV2'
import { Providers } from '@auth-settings/modals/SAMLProvider/utils'
import css from './SAMLProvider.module.scss'
import cssConfiguration from '@auth-settings/pages/Configuration/Configuration.module.scss'

interface Props {
  authSettings: AuthenticationSettingsResponse
  refetchAuthSettings: () => void
  permissionRequest: PermissionRequest
  canEdit: boolean
  setUpdating: Dispatch<SetStateAction<boolean>>
}

const samlIconMap: Record<Providers, IconName> = {
  [Providers.AZURE]: 'service-azure',
  [Providers.OKTA]: 'service-okta',
  [Providers.ONE_LOGIN]: 'service-onelogin',
  [Providers.OTHER]: 'main-more'
}

const SAMLProviderV2: React.FC<Props> = ({
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
  const [samlSettingToDelete, setSamlSettingToDelete] = React.useState<SAMLSettings | undefined>()
  const samlEnabled = authSettings.authenticationMechanism === AuthenticationMechanisms.SAML
  const samlSettings = authSettings.ngAuthSettings?.filter(
    settings => settings.settingsType === AuthenticationMechanisms.SAML
  ) as SAMLSettings[]
  const enabledSamlProviders = samlSettings.filter(saml => saml.authenticationEnabled)

  const { PL_ENABLE_JIT_USER_PROVISION } = useFeatureFlags()
  const { enabled: featureEnabled } = useFeature({
    featureRequest: {
      featureName: FeatureIdentifier.SAML_SUPPORT
    }
  })

  const onSuccess = (): void => {
    refetchAuthSettings()
  }

  const { openSAMlProvider } = useSAMLProviderModalV2({
    onSuccess
  })

  const { mutate: enableDisableSAMLSetting, loading: loadingEnableDiableAuthSettings } =
    useEnableDisableAuthenticationForSAMLSetting({
      queryParams: { accountIdentifier: accountId, enable: true },
      samlSSOId: ''
    })

  const {
    data: samlLoginTestData,
    loading: fetchingSamlLoginTestData,
    error: samlLoginTestDataError,
    refetch: getSamlLoginTestData
  } = useGetSamlLoginTestV2({
    queryParams: {
      accountIdentifier: accountId
    },
    samlSSOId: '',
    lazy: true
  })

  const { mutate: deleteSamlSettings, loading: deletingSamlSettings } = useDeleteSamlMetaDataForSamlSSOId({
    samlSSOId: ''
  })

  const { mutate: updateAuthMechanismToSaml, loading: updatingAuthMechanismToSaml } = useUpdateAuthMechanism({
    queryParams: {
      accountIdentifier: accountId,
      authenticationMechanism: AuthenticationMechanisms.SAML
    }
  })

  React.useEffect(() => {
    setUpdating(updatingAuthMechanismToSaml || deletingSamlSettings || loadingEnableDiableAuthSettings)
  }, [updatingAuthMechanismToSaml, deletingSamlSettings, loadingEnableDiableAuthSettings, setUpdating])

  const { openDialog: confirmSamlSettingsDelete } = useConfirmationDialog({
    titleText: getString('authSettings.deleteSamlProvider'),
    contentText: (
      <String
        stringID="authSettings.deleteSamlProviderDescription"
        useRichText={true}
        vars={{ displayName: samlSettingToDelete?.displayName }}
      />
    ),
    confirmButtonText: getString('confirm'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async isConfirmed => {
      /* istanbul ignore else */ if (isConfirmed && samlSettingToDelete) {
        try {
          const deleted = await deleteSamlSettings('' as any, {
            pathParams: { samlSSOId: samlSettingToDelete.identifier },
            queryParams: { accountIdentifier: accountId }
          })

          /* istanbul ignore else */ if (deleted) {
            refetchAuthSettings()
            showSuccess(getString('authSettings.samlProviderDeleted'), 5000)
          }
        } catch (e) {
          /* istanbul ignore next */ showError(getRBACErrorMessage(e), 5000)
        }
      }
      setSamlSettingToDelete(undefined)
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

  const handleEnableDisableAuthentication = async (e: React.FormEvent<HTMLInputElement>, ssoId: string) => {
    const enable = e.currentTarget.checked

    try {
      const response = await enableDisableSAMLSetting('' as any, {
        pathParams: { samlSSOId: ssoId },
        queryParams: { enable, accountIdentifier: accountId }
      })
      if (response) {
        refetchAuthSettings()
      }
    } catch (error) {
      showError(getRBACErrorMessage(error), 5000)
    }
  }

  return (
    <Container margin="xlarge" background={Color.WHITE}>
      {samlSettings.length > 0 ? (
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
                  disabled={
                    !featureEnabled || !canEdit || updatingAuthMechanismToSaml || enabledSamlProviders.length === 0
                  }
                />
              </Container>
            </Utils.WrapOptionalTooltip>
          }
        >
          {samlSettings.map(samlSetting => {
            return (
              <Container padding={{ bottom: 'large' }} key={samlSetting.identifier}>
                <Card className={css.card}>
                  <Switch
                    onChange={e => {
                      handleEnableDisableAuthentication(e, samlSetting.identifier)
                    }}
                    checked={samlSetting.authenticationEnabled}
                  />
                  <Text color={Color.GREY_800} font={{ weight: 'bold' }} width="25%">
                    {samlSetting.displayName}
                  </Text>
                  <Layout.Horizontal width="25%" padding={{ right: 'large' }}>
                    <Text
                      className={css.displayNamePlaceholder}
                      inline
                      color={Color.GREY_300}
                      font={FontVariation.SMALL}
                      margin={{ right: 'small' }}
                    >
                      {getString('common.displayName')}
                    </Text>
                    <Text color={Color.BLACK} font={FontVariation.SMALL} inline lineClamp={1}>
                      {samlSetting.friendlySamlName}
                    </Text>
                  </Layout.Horizontal>
                  <Layout.Horizontal width="20%" flex={{ justifyContent: 'flex-start' }}>
                    <Text font={FontVariation.SMALL} inline margin={{ right: 'small' }}>
                      {`${getString('typeLabel')}: `}
                    </Text>
                    <Icon name={samlIconMap[samlSetting.samlProviderType as Providers]} margin={{ right: 'small' }} />
                    <Text inline font={{ variation: FontVariation.BODY }}>
                      {samlSetting.samlProviderType}
                    </Text>
                  </Layout.Horizontal>
                  <Text color={Color.GREY_800} width="20%">
                    {PL_ENABLE_JIT_USER_PROVISION && (
                      <>
                        {`${getString('authSettings.jitProvisioning')}: `}
                        <Text font={{ weight: 'semi-bold' }} color={Color.GREY_800} inline>
                          {samlSetting.jitEnabled ? getString('enabledLabel') : getString('common.disabled')}
                        </Text>
                      </>
                    )}
                  </Text>
                  <Container width="10%" flex={{ justifyContent: 'flex-end' }}>
                    <Button
                      text={getString('test')}
                      variation={ButtonVariation.SECONDARY}
                      disabled={!!childWindow || fetchingSamlLoginTestData}
                      onClick={() => {
                        getSamlLoginTestData({ pathParams: { samlSSOId: samlSetting.identifier } })
                      }}
                    />
                  </Container>

                  <Popover
                    interactionKind="click"
                    position="left-top"
                    content={
                      <Menu>
                        <MenuItem
                          text={getString('edit')}
                          onClick={() => openSAMlProvider(omitBy(samlSetting, isNull) as SAMLSettings)}
                          disabled={!canEdit}
                        />
                        <RbacMenuItem
                          text={getString('delete')}
                          onClick={() => {
                            setSamlSettingToDelete(samlSetting)
                            confirmSamlSettingsDelete()
                          }}
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
            )
          })}
          <Button
            variation={ButtonVariation.SECONDARY}
            margin={{ bottom: 'large' }}
            onClick={() => {
              openSAMlProvider()
            }}
          >
            {getString('authSettings.addSAMLProvider')}
          </Button>
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

export default SAMLProviderV2
