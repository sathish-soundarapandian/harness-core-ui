export const trendData = {
  chart: {
    type: 'column',
    backgroundColor: 'transparent',
    style: {
      fontFamily: 'var(--font-family)'
    }
  },
  title: {
    text: ''
  },
  legend: {
    enabled: false
  },
  xAxis: {
    labels: {
      enabled: false
    },
    tickLength: 1,
    gridLineWidth: 0,
    min: 0.25,
    title: {
      text: ''
    },
    startOnTick: true,
    endOnTick: true
  },
  yAxis: {
    labels: {
      enabled: false
    },
    lineWidth: 0,
    tickLength: 0,
    gridLineWidth: 0,
    title: {
      text: ''
    }
  },
  plotOptions: {
    series: {
      pointWidth: 10
    },
    column: {},
    bar: {
      groupPadding: 0,
      pointPadding: 0,
      dataLabels: {
        enabled: true
      }
    }
  },
  tooltip: {
    outside: true,
    useHTML: true,
    backgroundColor: 'white',
    borderColor: 'grey300',
    borderRadius: 10,
    shadow: {
      color: 'rgba(96, 97, 112, 0.56)'
    },
    shape: 'square'
  },
  series: [
    {
      name: 'testData',
      type: 'column',
      color: 'var(--red-400)',
      data: [14, 10, 8, 20, 4, 5, 5, 4, 5]
    }
  ]
}
