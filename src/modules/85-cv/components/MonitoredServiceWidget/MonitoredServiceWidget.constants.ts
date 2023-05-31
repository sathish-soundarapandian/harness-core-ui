import type { MonitoredServiceConfig } from './MonitoredServiceWidget.interface'

export const PROJECT_MONITORED_SERVICE_CONFIG: MonitoredServiceConfig = {
  module: 'projects',
  listing: {
    healthSource: true,
    changeSource: true,
    agentConfiguration: true,
    goto: true
  },
  creation: {
    serviceType: true
  },
  filters: {
    serviceType: true
  },
  details: {
    healthSource: true,
    changeSource: true,
    agentConfiguration: true
  }
}

export const CD_MONITORED_SERVICE_CONFIG: MonitoredServiceConfig = {
  module: 'cd',
  listing: {
    healthSource: true,
    changeSource: false,
    agentConfiguration: false,
    goto: false
  },
  creation: {
    serviceType: false
  },
  filters: {
    serviceType: false
  },
  details: {
    healthSource: true,
    changeSource: false,
    agentConfiguration: false
  }
}
