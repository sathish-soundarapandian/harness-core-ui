/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { FontVariation, Text, Icon, Color, Layout } from '@harness/uicore'
import React, { ReactElement } from 'react'
import { useStrings } from 'framework/strings'
import type { LdapConnectionSettings, ResponseMessage } from 'services/cd-ng'
import { ErrorHandler } from '@common/components/ErrorHandler/ErrorHandler'

export interface RawLdapConnectionSettings {
  accountId?: string
  bindDN?: string
  bindPassword?: string
  bindSecret?: string[]
  connectTimeout?: number
  host: string
  maxReferralHops?: number
  passwordType?: string
  port?: number
  referralsEnabled?: boolean
  responseTimeout?: number
  sslEnabled?: boolean
  useRecursiveGroupMembershipSearch?: boolean
}

export const updateLDAPConnectionSettingsFormData = (
  values: RawLdapConnectionSettings | undefined,
  accountId: string,
  maxReferralHops: number | undefined
): LdapConnectionSettings | void => {
  if (!values) {
    return
  }

  const updatedValues = { ...values }

  if (values['referralsEnabled']) {
    if (values['maxReferralHops']) {
      updatedValues['maxReferralHops'] = Number(values['maxReferralHops'])
    } else {
      updatedValues['maxReferralHops'] = maxReferralHops
    }
  } else {
    delete updatedValues['maxReferralHops']
  }

  if (!values['sslEnabled']) {
    updatedValues['sslEnabled'] = false
  }

  delete updatedValues['bindSecret']

  return {
    ...updatedValues,
    passwordType: 'INLINE',
    port: Number(values['port']),
    connectTimeout: Number(values['connectTimeout']),
    responseTimeout: Number(values['responseTimeout']),
    accountId: accountId
  }
}

export const QueryTestSuccessMsg: React.FC<{ message: string }> = ({ message }) => {
  return (
    <>
      <Icon name="success-tick" size={16} margin={{ right: 'xsmall' }} />
      <Text font={{ variation: FontVariation.FORM_MESSAGE_SUCCESS }} color={Color.GREEN_800}>
        {message}
      </Text>
    </>
  )
}

export const QueryTestFailMsgs: React.FC<{ errorMessages: ResponseMessage[] }> = ({ errorMessages }) => {
  return <ErrorHandler responseMessages={errorMessages} />
}

export const QueryStepTitle: React.FC<{ stepTitle?: string }> = ({ stepTitle }) => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal margin={{ bottom: 'medium' }} style={{ alignItems: 'center' }}>
      <Text font={{ variation: FontVariation.H4 }} margin={{ right: 'small' }}>
        {stepTitle}
      </Text>
      <Text font={{ weight: 'light' }}>{getString('titleOptional')}</Text>
    </Layout.Horizontal>
  )
}

export const QueryFormTitle: React.FC<{ title: string }> = ({ title }) => {
  return (
    <>
      <Text font={{ variation: FontVariation.H5 }}>
        <Icon name="chevron-down" color={Color.PRIMARY_6} margin={{ right: 'small' }} />
        {title}
      </Text>
    </>
  )
}

export const getErrorMessageFromException = (e: any, fallbackMessage?: string): ResponseMessage[] => {
  const hasResponseMessages = e.data?.responseMessages && e.data?.responseMessages.length > 0
  return hasResponseMessages
    ? e.data?.responseMessages
    : [{ level: 'ERROR', message: e.data?.message || e.message || fallbackMessage }]
}

export const DEFAULT_LDAP_SYNC_CRON_EXPRESSION = '0/15 * * * *' // Every 15 minutes

export const getDateIterationsList = (dates: number[]): ReactElement => {
  const datesHTML = dates.map(date => {
    const dateObject = new Date(date)
    return <li key={date}>{dateObject.toString()}</li>
  })

  return <ul>{datesHTML}</ul>
}
