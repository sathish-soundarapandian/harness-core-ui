import type { Module } from 'framework/types/ModuleName'

export interface MonitoredServiceConfig {
  module: Module | string
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
