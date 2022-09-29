import type { TriggerBaseType, ManifestType } from '../TriggerInterface'

export interface HelmChartInitialValues {
  triggerType: TriggerBaseType
  manifestType: ManifestType
}
