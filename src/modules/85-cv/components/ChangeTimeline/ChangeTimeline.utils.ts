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
import DeploymentWithTwoChanges from '@cv/assets/ChangeTimelineSymbol/Deployment/DeploymentWithTwoChange.svg'
import DeploymentWithNChanges from '@cv/assets/ChangeTimelineSymbol/Deployment/DeploymentWithNChange.svg'
import IncidentWithTwoChanges from '@cv/assets/ChangeTimelineSymbol/Incident/IncidentWithTwoChange.svg'
import IncidentWithNChanges from '@cv/assets/ChangeTimelineSymbol/Incident/IncidentWithNChange.svg'
import InfraWithTwoChanges from '@cv/assets/ChangeTimelineSymbol/Infra/InfraWithTwoChange.svg'
import InfraWithNChanges from '@cv/assets/ChangeTimelineSymbol/Infra/InfraWithNChange.svg'
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
    case ChangeSourceTypes.Deployments:
      return isChartSymbol ? 'var(--green-400)' : Color.GREEN_400
    case ChangeSourceTypes.Infrastructure:
      return isChartSymbol ? 'var(--primary-4)' : Color.PRIMARY_4
    case ChangeSourceTypes.Incidents:
      return isChartSymbol ? 'var(--purple-400)' : Color.PURPLE_400
    default:
      return Color.GREY_200
  }
}

const getSymbolBytypeForTwoCluster = (type: string) => {
  switch (type) {
    case ChangeSourceTypes.Deployments:
      return DeploymentWithTwoChanges
    case ChangeSourceTypes.Infrastructure:
      return InfraWithTwoChanges
    case ChangeSourceTypes.Incidents:
      return IncidentWithTwoChanges
    default:
      return 'diamond'
  }
}

export const getColorForChangeEventType = (type: ChangeEventDTO['type']): string => {
  switch (type) {
    case 'HarnessCD':
    case 'HarnessCDNextGen':
      return getChangeSoureIconColor(ChangeSourceTypes.Deployments, true)
    case 'PagerDuty':
      return getChangeSoureIconColor(ChangeSourceTypes.Incidents, true)
    case 'K8sCluster':
      return getChangeSoureIconColor(ChangeSourceTypes.Infrastructure, true)
    default:
      return ''
  }
}

const getSymbolBytypeForGreaterThanTwoCluster = (type: string) => {
  switch (type) {
    case ChangeSourceTypes.Deployments:
      return DeploymentWithNChanges
    case ChangeSourceTypes.Infrastructure:
      return InfraWithNChanges
    case ChangeSourceTypes.Incidents:
      return IncidentWithNChanges
    default:
      return 'diamond'
  }
}

const getSymbolAndColorByChangeType = (count: number, type: ChangeSourceTypes): TimelineData['icon'] => {
  if (count === 2) {
    return { height: 16, width: 16, url: getSymbolBytypeForTwoCluster(type) }
  } else if (count > 2) {
    return { height: 18, width: 18, url: getSymbolBytypeForGreaterThanTwoCluster(type) }
  }
  return { height: 9, width: 9, fillColor: getChangeSoureIconColor(type, true), url: 'diamond' }
}

export const createTooltipLabel = (
  count: number,
  type: ChangeSourceTypes,
  getString: UseStringsReturn['getString']
): string => {
  switch (type) {
    case ChangeSourceTypes.Deployments:
      return `${count} ${count > 1 ? type : getString('deploymentText')}`
    case ChangeSourceTypes.Infrastructure:
      return `${count} ${getString('infrastructureText')} ${count > 1 ? getString('changes') : getString('change')}`
    case ChangeSourceTypes.Incidents:
      return `${count} ${
        count > 1 ? getString('cv.changeSource.tooltip.incidents') : getString('cv.changeSource.incident')
      }`
    default:
      return ''
  }
}

export const createChangeInfoCardData = (
  startTime: number | undefined,
  endTime: number | undefined,
  Deployment: TimeRangeDetail[],
  Infrastructure: TimeRangeDetail[],
  Alert: TimeRangeDetail[],
  getString: UseStringsReturn['getString']
): ChangesInfoCardData[] => {
  if (startTime && endTime) {
    const filterDeployment = Deployment?.filter((item: TimeRangeDetail) =>
      isChangesInTheRange(item, startTime, endTime)
    )
    const filterInfra = Infrastructure?.filter((item: TimeRangeDetail) => isChangesInTheRange(item, startTime, endTime))
    const filterIncident = Alert?.filter((item: TimeRangeDetail) => isChangesInTheRange(item, startTime, endTime))
    return [
      {
        key: ChangeSourceTypes.Deployments,
        count: sumBy(filterDeployment, 'count'),
        message: createTooltipLabel(sumBy(filterDeployment, 'count'), ChangeSourceTypes.Deployments, getString)
      },
      {
        key: ChangeSourceTypes.Incidents,
        count: sumBy(filterIncident, 'count'),
        message: createTooltipLabel(sumBy(filterIncident, 'count'), ChangeSourceTypes.Incidents, getString)
      },
      {
        key: ChangeSourceTypes.Infrastructure,
        count: sumBy(filterInfra, 'count'),
        message: createTooltipLabel(sumBy(filterInfra, 'count'), ChangeSourceTypes.Infrastructure, getString)
      }
    ]
  } else {
    return []
  }
}

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
