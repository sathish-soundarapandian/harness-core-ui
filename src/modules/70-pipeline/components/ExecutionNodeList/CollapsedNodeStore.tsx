/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { createContext, useContext, useReducer } from 'react'

export type CollapsedNodeState = {
  visibilityMap: Map<string, boolean>
}

export enum CollapsedNodeActionType {
  custom = 'custom'
}

export type CollapsedNodeAction = {
  type: CollapsedNodeActionType
  payload?: Partial<CollapsedNodeState>
  callback?: (arg: CollapsedNodeState) => CollapsedNodeState
}

function createInitialState(): CollapsedNodeState {
  return {
    visibilityMap: new Map()
  }
}

function reducer(state: CollapsedNodeState, action: CollapsedNodeAction): CollapsedNodeState {
  const { payload, type, callback } = action
  switch (type) {
    case CollapsedNodeActionType.custom: {
      if (typeof callback === 'function') {
        return callback(state)
      }
      return {
        ...state,
        ...payload
      }
    }
  }
}

export const CollapsedNodeContext = createContext<
  [CollapsedNodeState, React.Dispatch<CollapsedNodeAction>] | undefined
>(undefined)

export function CollapsedNodeProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const useReducerReturn = useReducer(reducer, null, createInitialState)

  return <CollapsedNodeContext.Provider value={useReducerReturn}>{children}</CollapsedNodeContext.Provider>
}

export function useCollapsedNodeStore(): [CollapsedNodeState, React.Dispatch<CollapsedNodeAction>] {
  const store = useContext(CollapsedNodeContext)
  if (!store) {
    throw new Error('useCollapsedNodeStore should be used within CollapsedNodeProvider')
  }
  return store
}
