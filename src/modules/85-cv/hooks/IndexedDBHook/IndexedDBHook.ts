/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IDBPDatabase } from 'idb';
import { openDB } from 'idb'
import { useEffect, useState } from 'react'
import SessionToken from 'framework/utils/SessionToken'
import { useToaster } from '@common/exports'
import { ModuleName } from 'framework/types/ModuleName'
import { loggerFor } from 'framework/logging/logging'

export const CVObjectStoreNames = {
  LIST_ENTITIES: 'datasourceListEntity',
  APPD_TIERS: 'appDTiers',
  ONBOARDING_JOURNEY: 'onBoardingJourney', // Remove this when old onboarding is removed
  SETUP: 'setup', // New setup/onboading journey
  ONBOARDING_SOURCES: 'onBoardingSources',
  MONITORED_SERVICE: 'monitoredService'
}

export const CVIndexedDBPrimaryKeys = {
  APPD_APP_NAME: 'applicationName',
  APPD_APP_ID: 'appId',
  DATASOURCE_ID: 'dataSourceId',
  SETUP_ID: 'setupID',
  SOURCE_ID: 'sourceID',
  MONITORED_SERVICE: 'monitoredService'
}

export const CVIndexedObjectStoreToPrimaryKey = {
  [CVObjectStoreNames.LIST_ENTITIES]: CVIndexedDBPrimaryKeys.DATASOURCE_ID,
  [CVObjectStoreNames.APPD_TIERS]: [CVIndexedDBPrimaryKeys.APPD_APP_ID, CVIndexedDBPrimaryKeys.DATASOURCE_ID],
  [CVObjectStoreNames.ONBOARDING_JOURNEY]: CVIndexedDBPrimaryKeys.DATASOURCE_ID,
  [CVObjectStoreNames.SETUP]: CVIndexedDBPrimaryKeys.SETUP_ID,
  [CVObjectStoreNames.ONBOARDING_SOURCES]: CVIndexedDBPrimaryKeys.SOURCE_ID,
  [CVObjectStoreNames.MONITORED_SERVICE]: CVIndexedDBPrimaryKeys.MONITORED_SERVICE
}

const logger = loggerFor(ModuleName.CV)

const OBJECT_STORES = [
  {
    name: CVObjectStoreNames.LIST_ENTITIES,
    options: { keyPath: CVIndexedObjectStoreToPrimaryKey[CVObjectStoreNames.LIST_ENTITIES], autoIncrement: false }
  },
  {
    name: CVObjectStoreNames.APPD_TIERS,
    options: {
      keyPath: CVIndexedObjectStoreToPrimaryKey[CVObjectStoreNames.APPD_TIERS],
      autoIncrement: false
    },
    index: {
      indexName: 'appDTiersIndex',
      property: CVIndexedObjectStoreToPrimaryKey[CVObjectStoreNames.APPD_TIERS],
      options: { multiEntry: false, unique: true }
    }
  },
  {
    name: CVObjectStoreNames.ONBOARDING_JOURNEY,
    options: { keyPath: CVIndexedDBPrimaryKeys.DATASOURCE_ID, autoIncrement: false },
    index: {
      indexName: 'onBoardingJourneyIndex',
      property: CVIndexedObjectStoreToPrimaryKey[CVObjectStoreNames.ONBOARDING_JOURNEY],
      options: { unique: true }
    }
  },
  {
    name: CVObjectStoreNames.SETUP,
    options: { keyPath: CVIndexedDBPrimaryKeys.SETUP_ID, autoIncrement: false },
    index: {
      indexName: 'setUpJourneyIndex',
      property: CVIndexedObjectStoreToPrimaryKey[CVObjectStoreNames.SETUP],
      options: { unique: true }
    }
  },

  {
    name: CVObjectStoreNames.ONBOARDING_SOURCES,
    options: { keyPath: CVIndexedDBPrimaryKeys.SOURCE_ID, autoIncrement: false },
    index: {
      indexName: 'onBoardingSourcesIndex',
      property: CVIndexedObjectStoreToPrimaryKey[CVObjectStoreNames.ONBOARDING_SOURCES],
      options: { unique: true }
    }
  },
  {
    name: CVObjectStoreNames.MONITORED_SERVICE,
    options: { keyPath: CVIndexedDBPrimaryKeys.MONITORED_SERVICE, autoIncrement: false },
    index: {
      indexName: 'monitoredServiceIndex',
      property: CVIndexedObjectStoreToPrimaryKey[CVObjectStoreNames.MONITORED_SERVICE],
      options: { unique: true }
    }
  }
]

async function initializeCVDB(setDBInstance: (dbInstance?: IDBPDatabase) => void): Promise<IDBPDatabase | void> {
  try {
    const dbInstance = await openDB('CV-INDEXED-DB', SessionToken.getLastTokenSetTime() || new Date().getTime(), {
      upgrade(db) {
        for (const store of OBJECT_STORES) {
          try {
            const dbStore = db.createObjectStore(store.name, store.options)
            if (store.index) {
              const { indexName, property, options } = store.index
              dbStore.createIndex(indexName, property, options)
            }
          } catch (exception) {
            logger.error(`Exception thrown when attempting to create an object store: ${exception}`)
          }
        }
      },
      blocked() {
        dbInstance?.close()
        setDBInstance()
      },
      blocking() {
        dbInstance?.close()
        setDBInstance()
      }
    })
    return dbInstance
  } catch (e) {
    logger.error(`Exception thrown by indexedDB: ${e}`)
  }
}

type CVIndexedDBHookReturnType = {
  isInitializingDB: boolean
  dbInstance?: IDBPDatabase
}

interface CVIndexDBHookProps {
  clearStroreList?: string[] // making it optional for now, change it after removing usages in old onboarding
}

export function useIndexedDBHook(props?: CVIndexDBHookProps): CVIndexedDBHookReturnType {
  const [isInitializingDB, setInitializingDB] = useState<boolean>(true)
  const [dbInstance, setDBInstance] = useState<IDBPDatabase | undefined>()
  const { showWarning } = useToaster()
  useEffect(() => {
    initializeCVDB(setDBInstance).then(db => {
      if (db) {
        setDBInstance(db)
        setInitializingDB(false)
      }
    })
  }, [])

  const clearDB = async (item: string) => {
    try {
      await dbInstance?.clear(item)
    } catch (e) {
      showWarning(e)
    }
  }

  useEffect(() => {
    return () => {
      if (props?.clearStroreList?.length) {
        props?.clearStroreList?.map(item => {
          clearDB(item)
        })
      }
    }
  }, [dbInstance])

  return { isInitializingDB, dbInstance }
}
