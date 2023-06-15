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
  Checkbox,
  Button,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  ButtonVariation
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useToaster } from '@common/components'
import type { LoginSettings, PasswordStrengthPolicy } from 'services/cd-ng'
import { usePutLoginSettings } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { MIN_NUMBER_OF_CHARACTERS, MAX_NUMBER_OF_CHARACTERS } from '@common/constants/Utils'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'

interface Props {
  onSubmit?: () => void
  onCancel: () => void
  loginSettings: LoginSettings
  editing: boolean
}

interface FormValues {
  minNumberOfCharacters: number
  atLeastOneUppercase: boolean
  atLeastOneLowercase: boolean
  atLeastOneDigit: boolean
  atLeastOneSpecialChar: boolean
}

const PasswordStrengthForm: React.FC<Props> = ({ onSubmit, onCancel, loginSettings, editing }) => {
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { showSuccess } = useToaster()
  const passwordStrengthSettings = loginSettings.passwordStrengthPolicy
  const [modalErrorHandler, setModalErrorHandler] = React.useState<ModalErrorHandlerBinding>()

  const { mutate: updateLoginSettings, loading: updatingLoginSettings } = usePutLoginSettings({
    loginSettingsId: loginSettings.uuid,
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const handleSubmit = async (values: FormValues): Promise<void> => {
    const passwordStrengthPolicy: PasswordStrengthPolicy = {
      enabled: editing ? passwordStrengthSettings.enabled : /* istanbul ignore next */ true,
      minNumberOfCharacters: values.minNumberOfCharacters,
      minNumberOfUppercaseCharacters: Number(values.atLeastOneUppercase),
      minNumberOfLowercaseCharacters: Number(values.atLeastOneLowercase),
      minNumberOfDigits: Number(values.atLeastOneDigit),
      minNumberOfSpecialCharacters: Number(values.atLeastOneSpecialChar)
    }

    try {
      const response = await updateLoginSettings({
        ...loginSettings,
        passwordStrengthPolicy
      })
      /* istanbul ignore else */ if (response) {
        showSuccess(
          getString(editing ? 'authSettings.passwordStrengthUpdated' : 'authSettings.passwordStrengthEnabled'),
          5000
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
        {getString('authSettings.passwordStrength')}
      </Text>
      <Formik
        formName="passwordStrengthForm"
        initialValues={{
          minNumberOfCharacters:
            passwordStrengthSettings?.minNumberOfCharacters || /* istanbul ignore next */ MIN_NUMBER_OF_CHARACTERS,
          atLeastOneUppercase: !!passwordStrengthSettings?.minNumberOfUppercaseCharacters,
          atLeastOneLowercase: !!passwordStrengthSettings?.minNumberOfLowercaseCharacters,
          atLeastOneDigit: !!passwordStrengthSettings?.minNumberOfDigits,
          atLeastOneSpecialChar: !!passwordStrengthSettings?.minNumberOfSpecialCharacters
        }}
        validationSchema={yup.object().shape({
          minNumberOfCharacters: yup
            .number()
            .typeError(getString('common.validation.valueMustBeANumber'))
            .min(
              MIN_NUMBER_OF_CHARACTERS,
              getString('common.validation.valueMustBeGreaterThanOrEqualToN', { n: MIN_NUMBER_OF_CHARACTERS })
            )
            .max(
              MAX_NUMBER_OF_CHARACTERS,
              getString('common.validation.valueMustBeLessThanOrEqualToN', { n: MAX_NUMBER_OF_CHARACTERS })
            )
            .required(getString('validation.minLengthRequired'))
        })}
        onSubmit={values => {
          handleSubmit(values)
        }}
      >
        {({ values, setFieldValue }) => (
          <FormikForm>
            <FormInput.Text
              name="minNumberOfCharacters"
              label={getString('authSettings.minLength')}
              inputGroup={{
                type: 'number'
              }}
            />
            <Layout.Vertical spacing="medium" padding={{ top: 'xxlarge' }}>
              <Checkbox
                label={getString('authSettings.haveOneUppercase')}
                checked={values.atLeastOneUppercase}
                onChange={e => setFieldValue('atLeastOneUppercase', e.currentTarget.checked)}
              />
              <Checkbox
                label={getString('authSettings.haveOneLowercase')}
                checked={values.atLeastOneLowercase}
                onChange={e => setFieldValue('atLeastOneLowercase', e.currentTarget.checked)}
              />
              <Checkbox
                label={getString('authSettings.haveOneDigit')}
                checked={values.atLeastOneDigit}
                onChange={e => setFieldValue('atLeastOneDigit', e.currentTarget.checked)}
              />
              <Checkbox
                label={getString('authSettings.haveOneSpecialChar')}
                checked={values.atLeastOneSpecialChar}
                onChange={e => setFieldValue('atLeastOneSpecialChar', e.currentTarget.checked)}
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

export default PasswordStrengthForm
