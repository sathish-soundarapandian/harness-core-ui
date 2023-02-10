import type { Duration } from '@common/components'
import type { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import type * as sscaService from 'services/ssca'

export interface SSCACustomMicroFrontendProps {
  services: typeof sscaService
  customHooks: {
    useQueryParams: typeof useQueryParams
    useUpdateQueryParams: typeof useUpdateQueryParams
  }
  customComponents: {
    Duration: typeof Duration
  }
}
