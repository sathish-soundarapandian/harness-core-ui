/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { createContext, ReactNode, useContext, ReactElement, useState, useCallback } from 'react'

interface FreezeWindowListContextProps {
  toggleRowSelect: (select: boolean, id: string) => void
  toggleAllSelect: (select: boolean, selectIds?: string[]) => void
  selectedItems: string[]
}

const FreezeWindowListContext = createContext({} as FreezeWindowListContextProps)

export function FreezeWindowListProvider({ children }: { children: ReactNode }): ReactElement {
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const toggleRowSelect = useCallback(
    (select: boolean, id: string) => {
      if (select) {
        setSelectedItems([...selectedItems, id])
      } else {
        const filteredItems = selectedItems.filter(selected => selected !== id)
        setSelectedItems(filteredItems)
      }
    },
    [selectedItems]
  )

  const toggleAllSelect = useCallback((select: boolean, selectIds?: string[]) => {
    if (select && selectIds) {
      setSelectedItems(selectIds)
    } else {
      setSelectedItems([])
    }
  }, [])

  return (
    <FreezeWindowListContext.Provider value={{ toggleRowSelect, toggleAllSelect, selectedItems }}>
      {children}
    </FreezeWindowListContext.Provider>
  )
}

export const useFreezeWindowListContext = () => useContext(FreezeWindowListContext)
