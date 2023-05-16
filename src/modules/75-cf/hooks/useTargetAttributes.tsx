/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ReactElement, ReactNode} from 'react';
import React, { createContext, useContext, useMemo } from 'react'
import { useGetAllTargetAttributes } from 'services/cf'
import { sortStrings } from '@cf/utils/sortStrings'

export interface UseTargetAttributesHookAPI {
  loading: boolean
  targetAttributes: string[]
}

export interface TargetAttributesProviderProps {
  projectIdentifier: string
  orgIdentifier: string
  accountIdentifier: string
  environmentIdentifier: string
  children?: ReactNode | ReactNode[]
}

const TargetAttributesContext = createContext<UseTargetAttributesHookAPI>({ loading: false, targetAttributes: [] })

export const TargetAttributesProvider = ({
  projectIdentifier,
  orgIdentifier,
  accountIdentifier,
  environmentIdentifier,
  children
}: TargetAttributesProviderProps): ReactElement => {
  const { loading, data } = useGetAllTargetAttributes({
    queryParams: { projectIdentifier, orgIdentifier, accountIdentifier, environmentIdentifier }
  })

  const targetAttributes = useMemo<string[]>(() => sortStrings(data || []), [data])

  return (
    <TargetAttributesContext.Provider value={{ loading, targetAttributes }}>
      {children}
    </TargetAttributesContext.Provider>
  )
}

export const useTargetAttributes = (): UseTargetAttributesHookAPI => useContext(TargetAttributesContext)
