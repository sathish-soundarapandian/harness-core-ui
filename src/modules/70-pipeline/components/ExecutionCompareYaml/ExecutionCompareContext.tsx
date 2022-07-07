/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { createContext, ReactNode, useContext, ReactElement, useState, useCallback } from 'react'
import type { PipelineExecutionSummary } from 'services/pipeline-ng'

interface ExecutionCompareContext {
  compareItems: PipelineExecutionSummary[]
  addToCompare: (execution: PipelineExecutionSummary) => void
  removeFromCompare: (execution: PipelineExecutionSummary) => void
  isCompareMode: boolean
  cancelCompareMode: () => void
}
export const ExecutionCompareContext = createContext({} as ExecutionCompareContext)
export const useExecutionCompareContext = () => useContext(ExecutionCompareContext)

export function ExecutionCompareProvider({ children }: { children: ReactNode }): ReactElement {
  const [compareItems, setCompareItems] = useState<PipelineExecutionSummary[]>([])
  const [isCompareMode, setCompareMode] = useState(false)

  const cancelCompareMode = useCallback(() => {
    setCompareMode(false)
    setCompareItems([])
  }, [])

  const addToCompare = useCallback(
    (execution: PipelineExecutionSummary) => {
      if (!isCompareMode) setCompareMode(true)
      setCompareItems([execution, ...compareItems])
    },
    [compareItems, isCompareMode]
  )

  const removeFromCompare = useCallback(
    (execution: PipelineExecutionSummary) => {
      const filteredItems = compareItems.filter(item => execution.planExecutionId !== item.planExecutionId)
      setCompareItems(filteredItems)
    },
    [compareItems]
  )

  return (
    <ExecutionCompareContext.Provider
      value={{ compareItems, addToCompare, removeFromCompare, isCompareMode, cancelCompareMode }}
    >
      {children}
    </ExecutionCompareContext.Provider>
  )
}
