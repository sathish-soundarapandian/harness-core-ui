/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getMultiTypeFromValue, IconName, MultiSelectOption, MultiTypeInputType, SelectOption } from '@harness/uicore'
import { defaultTo } from 'lodash-es'
import { Scope } from '@common/interfaces/SecretsInterface'
import { ModuleName, moduleToModuleNameMapping } from 'framework/types/ModuleName'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { Editions } from '@common/constants/SubscriptionTypes'
import type { UserMetadataDTO } from 'services/cd-ng'
import type { Module } from '@common/interfaces/RouteInterfaces'

const PR_ENV_HOST_NAME = 'pr.harness.io'

interface SetPageNumberProps {
  setPage: (value: number) => void
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

export function isValueFixed(
  value?: boolean | string | number | SelectOption | string[] | MultiSelectOption[]
): boolean {
  const type = getMultiTypeFromValue(value)

  return isMultiTypeFixed(type)
}

export function isMultiTypeRuntime(type: MultiTypeInputType): boolean {
  return [MultiTypeInputType.EXECUTION_TIME, MultiTypeInputType.RUNTIME].includes(type)
}

export function isValueRuntimeInput(
  value?: boolean | string | number | SelectOption | string[] | MultiSelectOption[]
): boolean {
  const type = getMultiTypeFromValue(value)

  return isMultiTypeRuntime(type)
}

export function isMultiTypeExpression(type: MultiTypeInputType): boolean {
  return type === MultiTypeInputType.EXPRESSION
}

export function getLastURLPathParam(URL: string): string {
  const splitArray = URL.split('/')
  return splitArray.length > 0 ? splitArray[splitArray.length - 1]?.split('-')?.join('') : ''
}

export function isValueExpression(
  value?: boolean | string | number | SelectOption | string[] | MultiSelectOption[]
): boolean {
  const type = getMultiTypeFromValue(value)

  return isMultiTypeExpression(type)
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

export interface NumberFormatterOptions {
  truncate?: boolean
}

export const numberFormatter: (value?: number, options?: NumberFormatterOptions) => string = (
  value?: number,
  options = { truncate: true }
) => {
  // istanbul ignore if
  if (value === undefined) {
    return ''
  }
  const truncateOptions = [
    { value: 1000000, suffix: 'm' },
    { value: 1000, suffix: 'k' }
  ]
  if (options.truncate) {
    for (const truncateOption of truncateOptions) {
      if (value >= truncateOption.value) {
        const truncatedValue = value / truncateOption.value
        // istanbul ignore if
        if (truncatedValue % 1 !== 0) {
          return `${truncatedValue.toFixed(1)}${truncateOption.suffix}`
        }
        return `${truncatedValue}${truncateOption.suffix}`
      }
    }
  }
  return `${getFixed(value)}`
}

export const getFixed = (value: number, places = 1): number => {
  if (value % 1 === 0) {
    return value
  }
  return parseFloat(value.toFixed(places))
}

export const getRefFromIdentifier = (
  identifier: string,
  orgIdentifier?: string,
  projectIdentifier?: string
): string => {
  if (projectIdentifier) {
    return identifier
  } else if (!orgIdentifier) {
    return `account.${identifier}`
  }
  return `org.${identifier}`
}

export const getIdentifierFromScopedRef = (entity: string): string => {
  return entity.indexOf('.') < 0 ? entity : entity.split('.')[1]
}

export const countAllKeysInObject = (obj: Record<string, any>): number =>
  Object.keys(obj).reduce((acc, curr) => {
    if (typeof obj[curr] === 'object' && !Array.isArray(obj[curr]) && obj[curr] !== null) {
      return 1 + acc + countAllKeysInObject(obj[curr])
    } else {
      return 1 + acc
    }
  }, 0)

export const isSimplifiedYAMLEnabled = (module?: Module, isSimpliedYAMLFFEnabled?: boolean): boolean => {
  return isSimpliedYAMLFFEnabled
    ? module?.valueOf().toLowerCase() === moduleToModuleNameMapping.ci.toLowerCase() ||
        module?.valueOf().toLowerCase() === moduleToModuleNameMapping.iacm.toLowerCase()
    : false
}
