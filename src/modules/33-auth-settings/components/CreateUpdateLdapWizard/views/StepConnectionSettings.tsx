/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Button,
  Layout,
  StepProps,
  Formik,
  FormikForm,
  FormInput,
  Text,
  ButtonVariation,
  Icon,
  ButtonSize,
  Container
} from '@harness/uicore'
import cx from 'classnames'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { Color, FontVariation } from '@harness/design-system'
import { defaultTo, isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { LdapConnectionSettings, ResponseMessage, useValidateLdapConnectionSettings } from 'services/cd-ng'
import { ErrorHandler } from '@common/components/ErrorHandler/ErrorHandler'
import { RawLdapConnectionSettings, updateLDAPConnectionSettingsFormData } from '../utils'
import type { CreateUpdateLdapWizardProps, LdapWizardStepProps } from '../CreateUpdateLdapWizard'
import type { LdapOverview } from './StepOverview'
import css from '../CreateUpdateLdapWizard.module.scss'

export const StepConnectionSettings: React.FC<
  StepProps<CreateUpdateLdapWizardProps> &
    LdapWizardStepProps<LdapConnectionSettings & LdapOverview> & {
      displayName: string
      identifier: string
      isEdit: boolean
    }
> = ({ stepData, previousStep, nextStep, updateStepData, displayName, identifier, isEdit }) => {
  const connectionSettings = stepData as LdapConnectionSettings
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const { getString } = useStrings()
  const [testConnSuccessOrFail, setTestConnSuccessOrFail] = useState<boolean>(false)
  const [errorMessages, setErrorMessages] = useState<ResponseMessage[] | null>(null)

  const { mutate: validateLdapConnectionSettings, loading: testingConnection } = useValidateLdapConnectionSettings({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  enum connectionSettingsFields {
    HOST = 'host',
    PORT = 'port',
    MAX_REFERRAL_HOPS = 'maxReferralHops',
    CONNECT_TIMEOUT = 'connectTimeout',
    RESPONSE_TIMEOUT = 'responseTimeout',
    BIND_DN = 'bindDN',
    BIND_PASSWORD = 'bindPassword',
    REFERRALS_ENABLED = 'referralsEnabled'
  }

  const validationSchema = Yup.object().shape({
    [connectionSettingsFields.HOST]: Yup.string()
      .trim()
      .required(getString('authSettings.ldap.connSettings.validateHost.required')),
    [connectionSettingsFields.PORT]: Yup.number()
      .typeError(getString('authSettings.ldap.connSettings.portNumber.number'))
      .required(getString('authSettings.ldap.connSettings.portNumber.required')),
    [connectionSettingsFields.MAX_REFERRAL_HOPS]: Yup.number().when([connectionSettingsFields.REFERRALS_ENABLED], {
      is: true,
      then: Yup.number()
        .typeError(getString('authSettings.ldap.connSettings.validateReferralHops.number'))
        .required(getString('authSettings.ldap.connSettings.validateReferralHops.required'))
    }),
    [connectionSettingsFields.CONNECT_TIMEOUT]: Yup.number()
      .typeError(getString('authSettings.ldap.connSettings.validateConnectionTimeout.number'))
      .required(getString('authSettings.ldap.connSettings.validateConnectionTimeout.required')),
    [connectionSettingsFields.RESPONSE_TIMEOUT]: Yup.number()
      .typeError(getString('authSettings.ldap.connSettings.validateResponseTime.number'))
      .required(getString('authSettings.ldap.connSettings.validateResponseTime.required')),
    [connectionSettingsFields.BIND_DN]: Yup.string()
      .trim()
      .required(getString('authSettings.ldap.connSettings.validateBindDN')),
    [connectionSettingsFields.BIND_PASSWORD]: Yup.string().trim().required(getString('validation.password'))
  })

  const testConnection = async (values: RawLdapConnectionSettings): Promise<void> => {
    const connectionErrorString = getString('common.test.connectionFailed')

    const updatedLdapConnSettings = updateLDAPConnectionSettingsFormData(values, accountId, stepData?.maxReferralHops)

    // clear the state for re-setting after API call
    setTestConnSuccessOrFail(false)
    setErrorMessages(null)

    const ldapSettingValues = {
      accountId,
      connectionSettings: updatedLdapConnSettings,
      type: 'LDAP',
      displayName,
      ...(isEdit && { uuid: identifier })
    }

    try {
      const response = await validateLdapConnectionSettings(ldapSettingValues as any, {
        headers: { 'content-type': 'application/json' }
      })

      if (response?.resource?.status !== 'SUCCESS') {
        setErrorMessages(defaultTo(response?.responseMessages, [{ level: 'ERROR', message: connectionErrorString }]))
      }
    } catch (e: any) /* istanbul ignore next */ {
      setErrorMessages(
        defaultTo(e.data?.responseMessages, [
          { level: 'ERROR', message: e.data?.message || e.message || connectionErrorString }
        ])
      )
    } finally {
      setTestConnSuccessOrFail(true)
    }
  }

  const handleSubmit = (formData: RawLdapConnectionSettings | undefined) => {
    const updatedLdapConnSettings = updateLDAPConnectionSettingsFormData(formData, accountId, stepData?.maxReferralHops)
    updatedLdapConnSettings && updateStepData(updatedLdapConnSettings)
    nextStep?.()
  }

  return (
    <Layout.Vertical className={cx(css.stepContainer, css.verticalStretch)}>
      <Formik<RawLdapConnectionSettings | undefined>
        onSubmit={formData => handleSubmit(formData)}
        validationSchema={validationSchema}
        formName="ldapConnectionSettingsForm"
        initialValues={{ ...connectionSettings, host: connectionSettings?.host ? connectionSettings?.host : '' }}
      >
        {formik => {
          return (
            <FormikForm>
              <Layout.Horizontal margin={{ bottom: 'large' }}>
                <Text font={{ variation: FontVariation.H4 }}>{getString('authSettings.ldap.connectionSettings')}</Text>
              </Layout.Horizontal>
              <Layout.Vertical className={css.connectionSettingsFormCtr}>
                <Layout.Horizontal>
                  <Container className={css.connectionWiderFieldSet}>
                    <FormInput.Text
                      name="host"
                      label={getString('common.hostLabel')}
                      placeholder={getString('authSettings.ldap.connSettings.hostAddress')}
                    />
                  </Container>
                </Layout.Horizontal>
                <Layout.Horizontal spacing="medium">
                  <Container className={css.connectionWiderFieldSet}>
                    <Layout.Horizontal spacing="medium">
                      <FormInput.Text name="port" label={getString('common.smtp.port')} />
                      <Container className={css.hangingFieldSet}>
                        <FormInput.CheckBox label={getString('common.useSSL')} name="sslEnabled" />
                      </Container>
                    </Layout.Horizontal>
                  </Container>
                  <Container className={css.connectionFieldSet}>
                    <Layout.Horizontal spacing="medium">
                      <FormInput.Text
                        name="maxReferralHops"
                        disabled={!formik.values?.referralsEnabled}
                        label={getString('authSettings.ldap.connSettings.maximumReferralHops')}
                      />
                      <Container className={css.hangingFieldSet}>
                        <FormInput.CheckBox
                          label={getString('authSettings.ldap.connSettings.enableReferrals')}
                          name="referralsEnabled"
                        />
                      </Container>
                    </Layout.Horizontal>
                  </Container>
                </Layout.Horizontal>
                <Layout.Horizontal spacing="medium">
                  <Container className={css.connectionWiderFieldSet}>
                    <Layout.Horizontal spacing="medium">
                      <FormInput.Text
                        name="connectTimeout"
                        label={getString('authSettings.ldap.connSettings.connectionTimeout')}
                      />
                      <Container className={css.hangingFieldSet}>
                        <FormInput.CheckBox
                          label={getString('authSettings.ldap.connSettings.recursiveSearch')}
                          name="useRecursiveGroupMembershipSearch"
                        />
                      </Container>
                    </Layout.Horizontal>
                  </Container>
                  <Container className={css.connectionFieldSet}>
                    <Layout.Horizontal>
                      <FormInput.Text
                        label={getString('authSettings.ldap.connSettings.responseTime')}
                        name="responseTimeout"
                      />
                    </Layout.Horizontal>
                  </Container>
                </Layout.Horizontal>
                <hr className={css.separator} />
                <Layout.Vertical>
                  <Layout.Horizontal spacing="medium">
                    <Container className={css.connectionWiderFieldSet} padding={{ right: 'small' }}>
                      <FormInput.Text
                        name="bindDN"
                        placeholder={getString('authSettings.ldap.connSettings.bindDN')}
                        label={getString('authSettings.ldap.connSettings.bindDN')}
                      />
                    </Container>
                  </Layout.Horizontal>
                  <Layout.Horizontal spacing="medium">
                    <Container className={css.connectionWiderFieldSet}>
                      <FormInput.Text
                        name="bindPassword"
                        placeholder={getString('authSettings.ldap.connSettings.passwordPlaceholder')}
                        label={getString('password')}
                        inputGroup={{ type: 'password' }}
                      />
                    </Container>
                    <Container className={cx(css.connectionFieldSet, css.hangingFieldSet)}>
                      <Button
                        size={ButtonSize.SMALL}
                        variation={ButtonVariation.SECONDARY}
                        data-testid="testConnSettings"
                        text={getString('common.smtp.testConnection')}
                        onClick={async () => {
                          // Reset the previous test result message
                          formik.setTouched({
                            ...formik.touched,
                            [connectionSettingsFields.HOST]: true,
                            [connectionSettingsFields.PORT]: true,
                            [connectionSettingsFields.MAX_REFERRAL_HOPS]: true,
                            [connectionSettingsFields.CONNECT_TIMEOUT]: true,
                            [connectionSettingsFields.RESPONSE_TIMEOUT]: true,
                            [connectionSettingsFields.BIND_DN]: true,
                            [connectionSettingsFields.BIND_PASSWORD]: true,
                            [connectionSettingsFields.REFERRALS_ENABLED]: true
                          })
                          setTestConnSuccessOrFail(false)
                          const formValidation = await formik.validateForm()
                          if (!isEmpty(formValidation) || !formik.values) {
                            // Test Connection call not to be fired if schema validation fails
                            return
                          }
                          testConnection(formik.values)
                        }}
                        margin={{ right: 'medium', bottom: 'medium' }}
                        disabled={testingConnection}
                      />
                    </Container>
                  </Layout.Horizontal>
                  <Layout.Horizontal className={css.alignCenter}>
                    {testConnSuccessOrFail && errorMessages && (
                      <ErrorHandler responseMessages={errorMessages} className={css.layoutIconMessage} />
                    )}
                    {testConnSuccessOrFail && !errorMessages && (
                      <>
                        <Icon margin={{ right: 'small' }} name="success-tick" size={16} />
                        <Text font={{ variation: FontVariation.FORM_MESSAGE_SUCCESS }} color={Color.GREEN_800}>
                          {getString('common.test.connectionSuccessful')}
                        </Text>
                      </>
                    )}
                  </Layout.Horizontal>
                </Layout.Vertical>
              </Layout.Vertical>
              <Layout.Horizontal className={css.stepCtaContainer}>
                <Button
                  onClick={() => previousStep?.()}
                  text={getString('back')}
                  icon="chevron-left"
                  margin={{ right: 'small' }}
                  variation={ButtonVariation.SECONDARY}
                  data-testid="back-to-overview-step"
                />
                <Button
                  intent="primary"
                  type="submit"
                  text={getString('continue')}
                  rightIcon="chevron-right"
                  data-testid="submit-connection-step"
                />
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export default StepConnectionSettings
