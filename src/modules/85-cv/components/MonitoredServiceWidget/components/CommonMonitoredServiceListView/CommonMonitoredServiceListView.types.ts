import type { FilterTypes } from '@cv/pages/monitored-service/CVMonitoredService/CVMonitoredService.types'
import type { CountServiceDTO, PageMonitoredServiceListItemDTO } from 'services/cv'
import type { MonitoredServiceConfig } from '../../MonitoredServiceWidget.interface'

export interface CommonMonitoredServiceListViewProps {
  setPage: (n: number) => void
  selectedFilter: FilterTypes
  onFilter: (type: FilterTypes) => void
  onEditService: (identifier: string) => void
  onToggleService: (identifier: string, checked: boolean) => Promise<void>
  onDeleteService: (identifier: string) => Promise<void>
  serviceCountData: CountServiceDTO | null
  refetchServiceCountData: () => Promise<void>
  healthMonitoringFlagLoading?: boolean
  monitoredServiceListData?: PageMonitoredServiceListItemDTO
  config: MonitoredServiceConfig
}
