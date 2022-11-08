/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getMultiTypeFromValue, IconName, MultiSelectOption, MultiTypeInputType, SelectOption } from '@harness/uicore'
import { defaultTo } from 'lodash-es'
import { Scope } from '@common/interfaces/SecretsInterface'
import { ModuleName } from 'framework/types/ModuleName'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { Editions } from '@common/constants/SubscriptionTypes'
import type { UserMetadataDTO } from 'services/cd-ng'

const PR_ENV_HOST_NAME = 'pr.harness.io'

interface SetPageNumberProps {
  setPage: (value: React.SetStateAction<number>) => void
  pageItemsCount?: number
  page: number
}

export const getModuleIcon = (module: ModuleName): IconName => {
  switch (module) {
    case ModuleName.CD:
      return 'cd-main'
    case ModuleName.CV:
      return 'cv-main'
    case ModuleName.CI:
      return 'ci-main'
    case ModuleName.CE:
      return 'ce-main'
    case ModuleName.CF:
      return 'cf-main'
    case ModuleName.STO:
      return 'sto-color-filled'
    case ModuleName.CHAOS:
      return 'chaos-main'
  }
  return 'nav-project'
}

export const getReference = (scope?: Scope, identifier?: string): string | undefined => {
  switch (scope) {
    case Scope.PROJECT:
      return identifier
    case Scope.ORG:
      return `org.${identifier}`
    case Scope.ACCOUNT:
      return `account.${identifier}`
  }
}

export const setPageNumber = ({ setPage, pageItemsCount, page }: SetPageNumberProps): void => {
  if (pageItemsCount === 0 && page > 0) {
    setPage(page - 1)
  }
}

export const formatCount = (num: number): string => {
  const min = 1e3
  if (num >= min) {
    const units = ['k', 'M', 'B', 'T']
    const order = Math.floor(Math.log(num) / Math.log(1000))
    const finalNum = Math.round(num / 1000 ** order)
    if (finalNum === min && order < units.length) {
      return 1 + units[order]
    }
    return finalNum + units[order - 1]
  }
  return num.toLocaleString()
}

export function useGetCommunity(): boolean {
  const { licenseInformation } = useLicenseStore()
  return licenseInformation?.['CD']?.edition === Editions.COMMUNITY
}

export const isOnPrem = (): boolean => window.deploymentType === 'ON_PREM'

export const focusOnNode = (node: HTMLElement): void => {
  const oldTabIndex = node.tabIndex
  node.tabIndex = -1
  node.focus()
  node.tabIndex = oldTabIndex
}

const HOTJAR_SUPPRESSION_ATTR = 'data-hj-suppress'

// Utility to add `data-hj-suppress` into a collection of elements to
// suppress data from HotJar recording
// @see https://bit.ly/3rCgpOY
export const suppressHotJarRecording = (elements: Element[] | null | undefined): void => {
  if (window.hj) {
    elements?.forEach?.((e: Element) => {
      if (!e.hasAttribute(HOTJAR_SUPPRESSION_ATTR)) {
        e.setAttribute(HOTJAR_SUPPRESSION_ATTR, 'true')
      }
    })
  }
}

// Utility to generate { 'data-hj-suppress': true } attribute if HotJar is available
export const addHotJarSuppressionAttribute = (): { [HOTJAR_SUPPRESSION_ATTR]: boolean } | undefined =>
  window.hj ? { [HOTJAR_SUPPRESSION_ATTR]: true } : undefined

// Utility to check if environment is a PR environment
export const isPR = (): boolean => {
  return location.hostname?.includes(PR_ENV_HOST_NAME)
}

// Utility to check if environment is a local develop environment
export const isLocalHost = (): boolean => {
  return location.hostname === 'localhost' || location.hostname === '127.0.0.1'
}

export const getPREnvNameFromURL = (url: string): string => {
  if (!url) {
    return ''
  }
  return isPR() ? url.split(PR_ENV_HOST_NAME)?.[1]?.split('/')?.[1] : ''
}

export function isMultiTypeFixed(type: MultiTypeInputType): boolean {
  return type === MultiTypeInputType.FIXED
}

export function isMultiTypeRuntime(type: MultiTypeInputType): boolean {
  return [MultiTypeInputType.EXECUTION_TIME, MultiTypeInputType.RUNTIME].includes(type)
}

export function isValueRuntimeInput(
  value: boolean | string | number | SelectOption | string[] | MultiSelectOption[]
): boolean {
  const type = getMultiTypeFromValue(value)

  return isMultiTypeRuntime(type)
}

export function isMultiTypeExpression(type: MultiTypeInputType): boolean {
  return type === MultiTypeInputType.EXPRESSION
}

export const getUserName = (user: UserMetadataDTO): string => {
  return defaultTo(user.name, user.email)
}

export const REFERER_URL = 'refererURL'

export const getSavedRefererURL = (): string => localStorage.getItem(REFERER_URL) || ''
export const getGaClientID = (): string => {
  try {
    return defaultTo(
      document?.cookie
        ?.split('; ')
        ?.find((key: string) => key.includes('_ga='))
        ?.split('.')
        ?.slice(2)
        ?.join('.'),
      ''
    )
  } catch (e) {
    return ''
  }
}

export const isWindowsOS = (): boolean => navigator?.appVersion?.indexOf('Win') != -1

export const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve((reader.result || '').toString())
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

export const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img')

    img.onload = () => {
      const width = img.naturalWidth
      const height = img.naturalHeight

      resolve({ width, height })
    }
    img.onerror = reject
    img.src = url
  })
}
