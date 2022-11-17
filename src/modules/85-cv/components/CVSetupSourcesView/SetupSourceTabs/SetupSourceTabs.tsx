/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { createContext, useEffect, useMemo, useState } from 'react'
import { Container, Tab, Tabs } from '@harness/uicore'
import { useHistory, useParams } from 'react-router-dom'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { getRoutePathByType } from '@cv/utils/routeUtils'
import { CVObjectStoreNames, useIndexedDBHook } from '@cv/hooks/IndexedDBHook/IndexedDBHook'
import { OnboardingEntites } from './SetupSourceTabs.constants'
import css from './SetupSourceTabs.module.scss'

type TabStatus = 'SUCCESS' | 'WARNING' | 'ERROR' | 'NO_STATUS'

type TabInfo = {
  tabStatus?: TabStatus
}

export interface SetupSourceTabsProps<T> {
  data: T
  children: JSX.Element[] | JSX.Element
  tabTitles: string[]
  determineMaxTab?: (data: T) => number
  disableCache?: boolean
}

export interface SetupSourceTabsProviderProps<T> {
  sourceData: T
  tabsInfo?: TabInfo[]
  onPrevious: (updatedData?: T, updatedTabInfo?: TabInfo) => Promise<void>
  onNext: (updatedData: T, updatedTabInfo?: TabInfo) => Promise<void>
  children: React.ReactNode
}

type CachedSourceObject = {
  type: string
  name: string
  identifier: string
  routeUrl: string
}

type CachedSetupObject = {
  setupID: string
  monitoringSources?: CachedSourceObject[]
  changeSources?: CachedSourceObject[]
  verificationJobs?: CachedSourceObject[]
}

type UseSetupSourceTabsHookReturnValues = {
  isInitializingDB: boolean
  sourceData: any
  tabsInfo: TabInfo[]
  activeTabIndex: number
  onSwitchTab: (updatedData: any, newTabIndex: number, updatedTabInfo?: TabInfo) => Promise<void>
  onPrevious: (updatedData?: any, updatedTabInfo?: TabInfo) => Promise<void>
  onNext: (updatedData: any, updatedTabInfo?: TabInfo) => Promise<void>
}

export const SetupSourceTabsContext = createContext<{
  tabsInfo?: TabInfo[]
  sourceData: any
  onNext: (updatedData: any, updatedTabInfo?: TabInfo) => Promise<void>
  onPrevious: (updatedData?: any, updatedTabInfo?: TabInfo) => Promise<void>
}>({
  tabsInfo: [],
  sourceData: {},
  onNext: () => Promise.resolve(),
  onPrevious: () => Promise.resolve()
})

function initializeTabsInfo(tabTitles: string[]): TabInfo[] {
  const tabsInfo: TabInfo[] = []
  tabTitles?.forEach(tabTitle => {
    if (tabTitle?.length) {
      tabsInfo.push({ tabStatus: 'NO_STATUS' })
    }
  })
  return tabsInfo
}

export function typeToSetupSourceType(type: any): string {
  switch (type) {
    case 'KUBERNETES':
    case 'HARNESS_CD10':
      return OnboardingEntites.CHANGE_SOURCE
    default:
      return OnboardingEntites.MONITORING_SOURCE
  }
}

export function getSetupSourceRoutingIndex(type: any): number {
  switch (type) {
    case 'KUBERNETES':
    case 'HARNESS_CD10':
      return 1
    default:
      return 2
  }
}

export function addItemToCache(sources: CachedSourceObject[], item: CachedSourceObject): CachedSourceObject[] {
  if (!sources?.length) {
    return [item]
  }

  const existingIndex = sources.findIndex(source => {
    if (!source.identifier) return
    return source.identifier === item.identifier
  })

  if (existingIndex !== -1) {
    sources[existingIndex] = item
  } else {
    sources.push(item)
  }

  return sources
}

function getRouteUrlForOnboarding(type: any, sourceType: string, identifier: string, params: ProjectPathProps): string {
  if (sourceType === OnboardingEntites.CHANGE_SOURCE) {
    return routes.toCVActivitySourceEditSetup({
      ...params,
      activitySource: getRoutePathByType(type),
      activitySourceId: identifier
    })
  } else if (sourceType === OnboardingEntites.MONITORING_SOURCE) {
    return routes.toCVAdminSetupMonitoringSourceEdit({
      ...params,
      monitoringSource: getRoutePathByType(type),
      identifier
    })
  }

  return ''
}

export function buildObjectToStore(
  data: any,
  savedData: CachedSetupObject,
  sourceType: string,
  params: ProjectPathProps
): CachedSetupObject {
  const dataToSave: CachedSourceObject = {
    type: data.type,
    name: data.monitoringSourceName || data.name,
    identifier: data.identifier,
    routeUrl: getRouteUrlForOnboarding(data.type, sourceType, data.identifier, params)
  }

  const objectToStore: CachedSetupObject = {
    ...savedData,
    setupID: `${params.accountId}-${params.orgIdentifier}-${params.projectIdentifier}`
  }
  switch (sourceType) {
    case OnboardingEntites.MONITORING_SOURCE:
      objectToStore.monitoringSources = addItemToCache(objectToStore.monitoringSources || [], dataToSave)
      break
    case OnboardingEntites.CHANGE_SOURCE:
      objectToStore.changeSources = addItemToCache(objectToStore.changeSources || [], dataToSave)
      break
    case OnboardingEntites.VERIFICATION_JOBS:
      objectToStore.verificationJobs = addItemToCache(objectToStore.verificationJobs || [], dataToSave)
      break
  }

  return objectToStore
}

export function useSetupSourceTabsHook<T>(
  data: T,
  tabsInformation: TabInfo[],
  disableCache = false
): UseSetupSourceTabsHookReturnValues {
  const [{ activeTabIndex, sourceData, tabsInfo }, setTabsState] = useState({
    activeTabIndex: 0,
    sourceData: data,
    tabsInfo: tabsInformation
  })
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const history = useHistory()
  const indexedDBEntryKey = `${accountId}-${orgIdentifier}-${projectIdentifier}`

  const { isInitializingDB, dbInstance } = useIndexedDBHook({
    clearStroreList: [CVObjectStoreNames.ONBOARDING_SOURCES]
  })

  useEffect(() => {
    setTabsState(currentTabsState => ({ ...currentTabsState, tabsInfo: tabsInformation }))
  }, [tabsInfo])

  async function onSwitchTab<U>(updatedData: U, newTabIndex: number, updatedTabInfo?: TabInfo): Promise<void> {
    if (!dbInstance) return

    if (newTabIndex > tabsInfo.length - 1) {
      const setupSourceType = typeToSetupSourceType((updatedData as any).type as any)
      dbInstance.get(CVObjectStoreNames.SETUP, indexedDBEntryKey)?.then(async (savedData: CachedSetupObject) => {
        try {
          await Promise.all([
            dbInstance.put(
              CVObjectStoreNames.SETUP,
              buildObjectToStore(updatedData, savedData, setupSourceType, {
                projectIdentifier,
                orgIdentifier,
                accountId
              })
            ),
            dbInstance.clear(CVObjectStoreNames.ONBOARDING_SOURCES)
          ])
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(`IDBP, saving on last tab - `, e)
        }
        history.push(
          `${routes.toCVAdminSetup({
            accountId,
            projectIdentifier,
            orgIdentifier
          })}?step=${getSetupSourceRoutingIndex((updatedData as any).type as any)}`
        )
      })
    } else {
      setTabsState(currentState => {
        if (updatedTabInfo) currentState.tabsInfo[activeTabIndex] = updatedTabInfo
        return { activeTabIndex: newTabIndex, sourceData: updatedData as any, tabsInfo: [...currentState.tabsInfo] }
      })

      // on first page and hit previous, go back to previous page
      if (newTabIndex === -1) {
        dbInstance.clear(CVObjectStoreNames.ONBOARDING_SOURCES)
        history.goBack()
        return
      }

      try {
        await dbInstance.put(CVObjectStoreNames.ONBOARDING_SOURCES, {
          sourceID: indexedDBEntryKey,
          sourceData: updatedData,
          tabsInfo,
          currentTabIndex: newTabIndex
        })
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(`IDBP, saving on tab currentTabIndex: ${newTabIndex}`, e)
      }
    }
  }

  useEffect(() => {
    if (!isInitializingDB && dbInstance && !disableCache) {
      dbInstance.get(CVObjectStoreNames.ONBOARDING_SOURCES, indexedDBEntryKey)?.then(cachedData => {
        if (cachedData) {
          setTabsState({
            activeTabIndex: cachedData.currentTabIndex,
            sourceData: cachedData.sourceData,
            tabsInfo: cachedData.tabsInfo
          })
        }
      })
    }
  }, [isInitializingDB, dbInstance, indexedDBEntryKey])

  useEffect(() => {
    if (data) setTabsState(previousState => ({ ...previousState, tabsData: data }))
  }, [data])

  return {
    isInitializingDB,
    sourceData,
    tabsInfo,
    activeTabIndex,
    onSwitchTab,
    onPrevious: (updatedData, updatedTabInfo) =>
      onSwitchTab(updatedData || sourceData, activeTabIndex - 1, updatedTabInfo),
    onNext: (updatedData, updatedTabInfo) => onSwitchTab(updatedData, activeTabIndex + 1, updatedTabInfo)
  }
}

export function SetupSourceTabsProvider<T>(props: SetupSourceTabsProviderProps<T>): JSX.Element {
  const { children, ...restProps } = props
  return <SetupSourceTabsContext.Provider value={restProps}>{children}</SetupSourceTabsContext.Provider>
}

export function SetupSourceTabs<T>(props: SetupSourceTabsProps<T>): JSX.Element {
  const { data, tabTitles, children, determineMaxTab, disableCache } = props
  const [tabsLength, setTabsLength] = useState<number>(0)
  const tabInfo = useMemo(() => initializeTabsInfo(tabTitles), [tabTitles])
  const { sourceData, activeTabIndex, onSwitchTab, onNext, onPrevious } = useSetupSourceTabsHook(
    data,
    tabInfo,
    disableCache
  )
  const maxEnabledTab = determineMaxTab?.(sourceData)
  const updatedChildren = useMemo(() => (Array.isArray(children) ? children : [children]), [children])

  return (
    <SetupSourceTabsProvider
      sourceData={sourceData}
      onPrevious={onPrevious}
      onNext={async (updatedData: any, updatedTabInfo?: TabInfo | undefined) => {
        setTabsLength(tabsL => (tabsL > tabTitles.length ? tabTitles.length : tabsL + 1))
        await onNext(updatedData, updatedTabInfo)
      }}
    >
      <Container className={css.tabWrapper}>
        <Tabs
          id="setup-sources"
          selectedTabId={activeTabIndex}
          onChange={(newTabId: number) => onSwitchTab(sourceData, newTabId)}
        >
          {updatedChildren.map((child, index) => (
            <Tab
              key={tabTitles[index]}
              id={index}
              title={tabTitles[index]}
              disabled={index > (maxEnabledTab ? maxEnabledTab : tabsLength)}
              panel={child}
            />
          ))}
        </Tabs>
      </Container>
    </SetupSourceTabsProvider>
  )
}
