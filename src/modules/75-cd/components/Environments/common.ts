/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Dispatch, MutableRefObject, SetStateAction} from 'react';
import { createContext, createRef, useContext } from 'react'
import { noop } from 'lodash-es'
import type { Module } from '@common/interfaces/RouteInterfaces'

export enum Views {
  LIST,
  INSIGHT
}
export type ParamsType = {
  orgIdentifier: string
  projectIdentifier: string
  accountId: string
  module: Module
}
export interface EnvironmentStore {
  view: Views
  setView: Dispatch<SetStateAction<Views>>
  fetchDeploymentList: MutableRefObject<(() => void) | unknown>
}

export const EnvironmentStoreContext = createContext({
  view: Views.INSIGHT,
  setView: noop,
  fetchDeploymentList: createRef()
})

export const useEnvironmentStore = (): EnvironmentStore => useContext(EnvironmentStoreContext)
