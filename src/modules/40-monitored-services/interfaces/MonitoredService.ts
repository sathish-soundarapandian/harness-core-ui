export interface MonitoredServiceConfig {
  listing: {
    healthSource: boolean
    changeSource: boolean
    agentConfiguration: boolean
    goto: boolean
  }
  creation: {
    serviceType: boolean
  }
  filters: {
    serviceType: boolean
  }
  details: {
    healthSource: boolean
    changeSource: boolean
    agentConfiguration: boolean
  }
}
