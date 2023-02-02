/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Container, FormInput, Layout, PillToggle, PillToggleProps, SelectOption, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import { ALL_TIME_ZONES } from '@common/utils/dateUtils'
import { DateTimePicker } from '@common/components/DateTimePicker/DateTimePicker'
import {
  DowntimeForm,
  DowntimeFormFields,
  EndTimeMode
} from '@cv/pages/slos/components/CVCreateDowntime/CVCreateDowntime.types'
import { DowntimeWindowToggleViews } from '../../CreateDowntimeForm.types'
import { getDurationOptions, getRecurrenceTypeOptions } from '../../CreateDowntimeForm.utils'
import css from '../../CreateDowntimeForm.module.scss'

const DowntimeWindow = (): JSX.Element => {
  const { getString } = useStrings()

  const formikProps = useFormikContext<DowntimeForm>()
  const { type, endTimeMode } = formikProps.values

  const [toggle, setToggle] = useState<DowntimeWindowToggleViews>(
    type === DowntimeWindowToggleViews.ONE_TIME
      ? DowntimeWindowToggleViews.ONE_TIME
      : DowntimeWindowToggleViews.RECURRING
  )

  const timeZoneList: SelectOption[] = ALL_TIME_ZONES.map(timezone => ({ value: timezone, label: timezone }))

  const toggleProps: PillToggleProps<DowntimeWindowToggleViews> = {
    options: [
      {
        label: getString('common.occurrence.oneTime'),
        value: DowntimeWindowToggleViews.ONE_TIME
      },
      {
        label: getString('common.occurrence.recurring'),
        value: DowntimeWindowToggleViews.RECURRING
      }
    ],
    onChange: view => {
      setToggle(view)
      formikProps.setFieldValue(DowntimeFormFields.TYPE, view)
    },
    selectedView: toggle,
    className: css.pillToggle
  }

  const renderFormInputs = (
    key: string,
    child: JSX.Element | null,
    dateTimePicker?: DowntimeFormFields,
    label?: string
  ): JSX.Element => (
    <Container>
      <Text font={{ variation: FontVariation.CARD_TITLE }} className={label && css.cardTitle}>
        {key}
      </Text>
      {dateTimePicker ? (
        <DateTimePicker name={dateTimePicker} label={label} className={label ? '' : css.picker} defaultToCurrentTime />
      ) : (
        child
      )}
    </Container>
  )

  const renderDurationDropdown = (recurrenceDuration = false, text?: string): JSX.Element => (
    <Layout.Horizontal
      spacing="small"
      className={css.endTime}
      width={text ? 300 : 200}
      margin={{ top: text ? 0 : 'small', bottom: text ? 0 : 'xsmall' }}
    >
      <Container width={text ? 180 : 150}>
        <FormInput.Text
          name={recurrenceDuration ? DowntimeFormFields.RECURRENCE_VALUE : DowntimeFormFields.DURATION_VALUE}
          disabled={text ? endTimeMode === EndTimeMode.END_TIME : false}
          inputGroup={{ type: 'number', min: 1 }}
        />
      </Container>
      <FormInput.Select
        name={recurrenceDuration ? DowntimeFormFields.RECURRENCE_TYPE : DowntimeFormFields.DURATION_TYPE}
        disabled={text ? endTimeMode === EndTimeMode.END_TIME : false}
        items={recurrenceDuration ? getRecurrenceTypeOptions(getString) : getDurationOptions(getString)}
      />
      {text && <span className={css.text}>{text}</span>}
    </Layout.Horizontal>
  )

  return (
    <Layout.Vertical spacing="large" margin={{ top: 'xsmall' }}>
      <Container>
        <PillToggle {...toggleProps} />
      </Container>

      <Container width={250}>
        <FormInput.DropDown
          label="Timezone"
          name={DowntimeFormFields.TIMEZONE}
          items={timeZoneList}
          dropDownProps={{
            minWidth: 250
          }}
          usePortal
        />
      </Container>

      <Layout.Vertical width={412} className={css.downtimeWindow}>
        {renderFormInputs(
          getString('pipeline.startTime'),
          null,
          DowntimeFormFields.START_TIME,
          getString('cv.dateAndTimeLabel')
        )}

        {toggle === DowntimeWindowToggleViews.ONE_TIME ? (
          renderFormInputs(
            getString('common.endTime'),
            <FormInput.RadioGroup
              name={DowntimeFormFields.END_TIME_MODE}
              items={[
                {
                  label: renderDurationDropdown(false, getString('cv.sloDowntime.durationText')),
                  value: EndTimeMode.DURATION
                },
                {
                  label: (
                    <DateTimePicker
                      name={DowntimeFormFields.END_TIME}
                      disabled={endTimeMode === EndTimeMode.DURATION}
                    />
                  ),
                  value: EndTimeMode.END_TIME
                }
              ]}
            />
          )
        ) : (
          <>
            {renderFormInputs(getString('pipeline.duration'), renderDurationDropdown())}
            {renderFormInputs(getString('cv.sloDowntime.repeatEvery'), renderDurationDropdown(true))}
            {renderFormInputs(getString('cv.sloDowntime.repeatEndsOn'), null, DowntimeFormFields.RECURRENCE_END_TIME)}
          </>
        )}
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default DowntimeWindow
