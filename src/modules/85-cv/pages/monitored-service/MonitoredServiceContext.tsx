/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Scope } from '@common/interfaces/SecretsInterface'

interface MonitoredServiceContextInterface {
  isTemplate: boolean
  templateScope?: Scope
}
export const MonitoredServiceContext = React.createContext<MonitoredServiceContextInterface>({
  isTemplate: false
})

export const MonitoredServiceProvider: React.FC<MonitoredServiceContextInterface> = ({
  isTemplate,
  templateScope,
  children
}) => {
  return (
    <MonitoredServiceContext.Provider value={{ isTemplate, templateScope }}>
      {children}
    </MonitoredServiceContext.Provider>
  )
}

export function useMonitoredServiceContext(): MonitoredServiceContextInterface {
  return React.useContext(MonitoredServiceContext)
}
