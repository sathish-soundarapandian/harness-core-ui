/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useReducer } from 'react'
import { defaultTo, concat } from 'lodash-es'
import type { PriceDTO } from 'services/cd-ng'

interface SkewsMap {
  [key: string]: {
    [key: string]: {
      [key: string]: PriceDTO[]
    }
  }
}
export interface PriceSkew {
  [key: string]: string
}

interface SubscriptionActions {
  type: string
  data: SkewsMap
}
interface SubscriptionsStoreConfig {
  priceSkews: SkewsMap
}

interface StoreConfigReturnType extends SubscriptionsStoreConfig {
  updateStore: (skews: SkewsMap) => void
}

const initialValues = {
  priceSkews: {},
  updateStore: (_skews: SkewsMap): void => {
    //body here
  }
}

//initial state
export const SubscriptionStoreContext = React.createContext(initialValues)

function useSubscriptionContext(): StoreConfigReturnType {
  return React.useContext(SubscriptionStoreContext)
}

export const UPDATE_PRICE_SKEWS = 'UPDATE_PRICE_SKEWS'

// Reducer
export function subsciptionReducer(
  state: SubscriptionsStoreConfig,
  action: SubscriptionActions
): SubscriptionsStoreConfig {
  switch (action.type) {
    case UPDATE_PRICE_SKEWS: {
      return {
        ...state,
        priceSkews: { ...state.priceSkews, ...action.data }
      }
    }

    default:
      return state
  }
}
function SubscriptionProvider(props: any): React.ReactElement {
  const [storeData, updateReducerSubscription] = useReducer(subsciptionReducer, initialValues)

  const updateStore = (subscriptionData: SkewsMap): void =>
    updateReducerSubscription({
      type: UPDATE_PRICE_SKEWS,
      data: subscriptionData
    })
  const priceSkews = { priceSkews: storeData.priceSkews, updateStore }

  return <SubscriptionStoreContext.Provider value={priceSkews} {...props} />
}

export { SubscriptionProvider, useSubscriptionContext }
export const getSkewsMap = (skews: PriceDTO[]): SkewsMap => {
  const skewsMap: SkewsMap = {}
  skews.forEach((skew: PriceDTO): void => {
    const editionName = defaultTo(skew?.metaData?.edition, '')
    const billedInterval = defaultTo(skew.metaData?.billed, '')
    const skewType = skew.metaData?.type as string
    if (skewsMap[skewType]) {
      const edition = skewsMap[skewType][editionName]
      if (edition) {
        edition[billedInterval] = edition[billedInterval] ? concat(edition[billedInterval], [skew]) : [skew]
      } else {
        skewsMap[skewType][editionName] = {
          [billedInterval]: [skew]
        }
      }
    } else {
      skewsMap[skewType] = {
        [editionName]: {
          [billedInterval]: [skew]
        }
      }
    }
  })
  return skewsMap
}
