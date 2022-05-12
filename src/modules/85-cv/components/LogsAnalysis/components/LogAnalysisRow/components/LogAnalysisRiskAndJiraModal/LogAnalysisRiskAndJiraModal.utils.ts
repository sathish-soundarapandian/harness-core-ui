import { Utils, Color } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'

const getChartCategories = (series?: Highcharts.SeriesOptionsType[]): string[] => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return Array.from({ length: series[0]?.data.length as number }).map((_, i) => String(i + 1))
}

export function getChartsConfigForDrawer(
  getString: UseStringsReturn['getString'],
  series?: Highcharts.SeriesOptionsType[]
): Highcharts.Options {
  return {
    title: {
      text: ''
    },
    subtitle: undefined,
    legend: {
      enabled: false
    },
    xAxis: {
      title: {
        text: getString('pipeline.verification.logs.eventCountPerMin'),
        style: {
          color: Utils.getRealCSSColor(Color.GREY_350)
        }
      },
      categories: getChartCategories(series)
    },
    yAxis: {
      title: {
        text: getString('common.frequency'),
        style: {
          color: Utils.getRealCSSColor(Color.GREY_350)
        }
      }
    },
    tooltip: {
      outside: true,
      useHTML: true,
      formatter: function () {
        return `${this.y}`
      },
      backgroundColor: Color.WHITE,
      borderColor: Color.GREY_300,
      borderRadius: 10,
      shadow: {
        color: 'rgba(96, 97, 112, 0.56)'
      },
      shape: 'square'
    },
    credits: {
      enabled: false
    },
    plotOptions: {
      series: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        pointWidth: 20
      }
    },
    series
  }
}
