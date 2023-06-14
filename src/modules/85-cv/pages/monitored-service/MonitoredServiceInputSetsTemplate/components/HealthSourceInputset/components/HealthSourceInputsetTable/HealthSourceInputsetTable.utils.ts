import { CustomHealthMetric } from '@cv/pages/health-source/HealthSourceDrawer/component/customiseHealthSource/CustomiseHealthSource.constant'
import { CustomHealthProduct } from '@cv/pages/health-source/connectors/CustomHealthSource/CustomHealthSource.constants'
import type { UseStringsReturn } from 'framework/strings'

const getHealthSourceFeatureMapping = (getString: UseStringsReturn['getString'], type?: string): string => {
  const featureMappings = {
    [CustomHealthMetric.Metric]: {
      label: getString('cv.customHealthSource.customHealthMetric'),
      value: CustomHealthProduct.METRICS
    },
    [CustomHealthMetric.Log]: {
      label: getString('cv.customHealthSource.customHealthLog'),
      value: CustomHealthProduct.LOGS
    }
  }

  return featureMappings[type as string]?.label
}

export function getFeatureNameDisplay({
  getString,
  featureName,
  type
}: {
  getString: UseStringsReturn['getString']
  featureName?: string
  type?: string
}): string {
  if (featureName) {
    return featureName
  }

  return getHealthSourceFeatureMapping(getString, type)
}
