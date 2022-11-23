/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Button, Container, FormInput, Layout, MultiSelectDropDown, Text, TextInput } from '@harness/uicore'
import React from 'react'
import HorizontalLineWithText from '@cv/components/HorizontalLineWithText/HorizontalLineWithText'
import { StringKeys, useStrings } from 'framework/strings'
import { FeatureFlag } from '@common/featureFlags'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import {
  eventStatusOptions,
  eventTypeOptions,
  conditionOptions,
  changeTypeOptions,
  Condition
} from '../ConfigureMonitoredServiceAlertConditions/ConfigureMonitoredServiceAlertConditions.constants'
import type { FieldValueType, MoreFieldsType, NotificationRuleRowProps } from './NotificationRuleRow.types'
import {
  getArrayOrEmpty,
  getValueFromEvent,
  getOptionsWithAllEvents,
  onConditionChange
} from './NotificationRuleRow.utils'
import type { NotificationRule } from '../../NotificationsContainer.types'
import { defaultOption } from '../../NotificationsContainer.constants'
import css from './NotificationRuleRow.module.scss'

const renderConnectedFields = (
  notificationRule: NotificationRule,
  index: number,
  handleChangeField: (
    notificationRule: NotificationRule,
    currentFieldValue: FieldValueType,
    currentField: string,
    moreFields?: MoreFieldsType
  ) => void,
  getString: (key: StringKeys) => string
): JSX.Element => {
  const { changeType, duration, id, condition, threshold, eventStatus, eventType } = notificationRule
  switch (condition?.value) {
    case Condition.CHANGE_IMPACT:
      return (
        <>
          {changeType ? (
            <Layout.Vertical spacing="xsmall" padding={{ left: 'small', right: 'small' }}>
              <Text>{getString('cv.notifications.changeType')}</Text>
              <MultiSelectDropDown
                value={getArrayOrEmpty(changeType)}
                items={changeTypeOptions}
                className={css.field}
                onChange={option => {
                  handleChangeField(notificationRule, option, 'changeType', { threshold: threshold || defaultOption })
                }}
              />
            </Layout.Vertical>
          ) : null}
          {threshold ? (
            <Layout.Vertical spacing="xsmall" padding={{ left: 'small' }}>
              <Text lineClamp={1} width={150}>
                {getString('cv.notifications.healthScoreBelow')}
              </Text>
              <TextInput
                min={0}
                max={100}
                type="number"
                required
                value={threshold}
                name={`${id}.threshold`}
                className={css.numberField}
                onChange={e => {
                  handleChangeField(notificationRule, getValueFromEvent(e), 'threshold', {
                    duration: duration || defaultOption
                  })
                }}
              />
            </Layout.Vertical>
          ) : null}
          {duration ? (
            <Layout.Vertical spacing="xsmall" padding={{ left: 'small' }}>
              <Text>{getString('pipeline.duration')}</Text>
              <TextInput
                type="number"
                required
                min={0}
                placeholder="min"
                value={duration as string}
                name={`${id}.duration`}
                className={css.numberField}
                onChange={e => {
                  handleChangeField(notificationRule, getValueFromEvent(e), 'duration')
                }}
              />
            </Layout.Vertical>
          ) : null}
        </>
      )
    case Condition.HEALTH_SCORE:
      return (
        <>
          {threshold ? (
            <Layout.Vertical spacing="xsmall" padding={{ left: 'small' }}>
              <Text>{getString('cv.notifications.thresholdBelow')}</Text>
              <TextInput
                type="number"
                required
                min={0}
                max={100}
                value={threshold as string}
                name={`${id}.threshold`}
                className={css.numberField}
                onChange={e => {
                  handleChangeField(notificationRule, getValueFromEvent(e), 'threshold', {
                    duration: duration || defaultOption
                  })
                }}
              />
            </Layout.Vertical>
          ) : null}
          {duration ? (
            <Layout.Vertical spacing="xsmall" padding={{ left: 'small' }}>
              <Text>{getString('pipeline.duration')}</Text>
              <TextInput
                type="number"
                required
                min={0}
                placeholder="min"
                value={duration as string}
                name={`${id}.duration`}
                className={css.numberField}
                onChange={e => {
                  handleChangeField(notificationRule, getValueFromEvent(e), 'duration')
                }}
              />
            </Layout.Vertical>
          ) : null}
        </>
      )
    case Condition.CHANGE_OBSERVED:
      return (
        <>
          {changeType ? (
            <Layout.Vertical spacing="xsmall" padding={{ left: 'small', right: 'small' }}>
              <Text>{getString('cv.notifications.changeType')}</Text>
              <MultiSelectDropDown
                value={getArrayOrEmpty(changeType)}
                items={changeTypeOptions}
                className={css.field}
                onChange={option => {
                  handleChangeField(notificationRule, option, 'changeType')
                }}
              />
            </Layout.Vertical>
          ) : null}
        </>
      )
    case Condition.CODE_ERRORS:
      return (
        <>
          <Layout.Vertical spacing="xsmall" padding={{ left: 'small', right: 'small' }}>
            <Text>{getString('events')}</Text>
            <FormInput.CustomRender
              name={`conditions.${index}.eventStatus`}
              render={() => (
                <MultiSelectDropDown
                  value={getArrayOrEmpty(eventStatus)}
                  items={eventStatusOptions}
                  className={css.field}
                  onChange={option => {
                    handleChangeField(notificationRule, option, 'eventStatus')
                  }}
                />
              )}
            />
          </Layout.Vertical>
          <Layout.Vertical spacing="xsmall" padding={{ left: 'small', right: 'small' }}>
            <Text>{getString('pipeline.verification.logs.eventType')}</Text>
            <FormInput.CustomRender
              name={`conditions.${index}.eventType`}
              render={() => (
                <MultiSelectDropDown
                  value={getArrayOrEmpty(eventType)}
                  items={eventTypeOptions}
                  className={css.field}
                  onChange={options => {
                    const actualOptions = getOptionsWithAllEvents(getArrayOrEmpty(eventType), options)
                    handleChangeField(notificationRule, actualOptions, 'eventType')
                  }}
                />
              )}
            />
          </Layout.Vertical>
        </>
      )
    default:
      return <></>
  }
}

export default function NotificationRuleRow({
  notificationRule,
  showDeleteNotificationsIcon,
  handleDeleteNotificationRule,
  handleChangeField,
  index
}: NotificationRuleRowProps): JSX.Element {
  const { getString } = useStrings()
  const SRM_CODE_ERROR_NOTIFICATIONS = useFeatureFlag(FeatureFlag.SRM_CODE_ERROR_NOTIFICATIONS)

  const actualConditionOptions = SRM_CODE_ERROR_NOTIFICATIONS
    ? conditionOptions
    : conditionOptions.filter(el => el.value != Condition.CODE_ERRORS)

  return (
    <>
      <Layout.Horizontal padding={{ top: 'large' }} key={notificationRule.id} spacing="medium">
        <Layout.Vertical spacing="xsmall" padding={{ right: 'small' }}>
          <Text>{getString('cv.notifications.condition')}</Text>
          <FormInput.Select
            name={`conditions.${index}.condition`}
            className={css.conditionField}
            value={notificationRule.condition}
            items={actualConditionOptions}
            onChange={option => {
              onConditionChange(option, notificationRule, handleChangeField)
            }}
          />
        </Layout.Vertical>
        {renderConnectedFields(notificationRule, index, handleChangeField, getString)}
        {showDeleteNotificationsIcon ? (
          <Container padding={{ top: 'large' }}>
            <Button
              data-name="trash"
              icon="main-trash"
              iconProps={{ size: 20 }}
              minimal
              onClick={() => handleDeleteNotificationRule(notificationRule.id)}
            />
          </Container>
        ) : null}
      </Layout.Horizontal>
      <Container padding={{ top: 'small' }}>
        <HorizontalLineWithText text={'OR'} />
      </Container>
    </>
  )
}
