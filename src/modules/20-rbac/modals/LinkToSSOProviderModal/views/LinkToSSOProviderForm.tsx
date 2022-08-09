/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useState, useMemo } from 'react'
import {
  Button,
  Container,
  Formik,
  FormikForm as Form,
  Layout,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  Text,
  SelectOption,
  ButtonVariation,
  FormInput,
  PageError,
  shouldShowError
} from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import type { StringsMap } from 'framework/strings/StringsContext'
import { useToaster } from '@common/components'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import {
  LdapGroupResponse,
  UserGroupDTO,
  SAMLSettings,
  useGetAuthenticationSettings,
  useLinkToSamlGroup,
  useLinkToLdapGroup,
  SSOSettings
} from 'services/cd-ng'
import LinkToLDAPProviderForm from './LinkToLDAPProviderForm'
import css from '../useLinkToSSOProviderModal.module.scss'

interface LinkToSSOProviderModalData {
  userGroupData: UserGroupDTO
  onSubmit?: () => void
}

interface SelectOptionWithType extends SelectOption {
  ssoType: SSOSettings['type']
}

export interface LinkToSSOProviderFormData {
  groupName: string
  sso: string
}

export interface LinkToLdapProviderFormData extends LinkToSSOProviderFormData {
  selectedRadioValue: LdapGroupResponse
}

const getSelectPlaceholder = (
  ssoSettings: SelectOption[],
  fetching: boolean,
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
): string => {
  const dataPlaceholder = !ssoSettings.length
    ? getString('noData')
    : getString('rbac.userDetails.linkToSSOProviderModal.selectSSOSetting')
  return fetching ? getString('loading') : dataPlaceholder
}

const LinkToSSOProviderForm: React.FC<LinkToSSOProviderModalData> = props => {
  const { onSubmit, userGroupData } = props
  const { getRBACErrorMessage } = useRBACError()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { showSuccess } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()

  let fetching = false
  const {
    data: authDataResponse,
    loading: authLoading,
    error,
    refetch
  } = useGetAuthenticationSettings({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const authSettingsData = authDataResponse?.resource?.ngAuthSettings as SAMLSettings[]

  const { mutate: linkSsoGroup, loading: linking } = useLinkToSamlGroup({
    userGroupId: '',
    samlId: '',
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const { mutate: linkLdapGroup, loading: linkingLdapGroup } = useLinkToLdapGroup({
    userGroupId: '',
    ldapId: '',
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  fetching = linking || linkingLdapGroup || authLoading

  const ssoSettings: SelectOptionWithType[] = useMemo(
    () =>
      (authSettingsData || []).reduce<SelectOptionWithType[]>((acc, setting: SAMLSettings) => {
        if ((setting.settingsType === 'SAML' && setting.authorizationEnabled) || setting.settingsType === 'LDAP') {
          acc.push({
            label: setting.displayName || setting.identifier,
            value: setting.identifier,
            ssoType: setting.settingsType
          })
        }
        return acc
      }, []),
    [authSettingsData]
  )

  const getSelectedSSOType = (identifier: string) => {
    return ssoSettings.find(setting => setting.value === identifier)
  }

  const handleOnSubmit = async (values: LinkToSSOProviderFormData): Promise<void> => {
    modalErrorHandler?.hide()
    try {
      let created
      if (getSelectedSSOType(values.sso)?.ssoType === 'LDAP') {
        const ldapFormValues = values as LinkToLdapProviderFormData
        created = await linkLdapGroup(
          {
            ldapGroupName: ldapFormValues.selectedRadioValue?.name,
            ldapGroupDN: ldapFormValues.selectedRadioValue?.dn
          },
          { pathParams: { userGroupId: userGroupData.identifier, ldapId: values.sso } }
        )
      } else if (getSelectedSSOType(values.sso)?.ssoType === 'SAML') {
        created = await linkSsoGroup(
          { samlGroupName: values.groupName },
          { pathParams: { userGroupId: userGroupData.identifier, samlId: values.sso } }
        )
      }
      if (created) {
        showSuccess(getString('rbac.userGroupForm.createSuccess', { name: values.groupName }))
        onSubmit?.()
      }
    } catch (err) {
      if (shouldShowError(err)) {
        modalErrorHandler?.showDanger(getRBACErrorMessage(err))
      }
    }
  }

  return (
    <Layout.Vertical padding="xlarge">
      <Layout.Vertical spacing="large">
        <Text color={Color.BLACK} font="medium">
          {getString('rbac.userDetails.linkToSSOProviderModal.linkLabel')}
        </Text>
        {error ? (
          <PageError message={getRBACErrorMessage(error as any)} onClick={refetch as any} />
        ) : (
          <Formik<LinkToSSOProviderFormData | LinkToLdapProviderFormData>
            formName="linkToSSOProviderForm"
            initialValues={{ groupName: '', sso: '' }}
            validationSchema={Yup.object().shape({
              groupName: Yup.string()
                .trim()
                .when('sso', {
                  is: sso => getSelectedSSOType(sso)?.ssoType === 'SAML',
                  then: Yup.string().required(
                    getString('rbac.userDetails.linkToSSOProviderModal.validation.groupNameRequired')
                  )
                }),
              sso: Yup.string().required(getString('rbac.userDetails.linkToSSOProviderModal.validation.ssoIdRequired'))
            })}
            onSubmit={values => {
              handleOnSubmit(values)
            }}
            enableReinitialize
          >
            {formik => {
              return (
                <Form>
                  <Container margin={{ bottom: 'medium' }}>
                    <Container padding={{ bottom: 'medium' }}>
                      <ModalErrorHandler bind={setModalErrorHandler} />
                    </Container>
                    <Layout.Vertical spacing="medium">
                      <Layout.Vertical flex={{ alignItems: 'end' }} spacing="xsmall">
                        <FormInput.Select
                          name="sso"
                          disabled={fetching}
                          className={css.select}
                          items={ssoSettings}
                          data-id="sso-value-select"
                          placeholder={getSelectPlaceholder(ssoSettings, fetching, getString)}
                        />
                      </Layout.Vertical>
                      {getSelectedSSOType(formik.values.sso)?.ssoType === 'SAML' && (
                        <FormInput.Text
                          disabled={!formik.values.sso || fetching}
                          name="groupName"
                          label={getString('rbac.userDetails.linkToSSOProviderModal.groupNameLabel')}
                        />
                      )}
                      {getSelectedSSOType(formik.values.sso)?.ssoType === 'LDAP' && <LinkToLDAPProviderForm />}
                    </Layout.Vertical>
                  </Container>
                  <Layout.Horizontal>
                    <Button
                      variation={ButtonVariation.PRIMARY}
                      data-testid="submitLinkSSOProvider"
                      text={getString('save')}
                      type="submit"
                      disabled={
                        fetching ||
                        (getSelectedSSOType(formik.values.sso)?.ssoType === 'LDAP' &&
                          (formik.values as LinkToLdapProviderFormData)?.selectedRadioValue === undefined)
                      }
                    />
                  </Layout.Horizontal>
                </Form>
              )
            }}
          </Formik>
        )}
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default LinkToSSOProviderForm
