/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { get } from 'lodash-es'
import type { CreateIpAllowlistConfigProps, UpdateIpAllowlistConfigProps } from '@harnessio/react-ng-manager-client'

import type { IIPAllowlistForm } from '@auth-settings/interfaces/IPAllowlistInterface'
import { SourceType } from '@auth-settings/interfaces/IPAllowlistInterface'
import { CurrencyType } from '@common/constants/SubscriptionTypes'

export function getAmountInCurrency(currency: CurrencyType, amount: number): string {
  switch (currency) {
    case CurrencyType.USD: {
      return amount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
      })
    }
  }

  return ''
}

// dividing the actual amount by 100 as amount numbers are in cents
export function getDollarAmount(amount?: number, isYearly?: boolean): number {
  if (isYearly) {
    return (amount || 0) / 1200
  }
  return (amount || 0) / 100
}

export const getErrorMessage = (error: any): string =>
  get(error, 'data.error', get(error, 'data.message', error?.message))

export const buildCreateIPAllowlistPayload = (data: IIPAllowlistForm): CreateIpAllowlistConfigProps => {
  const allowSourceType = []
  if (data.allowSourceTypeUI) {
    allowSourceType.push(SourceType.UI)
  }
  if (data.allowSourceTypeAPI) {
    allowSourceType.push(SourceType.API)
  }
  return {
    body: {
      ip_allowlist_config: {
        allowed_source_type: allowSourceType,
        description: data?.description,
        enabled: false, // always false while creating
        identifier: data.identifier,
        ip_address: data.ipAddress,
        name: data.name,
        tags: data?.tags
      }
    }
  }
}

export const buildUpdateIPAllowlistPayload = (
  data: IIPAllowlistForm,
  overrideFields?: any
): UpdateIpAllowlistConfigProps => {
  const allowSourceType = []
  if (data.allowSourceTypeUI) {
    allowSourceType.push(SourceType.UI)
  }
  if (data.allowSourceTypeAPI) {
    allowSourceType.push(SourceType.API)
  }
  return {
    'ip-config-identifier': data.identifier,
    body: {
      ip_allowlist_config: {
        allowed_source_type: allowSourceType,
        description: data?.description,
        enabled: data?.enabled,
        identifier: data.identifier,
        ip_address: data.ipAddress,
        name: data.name,
        tags: data?.tags,
        ...overrideFields
      }
    }
  }
}
