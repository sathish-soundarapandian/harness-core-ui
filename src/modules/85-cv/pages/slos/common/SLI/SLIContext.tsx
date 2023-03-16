/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

interface ConfigureSLIContextInterface {
  showSLIMetricChart: boolean
  isRatioBased: boolean
  isWindowBased: boolean
}
export const ConfigureSLIContext = React.createContext<ConfigureSLIContextInterface>({} as ConfigureSLIContextInterface)

export const ConfigureSLIProvider: React.FC<ConfigureSLIContextInterface> = ({ children, ...rest }) => {
  return <ConfigureSLIContext.Provider value={{ ...rest }}>{children}</ConfigureSLIContext.Provider>
}

export function useConfigureSLIContext(): ConfigureSLIContextInterface {
  return React.useContext(ConfigureSLIContext)
}
