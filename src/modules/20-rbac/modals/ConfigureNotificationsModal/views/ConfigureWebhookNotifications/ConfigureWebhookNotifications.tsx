/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  FormikForm,
  FormInput,
  Button,
  Layout,
  Icon,
  ButtonProps,
  Formik,
  ButtonVariation,
  MultiTypeInputType,
  getMultiTypeFromValue
} from '@harness/uicore'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import cx from 'classnames'
import { URLValidationSchema } from '@common/utils/Validation'
import { useToaster } from '@common/components'
import { useTestNotificationSetting, WebhookSettingDTO } from 'services/notifications'
import { NotificationType, WebhookNotificationConfiguration, TestStatus } from '@rbac/interfaces/Notifications'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import css from '../../ConfigureNotificationsModal.module.scss'

interface ConfigureWebhookNotificationsProps {
  onSuccess: (config: WebhookNotificationConfiguration) => void
  hideModal: () => void
  withoutHeading?: boolean
  isStep?: boolean
  onBack?: (config?: WebhookNotificationConfiguration) => void
  submitButtonText?: string
  config?: WebhookNotificationConfiguration
  expressions?: string[]
}

interface WebhookNotificationData {
  webhookUrl: string
}

export const TestWebhookNotifications: React.FC<{
  data: WebhookNotificationData
  onClick?: () => Promise<boolean>
  buttonProps?: ButtonProps
}> = ({ data, onClick, buttonProps }) => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const [testStatus, setTestStatus] = useState<TestStatus>(TestStatus.INIT)
  const { mutate: testNotificationSetting } = useTestNotificationSetting({})
  const { showSuccess, showError } = useToaster()

  const handleTest = async (testData: WebhookNotificationData): Promise<void> => {
    if (onClick) {
      const success = await onClick()
      if (!success) return
    }
    try {
      setTestStatus(TestStatus.INIT)
      const resp = await testNotificationSetting({
        accountId,
        type: 'WEBHOOK',
        recipient: testData.webhookUrl,
        notificationId: 'asd'
      } as WebhookSettingDTO)
      if (resp.status === 'SUCCESS' && resp.data) {
        showSuccess(getString('rbac.notifications.webhookTestSuccess'))
        setTestStatus(TestStatus.SUCCESS)
      } else {
        showError(getString('somethingWentWrong'))
        setTestStatus(TestStatus.FAILED)
      }
    } catch (err) {
      showError(getString('rbac.notifications.invalidWebhookURL'))
      setTestStatus(TestStatus.ERROR)
    }
  }
  return (
    <>
      <Button
        text={getString('test')}
        disabled={!data.webhookUrl?.length}
        tooltipProps={{ dataTooltipId: 'testWebhookConfigButton' }}
        onClick={() => handleTest(data)}
        {...buttonProps}
      />
      {testStatus === TestStatus.SUCCESS ? <Icon name="tick" className={cx(css.statusIcon, css.green)} /> : null}
      {testStatus === TestStatus.FAILED || testStatus === TestStatus.ERROR ? (
        <Icon name="cross" className={cx(css.statusIcon, css.red)} />
      ) : null}
    </>
  )
}

const ConfigureWebhookNotifications: React.FC<ConfigureWebhookNotificationsProps> = props => {
  const [webhookUrlType, setWebhookUrlType] = useState<MultiTypeInputType>(
    getMultiTypeFromValue(props.config?.webhookUrl)
  )
  const { getString } = useStrings()

  const handleSubmit = (formData: WebhookNotificationData): void => {
    props.onSuccess(convertFormData(formData))
  }

  const convertFormData = (formData: WebhookNotificationData) => {
    return {
      type: NotificationType.Webhook,
      ...formData
    }
  }

  return (
    <div className={css.body}>
      <Layout.Vertical spacing="large">
        <Formik
          onSubmit={handleSubmit}
          formName="configureWebhookNotifications"
          validationSchema={Yup.object().shape({
            // TODO: Create global validation function for url validation
            webhookUrl:
              webhookUrlType === MultiTypeInputType.EXPRESSION
                ? Yup.string().required()
                : URLValidationSchema(getString)
          })}
          initialValues={{
            webhookUrl: '',
            ...props.config
          }}
        >
          {formik => {
            return (
              <FormikForm>
                {props.expressions ? (
                  <FormInput.MultiTextInput
                    name={'webhookUrl'}
                    label={getString('rbac.notifications.webhookUrl')}
                    multiTextInputProps={{
                      expressions: props.expressions,
                      allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                      onTypeChange: setWebhookUrlType
                    }}
                  />
                ) : (
                  <FormInput.Text name={'webhookUrl'} label={getString('rbac.notifications.webhookUrl')} />
                )}

                <Layout.Horizontal margin={{ bottom: 'xxlarge' }} style={{ alignItems: 'center' }}>
                  <TestWebhookNotifications
                    data={formik.values}
                    buttonProps={{ disabled: webhookUrlType === MultiTypeInputType.EXPRESSION }}
                  />
                </Layout.Horizontal>
                {props.isStep ? (
                  <Layout.Horizontal spacing="large" className={css.buttonGroupSlack}>
                    <Button
                      text={getString('back')}
                      variation={ButtonVariation.SECONDARY}
                      onClick={() => {
                        props.onBack?.(convertFormData(formik.values))
                      }}
                    />
                    <Button
                      text={props.submitButtonText || getString('next')}
                      disabled={!formik.values.webhookUrl?.length}
                      variation={ButtonVariation.PRIMARY}
                      type="submit"
                    />
                  </Layout.Horizontal>
                ) : (
                  <Layout.Horizontal spacing={'medium'} margin={{ top: 'xxlarge' }}>
                    <Button
                      type={'submit'}
                      variation={ButtonVariation.PRIMARY}
                      text={props.submitButtonText || getString('submit')}
                    />
                    <Button
                      text={getString('cancel')}
                      variation={ButtonVariation.SECONDARY}
                      onClick={props.hideModal}
                    />
                  </Layout.Horizontal>
                )}
              </FormikForm>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </div>
  )
}

export default ConfigureWebhookNotifications
