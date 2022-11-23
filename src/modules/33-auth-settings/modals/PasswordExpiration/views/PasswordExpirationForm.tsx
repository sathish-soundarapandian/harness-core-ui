/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as yup from 'yup'
import { useParams } from 'react-router-dom'
import {
  Layout,
  Text,
  Formik,
  FormikForm,
  FormInput,
  Button,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  ButtonVariation
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useToaster } from '@common/components'
import type { LoginSettings, PasswordExpirationPolicy } from 'services/cd-ng'
import { usePutLoginSettings } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'

interface Props {
  onSubmit?: () => void
  onCancel: () => void
  loginSettings: LoginSettings
  editing: boolean
}

interface FormValues {
  daysBeforePasswordExpire: number
  daysBeforeUserNotified: number
}

const PasswordExpirationForm: React.FC<Props> = ({ onSubmit, onCancel, loginSettings, editing }) => {
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { showSuccess } = useToaster()
  const passwordExpirationSettings = loginSettings.passwordExpirationPolicy
  const [modalErrorHandler, setModalErrorHandler] = React.useState<ModalErrorHandlerBinding>()

  const { mutate: updateLoginSettings, loading: updatingLoginSettings } = usePutLoginSettings({
    loginSettingsId: loginSettings.uuid,
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const handleSubmit = async (values: FormValues): Promise<void> => {
    const passwordExpirationPolicy: PasswordExpirationPolicy = {
      enabled: editing ? passwordExpirationSettings.enabled : /* istanbul ignore next */ true,
      daysBeforePasswordExpires: values.daysBeforePasswordExpire,
      daysBeforeUserNotifiedOfPasswordExpiration: values.daysBeforeUserNotified
    }

    try {
      const response = await updateLoginSettings({
        ...loginSettings,
        passwordExpirationPolicy
      })
      /* istanbul ignore else */ if (response) {
        showSuccess(
          getString(editing ? 'authSettings.passwordExpirationUpdated' : 'authSettings.passwordExpirationEnabled')
        )
        onSubmit?.()
      }
    } catch (e) {
      /* istanbul ignore next */ modalErrorHandler?.showDanger(getRBACErrorMessage(e))
    }
  }

  return (
    <Layout.Vertical padding={{ left: 'huge', right: 'huge' }}>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <Text color={Color.GREY_900} font={{ size: 'medium', weight: 'semi-bold' }} margin={{ bottom: 'xxlarge' }}>
        {getString('authSettings.passwordExpiration')}
      </Text>
      <Formik
        formName="passwordExpirationForm"
        initialValues={{
          daysBeforePasswordExpire:
            passwordExpirationSettings.daysBeforePasswordExpires || /* istanbul ignore next */ 30,
          daysBeforeUserNotified:
            passwordExpirationSettings.daysBeforeUserNotifiedOfPasswordExpiration || /* istanbul ignore next */ 3
        }}
        validationSchema={yup.object().shape({
          daysBeforePasswordExpire: yup
            .number()
            .typeError(getString('common.validation.valueMustBeANumber'))
            .min(1, getString('common.validation.valueMustBeGreaterThanOrEqualToN', { n: 1 }))
            .required(getString('validation.thisIsARequiredField')),
          daysBeforeUserNotified: yup
            .number()
            .typeError(getString('common.validation.valueMustBeANumber'))
            .min(1, getString('common.validation.valueMustBeGreaterThanOrEqualToN', { n: 1 }))
            .required(getString('validation.thisIsARequiredField'))
        })}
        onSubmit={values => {
          handleSubmit(values)
        }}
      >
        {() => (
          <FormikForm>
            <Layout.Vertical spacing="xlarge">
              <FormInput.Text
                name="daysBeforePasswordExpire"
                label={getString('authSettings.daysBeforePasswordExpires')}
                inputGroup={{
                  type: 'number'
                }}
              />
              <FormInput.Text
                name="daysBeforeUserNotified"
                label={getString('authSettings.daysBeforeUserNotified')}
                inputGroup={{
                  type: 'number'
                }}
              />
            </Layout.Vertical>
            <Layout.Horizontal margin={{ top: 'xxxlarge', bottom: 'xlarge' }}>
              <Button
                text={getString('save')}
                type="submit"
                variation={ButtonVariation.PRIMARY}
                margin={{ right: 'small' }}
                disabled={updatingLoginSettings}
              />
              <Button text={getString('cancel')} onClick={onCancel} variation={ButtonVariation.TERTIARY} />
            </Layout.Horizontal>
          </FormikForm>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default PasswordExpirationForm
