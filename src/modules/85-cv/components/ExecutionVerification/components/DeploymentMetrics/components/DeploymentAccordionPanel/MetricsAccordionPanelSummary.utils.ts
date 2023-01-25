import { getRiskLabelStringId } from '@cv/utils/CommonUtils'
import type { UseStringsReturn } from 'framework/strings'
import type { MetricsAnalysis } from 'services/cv'

export function getRiskDisplayName(
  risk: MetricsAnalysis['analysisResult'],
  getString: UseStringsReturn['getString']
): string | undefined {
  return getString(getRiskLabelStringId(risk))
}
