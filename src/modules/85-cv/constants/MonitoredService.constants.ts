import type { MonitoredServiceConfig } from '../interfaces/MonitoredService'

export const PROJECT_MONITORED_SERVICE_CONFIG: MonitoredServiceConfig = {
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
