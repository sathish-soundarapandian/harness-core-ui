/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'

import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useLocalStorage } from '@common/hooks'
import type { UserInfo } from 'services/cd-ng'

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
export interface PreferenceStoreProps<T> {
  set(scope: PreferenceScope, entityToPersist: string, value: T /*options?: PreferenceStoreOptions*/): void
  get(scope: PreferenceScope, entityToRetrieve: string /*options?: PreferenceStoreOptions*/): T
  clear(scope: PreferenceScope, entityToRetrieve: string /*options?: PreferenceStoreOptions*/): void
  updatePreferenceStore(data: PreferenceStoreStateProps): void
}

export interface ScopeContext {
  accountId?: string
  projectIdentifier?: string
  orgIdentifier?: string
  userId?: string
}

export interface PreferenceStoreContextProps<T> {
  preference: T
  setPreference: (value: T) => void
  clearPreference: () => void
  updatePreferenceStore: (data: PreferenceStoreStateProps) => void
}

export const PREFERENCES_TOP_LEVEL_KEY = 'preferences'

export const PreferenceStoreContext = React.createContext<PreferenceStoreProps<any>>({
  set: () => void 0,
  get: () => void 0,
  clear: () => void 0,
  updatePreferenceStore: () => void 0
})

export function usePreferenceStore<T>(
  scope: PreferenceScope,
  entity: string
  // options: PreferenceStoreOptions = {}
): PreferenceStoreContextProps<T> {
  const { get, set, clear, updatePreferenceStore } = React.useContext(PreferenceStoreContext)

  const preference = get(scope, entity /*options*/)
  const setPreference = set.bind(null, scope, entity /*options*/)
  const clearPreference = clear.bind(null, scope, entity /*options*/)

  return { preference, setPreference, clearPreference, updatePreferenceStore }
}

const checkAccess = (scope: PreferenceScope, contextArr: (string | undefined)[]): void => {
  if (!contextArr || contextArr?.some(val => val === undefined)) {
    throw new Error(`Access to "${scope}" scope is not available in the current context.`)
  }
}

const getKey = (arr: (string | undefined)[], entity: string): string => {
  return [...arr, entity].join('/')
}

export const PreferenceStoreProvider: React.FC = (props: React.PropsWithChildren<unknown>) => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [state, setState] = React.useState<PreferenceStoreStateProps>({
    currentUserInfo: {}
  })
  const [currentPreferences, setPreferences] = useLocalStorage<Record<string, unknown>>(PREFERENCES_TOP_LEVEL_KEY, {})
  const userId = state.currentUserInfo?.email
  const [scopeToKeyMap, setScopeToKeyMap] = React.useState({
    [PreferenceScope.USER]: [userId],
    [PreferenceScope.ACCOUNT]: [accountId],
    [PreferenceScope.ORG]: [accountId, orgIdentifier],
    [PreferenceScope.PROJECT]: [accountId, orgIdentifier, projectIdentifier],
    [PreferenceScope.MACHINE]: []
  })

  useEffect(() => {
    setScopeToKeyMap({
      [PreferenceScope.USER]: [userId],
      [PreferenceScope.ACCOUNT]: [accountId],
      [PreferenceScope.ORG]: [accountId, orgIdentifier],
      [PreferenceScope.PROJECT]: [accountId, orgIdentifier, projectIdentifier],
      [PreferenceScope.MACHINE]: []
    })
  }, [accountId, orgIdentifier, projectIdentifier, userId])

  const setPreference = (key: string, value: unknown /* options?: PreferenceStoreOptions */): void => {
    // if (options?.fromBackend) {
    //   // TODO: ENHANCEMENT: call backend to set
    // } else {
    const newPreferences = { ...currentPreferences, [key]: value }
    setPreferences(newPreferences)
    // }
  }

  const getPreference = (key: string /*options?: PreferenceStoreOptions*/): any => {
    // if (options?.fromBackend) {
    //   // TODO: ENHANCEMENT: call backend to get and return
    //   return null
    // } else {
    return currentPreferences[key]
    // }
  }

  const clearPreference = (key: string /*options?: PreferenceStoreOptions*/): void => {
    // if (options?.fromBackend) {
    //   // TODO: ENHANCEMENT: call backend to clear or delete
    // } else {
    const newPreferences = { ...currentPreferences }
    delete newPreferences[key]
    setPreferences(newPreferences)
    // }
  }

  const set = (
    scope: PreferenceScope,
    entityToPersist: string,
    // options: PreferenceStoreOptions,
    value: unknown
  ): void => {
    checkAccess(scope, scopeToKeyMap[scope])
    const key = getKey(scopeToKeyMap[scope], entityToPersist)
    setPreference(key, value /*options*/)
  }

  const get = (scope: PreferenceScope, entityToRetrieve: string /*options?: PreferenceStoreOptions*/): unknown => {
    const key = getKey(scopeToKeyMap[scope], entityToRetrieve)
    return getPreference(key /*options*/)
  }

  const clear = (scope: PreferenceScope, entityToRetrieve: string /*options?: PreferenceStoreOptions*/): void => {
    const key = getKey(scopeToKeyMap[scope], entityToRetrieve)
    clearPreference(key /*options*/)
  }

  function updatePreferenceStore(data: PreferenceStoreStateProps): void {
    setState(prevState => ({
      ...prevState,
      currentUserInfo: defaultTo(data?.currentUserInfo, prevState?.currentUserInfo)
    }))
  }

  return (
    <PreferenceStoreContext.Provider
      value={{
        set,
        get,
        clear,
        updatePreferenceStore
      }}
    >
      {props.children}
    </PreferenceStoreContext.Provider>
  )
}
