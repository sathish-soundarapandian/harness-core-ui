import { CHART_VISIBILITY_ENUM } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'

export function shouldAutoBuildChart(
  chartConfig: { enabled: boolean; chartVisibilityMode: CHART_VISIBILITY_ENUM } | undefined
): boolean {
  return !!(chartConfig?.enabled && chartConfig?.chartVisibilityMode === CHART_VISIBILITY_ENUM.AUTO)
}

export function shouldShowChartComponent(
  chartConfig: { enabled: boolean; chartVisibilityMode: CHART_VISIBILITY_ENUM } | undefined,
  records: Record<string, any>[]
): boolean {
  return !!(chartConfig?.enabled && records && records?.length)
}
