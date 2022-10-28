import type { GroupedThumbnailSelectProps } from '@harness/uicore'
import { HealthSourceTypes } from '@cv/pages/health-source/types'
import type { UseStringsReturn } from 'framework/strings'
import { AWSDataSourceType } from '../../DefineHealthSource.constant'

export function getDataGroupSelectorItems(
  getString: UseStringsReturn['getString']
): GroupedThumbnailSelectProps['groups'] {
  return [
    {
      groupLabel: getString('pipelineSteps.deploy.infrastructure.directConnection'),
      items: [
        {
          label: HealthSourceTypes.Prometheus,
          icon: 'service-prometheus',
          value: HealthSourceTypes.Prometheus
        }
      ]
    },
    {
      groupLabel: getString('pipelineSteps.deploy.infrastructure.viaCloudProvider'),
      items: [
        {
          label: getString('cv.healthSource.awsDataSourceName'),
          icon: 'service-aws',
          value: AWSDataSourceType
        }
      ]
    }
  ]
}
