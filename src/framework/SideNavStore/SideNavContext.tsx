/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { createContext, useContext, useState } from 'react'

export interface SideNavContextProps {
  showGetStartedTabInMainMenu: boolean
  showGetStartedCDTabInMainMenu: boolean
  setShowGetStartedTabInMainMenu: (shouldShow: boolean) => void
  setShowGetStartedCDTabInMainMenu: (shouldShow: boolean) => void
}

export const SideNavContext = createContext<SideNavContextProps>({
  showGetStartedTabInMainMenu: false,
  showGetStartedCDTabInMainMenu: false,
  setShowGetStartedTabInMainMenu: (_shouldShow: boolean) => void 0,
  setShowGetStartedCDTabInMainMenu: (_shouldShow: boolean) => void 0
})

export function useSideNavContext(): SideNavContextProps {
  return useContext(SideNavContext)
}
interface ModuleOnboardingMap {
  [module: string]: boolean
}

export function SideNavProvider(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const [show, setShow] = useState<ModuleOnboardingMap>({
    ci: false,
    cd: false
  })
  return (
    <SideNavContext.Provider
      value={{
        showGetStartedTabInMainMenu: show['ci'],
        setShowGetStartedTabInMainMenu: (shouldShow: boolean) => setShow({ ...show, ci: shouldShow }),
        showGetStartedCDTabInMainMenu: show['cd'],
        setShowGetStartedCDTabInMainMenu: (shouldShow: boolean) => setShow({ ...show, cd: shouldShow })
      }}
    >
      {props.children}
    </SideNavContext.Provider>
  )
}
