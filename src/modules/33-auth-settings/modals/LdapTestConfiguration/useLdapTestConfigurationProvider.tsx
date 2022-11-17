/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useRef, useState } from 'react'
import {
  Container,
  Formik,
  FormikForm,
  FormInput,
  Layout,
  Text,
  Button,
  Dialog,
  ButtonVariation,
  useToaster
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import type { FormikProps } from 'formik'
import { useModalHook } from '@harness/use-modal'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { defaultTo, isEmpty } from 'lodash-es'
import { EmailSchema } from '@common/utils/Validation'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { ResponseMessage, usePostLdapAuthenticationTest, useUpdateAuthMechanism } from 'services/cd-ng'
import { AuthenticationMechanisms } from '@rbac/utils/utils'
import { ErrorHandler } from '@common/components/ErrorHandler/ErrorHandler'
import css from './useLdapTestConfiguration.module.scss'

export interface useLdapTestConfigurationModalReturn {
  openLdapTestModal: () => void
  closeLdapTestModal: () => void
}

interface LDAPConnectionTestConfig {
  email: string
  password: string
}

export interface useLdapTestConfigurationModalProps {
  onSuccess: () => void
}

const useLdapTestConfigurationProvider = ({
  onSuccess
}: useLdapTestConfigurationModalProps): useLdapTestConfigurationModalReturn => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { showSuccess, showError } = useToaster()
  const formRef = useRef<FormikProps<LDAPConnectionTestConfig>>(null)
  const [errorMessages, setErrorMessages] = useState<ResponseMessage[] | null>(null)
  const validationSchema = Yup.object().shape({
    email: EmailSchema(),
    password: Yup.string().min(6).required(getString('password'))
  })

  const { mutate: ldapLoginTest, loading: isTestLoading } = usePostLdapAuthenticationTest({
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const { mutate: updateAuthMechanism, loading: isAuthUpdateLoading } = useUpdateAuthMechanism({})

  const testLdapConfig = async ({ email, password }: LDAPConnectionTestConfig): Promise<void> => {
    try {
      const formData = new FormData()
      formData.set('email', email)
      formData.set('password', password)
      await resetStatesAndInvokeLdapAuth(formData)
    } catch (e: any) /* istanbul ignore next */ {
      setErrorMessages(defaultTo(e.data?.responseMessages, [{ level: 'ERROR', message: e.data?.message || e.message }]))
    }
  }

  const testAndEnableLdap = async (): Promise<void> => {
    let testConnectionPassed = false
    try {
      /* istanbul ignore else */
      if (!formRef.current) {
        return
      }
      const formValidation = await formRef.current.validateForm()
      /* istanbul ignore else */
      if (!isEmpty(formValidation) || !formRef.current) {
        return
      }

      const { email, password } = formRef.current.values as LDAPConnectionTestConfig
      const formData = new FormData()
      formData.set('email', email as string)
      formData.set('password', password as string)
      testConnectionPassed = await resetStatesAndInvokeLdapAuth(formData)
    } catch (e: any) /* istanbul ignore next */ {
      setErrorMessages(defaultTo(e.data?.responseMessages, [{ level: 'ERROR', message: e.data?.message || e.message }]))
    }

    /* istanbul ignore else */
    if (testConnectionPassed) {
      try {
        const { resource: updateAuthResource, responseMessages } = await updateAuthMechanism(undefined, {
          queryParams: {
            accountIdentifier: accountId,
            authenticationMechanism: AuthenticationMechanisms.LDAP
          }
        })

        if (!updateAuthResource) {
          showError(responseMessages?.[0].message, 5000)
        } else {
          hideModal()
          showSuccess(getString('authSettings.ldap.authChangeSuccessful'), 5000)
          onSuccess()
        }
      } catch (e: any) {
        /* istanbul ignore next */ showError(e.data?.message || e.message, 5000)
      }
    }
  }

  const resetStatesAndInvokeLdapAuth = async (formData: FormData): Promise<boolean> => {
    setErrorMessages(null)
    const response = await ldapLoginTest(formData as any)
    if (response?.resource?.status === 'SUCCESS') {
      showSuccess(getString('authSettings.ldap.ldapTestSuccessful'), 5000)
      return true
    }
    setErrorMessages(defaultTo(response?.responseMessages, [{ level: 'ERROR', message: response.resource?.message }]))
    return false
  }

  const [showModal, hideModal] = useModalHook(() => {
    const isDisabled = isTestLoading || isAuthUpdateLoading
    return (
      <Dialog isOpen={true} enforceFocus={false} className={css.dialog} onClose={hideModal}>
        <Container>
          <Text font={{ variation: FontVariation.H5 }} margin={{ bottom: 'xlarge' }}>
            {getString('authSettings.ldap.verifyAndEnableConfig')}
          </Text>
          <Formik<LDAPConnectionTestConfig>
            innerRef={formRef}
            validationSchema={validationSchema}
            formName="ldapConfigTestForm"
            initialValues={{ email: '', password: '' }}
            onSubmit={formData => {
              testLdapConfig(formData)
            }}
          >
            <FormikForm>
              <Layout.Vertical>
                <FormInput.Text name="email" label={getString('signUp.form.emailLabel')} disabled={isDisabled} />
                <FormInput.Text
                  name="password"
                  label={getString('password')}
                  inputGroup={{ type: 'password' }}
                  disabled={isDisabled}
                />
                <Layout.Horizontal>
                  {errorMessages && errorMessages?.length > 0 && (
                    <ErrorHandler responseMessages={errorMessages} className={css.layoutErrorMessage} />
                  )}
                </Layout.Horizontal>
                <Layout.Horizontal margin={{ top: 'large', bottom: 'large' }}>
                  <Button
                    intent="primary"
                    loading={isTestLoading || isAuthUpdateLoading}
                    disabled={isDisabled}
                    margin={{ right: 'medium' }}
                    data-testid="enable-ldap-config"
                    onClick={() => testAndEnableLdap()}
                  >
                    {getString('enable')}
                  </Button>
                  <Button
                    type="submit"
                    variation={ButtonVariation.SECONDARY}
                    loading={isTestLoading}
                    disabled={isDisabled}
                    data-testid="test-ldap-config"
                  >
                    {getString('test')}
                  </Button>
                </Layout.Horizontal>
              </Layout.Vertical>
            </FormikForm>
          </Formik>
        </Container>
      </Dialog>
    )
  }, [isTestLoading, isAuthUpdateLoading, errorMessages])

  return {
    openLdapTestModal: () => {
      setErrorMessages(null)
      showModal()
    },
    closeLdapTestModal: hideModal
  }
}

export default useLdapTestConfigurationProvider
