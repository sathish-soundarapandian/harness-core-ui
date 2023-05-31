import React from 'react'
import type { MonitoredServiceConfig } from './MonitoredServiceWidget.interface'
import MonitoredServiceListWidget from './MonitoredServiceListWidget'

export interface MonitoredServiceWidgetContainerProps {
  config: MonitoredServiceConfig
}

export default function MonitoredServiceWidgetContainer(props: MonitoredServiceWidgetContainerProps): JSX.Element {
  const { config } = props
  return <MonitoredServiceListWidget config={config} />
}
