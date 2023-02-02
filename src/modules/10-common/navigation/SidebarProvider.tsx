/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { SideNavProps } from './SideNav/SideNav'

export interface SidebarContext extends SideNavProps {
  navComponent?: React.ComponentType
}

const SidebarContext = React.createContext<SidebarContext>({
  title: '',
  subtitle: ''
})

export function useSidebar(): SidebarContext {
  return React.useContext(SidebarContext)
}

export default function SidebarProvider(props: React.PropsWithChildren<SidebarContext>): React.ReactElement {
  const { children, ...value } = props

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}
