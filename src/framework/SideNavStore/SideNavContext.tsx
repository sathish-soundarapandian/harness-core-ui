/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { createContext, useContext, useState } from 'react'
import type { Module } from 'framework/types/ModuleName'
interface ModuleOnboardingMap {
  [module: string]: boolean
}

export interface SideNavContextProps {
  showGetStartedTabInMainMenu: ModuleOnboardingMap
  setShowGetStartedTabInMainMenu: (module: Module, shouldShow: boolean) => void
}

const initialModuleVisibility = { ci: false, cd: false } as ModuleOnboardingMap
export const SideNavContext = createContext<SideNavContextProps>({
  showGetStartedTabInMainMenu: initialModuleVisibility,
  setShowGetStartedTabInMainMenu: (_module: Module, _shouldShow: boolean) => void 0
})

export function useSideNavContext(): SideNavContextProps {
  return useContext(SideNavContext)
}

export function SideNavProvider(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const [show, setShow] = useState<ModuleOnboardingMap>(initialModuleVisibility)

  const setShowGetStartedTabInMainMenu = (module: Module, shouldShow: boolean): void => {
    setShow({ ...show, [module]: shouldShow })
  }

  return (
    <SideNavContext.Provider
      value={{
        showGetStartedTabInMainMenu: show,
        setShowGetStartedTabInMainMenu: setShowGetStartedTabInMainMenu
      }}
    >
      {props.children}
    </SideNavContext.Provider>
  )
}
