/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'

import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { FeatureFlag } from '@common/featureFlags'
import { useLocalStorage } from '@common/hooks'
import type { UserInfo } from 'services/cd-ng'

export type FeatureFlagMap = Partial<Record<FeatureFlag, boolean>>

export interface PreferencePeripheralProps extends ProjectPathProps {
  userId: string
}

export enum PreferenceScope {
  USER = 'USER',
  ACCOUNT = 'ACCOUNT',
  ORG = 'ORG',
  PROJECT = 'PROJECT',
  MACHINE = 'MACHINE' // or workstation. This will act as default PreferenceScope
}

export interface PreferenceStoreOptions {
  fromBackend?: boolean
}

export interface PreferenceStoreStateProps {
  readonly currentUserInfo: UserInfo | undefined
}

/**
 * Preference Store - helps to save ANY user-personalisation info
 */
export interface PreferenceStoreProps {
  set(scope: PreferenceScope, entityToPersist: string, value: unknown, options?: PreferenceStoreOptions): void
  get(scope: PreferenceScope, entityToRetrieve: string, options?: PreferenceStoreOptions): any
  updatePreferenceStore(data: PreferenceStoreStateProps): void
}

export interface ScopeContext {
  accountId?: string
  projectIdentifier?: string
  orgIdentifier?: string
  userId?: string
}

const TOP_LEVEL_KEY = 'preferences'

export const PreferenceStoreContext = React.createContext<PreferenceStoreProps>({
  set: () => void 0,
  get: () => void 0,
  updatePreferenceStore: () => void 0
})

export function usePreferenceStore(
  scope: PreferenceScope,
  entity: string,
  options: PreferenceStoreOptions = {}
): [any, (value: any) => void, (data: PreferenceStoreStateProps) => void] {
  const { get, set, updatePreferenceStore } = React.useContext(PreferenceStoreContext)

  const value = get(scope, entity, options)
  const setPreference = set.bind(null, scope, entity, options)

  return [value, setPreference, updatePreferenceStore]
}

const checkAccess = (scope: PreferenceScope, contextToCheck: string | undefined): void => {
  if (!contextToCheck) {
    throw new Error(`Access to "${scope}" scope is not available in the current context.`)
  }
}

export const getStringKeyFromObjectValues = (
  scope: PreferenceScope,
  contextObj: ScopeContext,
  entity: string,
  shouldCheckAccess = true,
  glue = '/'
): string => {
  // pick specific keys, get their values, and join with a `/`
  const scopeArr = []
  switch (scope) {
    case PreferenceScope.USER:
      shouldCheckAccess && checkAccess(scope, contextObj?.userId)
      scopeArr.push(contextObj.userId)
      break
    case PreferenceScope.ACCOUNT:
      shouldCheckAccess && checkAccess(scope, contextObj?.accountId)
      scopeArr.push(contextObj.accountId)
      break
    case PreferenceScope.ORG:
      shouldCheckAccess && checkAccess(scope, contextObj?.orgIdentifier)
      scopeArr.push(contextObj.accountId, contextObj.orgIdentifier)
      break
    case PreferenceScope.PROJECT:
      shouldCheckAccess && checkAccess(scope, contextObj?.projectIdentifier)
      scopeArr.push(contextObj.accountId, contextObj.orgIdentifier, contextObj.projectIdentifier)
      break
    default:
      // do nothing
      break
  }
  return scopeArr.concat([entity]).join(glue)
}

export const PreferenceStoreProvider: React.FC = (props: React.PropsWithChildren<unknown>) => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [state, setState] = React.useState<PreferenceStoreStateProps>({
    currentUserInfo: {}
  })
  const [currentPreferences, setPreferences] = useLocalStorage<Record<string, unknown>>(TOP_LEVEL_KEY, {})
  const userId = state.currentUserInfo?.email
  const contextObj = {
    accountId,
    projectIdentifier,
    orgIdentifier,
    userId
  }

  const setPreference = (key: string, value: unknown, options?: PreferenceStoreOptions): void => {
    if (options?.fromBackend) {
      // TODO: ENHANCEMENT: call backend to set
    } else {
      const newPreferences = { ...currentPreferences, [key]: value }
      setPreferences(newPreferences)
    }
  }

  const getPreference = (key: string, options?: PreferenceStoreOptions): any => {
    if (options?.fromBackend) {
      // TODO: ENHANCEMENT: call backend to get and return
      return
    } else {
      return currentPreferences[key]
    }
  }

  const set = (
    scope: PreferenceScope,
    entityToPersist: string,
    options: PreferenceStoreOptions,
    value: unknown
  ): void => {
    const key = getStringKeyFromObjectValues(scope, contextObj, entityToPersist)
    setPreference(key, value, options)
  }

  const get = (scope: PreferenceScope, entityToRetrieve: string, options?: PreferenceStoreOptions): unknown => {
    const key = getStringKeyFromObjectValues(scope, contextObj, entityToRetrieve, false)
    return getPreference(key, options)
  }

  function updatePreferenceStore(data: PreferenceStoreStateProps): void {
    setState(prevState => ({
      ...prevState,
      currentUserInfo: data.currentUserInfo || prevState?.currentUserInfo
    }))
  }

  return (
    <PreferenceStoreContext.Provider
      value={{
        set,
        get,
        updatePreferenceStore
      }}
    >
      {props.children}
    </PreferenceStoreContext.Provider>
  )
}
