import type { StringsMap } from 'stringTypes'
import type { ManifestType } from '../../TriggerInterface'
import { ManifestTrigger } from '../ManifestTrigger'
import type { HelmChartInitialValues } from '../utils'

export class HelmChart extends ManifestTrigger<HelmChartInitialValues> {
  protected type: ManifestType = 'HelmChart'
  protected triggerDescription: keyof StringsMap = 'common.repo_provider.azureRepos'

  protected defaultValues = {
    triggerType: this.baseType,
    manifestType: this.type
  }
}
