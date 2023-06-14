import { merge } from 'lodash-es'
import PlanningAndRequirementsProcessImage from '../assets/PlanningAndRequirementsProcess.svg'
import DiscoverabilityAndDocumentationImage from '../assets/DiscoverabilityAndDocumentation.svg'
import DeveloperEnvironmentExperienceImage from '../assets/DeveloperEnvironmentExperience.svg'
import DevelopmentProcecssImage from '../assets/DeploymentProcess.svg'
import IntegratedSecurityGovImage from '../assets/IntegratedSecurityGovernance.svg'
import BuildProcessImage from '../assets/BuildProcess.svg'
import MetricsInsightsImage from '../assets/MetricsandInsights.svg'
import LearningDevelopmentImage from '../assets/LearningandDevelopment.svg'
import IncidentManagementImage from '../assets/IncidentManagement.svg'
import ResilienceTestingImage from '../assets/ResilienceTesting.svg'

export function getSectionImage(sectionName?: string): string {
  let sectionImage = PlanningAndRequirementsProcessImage
  switch (sectionName) {
    case 'Planning and Requirements Process':
      sectionImage = PlanningAndRequirementsProcessImage
      break
    case 'Discoverability and Documentation':
      sectionImage = DiscoverabilityAndDocumentationImage
      break
    case 'Developer Environment Experience':
      sectionImage = DeveloperEnvironmentExperienceImage
      break
    case 'Development Process':
      sectionImage = DevelopmentProcecssImage
      break
    case 'Build Process':
      sectionImage = BuildProcessImage
      break
    case 'Quality and Resilience Testing':
      sectionImage = ResilienceTestingImage
      break
    case 'Integrated Security and Governance':
      sectionImage = IntegratedSecurityGovImage
      break
    case 'Metrics and Insights':
      sectionImage = MetricsInsightsImage
      break
    case 'Incident Management':
      sectionImage = IncidentManagementImage
      break
    case 'Learning and Development':
      sectionImage = LearningDevelopmentImage
      break
    default:
      sectionImage = PlanningAndRequirementsProcessImage
  }
  return sectionImage
}

export const calculatePercentage = (value?: number, maxValue?: number): number => {
  if (!value || !maxValue) return 0
  return Math.round((value * 100) / maxValue)
}

export const getScoreComparisonChartOptions = (
  {
    userScore,
    questionOrgScore,
    questionBenchMarkScore
  }: {
    userScore?: number
    questionOrgScore?: number
    questionBenchMarkScore?: number
  },
  options?: Highcharts.Options
): Highcharts.Options => {
  const defautOptions = {
    chart: {
      type: 'bar',
      spacing: [10, 0, 0, 0],
      height: 130,
      width: 500
    },
    credits: undefined,
    title: {
      text: ''
    },
    legend: {
      enabled: false
    },
    plotOptions: {
      series: {
        marker: {
          states: {
            hover: {
              enabled: false
            }
          },
          enabled: false,
          radius: 1
        }
      },
      bar: {
        pointWidth: 15,
        pointPadding: 0.1,
        dataLabels: {
          enabled: true, // Enable data labels
          format: '{y}' // Set the format of the data labels
        },
        states: {
          hover: {
            enabled: false // Disable the hover effect
          }
        }
      }
    },
    tooltip: {
      enabled: false
    },
    xAxis: {
      title: {
        text: ''
      },
      labels: {
        enabled: false
      },
      gridLineWidth: 0,
      lineWidth: 0,
      tickLength: 0,
      categories: ['Your Score', 'Company score', 'Benchmark', 'Maximum Score']
    },
    yAxis: {
      labels: { enabled: false },
      title: {
        text: ''
      },
      gridLineWidth: 0,
      lineWidth: 0,
      tickLength: 0
    },
    series: [
      {
        name: 'Your Score',
        data: [userScore],
        color: '#A3E9FF'
      },
      {
        name: 'Company score',
        data: [questionOrgScore],
        color: '#FFDABF'
      },
      {
        name: 'Benchmark',
        data: [questionBenchMarkScore],
        color: '#FEE89D'
      }
    ]
  }

  const completeOptions = merge(defautOptions, options)
  return completeOptions
}
