/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Layout, Select, SelectOption, StepProps, Text } from '@harness/uicore'
import React, { useState } from 'react'
import { Color } from '@harness/design-system'
import { noop } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { NotificationType } from '@rbac/interfaces/Notifications'
import type {
  NotificationRules,
  PmsEmailChannel,
  PmsPagerDutyChannel,
  PmsSlackChannel,
  PmsWebhookChannel
} from 'services/pipeline-ng'
import { NotificationTypeSelectOptions } from '@rbac/constants/NotificationConstants'
import ConfigureEmailNotifications from '@rbac/modals/ConfigureNotificationsModal/views/ConfigureEmailNotifications/ConfigureEmailNotifications'
import ConfigureSlackNotifications from '@rbac/modals/ConfigureNotificationsModal/views/ConfigureSlackNotifications/ConfigureSlackNotifications'
import ConfigurePagerDutyNotifications from '@rbac/modals/ConfigureNotificationsModal/views/ConfigurePagerDutyNotifications/ConfigurePagerDutyNotifications'
import ConfigureMSTeamsNotifications from '@rbac/modals/ConfigureNotificationsModal/views/ConfigureMSTeamsNotifications/ConfigureMSTeamsNotifications'
import ConfigureWebhookNotifications from '@rbac/modals/ConfigureNotificationsModal/views/ConfigureWebhookNotifications/ConfigureWebhookNotifications'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

export interface NotificationMethodsProps extends StepProps<NotificationRules> {
  typeOptions?: SelectOption[]
  expressions?: string[]
}

function NotificationMethods({
  prevStepData,
  nextStep,
  previousStep,
  typeOptions,
  expressions
}: NotificationMethodsProps): React.ReactElement {
  const { getString } = useStrings()
  const { PIE_WEBHOOK_NOTIFICATION } = useFeatureFlags()
  const [method, setMethod] = useState<SelectOption | undefined>(
    prevStepData?.notificationMethod?.type
      ? {
          label: prevStepData?.notificationMethod?.type,
          value: prevStepData?.notificationMethod?.type
        }
      : undefined
  )

  const getFilteredOptions = (items: SelectOption[]): SelectOption[] => {
    if (!PIE_WEBHOOK_NOTIFICATION) {
      return items.filter(item => item.value !== NotificationType.Webhook)
    }
    return items
  }

  return (
    <Layout.Vertical spacing="xxlarge" padding="small">
      <Text font="medium" color={Color.BLACK}>
        {getString('rbac.notifications.notificationMethod')}
      </Text>

      <Layout.Vertical height={500} width={550} spacing="large">
        <Layout.Vertical spacing="xsmall">
          <Text tooltipProps={{ dataTooltipId: 'notifications.notificationMethod' }}>
            {getString('rbac.notifications.notificationMethod')}
          </Text>
          <Select
            items={getFilteredOptions(typeOptions || NotificationTypeSelectOptions)}
            value={method}
            onChange={item => {
              setMethod(item)
            }}
            inputProps={{
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              'data-testid': 'notificationType'
            }}
          />
        </Layout.Vertical>
        {method?.value === NotificationType.MsTeams ? (
          <ConfigureMSTeamsNotifications
            withoutHeading={true}
            submitButtonText={getString('finish')}
            onSuccess={data => {
              nextStep?.({
                ...prevStepData,
                notificationMethod: {
                  type: method.value.toString(),
                  spec: {
                    userGroups: data.userGroups,
                    msTeamKeys: data.msTeamKeys
                  }
                }
              })
            }}
            expressions={expressions}
            hideModal={noop}
            isStep={true}
            onBack={data =>
              previousStep?.({
                ...prevStepData,
                notificationMethod: {
                  type: method.value.toString(),
                  spec: {
                    userGroups: data?.userGroups,
                    msTeamKeys: data?.msTeamKeys
                  }
                }
              })
            }
            config={{
              type: NotificationType.MsTeams,
              msTeamKeys: prevStepData?.notificationMethod?.spec?.msTeamKeys,
              userGroups: (prevStepData?.notificationMethod?.spec as PmsSlackChannel)?.userGroups || []
            }}
          />
        ) : null}
        {method?.value === NotificationType.Email ? (
          <>
            <ConfigureEmailNotifications
              withoutHeading={true}
              submitButtonText={getString('finish')}
              onSuccess={data => {
                nextStep?.({
                  ...prevStepData,
                  notificationMethod: {
                    type: method.value.toString(),
                    spec: {
                      userGroups: data.userGroups,
                      recipients: data.emailIds
                    }
                  }
                })
              }}
              hideModal={noop}
              isStep={true}
              onBack={data =>
                previousStep?.({
                  ...prevStepData,
                  notificationMethod: {
                    type: method.value.toString(),
                    spec: {
                      userGroups: data?.userGroups,
                      recipients: data?.emailIds
                    }
                  }
                })
              }
              config={{
                type: NotificationType.Email,
                emailIds: (prevStepData?.notificationMethod?.spec as PmsEmailChannel)?.recipients || [],
                userGroups: (prevStepData?.notificationMethod?.spec as PmsEmailChannel)?.userGroups || []
              }}
            />
          </>
        ) : null}

        {method?.value === NotificationType.Slack ? (
          <ConfigureSlackNotifications
            withoutHeading={true}
            submitButtonText={getString('finish')}
            onSuccess={data => {
              nextStep?.({
                ...prevStepData,
                notificationMethod: {
                  type: method.value.toString(),
                  spec: {
                    userGroups: data.userGroups,
                    webhookUrl: data.webhookUrl
                  }
                }
              })
            }}
            expressions={expressions}
            hideModal={noop}
            isStep={true}
            onBack={data =>
              previousStep?.({
                ...prevStepData,
                notificationMethod: {
                  type: method.value.toString(),
                  spec: {
                    userGroups: data?.userGroups,
                    webhookUrl: data?.webhookUrl
                  }
                }
              })
            }
            config={{
              type: NotificationType.Slack,
              webhookUrl: (prevStepData?.notificationMethod?.spec as PmsSlackChannel)?.webhookUrl || '',
              userGroups: (prevStepData?.notificationMethod?.spec as PmsSlackChannel)?.userGroups || []
            }}
          />
        ) : null}
        {method?.value === NotificationType.Webhook ? (
          <ConfigureWebhookNotifications
            withoutHeading={true}
            submitButtonText={getString('finish')}
            onSuccess={data => {
              nextStep?.({
                ...prevStepData,
                notificationMethod: {
                  type: method.value.toString(),
                  spec: {
                    webhookUrl: data.webhookUrl
                  }
                }
              })
            }}
            expressions={expressions}
            hideModal={noop}
            isStep={true}
            onBack={data =>
              previousStep?.({
                ...prevStepData,
                notificationMethod: {
                  type: method.value.toString(),
                  spec: {
                    webhookUrl: data?.webhookUrl
                  }
                }
              })
            }
            config={{
              type: NotificationType.Webhook,
              webhookUrl: (prevStepData?.notificationMethod?.spec as PmsWebhookChannel)?.webhookUrl || ''
            }}
          />
        ) : null}
        {method?.value === NotificationType.PagerDuty ? (
          <ConfigurePagerDutyNotifications
            withoutHeading={true}
            submitButtonText={getString('finish')}
            onSuccess={data => {
              nextStep?.({
                ...prevStepData,
                notificationMethod: {
                  type: method.value.toString(),
                  spec: {
                    userGroups: data.userGroups,
                    integrationKey: data.key
                  }
                }
              })
            }}
            expressions={expressions}
            hideModal={() => undefined}
            isStep={true}
            onBack={() => previousStep?.({ ...prevStepData })}
            config={{
              type: NotificationType.PagerDuty,
              key: (prevStepData?.notificationMethod?.spec as PmsPagerDutyChannel)?.integrationKey?.toString() || '',
              userGroups: (prevStepData?.notificationMethod?.spec as PmsPagerDutyChannel)?.userGroups || []
            }}
          />
        ) : null}
      </Layout.Vertical>
    </Layout.Vertical>
  )
}
export default NotificationMethods
