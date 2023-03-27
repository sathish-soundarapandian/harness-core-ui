/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color } from '@harness/design-system'
import { ChangeSourceTypes } from '@cv/pages/ChangeSource/ChangeSourceDrawer/ChangeSourceDrawer.constants'
import type { ChangeEventDTO } from 'services/cv'
import type { UseStringsReturn } from 'framework/strings'
import { EXECUTION_STATUS_HARNESS_CD_NEXTGEN, EXECUTION_STATUS_HARNESS_CD } from './ChangeDetails.constant'

export const createDetailsTitle = (type?: string, category?: string) => {
  switch (category) {
    case category:
      return `${type} ${category} `
    default:
      return ''
  }
}

export const getOnClickOptions = (detailsItem: { name: string | ChangeEventDTO['type']; url?: string } | string) => {
  if (typeof detailsItem !== 'string' && detailsItem?.url) {
    return {
      onClick: () => window.open(detailsItem?.url, '_blank')
    }
  }
  return {}
}

const statusToColorMappingHarnessCDNextGen = (status: keyof typeof EXECUTION_STATUS_HARNESS_CD_NEXTGEN) => {
  switch (status) {
    case EXECUTION_STATUS_HARNESS_CD_NEXTGEN.SUCCESS:
    case EXECUTION_STATUS_HARNESS_CD_NEXTGEN.IGNORE_FAILED:
      return {
        color: Color.GREEN_600,
        backgroundColor: Color.GREEN_100
      }
    case EXECUTION_STATUS_HARNESS_CD_NEXTGEN.RUNNING:
    case EXECUTION_STATUS_HARNESS_CD_NEXTGEN.TIMED_WAITING:
    case EXECUTION_STATUS_HARNESS_CD_NEXTGEN.ASYNC_WAITING:
    case EXECUTION_STATUS_HARNESS_CD_NEXTGEN.TASK_WAITING:
      return {
        color: Color.PRIMARY_7,
        backgroundColor: Color.BLUE_100
      }
    case EXECUTION_STATUS_HARNESS_CD_NEXTGEN.PAUSING:
      return {
        color: Color.ORANGE_500,
        backgroundColor: Color.ORANGE_100
      }
    case EXECUTION_STATUS_HARNESS_CD_NEXTGEN.INTERVENTION_WAITING:
    case EXECUTION_STATUS_HARNESS_CD_NEXTGEN.APPROVAL_WAITING:
    case EXECUTION_STATUS_HARNESS_CD_NEXTGEN.RESOURCE_WAITING:
      return {
        color: Color.ORANGE_800,
        backgroundColor: Color.ORANGE_100
      }
    case EXECUTION_STATUS_HARNESS_CD_NEXTGEN.ERRORED:
    case EXECUTION_STATUS_HARNESS_CD_NEXTGEN.FAILED:
    case EXECUTION_STATUS_HARNESS_CD_NEXTGEN.SUSPENDED:
    case EXECUTION_STATUS_HARNESS_CD_NEXTGEN.APPROVAL_REJECTED:
      return {
        color: Color.RED_500,
        backgroundColor: Color.RED_100
      }
    case EXECUTION_STATUS_HARNESS_CD_NEXTGEN.QUEUED:
    case EXECUTION_STATUS_HARNESS_CD_NEXTGEN.SKIPPED:
    case EXECUTION_STATUS_HARNESS_CD_NEXTGEN.ABORTED:
    case EXECUTION_STATUS_HARNESS_CD_NEXTGEN.EXPIRED:
    case EXECUTION_STATUS_HARNESS_CD_NEXTGEN.DISCONTINUING:
      return {
        color: Color.GREY_800,
        backgroundColor: Color.WHITE
      }
    case EXECUTION_STATUS_HARNESS_CD_NEXTGEN.NO_OP:
    case EXECUTION_STATUS_HARNESS_CD_NEXTGEN.PAUSED:
    case EXECUTION_STATUS_HARNESS_CD_NEXTGEN.UNRECOGNIZED:
      return {
        color: Color.BLACK,
        backgroundColor: Color.GREY_100
      }
    default:
      return {
        color: Color.GREY_500,
        backgroundColor: Color.GREY_50
      }
  }
}

const statusToColorMappingHarnessCD = (status: keyof typeof EXECUTION_STATUS_HARNESS_CD) => {
  switch (status) {
    case EXECUTION_STATUS_HARNESS_CD.SUCCESS:
      return {
        color: Color.GREEN_600,
        backgroundColor: Color.GREEN_100
      }
    case EXECUTION_STATUS_HARNESS_CD.RUNNING:
    case EXECUTION_STATUS_HARNESS_CD.STARTING:
      return {
        color: Color.PRIMARY_7,
        backgroundColor: Color.BLUE_100
      }
    case EXECUTION_STATUS_HARNESS_CD.PAUSING:
      return {
        color: Color.ORANGE_500,
        backgroundColor: Color.ORANGE_100
      }
    case EXECUTION_STATUS_HARNESS_CD.WAITING:
    case EXECUTION_STATUS_HARNESS_CD.PREPARING:
      return {
        color: Color.ORANGE_800,
        backgroundColor: Color.ORANGE_100
      }
    case EXECUTION_STATUS_HARNESS_CD.ERROR:
    case EXECUTION_STATUS_HARNESS_CD.FAILED:
    case EXECUTION_STATUS_HARNESS_CD.ABORTING:
    case EXECUTION_STATUS_HARNESS_CD.REJECTED:
      return {
        color: Color.RED_500,
        backgroundColor: Color.RED_100
      }
    case EXECUTION_STATUS_HARNESS_CD.QUEUED:
    case EXECUTION_STATUS_HARNESS_CD.SKIPPED:
    case EXECUTION_STATUS_HARNESS_CD.EXPIRED:
    case EXECUTION_STATUS_HARNESS_CD_NEXTGEN.ABORTED:
    case EXECUTION_STATUS_HARNESS_CD.DISCONTINUING:
      return {
        color: Color.GREY_800,
        backgroundColor: Color.WHITE
      }
    case EXECUTION_STATUS_HARNESS_CD.NEW:
    case EXECUTION_STATUS_HARNESS_CD.PAUSED:
    case EXECUTION_STATUS_HARNESS_CD.RESUMED:
    case EXECUTION_STATUS_HARNESS_CD.SCHEDULED:
      return {
        color: Color.BLACK,
        backgroundColor: Color.GREY_100
      }
    default:
      return {
        color: Color.GREY_500,
        backgroundColor: Color.GREY_50
      }
  }
}

export const statusToColorMapping = (
  status: keyof typeof EXECUTION_STATUS_HARNESS_CD_NEXTGEN | keyof typeof EXECUTION_STATUS_HARNESS_CD,
  type?: ChangeEventDTO['type']
): {
  color: Color
  backgroundColor: Color
} => {
  switch (type) {
    case ChangeSourceTypes.HarnessCD:
      return statusToColorMappingHarnessCD(status as keyof typeof EXECUTION_STATUS_HARNESS_CD)
    case ChangeSourceTypes.HarnessCDNextGen:
      return statusToColorMappingHarnessCDNextGen(status as keyof typeof EXECUTION_STATUS_HARNESS_CD_NEXTGEN)
    default:
      return {
        color: Color.GREY_500,
        backgroundColor: Color.GREY_50
      }
  }
}

export const getSourceLabel = (getString: UseStringsReturn['getString'], type: ChangeEventDTO['type']): string => {
  switch (type) {
    case ChangeSourceTypes.HarnessFF:
      return getString('common.moduleTitles.cf')
    case ChangeSourceTypes.HarnessCE:
      return getString('chaos.chaosExperiment')
    case ChangeSourceTypes.CustomFF:
    case ChangeSourceTypes.CustomDeploy:
    case ChangeSourceTypes.CustomIncident:
    case ChangeSourceTypes.CustomInfrastructure:
      return type
    default:
      return ''
  }
}
