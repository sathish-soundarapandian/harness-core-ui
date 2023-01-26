import { isEmpty } from 'lodash-es'
import type { SeriesColumnOptions } from 'highcharts'
import moment from 'moment'
import { Utils } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { LogData } from 'services/cv'
import { getEventTypeChartColor } from '@cv/utils/CommonUtils'
import type { LogAnalysisMessageFrequency } from '@cv/components/ExecutionVerification/components/LogAnalysisContainer/LogAnalysis.types'
import type { UseStringsReturn } from 'framework/strings'
import { legendKeyMappingSingular, LogEvents } from './LogAnalysisDetailsDrawer.constants'

const getChartCategories = (data?: SeriesColumnOptions[]): string[] => {
  if (data && isEmpty(data?.[0]?.data)) {
    return []
  }

  return Array.from({ length: data?.[0]?.data?.length as number }).map((_, i) => String(i + 1))
}

const getTooltipHTML = ({
  chartDetails,
  hoveredBarIndex,
  chartIndex,
  eventType,
  isBaseline,
  getString
}: {
  chartDetails: LogAnalysisMessageFrequency
  hoveredBarIndex: number
  chartIndex: number
  eventType: LogData['tag']
  isBaseline?: boolean
  getString: UseStringsReturn['getString']
}): string => {
  if (isEmpty(chartDetails) || !eventType) {
    return ''
  }

  const label = isBaseline ? getString('cv.baselineEvent') : getString(legendKeyMappingSingular[eventType])
  const eventColor = isBaseline ? Utils.getRealCSSColor(Color.GREY_300) : getEventTypeChartColor(eventType)

  const displayLabel = `${label} ${getString('cv.count')}:`

  return `<div style="margin-bottom: var(--spacing-xsmall)">${moment(
    chartDetails.data?.[chartIndex]?.custom?.timestamp?.[hoveredBarIndex] * 1000
  ).format('lll')}</div>
  <div style="display: flex; align-items: center">
  <div style="height: 8px; width: 8px; border-radius: 1px; margin-right: var(--spacing-small); background: ${eventColor};"></div>
  <span>${displayLabel} <span style="color: var(--white)">${
    chartDetails.data?.[chartIndex]?.data?.[hoveredBarIndex]
  }</span></span>
  </div>`
}

export function getChartsConfigForDrawer({
  getString,
  chartDetails,
  eventType
}: {
  getString: UseStringsReturn['getString']
  chartDetails: LogAnalysisMessageFrequency
  eventType: LogData['tag']
}): Highcharts.Options {
  return {
    chart: {
      backgroundColor: 'var(--grey-50)',
      borderColor: 'var(--grey-100)',
      borderWidth: 1,
      borderRadius: 3,
      height: '200'
    },
    title: {
      text: ''
    },
    subtitle: undefined,
    legend: {
      enabled: false
    },
    xAxis: {
      title: {
        text: getString('common.schedulePanel.minutesLabel'),
        style: {
          color: Utils.getRealCSSColor(Color.GREY_600)
        }
      },
      categories: getChartCategories(chartDetails?.data),
      crosshair: {
        width: 1,
        color: 'var(--primary-9-dark)'
      }
    },
    yAxis: {
      title: {
        text: getString('common.frequency'),
        style: {
          color: Utils.getRealCSSColor(Color.GREY_600)
        }
      }
    },
    tooltip: {
      outside: false,
      className: 'LogAnalysisTooltip',
      useHTML: true,

      formatter: function () {
        const hoveredBarIndex = this?.points?.[0]?.point.index

        const isUnknownEvent = eventType === LogEvents.UNKNOWN
        const chartDataIndexForTestData = isUnknownEvent ? 0 : 1

        const tooltipHeight = isUnknownEvent ? 44 : 80

        const testTooltipData = getTooltipHTML({
          chartDetails,
          chartIndex: chartDataIndexForTestData,
          eventType,
          getString,
          hoveredBarIndex: hoveredBarIndex as number
        })

        let baselineTooltipData = ''

        if (!isUnknownEvent) {
          baselineTooltipData = getTooltipHTML({
            chartDetails,
            chartIndex: 0,
            eventType,
            getString,
            hoveredBarIndex: hoveredBarIndex as number,
            isBaseline: true
          })
        }

        return `
        <div style="width: 200px; height: ${tooltipHeight}px; font-size: var(--font-size-small); color: var(--grey-250)"}>
        ${testTooltipData}
        </br>
        ${baselineTooltipData}
        </div>
        `
      },
      positioner: (_, __, point) => {
        const { plotX } = point || {}
        const xPosition = plotX < 50 ? plotX - 20 : plotX - 100

        return {
          x: xPosition,
          y: 0
        }
      },
      backgroundColor: 'var(--primary-9-dark)',
      hideDelay: 10,
      borderColor: Color.GREY_300,
      borderRadius: 12,
      shadow: {
        color: 'rgba(96, 97, 112, 0.56)'
      },
      shape: 'square',
      shared: true
    },
    credits: {
      enabled: false
    },
    plotOptions: {
      series: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        pointPadding: 0.1,
        groupPadding: 0.4
      }
    },
    series: chartDetails?.data
  }
}
