import type { Tooltip, TooltipPositionerPointObject } from 'highcharts'
import type { LogAnalysisMessageFrequency } from '@cv/components/ExecutionVerification/components/LogAnalysisContainer/LogAnalysis.types'
import { getChartsConfigForDrawer } from '../LogAnalysisDetailsDrawer.utils'
import { drawerPropsMockData, thisValueForFormatter, thisValueForTooltip } from './LogAnalysisDetailsDrawer.mock'

describe('LogAnalysisDetailsDrawer utils test', () => {
  test('getChartsConfigForDrawer should return tooltip with baseline data for known event type', () => {
    const messageFrequency = drawerPropsMockData.rowData.messageFrequency[0]

    const result = getChartsConfigForDrawer({ getString: a => a, chartDetails: messageFrequency, eventType: 'KNOWN' })

    const tooltipFormatter = result.tooltip?.formatter?.bind(thisValueForFormatter)

    if (tooltipFormatter) {
      expect(tooltipFormatter({} as Tooltip)).toContain(`Jan 4, 2023 3:18 PM`)
      expect(tooltipFormatter({} as Tooltip)).toContain(`Jan 4, 2023 3:12 PM`)
      expect(tooltipFormatter({} as Tooltip)).toContain(`cv.baselineEvent cv.count:`)
      expect(tooltipFormatter({} as Tooltip)).toContain(`cv.knownEvent cv.count:`)
    }
  })

  test('getChartsConfigForDrawer should return tooltip without baseline data for unknown event type', () => {
    const messageFrequency = drawerPropsMockData.rowData.messageFrequency[0]

    const result = getChartsConfigForDrawer({ getString: a => a, chartDetails: messageFrequency, eventType: 'UNKNOWN' })

    const tooltipFormatter = result.tooltip?.formatter?.bind(thisValueForFormatter)

    if (tooltipFormatter) {
      expect(tooltipFormatter({} as Tooltip)).toContain(`Jan 4, 2023 3:12 PM`)
      expect(tooltipFormatter({} as Tooltip)).not.toContain(`cv.baselineEvent cv.count:`)
      expect(tooltipFormatter({} as Tooltip)).toContain(`cv.unknownEvent cv.count:`)
    }
  })

  test('getChartsConfigForDrawer should return tooltip as empty string if correct values are not passed', () => {
    const messageFrequency = null

    const result = getChartsConfigForDrawer({
      getString: a => a,
      chartDetails: messageFrequency as unknown as LogAnalysisMessageFrequency,
      eventType: 'UNKNOWN'
    })

    const tooltipFormatter = result.tooltip?.formatter?.bind(thisValueForFormatter)

    if (tooltipFormatter) {
      expect(tooltipFormatter({} as Tooltip)).not.toContain(`cv.unknownEvent cv.count:`)
    }
  })

  test('getChartsConfigForDrawer should return correct tooltip positioner', () => {
    const messageFrequency = null

    const result = getChartsConfigForDrawer({
      getString: a => a,
      chartDetails: messageFrequency as unknown as LogAnalysisMessageFrequency,
      eventType: 'UNKNOWN'
    })

    const tooltipPositioner = result.tooltip?.positioner?.bind(thisValueForTooltip)

    if (tooltipPositioner) {
      expect(tooltipPositioner(10, 100, { plotX: 20 } as TooltipPositionerPointObject)).toEqual({ x: 0, y: 0 })
    }
  })

  test('getChartsConfigForDrawer should return correct tooltip positioner for x axis value greater than 50', () => {
    const messageFrequency = null

    const result = getChartsConfigForDrawer({
      getString: a => a,
      chartDetails: messageFrequency as unknown as LogAnalysisMessageFrequency,
      eventType: 'UNKNOWN'
    })

    const tooltipPositioner = result.tooltip?.positioner?.bind(thisValueForTooltip)

    if (tooltipPositioner) {
      expect(tooltipPositioner(10, 100, { plotX: 80 } as TooltipPositionerPointObject)).toEqual({ x: -20, y: 0 })
    }
  })
})
