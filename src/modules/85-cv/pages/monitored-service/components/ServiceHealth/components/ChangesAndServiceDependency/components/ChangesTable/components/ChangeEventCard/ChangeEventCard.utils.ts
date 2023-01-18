/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import moment from 'moment'
import { Color } from '@harness/design-system'
import type { EventData } from '@cv/components/ActivitiesTimelineView/ActivitiesTimelineView'
import type { ChangeEventMetadata, ChangeEventDTO, InternalChangeEventMetaData } from 'services/cv'
import type { UseStringsReturn } from 'framework/strings'
import { ChangeSourceTypes } from '@cv/pages/ChangeSource/ChangeSourceDrawer/ChangeSourceDrawer.constants'
import type { ChangeTitleData, CustomChangeEventDTO } from './ChangeEventCard.types'
import { StageStatusMapper, VerificationStatus } from './ChangeEventCard.constant'

export const createChangeDetailsData = (resource: ChangeEventDTO | undefined) => {
  const { type, category, serviceName = '', environmentName = '', metadata } = resource || {}
  return {
    type,
    category,
    status: metadata?.status,
    details: {
      service: { name: serviceName },
      environment: { name: environmentName },
      source: { name: type as string, url: metadata?.htmlUrl }
    }
  }
}

export const createChangeDetailsDataForKubernetes = (resource: ChangeEventDTO | undefined) => {
  const { type, category, metadata, name } = resource || {}
  return {
    type,
    category,
    status: metadata?.status,
    name,
    details: {
      eventType: { name: `${category} (${name})` },
      source: { name: type, url: metadata?.htmlUrl }
    }
  }
}

export const createChangeInfoData = (metadata: ChangeEventMetadata | undefined) => {
  const {
    triggeredAt = 0,
    priority,
    urgency,
    assignment,
    assignmentUrl,
    escalationPolicy,
    escalationPolicyUrl
  } = metadata || {}
  return {
    triggerAt: moment(new Date(triggeredAt * 1000)).format('Do MMM hh:mm A'),
    summary: {
      priority: priority,
      assignee: { name: assignment, url: assignmentUrl },
      urgency: urgency,
      policy: { name: escalationPolicy, url: escalationPolicyUrl }
    }
  }
}

export const createChangeTitleData = (
  resource: CustomChangeEventDTO | undefined,
  pipelineIdentifier?: string,
  runSequence?: number,
  status?: string
): ChangeTitleData => {
  const { name, id = '', type, metadata, serviceIdentifier, envIdentifier } = resource || {}
  return {
    name: pipelineIdentifier ?? name,
    type,
    executionId: runSequence ?? id,
    url: metadata?.pipelinePath,
    serviceIdentifier,
    envIdentifier,
    status: (StageStatusMapper as any)[`${status}`] || status
  }
}

export const createChangeTitleDataForInternalCS = (resource?: ChangeEventDTO): ChangeTitleData => {
  const { name, type, metadata, serviceIdentifier, envIdentifier } = resource || {}
  return {
    name,
    type,
    url: (metadata as InternalChangeEventMetaData)?.internalChangeEvent?.internalLinkToEntity?.url,
    serviceIdentifier,
    envIdentifier
  }
}

export const getTextForRedirectButton = (getString: UseStringsReturn['getString'], type?: string): string => {
  switch (type) {
    case ChangeSourceTypes.HarnessCDNextGen:
      return getString('cv.changeSource.changeSourceCard.viewDeployment')
    case ChangeSourceTypes.HarnessFF:
      return getString('cv.changeSource.changeSourceCard.viewFeatureFlag')
    default:
      return ''
  }
}

export function verificationResultToColor(
  verificationResult: EventData['verificationResult'],
  getString: UseStringsReturn['getString']
): {
  color: Color
  statusMessage: string
  backgroundColor: Color
} {
  let statusMessage = ''
  let color = Color.GREY_700
  let backgroundColor = Color.GREY_350
  switch (verificationResult) {
    case VerificationStatus.IN_PROGRESS:
      statusMessage = getString('inProgress')
      color = Color.PRIMARY_2
      backgroundColor = Color.PRIMARY_6
      break
    case VerificationStatus.VERIFICATION_FAILED:
      statusMessage = getString('failed')
      color = Color.RED_500
      backgroundColor = Color.RED_200
      break
    case VerificationStatus.ERROR:
      statusMessage = getString('error')
      color = Color.RED_500
      backgroundColor = Color.RED_200
      break
    case VerificationStatus.VERIFICATION_PASSED:
      statusMessage = getString('passed')
      color = Color.GREEN_700
      backgroundColor = Color.GREEN_350
      break
    default:
  }

  return {
    statusMessage,
    color,
    backgroundColor
  }
}
