import React from 'react'
import type { MonitoredServiceConfig } from './interfaces/MonitoredService'
import MonitoredServiceList from './MonitoredServiceList/MonitoredServiceList'

export interface MonitoredServiceContainerProps {
  config: MonitoredServiceConfig
}

export default function MonitoredServiceContainer(props: MonitoredServiceContainerProps): JSX.Element {
  const { config } = props
  return <MonitoredServiceList config={config} />
}
