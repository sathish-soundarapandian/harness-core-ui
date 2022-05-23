/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { createContext, useContext, useState } from 'react'

export interface SideNavContextProps {
  showGetStartedTabInMainMenu: boolean
  setShowGetStartedTabInMainMenu: (shouldShow: boolean) => void
}

export const SideNavContext = createContext<SideNavContextProps>({
  showGetStartedTabInMainMenu: false,
  setShowGetStartedTabInMainMenu: (_shouldShow: boolean) => void 0
})

export function useSideNavContext(): SideNavContextProps {
  return useContext(SideNavContext)
}

export function SideNavProvider(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const [show, setShow] = useState<boolean>(false)
  return (
    <SideNavContext.Provider
      value={{
        showGetStartedTabInMainMenu: show,
        setShowGetStartedTabInMainMenu: (shouldShow: boolean) => setShow(shouldShow)
      }}
    >
      {props.children}
    </SideNavContext.Provider>
  )
}
