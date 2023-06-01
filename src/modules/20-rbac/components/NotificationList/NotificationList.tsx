/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import * as Yup from 'yup'
import cx from 'classnames'
import {
  Button,
  ButtonVariation,
  Container,
  Formik,
  FormInput,
  Icon,
  Layout,
  SelectOption,
  Text,
  MultiTypeInputType,
  getMultiTypeFromValue
} from '@harness/uicore'
import { Form, FormikProps } from 'formik'
import produce from 'immer'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import { TestPagerDutyNotifications } from '@rbac/modals/ConfigureNotificationsModal/views/ConfigurePagerDutyNotifications/ConfigurePagerDutyNotifications'
import { TestEmailNotifications } from '@rbac/modals/ConfigureNotificationsModal/views/ConfigureEmailNotifications/ConfigureEmailNotifications'
import { useStrings } from 'framework/strings'
import { NotificationSettingConfigDTO, usePutUserGroup, UserGroupDTO } from 'services/cd-ng'
import { TestSlackNotifications } from '@rbac/modals/ConfigureNotificationsModal/views/ConfigureSlackNotifications/ConfigureSlackNotifications'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useToaster } from '@common/exports'
import { TestMSTeamsNotifications } from '@rbac/modals/ConfigureNotificationsModal/views/ConfigureMSTeamsNotifications/ConfigureMSTeamsNotifications'
import { getNotificationByConfig } from '@rbac/utils/NotificationUtils'
import { EmailSchema, EmailSchemaWithoutRequired, URLValidationSchema } from '@common/utils/Validation'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import ManagePrincipalButton from '../ManagePrincipalButton/ManagePrincipalButton'
import css from './NotificationList.module.scss'

interface NotificationListProps {
  userGroup: UserGroupDTO
  inherited?: boolean
  inheritedCreateDisabledText?: JSX.Element
  onSubmit: () => void
}

interface RowData extends NotificationSettingConfigDTO {
  groupEmail?: string
  recipient?: string
  slackWebhookUrl?: string
  pagerDutyKey?: string
  microsoftTeamsWebhookUrl?: string
  sendEmailToAllUsers?: boolean
}
export interface NotificationOption {
  label: string
  value: NonNullable<NotificationSettingConfigDTO['type']>
}

interface FieldDetails {
  name: keyof RowData
  textPlaceholder: string
}

interface ChannelRow {
  data: NotificationSettingConfigDTO | null
  userGroup: UserGroupDTO
  inherited?: boolean
  onSubmit: () => void
  options: SelectOption[]
  onRowDelete?: () => void
  notificationItems: SelectOption[]
}

const ChannelRow: React.FC<ChannelRow> = ({
  data,
  userGroup,
  inherited,
  onSubmit,
  notificationItems,
  options,
  onRowDelete
}) => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getRBACErrorMessage } = useRBACError()
  const [isCreate, setIsCreate] = useState<boolean>(data ? false : true)
  const { getString } = useStrings()
  const [edit, setEdit] = useState<boolean>(false)
  const enableEdit = isCreate || edit
  const { showSuccess, showError } = useToaster()
  const [selectedInputType, setSelectedInputType] = useState<MultiTypeInputType>(
    getMultiTypeFromValue(getNotificationByConfig(data)?.value)
  )

  const { mutate: updateNotifications, loading } = usePutUserGroup({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const getFieldDetails = (type: NotificationSettingConfigDTO['type']): FieldDetails => {
    switch (type) {
      case 'EMAIL':
        return {
          name: 'groupEmail',
          textPlaceholder: getString('rbac.notifications.emailOrAlias')
        }
      case 'SLACK':
        return {
          name: 'slackWebhookUrl',
          textPlaceholder: getString('rbac.notifications.labelWebhookUrl')
        }
      case 'PAGERDUTY':
        return {
          name: 'pagerDutyKey',
          textPlaceholder: getString('rbac.notifications.labelPagerDuty')
        }
      case 'MSTEAMS':
        return {
          name: 'microsoftTeamsWebhookUrl',
          textPlaceholder: getString('rbac.notifications.labelMSTeam')
        }
      default:
        return {
          name: 'recipient',
          textPlaceholder: ''
        }
    }
  }

  const handleSubmit = async (values: RowData): Promise<void> => {
    const recipient = getFieldDetails(values.type).name
    if (isCreate) {
      const notification = {
        type: values.type,
        [recipient]: values[recipient]
      }

      if (values.type === 'EMAIL') {
        notification.sendEmailToAllUsers = defaultTo(values?.sendEmailToAllUsers, true)
      }

      userGroup.notificationConfigs?.push(notification)
    }
    if (edit) {
      userGroup.notificationConfigs = userGroup.notificationConfigs?.map(val => {
        return val.type === values.type ? values : val
      })
    }
    try {
      const edited = await updateNotifications(userGroup)
      /* istanbul ignore else */ if (edited) {
        showSuccess(getString('rbac.updateNotificationSuccess'))
        onSubmit()
        setEdit(false)
        setIsCreate(false)
      }
    } catch (e) {
      /* istanbul ignore next */
      showError(getRBACErrorMessage(e))
    }
  }

  const handleTest = async (formikProps: FormikProps<RowData>): Promise<boolean> => {
    const errors = await formikProps.validateForm()
    if (Object.keys(errors).length) {
      formikProps.setFieldTouched(getFieldDetails(formikProps.values.type).name, true)
      return false
    }
    return true
  }

  const handleDelete = async (values: RowData): Promise<void> => {
    userGroup.notificationConfigs = userGroup.notificationConfigs?.filter(val => val.type != values.type)
    try {
      const deleted = await updateNotifications(userGroup)
      /* istanbul ignore else */ if (deleted) {
        showSuccess(getString('rbac.updateNotificationSuccess'))
        onSubmit()
        setEdit(false)
      }
    } catch (e) {
      /* istanbul ignore next */
      showError(getRBACErrorMessage(e))
    }
  }

  const renderInputField = (type: NotificationSettingConfigDTO['type']) => {
    const { name, textPlaceholder } = getFieldDetails(type)
    if (type === 'EMAIL') {
      return <FormInput.Text name={name} placeholder={textPlaceholder} />
    }

    return (
      <FormInput.MultiTextInput
        name={name}
        label=""
        placeholder={textPlaceholder}
        multiTextInputProps={{
          allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
          onTypeChange: setSelectedInputType
        }}
      />
    )
  }

  const getIntialValues = () => {
    return { sendEmailToAllUsers: true, ...data }
  }

  return (
    <>
      <Formik<RowData>
        initialValues={getIntialValues()}
        validationSchema={Yup.object().shape({
          type: Yup.string().required(),
          groupEmail: Yup.string()
            .nullable()
            .when(['type', 'sendEmailToAllUsers'], {
              is: (type, sendEmailToAllUsers) => {
                return type === 'EMAIL' && sendEmailToAllUsers
              },
              then: EmailSchemaWithoutRequired(getString)
            })
            .when(['type', 'sendEmailToAllUsers'], {
              is: (type, sendEmailToAllUsers) => {
                return type === 'EMAIL' && !sendEmailToAllUsers
              },
              then: EmailSchema(getString)
            }),
          slackWebhookUrl: Yup.string().when(['type'], {
            is: 'SLACK',
            then:
              selectedInputType === MultiTypeInputType.EXPRESSION
                ? Yup.string().required(getString('common.validation.urlIsRequired'))
                : URLValidationSchema(getString)
          }),
          pagerDutyKey: Yup.string().when(['type'], {
            is: 'PAGERDUTY',
            then: Yup.string().trim().required(getString('rbac.notifications.validationPDKey'))
          }),
          microsoftTeamsWebhookUrl: Yup.string().when(['type'], {
            is: 'MSTEAMS',
            then:
              selectedInputType === MultiTypeInputType.EXPRESSION
                ? Yup.string().required(getString('common.validation.urlIsRequired'))
                : URLValidationSchema(getString)
          })
        })}
        formName="NotificationForm"
        onSubmit={values => {
          handleSubmit(values)
        }}
      >
        {formikProps => {
          return (
            <Form>
              <Layout.Horizontal spacing="small" className={cx(css.card, { [css.centerAlign]: !enableEdit })}>
                {enableEdit && !inherited ? (
                  <Container width="75%">
                    <Container width="100%">
                      <Layout.Horizontal spacing="small">
                        <Container width="45%">
                          <FormInput.Select
                            name="type"
                            placeholder={getString('common.selectAChannel')}
                            items={edit ? options : notificationItems}
                            disabled={edit}
                          />
                        </Container>
                        <Container width="55%">{renderInputField(formikProps.values.type)}</Container>
                      </Layout.Horizontal>
                    </Container>

                    <div className={css.sendEmailToAllUsersContainer}>
                      {formikProps.values.type === 'EMAIL' && (
                        <FormInput.CheckBox
                          name="sendEmailToAllUsers"
                          label="Send email to all users part of the user group"
                        />
                      )}
                    </div>
                  </Container>
                ) : (
                  <Container
                    width="75%"
                    className={cx(formikProps.values.type !== 'EMAIL' ? css.infoCard : css.emailInfoCard)}
                  >
                    <Container width="100%">
                      <Layout.Horizontal spacing="small">
                        <Container width="35%">
                          <Layout.Horizontal spacing="small">
                            <Icon name={getNotificationByConfig(data).icon} />
                            <Text>{getNotificationByConfig(data).label}</Text>
                          </Layout.Horizontal>
                        </Container>
                        <Container width="40%">
                          <Text lineClamp={1} className={css.overflow}>
                            {getNotificationByConfig(data).value}
                          </Text>
                        </Container>
                      </Layout.Horizontal>

                      <div className={css.sendEmailToAllUsersContainer}>
                        {formikProps.values.type === 'EMAIL' && (
                          <FormInput.CheckBox
                            name="sendEmailToAllUsers"
                            label="Send email to all users part of the user group"
                            disabled
                          />
                        )}
                      </div>
                    </Container>
                  </Container>
                )}
                <Container width="25%">
                  <Layout.Horizontal flex={{ justifyContent: 'flex-end' }} spacing="xsmall">
                    {formikProps.values.type == 'EMAIL' ? (
                      <TestEmailNotifications
                        onClick={() => handleTest(formikProps)}
                        buttonProps={{
                          minimal: true
                        }}
                      />
                    ) : null}
                    {formikProps.values.type == 'SLACK' ? (
                      <TestSlackNotifications
                        data={formikProps.values as any}
                        onClick={() => handleTest(formikProps)}
                        buttonProps={{
                          minimal: true,
                          disabled: selectedInputType === MultiTypeInputType.EXPRESSION
                        }}
                      />
                    ) : null}
                    {formikProps.values.type == 'PAGERDUTY' ? (
                      <TestPagerDutyNotifications
                        data={formikProps.values as any}
                        onClick={() => handleTest(formikProps)}
                        buttonProps={{
                          minimal: true,
                          disabled: selectedInputType === MultiTypeInputType.EXPRESSION
                        }}
                      />
                    ) : null}
                    {formikProps.values.type == 'MSTEAMS' ? (
                      <TestMSTeamsNotifications
                        data={{
                          userGroups: [],
                          msTeamKeys: [defaultTo(formikProps.values.microsoftTeamsWebhookUrl, '')]
                        }}
                        buttonProps={{
                          minimal: true,
                          disabled: selectedInputType === MultiTypeInputType.EXPRESSION
                        }}
                        errors={{}}
                        onClick={() => handleTest(formikProps)}
                      />
                    ) : null}
                    {!inherited ? (
                      enableEdit ? (
                        <Button text={getString('save')} minimal type="submit" disabled={loading} />
                      ) : (
                        <>
                          <Button icon="edit" minimal onClick={() => setEdit(true)} className={css.button} />
                          <Button
                            data-testid="trashBtn"
                            icon="trash"
                            minimal
                            onClick={() => handleDelete(formikProps.values)}
                            className={css.button}
                          />
                        </>
                      )
                    ) : null}
                    {isCreate && !inherited ? (
                      <Button
                        data-testid="trashBtn"
                        icon="trash"
                        minimal
                        onClick={() => onRowDelete?.()}
                        className={css.button}
                      />
                    ) : null}
                  </Layout.Horizontal>
                </Container>
              </Layout.Horizontal>
            </Form>
          )
        }}
      </Formik>
    </>
  )
}

const NotificationList: React.FC<NotificationListProps> = ({
  userGroup,
  inherited,
  inheritedCreateDisabledText,
  onSubmit
}) => {
  const notifications = userGroup.notificationConfigs
  const [values, setValues] = useState<(NotificationSettingConfigDTO | null)[]>(notifications || [])
  const { getString } = useStrings()

  const EmailNotification: NotificationOption = {
    label: getString('rbac.notifications.emailOrAlias'),
    value: 'EMAIL'
  }

  const SlackNotification: NotificationOption = {
    label: getString('rbac.notifications.labelWebhookUrl'),
    value: 'SLACK'
  }

  const PDNotification: NotificationOption = {
    label: getString('rbac.notifications.labelPagerDuty'),
    value: 'PAGERDUTY'
  }

  const MSNotification: NotificationOption = {
    label: getString('rbac.notifications.labelMSTeam'),
    value: 'MSTEAMS'
  }

  const options = [EmailNotification, SlackNotification, PDNotification, MSNotification]

  const getNotificationOption = (type: NotificationSettingConfigDTO['type']): NotificationOption => {
    switch (type) {
      case 'EMAIL':
        return EmailNotification
      case 'SLACK':
        return SlackNotification
      case 'PAGERDUTY':
        return PDNotification
      case 'MSTEAMS':
        return MSNotification
      default:
        return EmailNotification
    }
  }

  const onRowDelete = (index: number): void => {
    setValues(
      produce(values, draft => {
        draft.splice(index, 1)
      })
    )
  }

  const getNotificationItems = (): SelectOption[] => {
    const existingOptions = values?.map(value => (value?.type ? getNotificationOption(value.type) : null))
    return options.filter(val => !existingOptions.includes(val))
  }

  return (
    <>
      {values?.map((item, index) => (
        <div key={index}>
          <ChannelRow
            data={item}
            onSubmit={onSubmit}
            onRowDelete={() => onRowDelete(index)}
            notificationItems={getNotificationItems()}
            options={options}
            userGroup={userGroup}
            inherited={inherited}
          />
        </div>
      ))}
      <Layout.Horizontal padding={{ top: 'small' }}>
        {values.length < 4 && !values.includes(null) ? (
          <ManagePrincipalButton
            disabled={inherited}
            data-testid="addChannel"
            tooltip={inherited ? inheritedCreateDisabledText : undefined}
            text={getString('plusNumber', { number: getString('common.channel') })}
            variation={ButtonVariation.LINK}
            onClick={() => {
              setValues(
                produce(values, draft => {
                  draft.push(null)
                })
              )
            }}
            resourceType={ResourceType.USERGROUP}
            resourceIdentifier={userGroup.identifier}
          />
        ) : null}
      </Layout.Horizontal>
    </>
  )
}

export default NotificationList
