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
  EntitiesRule,
  EntityDetails,
  EntityIdentifiersRule,
  MonitoredServiceDetail,
  OnetimeDowntimeSpec,
  OnetimeDurationBasedSpec,
  OnetimeEndTimeBasedSpec,
  OnetimeSpec,
  RecurringDowntimeSpec
} from 'services/cv'
import {
  DowntimeCategory,
  DowntimeForm,
  DowntimeFormFields,
  EndTimeMode,
  EntitiesRuleType
} from './CVCreateDowntime.types'
import { DATE_PARSE_FORMAT } from './CVCreateDowntime.constants'
import { DowntimeWindowToggleViews } from './components/CreateDowntimeForm/CreateDowntimeForm.types'

const getTimeRoundedOffToNext30Minutes = (): number => {
  const date = new Date()
  return date.getTime() + (30 - (date.getMinutes() % 30)) * 60 * 1000
}

export const getFormattedTime = ({
  field,
  dateTime,
  format = DATE_PARSE_FORMAT
}: {
  field?: DowntimeFormFields
  dateTime?: string
  format?: string
}): string => {
  if (dateTime) {
    return moment(dateTime).format(format)
  }
  const time = getTimeRoundedOffToNext30Minutes()
  if (field === DowntimeFormFields.END_TIME) {
    return moment(time).add(30, 'm').format(format)
  } else if (field === DowntimeFormFields.RECURRENCE_END_TIME) {
    return moment(time).add(1, 'y').format(format)
  }
  return moment(time).format(format)
}

export const getDowntimeInitialFormData = (sloDowntime?: DowntimeDTO): DowntimeForm => {
  const { type = DowntimeWindowToggleViews.ONE_TIME } = sloDowntime?.spec || {}
  const onetimeDowntimeSpec = sloDowntime?.spec?.spec as OnetimeDowntimeSpec
  const onetimeDurationBasedSpec = onetimeDowntimeSpec?.spec as OnetimeDurationBasedSpec
  const onetimeEndTimeBasedSpec = onetimeDowntimeSpec?.spec as OnetimeEndTimeBasedSpec
  const recurringDowntimeSpec = sloDowntime?.spec?.spec as RecurringDowntimeSpec

  const downtimeForm = {
    [DowntimeFormFields.NAME]: sloDowntime?.name || '',
    [DowntimeFormFields.IDENTIFIER]: sloDowntime?.identifier || '',
    [DowntimeFormFields.TAGS]: sloDowntime?.tags,
    [DowntimeFormFields.DESCRIPTION]: sloDowntime?.description,
    [DowntimeFormFields.CATEGORY]: sloDowntime?.category || ('' as DowntimeDTO['category']),
    [DowntimeFormFields.TYPE]: type,
    [DowntimeFormFields.TIMEZONE]:
      sloDowntime?.spec?.spec?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    [DowntimeFormFields.START_TIME]: getFormattedTime({
      field: DowntimeFormFields.START_TIME,
      dateTime: sloDowntime?.spec?.spec?.startDateTime
    }),
    [DowntimeFormFields.END_TIME_MODE]: onetimeDowntimeSpec?.type || EndTimeMode.DURATION,
    [DowntimeFormFields.END_TIME]: getFormattedTime({
      field: DowntimeFormFields.END_TIME,
      dateTime: onetimeEndTimeBasedSpec?.endDateTime
    }),
    [DowntimeFormFields.RECURRENCE_VALUE]: recurringDowntimeSpec?.downtimeRecurrence?.recurrenceValue || 2,
    [DowntimeFormFields.RECURRENCE_TYPE]: recurringDowntimeSpec?.downtimeRecurrence?.recurrenceType || 'Week',
    [DowntimeFormFields.RECURRENCE_END_TIME]: getFormattedTime({
      field: DowntimeFormFields.RECURRENCE_END_TIME,
      dateTime: recurringDowntimeSpec?.recurrenceEndDateTime
    }),
    [DowntimeFormFields.ENTITIES_RULE_TYPE]: sloDowntime?.entitiesRule.type || EntitiesRuleType.IDENTIFIERS,
    [DowntimeFormFields.MS_LIST]: []
  }

  if (type === DowntimeWindowToggleViews.ONE_TIME) {
    return {
      ...downtimeForm,
      [DowntimeFormFields.DURATION_VALUE]: onetimeDurationBasedSpec?.downtimeDuration?.durationValue || 30,
      [DowntimeFormFields.DURATION_TYPE]: onetimeDurationBasedSpec?.downtimeDuration?.durationType || 'Minutes'
    }
  } else {
    return {
      ...downtimeForm,
      [DowntimeFormFields.DURATION_VALUE]: recurringDowntimeSpec?.downtimeDuration?.durationValue || 30,
      [DowntimeFormFields.DURATION_TYPE]: recurringDowntimeSpec?.downtimeDuration?.durationType || 'Minutes'
    }
  }
}

export const getDowntimeFormValidationSchema = (getString: UseStringsReturn['getString']): any => {
  const endTimeValidation = Yup.string()
    .nullable()
    .required(getString('cv.sloDowntime.validations.endTimeValidation'))
    .test(
      'endTimeGreaterThanStartTime',
      getString('cv.sloDowntime.validations.endTimeGreaterThanStartTime'),
      function (endTime) {
        return moment(endTime).unix() > moment(this.parent.startTime).unix()
      }
    )
    .test(
      'endTimeLessThan3YearsFromStartTime',
      getString('cv.sloDowntime.validations.endTimeNotMoreThan3Years'),
      function (endTime) {
        return moment(endTime).unix() <= moment(this.parent.startTime).add(3, 'y').unix()
      }
    )

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
      .required(getString('cv.sloDowntime.validations.categoryValidation')),
    [DowntimeFormFields.TIMEZONE]: Yup.string()
      .trim()
      .required(getString('cv.sloDowntime.validations.timezoneValidation')),
    [DowntimeFormFields.END_TIME]: Yup.string().when([DowntimeFormFields.END_TIME_MODE, DowntimeFormFields.TYPE], {
      is: (endTimeMode, type) => endTimeMode === EndTimeMode.END_TIME && type === DowntimeWindowToggleViews.ONE_TIME,
      then: endTimeValidation
    }),
    [DowntimeFormFields.RECURRENCE_END_TIME]: Yup.string().when([DowntimeFormFields.TYPE], {
      is: type => type === DowntimeWindowToggleViews.RECURRING,
      then: endTimeValidation
    }),
    [DowntimeFormFields.MS_LIST]: Yup.array().when([DowntimeFormFields.ENTITIES_RULE_TYPE], {
      is: entitiesRuleType => entitiesRuleType === EntitiesRuleType.IDENTIFIERS,
      then: Yup.array().nullable().required(getString('cv.sloDowntime.validations.msListValidation'))
    })
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
      endDateTime: endTime
    }
  }
}

const getEntityDetails = (msList: MonitoredServiceDetail[]): EntityDetails[] =>
  msList.map(msDetail => ({ entityRef: msDetail.monitoredServiceIdentifier || '', enabled: true }))

const getEntitiesRule = (msList: MonitoredServiceDetail[], entitiesRuleType: EntitiesRule['type']): EntitiesRule => {
  if (entitiesRuleType === EntitiesRuleType.ALL) {
    return {
      type: EntitiesRuleType.ALL
    }
  } else {
    return {
      type: EntitiesRuleType.IDENTIFIERS,
      entityIdentifiers: getEntityDetails(msList)
    } as EntityIdentifiersRule
  }
}

export const createSLODowntimeRequestPayload = (
  values: DowntimeForm,
  orgIdentifier: string,
  projectIdentifier: string
): DowntimeDTO => {
  const {
    name,
    identifier,
    description,
    tags,
    category,
    msList,
    type,
    startTime,
    timezone,
    endTimeMode,
    entitiesRuleType
  } = values
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
      entitiesRule: getEntitiesRule(msList, entitiesRuleType),
      spec: {
        type,
        spec: {
          timezone,
          startDateTime: startTime,
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
      entitiesRule: getEntitiesRule(msList, entitiesRuleType),
      spec: {
        type,
        spec: {
          timezone,
          startDateTime: startTime,
          downtimeDuration: {
            durationValue,
            durationType
          },
          downtimeRecurrence: {
            recurrenceValue,
            recurrenceType
          },
          recurrenceEndDateTime: recurrenceEndTime
        } as RecurringDowntimeSpec
      }
    }
  }
}

export const getSLOTitle = (getString: UseStringsReturn['getString'], identifier?: string): string =>
  identifier ? getString('cv.sloDowntime.editSLODowntime') : getString('cv.sloDowntime.createSLODowntime')
