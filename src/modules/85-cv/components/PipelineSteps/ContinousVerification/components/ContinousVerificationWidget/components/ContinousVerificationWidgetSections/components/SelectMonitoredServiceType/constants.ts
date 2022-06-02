export enum MONITORED_SERVICE_TYPES {
  DEFAULT = 'DEFAULT',
  CONFIGURED = 'CONFIGURED',
  TEMPLATE = 'TEMPLATE'
}

export const monitoredServiceTypes = [
  { label: 'Default', value: MONITORED_SERVICE_TYPES.DEFAULT },
  { label: 'Configured', value: MONITORED_SERVICE_TYPES.CONFIGURED },
  { label: 'Template', value: MONITORED_SERVICE_TYPES.TEMPLATE }
]
