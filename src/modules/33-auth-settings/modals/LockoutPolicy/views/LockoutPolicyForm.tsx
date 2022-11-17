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
  Formik,
  FormikForm,
  FormInput,
  Checkbox,
  Button,
  // Select,
  Text,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  ButtonVariation
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useToaster } from '@common/components'
import type { LoginSettings, UserLockoutPolicy } from 'services/cd-ng'
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

const LockoutPolicyForm: React.FC<Props> = ({ onSubmit, onCancel, loginSettings, editing }) => {
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { showSuccess } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = React.useState<ModalErrorHandlerBinding>()
  const userLockoutSettings = loginSettings.userLockoutPolicy

  const { mutate: updateLoginSettings, loading: updatingLoginSettings } = usePutLoginSettings({
    loginSettingsId: loginSettings.uuid,
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const handleSubmit = async (values: UserLockoutPolicy): Promise<void> => {
    const userLockoutPolicy: UserLockoutPolicy = {
      ...values,
      enableLockoutPolicy: editing ? userLockoutSettings.enableLockoutPolicy : true,
      userGroupsToNotify: userLockoutSettings.userGroupsToNotify
    }

    try {
      const response = await updateLoginSettings({
        ...loginSettings,
        userLockoutPolicy
      })

      /* istanbul ignore else */ if (response) {
        showSuccess(
          getString(editing ? 'authSettings.lockoutPolicyUpdated' : 'authSettings.lockoutPolicyEnabled'),
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
        {getString('authSettings.lockoutPolicy')}
      </Text>
      <Formik
        formName="lockoutPolicyForm"
        initialValues={{
          numberOfFailedAttemptsBeforeLockout:
            userLockoutSettings.numberOfFailedAttemptsBeforeLockout || /* istanbul ignore next */ 1,
          lockOutPeriod: userLockoutSettings.lockOutPeriod || /* istanbul ignore next */ 1,
          notifyUser: !!userLockoutSettings.notifyUser
          // userGroupsToNotify: []
        }}
        validationSchema={yup.object().shape({
          numberOfFailedAttemptsBeforeLockout: yup
            .number()
            .typeError(getString('common.validation.valueMustBeANumber'))
            .min(1, getString('common.validation.valueMustBeGreaterThanOrEqualToN', { n: 1 }))
            .required(getString('validation.thisIsARequiredField')),
          lockOutPeriod: yup
            .number()
            .typeError(getString('common.validation.valueMustBeANumber'))
            .min(1, getString('common.validation.valueMustBeGreaterThanOrEqualToN', { n: 1 }))
            .required(getString('validation.thisIsARequiredField'))
        })}
        onSubmit={values => {
          handleSubmit(values)
        }}
      >
        {({ values, setFieldValue }) => (
          <FormikForm>
            <Layout.Vertical spacing="xlarge">
              <FormInput.Text
                name="numberOfFailedAttemptsBeforeLockout"
                label={getString('authSettings.failedLoginsBeforeLocked')}
                inputGroup={{
                  type: 'number'
                }}
              />
              <FormInput.Text
                name="lockOutPeriod"
                label={getString('authSettings.lockoutDuration')}
                inputGroup={{
                  type: 'number'
                }}
              />
            </Layout.Vertical>
            <Layout.Vertical padding={{ top: 'large', bottom: 'xxlarge' }}>
              <Checkbox
                label={getString('authSettings.notifyUsersWhenTheyLocked')}
                checked={values.notifyUser}
                onChange={e => setFieldValue('notifyUser', e.currentTarget.checked)}
              />
            </Layout.Vertical>
            {/* <Text color={Color.GREY_500} padding={{ top: 'xsmall', bottom: 'xsmall' }}>
              {getString('authSettings.notifyUsersWhenUserLocked')}
            </Text>
            <Select
              name="userGroupsToNotify"
              items={[]}
              inputProps={{ placeholder: getString('authSettings.selectUserGroup') }}
            /> */}
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

export default LockoutPolicyForm
