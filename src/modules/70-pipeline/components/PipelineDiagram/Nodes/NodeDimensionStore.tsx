/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useReducer } from 'react'

export interface Dimension {
  height: number
  width: number
}

export interface Dimensions {
  [key: string]: Dimension
}
interface DimentionsActions {
  type: string
  data: Dimensions
}
interface NodeDimensionsStoreConfig {
  childrenDimensions: Dimensions
}

interface StoreConfigReturnType extends NodeDimensionsStoreConfig {
  updateDimensions?: (dimension: Dimensions) => void
}

const initialValues = {
  childrenDimensions: {}
}

//initial state
export const NodeDimensionStoreContext = React.createContext(initialValues)

function useNodeDimensionContext(): StoreConfigReturnType {
  return React.useContext(NodeDimensionStoreContext)
}

export const UPDATE_DIMENSION = 'UPDATE_DIMENSION'

// Reducer
export function dimensionReducer(
  state: NodeDimensionsStoreConfig,
  action: DimentionsActions
): NodeDimensionsStoreConfig {
  switch (action.type) {
    case UPDATE_DIMENSION: {
      return {
        ...state,
        childrenDimensions: { ...state.childrenDimensions, ...action.data }
      }
    }

    default:
      return state
  }
}
function NodeDimensionProvider(props: any): React.ReactElement {
  const [dimensions, updateReducerDimensions] = useReducer(dimensionReducer, initialValues)

  const updateDimensions = (dimensionsData: Dimensions): void =>
    updateReducerDimensions({
      type: UPDATE_DIMENSION,
      data: dimensionsData
    })
  const childrenDimensions = { childrenDimensions: dimensions.childrenDimensions, updateDimensions }

  return <NodeDimensionStoreContext.Provider value={childrenDimensions} {...props} />
}

export { NodeDimensionProvider, useNodeDimensionContext }
