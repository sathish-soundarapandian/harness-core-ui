import React from 'react'
import MonitoredService from '@cv/pages/monitored-service/CVMonitoredService/CVMonitoredService'
import type { MonitoredServiceConfig } from './MonitoredServiceWidget.interface'

interface MonitoredServiceListWidgetProps {
  config: MonitoredServiceConfig
}

export default function MonitoredServiceListWidget(props: MonitoredServiceListWidgetProps): JSX.Element {
  const { config } = props

  return <MonitoredService config={config} />
}
