/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import type { GetDataError } from 'restful-react'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type {
  Application,
  Environment,
  RestResponsePageResponseApplication,
  RestResponsePageResponseEnvironment,
  RestResponsePageResponseService,
  Service
} from 'services/portal'

export const getApplicationsData = (applicationsData: RestResponsePageResponseApplication | null): SelectOption[] => {
  return (
    ((applicationsData?.resource as any)?.response?.map((el: Application) => ({
      label: el?.name,
      value: el?.appId
    })) as SelectOption[]) || []
  )
}

export const getServicesData = (servicesData: RestResponsePageResponseService | null): SelectOption[] => {
  return (
    ((servicesData?.resource as any)?.response?.map((el: Service) => ({
      label: el?.name,
      value: el?.uuid
    })) as SelectOption[]) || []
  )
}

export const getEnvironmentsData = (environmentsData: RestResponsePageResponseEnvironment | null): SelectOption[] => {
  return (
    ((environmentsData?.resource as any)?.response?.map((el: Environment) => ({
      label: el?.name,
      value: el?.uuid
    })) as SelectOption[]) || []
  )
}

export function showToasterError(
  error: GetDataError<unknown> | null,
  clear: () => void,
  showError: (message: React.ReactNode, timeout?: number | undefined, key?: string | undefined) => void
): void {
  if (error) {
    clear()
    showError(getErrorMessage(error))
  }
}

export function getPlaceHolder(loadingFlag: boolean, placeholderText: string, loadingText: string): string {
  return loadingFlag ? loadingText : placeholderText
}

export function getHarnessCDFieldValue(
  currentApplicationId: string,
  options: SelectOption[],
  fieldToGet: SelectOption | string
): SelectOption {
  return (!currentApplicationId ? options?.find(el => el.value === fieldToGet) : fieldToGet) as SelectOption
}
