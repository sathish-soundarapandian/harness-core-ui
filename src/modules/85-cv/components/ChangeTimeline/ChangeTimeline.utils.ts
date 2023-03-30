/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import moment from 'moment'
import { sumBy, isNumber } from 'lodash-es'
import { Color } from '@harness/design-system'
import type { ChangeEventDTO, TimeRangeDetail } from 'services/cv'
import type { UseStringsReturn } from 'framework/strings'
import ChaosExperimentWithNChange from '@cv/assets/ChangeTimelineSymbol/ChaosExperiment/ChaosExperimentWithNChange.svg'
import ChaosExperimentWithTwoChange from '@cv/assets/ChangeTimelineSymbol/ChaosExperiment/ChaosExperimentWithTwoChange.svg'
import DeploymentWithTwoChanges from '@cv/assets/ChangeTimelineSymbol/Deployment/DeploymentWithTwoChange.svg'
import DeploymentWithNChanges from '@cv/assets/ChangeTimelineSymbol/Deployment/DeploymentWithNChange.svg'
import IncidentWithTwoChanges from '@cv/assets/ChangeTimelineSymbol/Incident/IncidentWithTwoChange.svg'
import IncidentWithNChanges from '@cv/assets/ChangeTimelineSymbol/Incident/IncidentWithNChange.svg'
import InfraWithTwoChanges from '@cv/assets/ChangeTimelineSymbol/Infra/InfraWithTwoChange.svg'
import InfraWithNChanges from '@cv/assets/ChangeTimelineSymbol/Infra/InfraWithNChange.svg'
import FeatureFlagWithTwoChanges from '@cv/assets/ChangeTimelineSymbol/FeatureFlag/FeatureFlagWithTwoChange.svg'
import FeatureFlagWithNChanges from '@cv/assets/ChangeTimelineSymbol/FeatureFlag/FeatureFlagWithNChange.svg'
import {
  getTimeInHrs,
  isChangesInTheRange
} from '@cv/pages/monitored-service/components/ServiceHealth/ServiceHealth.utils'
import { TimePeriodEnum } from '@cv/pages/monitored-service/components/ServiceHealth/ServiceHealth.constants'
import { ChangeSourceTypes } from './ChangeTimeline.constants'
import type { TimelineData } from './components/TimelineRow/TimelineRow.types'
import type { ChangesInfoCardData } from './ChangeTimeline.types'

export const getChangeSoureIconColor = (type = '', isChartSymbol = false): string => {
  switch (type) {
    case ChangeSourceTypes.Deployment:
      return isChartSymbol ? 'var(--green-400)' : Color.GREEN_400
    case ChangeSourceTypes.Infrastructure:
      return isChartSymbol ? 'var(--primary-4)' : Color.PRIMARY_4
    case ChangeSourceTypes.Alert:
      return isChartSymbol ? 'var(--purple-400)' : Color.PURPLE_400
    case ChangeSourceTypes.FeatureFlag:
      return isChartSymbol ? '#EE8625' : Color.ORANGE_800
    case ChangeSourceTypes.ChaosExperiment:
      return isChartSymbol ? '#ff61a2' : Color.MAGENTA_800
    default:
      return Color.GREY_200
  }
}

const getSymbolByTypeForTwoCluster = (type: string) => {
  switch (type) {
    case ChangeSourceTypes.Deployment:
      return DeploymentWithTwoChanges
    case ChangeSourceTypes.Infrastructure:
      return InfraWithTwoChanges
    case ChangeSourceTypes.Alert:
      return IncidentWithTwoChanges
    case ChangeSourceTypes.FeatureFlag:
      return FeatureFlagWithTwoChanges
    case ChangeSourceTypes.ChaosExperiment:
      return ChaosExperimentWithTwoChange
    default:
      return 'diamond'
  }
}

export const getColorForChangeEventType = (type: ChangeEventDTO['type']): string => {
  switch (type) {
    case 'HarnessCD':
    case 'HarnessCDNextGen':
      return getChangeSoureIconColor(ChangeSourceTypes.Deployment, true)
    case 'PagerDuty':
      return getChangeSoureIconColor(ChangeSourceTypes.Alert, true)
    case 'K8sCluster':
      return getChangeSoureIconColor(ChangeSourceTypes.Infrastructure, true)
    case 'HarnessFF':
      return getChangeSoureIconColor(ChangeSourceTypes.FeatureFlag, true)
    default:
      return ''
  }
}

const getSymbolByTypeForGreaterThanTwoCluster = (type: string) => {
  switch (type) {
    case ChangeSourceTypes.Deployment:
      return DeploymentWithNChanges
    case ChangeSourceTypes.Infrastructure:
      return InfraWithNChanges
    case ChangeSourceTypes.Alert:
      return IncidentWithNChanges
    case ChangeSourceTypes.FeatureFlag:
      return FeatureFlagWithNChanges
    case ChangeSourceTypes.ChaosExperiment:
      return ChaosExperimentWithNChange
    default:
      return 'diamond'
  }
}

const getSymbolAndColorByChangeType = (count: number, type: ChangeSourceTypes): TimelineData['icon'] => {
  if (count === 2) {
    return { height: 16, width: 16, url: getSymbolByTypeForTwoCluster(type) }
  } else if (count > 2) {
    return { height: 18, width: 18, url: getSymbolByTypeForGreaterThanTwoCluster(type) }
  }
  return { height: 9, width: 9, fillColor: getChangeSoureIconColor(type, true), url: 'diamond' }
}

export const createTooltipLabel = (
  count: number,
  type: ChangeSourceTypes,
  getString: UseStringsReturn['getString']
): string => {
  switch (type) {
    case ChangeSourceTypes.Deployment:
      return `${count} ${count !== 1 ? getString('deploymentsText') : getString('deploymentText')}`
    case ChangeSourceTypes.Infrastructure:
      return `${count} ${getString('infrastructureText')} ${count !== 1 ? getString('changes') : getString('change')}`
    case ChangeSourceTypes.Alert:
      return `${count} ${
        count !== 1 ? getString('cv.changeSource.tooltip.incidents') : getString('cv.changeSource.incident')
      }`
    case ChangeSourceTypes.FeatureFlag:
      return `${count} ${getString('common.moduleTitles.cf')} ${
        count !== 1 ? getString('changes') : getString('change')
      }`
    case ChangeSourceTypes.ChaosExperiment:
      return `${count} ${
        count == 1
          ? getString('cv.changeSource.chaosExperiment.event')
          : getString('cv.changeSource.chaosExperiment.events')
      }`
    default:
      return ''
  }
}

export const labelByCategory = (categoryType: string, getString: UseStringsReturn['getString']): string => {
  switch (categoryType) {
    case ChangeSourceTypes.Infrastructure:
      return getString('infrastructureText')
    case ChangeSourceTypes.Deployment:
      return getString('deploymentsText')
    case ChangeSourceTypes.FeatureFlag:
      return getString('common.purpose.cf.continuous')
    case ChangeSourceTypes.Alert:
      return getString('cv.changeSource.tooltip.incidents')
    case ChangeSourceTypes.ChaosExperiment:
      return getString('chaos.navLabels.chaosExperiments')
    default:
      return ''
  }
}

export const createChangeInfoCardData = (
  getString: UseStringsReturn['getString'],
  startTime?: number,
  endTime?: number,
  categoryTimeline?: { [key: string]: TimeRangeDetail[] }
): ChangesInfoCardData[] => {
  if (startTime && endTime && categoryTimeline) {
    return Object.entries(categoryTimeline).map(category => ({
      key: category[0] as ChangeSourceTypes,
      count: sumBy(filterChangeSourceType(category[1], startTime, endTime), 'count'),
      message: createTooltipLabel(
        sumBy(filterChangeSourceType(category[1], startTime, endTime), 'count'),
        category[0] as ChangeSourceTypes,
        getString
      )
    }))
  } else {
    return []
  }
}

const filterChangeSourceType = (
  changeSource: TimeRangeDetail[],
  startTime: number,
  endTime: number
): TimeRangeDetail[] => changeSource?.filter((item: TimeRangeDetail) => isChangesInTheRange(item, startTime, endTime))

export const nearestMinutes = (interval: number, someMoment: moment.Moment) => {
  const roundedMinutes = Math.ceil(someMoment.clone().minute() / interval) * interval
  return someMoment.clone().minute(roundedMinutes).second(0)
}

export const getStartAndEndTime = (duration: string) => {
  const now = moment()
  const diff = getTimeInHrs(duration || '') * 60 * 60 * 1000
  const diffInMin = duration === TimePeriodEnum.FOUR_HOURS ? 5 : 30
  const endTimeRoundedOffToNearest30min = nearestMinutes(diffInMin, now).valueOf()
  const startTimeRoundedOffToNearest30min = endTimeRoundedOffToNearest30min - diff

  return { startTimeRoundedOffToNearest30min, endTimeRoundedOffToNearest30min }
}

export const createTimelineSeriesData = (
  type: ChangeSourceTypes,
  getString: UseStringsReturn['getString'],
  timeRangeDetail?: TimeRangeDetail[]
): TimelineData[] => {
  const timelineData: TimelineData[] = []
  for (const timeRange of timeRangeDetail || []) {
    const { endTime, startTime, count } = timeRange || {}
    if (endTime && startTime && isNumber(count)) {
      timelineData.push({
        startTime,
        endTime,
        icon: getSymbolAndColorByChangeType(count, type),
        tooltip: {
          message: createTooltipLabel(count, type, getString),
          sideBorderColor: getChangeSoureIconColor(type, true)
        }
      })
    }
  }

  return timelineData
}
