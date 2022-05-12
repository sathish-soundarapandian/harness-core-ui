/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { createContext, Dispatch, SetStateAction, useContext } from 'react'
import { noop } from 'lodash-es'

import { Views } from '@harness/uicore'
export interface PageStore {
  view: Views
  setView: Dispatch<SetStateAction<Views>>
}

export const PageStoreContext = createContext({
  view: Views.LIST,
  setView: noop
})

export const usePageStore = (): PageStore => useContext(PageStoreContext)
