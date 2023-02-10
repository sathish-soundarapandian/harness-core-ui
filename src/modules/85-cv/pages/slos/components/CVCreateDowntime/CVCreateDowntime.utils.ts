/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as Yup from 'yup'
import type { Item } from '@harness/uicore/dist/components/ThumbnailSelect/ThumbnailSelect'
import moment from 'moment'
import type { UseStringsReturn } from 'framework/strings'
import type {
  DowntimeDTO,
  EntityDetails,
  EntityIdentifiersRule,
  MonitoredServiceDetail,
  OnetimeDowntimeSpec,
  OnetimeDurationBasedSpec,
  OnetimeEndTimeBasedSpec,
  OnetimeSpec,
  RecurringDowntimeSpec
} from 'services/cv'
import { DowntimeCategory, DowntimeForm, DowntimeFormFields, EndTimeMode } from './CVCreateDowntime.types'
import { DATE_PARSE_FORMAT } from './CVCreateDowntime.constants'
import { DowntimeWindowToggleViews } from './components/CreateDowntimeForm/CreateDowntimeForm.types'

export const getFormattedTime = (field: DowntimeFormFields, time?: number): string => {
  if (time) {
    return moment(time * 1000).format(DATE_PARSE_FORMAT)
  } else if (field === DowntimeFormFields.END_TIME) {
    return moment().add(30, 'm').format(DATE_PARSE_FORMAT)
  } else if (field === DowntimeFormFields.RECURRENCE_END_TIME) {
    return moment().add(1, 'y').format(DATE_PARSE_FORMAT)
  }
  return moment().format(DATE_PARSE_FORMAT)
}

export const getDowntimeInitialFormData = (sloDowntime?: DowntimeDTO): DowntimeForm => {
  const onetimeDowntimeSpec = sloDowntime?.spec?.spec as OnetimeDowntimeSpec
  const onetimeDurationBasedSpec = onetimeDowntimeSpec?.spec as OnetimeDurationBasedSpec
  const onetimeEndTimeBasedSpec = onetimeDowntimeSpec?.spec as OnetimeEndTimeBasedSpec
  const recurringDowntimeSpec = sloDowntime?.spec?.spec as RecurringDowntimeSpec
  return {
    [DowntimeFormFields.NAME]: sloDowntime?.name || '',
    [DowntimeFormFields.IDENTIFIER]: sloDowntime?.identifier || '',
    [DowntimeFormFields.TAGS]: sloDowntime?.tags,
    [DowntimeFormFields.DESCRIPTION]: sloDowntime?.description,
    [DowntimeFormFields.CATEGORY]: sloDowntime?.category || ('' as DowntimeDTO['category']),
    [DowntimeFormFields.TYPE]: sloDowntime?.spec?.type || DowntimeWindowToggleViews.ONE_TIME,
    [DowntimeFormFields.TIMEZONE]:
      sloDowntime?.spec?.spec?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    [DowntimeFormFields.START_TIME]: getFormattedTime(
      DowntimeFormFields.START_TIME,
      sloDowntime?.spec?.spec?.startTime
    ),
    [DowntimeFormFields.END_TIME_MODE]: onetimeDowntimeSpec?.type || EndTimeMode.DURATION,
    [DowntimeFormFields.DURATION_VALUE]: onetimeDurationBasedSpec?.downtimeDuration?.durationValue || 30,
    [DowntimeFormFields.DURATION_TYPE]: onetimeDurationBasedSpec?.downtimeDuration?.durationType || 'Minutes',
    [DowntimeFormFields.END_TIME]: getFormattedTime(DowntimeFormFields.END_TIME, onetimeEndTimeBasedSpec?.endTime),
    [DowntimeFormFields.RECURRENCE_VALUE]: recurringDowntimeSpec?.downtimeRecurrence?.recurrenceValue || 2,
    [DowntimeFormFields.RECURRENCE_TYPE]: recurringDowntimeSpec?.downtimeRecurrence?.recurrenceType || 'Week',
    [DowntimeFormFields.RECURRENCE_END_TIME]: getFormattedTime(
      DowntimeFormFields.RECURRENCE_END_TIME,
      recurringDowntimeSpec?.recurrenceEndTime
    ),
    [DowntimeFormFields.MS_LIST]: []
  }
}

export const getDowntimeFormValidationSchema = (getString: UseStringsReturn['getString']): any => {
  return Yup.object().shape({
    [DowntimeFormFields.NAME]: Yup.string()
      .trim()
      .required(getString('cv.sloDowntime.validations.nameValidation'))
      .matches(/^[0-9a-zA-Z-_\s]+$/, getString('cv.slos.validations.specialCharacters')),
    [DowntimeFormFields.IDENTIFIER]: Yup.string().when([DowntimeFormFields.NAME], {
      is: name => name,
      then: Yup.string().trim().required(getString('validation.identifierRequired'))
    }),
    [DowntimeFormFields.CATEGORY]: Yup.string()
      .trim()
      .required(getString('cv.sloDowntime.validations.categoryValidation'))
  })
}

export const getDowntimeCategoryOptions = (getString: UseStringsReturn['getString']): Item[] => {
  return [
    {
      label: getString('cv.sloDowntime.scheduledMaintenance'),
      value: DowntimeCategory.SCHEDULED_MAINTENANCE
    },
    {
      label: getString('deploymentText'),
      value: DowntimeCategory.DEPLOYMENT
    },
    {
      label: getString('common.other'),
      value: DowntimeCategory.OTHER
    }
  ]
}

export const getDowntimeCategoryLabel = (
  value: DowntimeDTO['category'],
  getString: UseStringsReturn['getString']
): string => {
  switch (value) {
    case DowntimeCategory.SCHEDULED_MAINTENANCE:
      return getString('cv.sloDowntime.scheduledMaintenance')
    case DowntimeCategory.DEPLOYMENT:
      return getString('deploymentText')
    case DowntimeCategory.OTHER:
      return getString('common.other')
    default:
      return ''
  }
}

const getOneTimeBasedDowntimeSpec = (values: DowntimeForm): OnetimeSpec => {
  const { endTimeMode } = values
  if (endTimeMode === EndTimeMode.DURATION) {
    const { durationValue, durationType } = values
    return {
      downtimeDuration: {
        durationValue,
        durationType
      }
    }
  } else {
    const { endTime } = values
    return {
      endTime: moment(endTime).unix()
    }
  }
}

const getEntityDetails = (msList: MonitoredServiceDetail[]): EntityDetails[] =>
  msList.map(msDetail => ({ entityRef: msDetail.monitoredServiceIdentifier || '', enabled: true }))

const getEntitiesRule = (msList: MonitoredServiceDetail[]): EntityIdentifiersRule => ({
  type: 'Identifiers',
  entityIdentifiers: getEntityDetails(msList)
})

export const createSLODowntimeRequestPayload = (
  values: DowntimeForm,
  orgIdentifier: string,
  projectIdentifier: string
): DowntimeDTO => {
  const { name, identifier, description, tags, category, msList, type, startTime, timezone, endTimeMode } = values
  if (values.type === DowntimeWindowToggleViews.ONE_TIME) {
    return {
      name,
      identifier,
      orgIdentifier,
      projectIdentifier,
      description,
      tags,
      category,
      scope: 'Project',
      enabled: true,
      entitiesRule: getEntitiesRule(msList),
      spec: {
        type,
        spec: {
          timezone,
          startTime: moment(startTime).unix(),
          type: endTimeMode,
          spec: getOneTimeBasedDowntimeSpec(values)
        } as OnetimeDowntimeSpec
      }
    }
  } else {
    const { durationValue, durationType, recurrenceValue, recurrenceType, recurrenceEndTime } = values
    return {
      name,
      identifier,
      orgIdentifier,
      projectIdentifier,
      description,
      tags,
      category,
      scope: 'Project',
      enabled: true,
      entitiesRule: getEntitiesRule(msList),
      spec: {
        type,
        spec: {
          timezone,
          startTime: moment(startTime).unix(),
          downtimeDuration: {
            durationValue,
            durationType
          },
          downtimeRecurrence: {
            recurrenceValue,
            recurrenceType
          },
          recurrenceEndTime: moment(recurrenceEndTime).unix()
        } as RecurringDowntimeSpec
      }
    }
  }
}
