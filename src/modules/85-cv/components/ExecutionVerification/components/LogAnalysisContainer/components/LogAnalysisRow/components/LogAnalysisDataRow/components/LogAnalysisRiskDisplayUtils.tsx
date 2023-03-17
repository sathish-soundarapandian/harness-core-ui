import LogHealthy from '@cv/assets/logHealthy.svg'
import LogMedium from '@cv/assets/logMedium.svg'
import LogUnhealthy from '@cv/assets/logUnhealthy.svg'
import { RiskValues } from '@cv/utils/CommonUtils'
import type { UseStringsReturn } from 'framework/strings'

import type { LogData } from 'services/cv'

export function getRiskDisplayText(risk: LogData['riskStatus'], getString: UseStringsReturn['getString']): string {
  switch (risk) {
    case RiskValues.HEALTHY:
      return getString('cd.getStartedWithCD.healthStatus.healthy')
    case RiskValues.UNHEALTHY:
      return getString('cv.monitoredServices.serviceHealth.serviceDependencies.states.unhealthy')
    case RiskValues.NO_ANALYSIS:
    case RiskValues.OBSERVE:
      return getString('cv.monitoredServices.serviceHealth.serviceDependencies.states.mediumHealthy')

    default:
      return getString('cv.monitoredServices.serviceHealth.serviceDependencies.states.mediumHealthy')
  }
}

export function getRiskIcon(risk: LogData['riskStatus']): string {
  switch (risk) {
    case RiskValues.HEALTHY:
      return LogHealthy
    case RiskValues.UNHEALTHY:
      return LogUnhealthy
    case RiskValues.NO_ANALYSIS:
    case RiskValues.OBSERVE:
      return LogMedium

    default:
      return LogMedium
  }
}
