/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Menu, MenuItem, PopoverInteractionKind, PopoverPosition } from '@blueprintjs/core'
import { DatePicker, TimePrecision, TimePicker } from '@blueprintjs/datetime'
import { Button, ButtonVariation, Color, Container, FontVariation, Heading, Layout } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { getDateRangeShortcuts, getDateTime } from '@cv/hooks/useLogContentHook/useLogContentHook.utils'
import type { CustomDatePickerProps } from './CustomDatePicker.types'

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange }) => {
  const { getString } = useStrings()
  const [isOpen, setIsOpen] = useState(false)
  const [date, setDate] = useState<Date>(new Date())
  const [startTime, setStartTime] = useState<Date>(new Date(new Date().setHours(0, 0, 0)))
  const [endTime, setEndTime] = useState<Date>(new Date(new Date().setHours(23, 59, 59)))

  return (
    <Button
      width={180}
      icon="calendar"
      alignText="left"
      text={value.label}
      variation={ButtonVariation.SECONDARY}
      onClick={() => setIsOpen(open => !open)}
      tooltip={
        <Container>
          <Heading
            level={2}
            color={Color.BLACK}
            border={{ bottom: true }}
            font={{ variation: FontVariation.H5 }}
            padding={{ top: 'small', right: 'small', bottom: 'small', left: 'small' }}
          >
            {getString('cv.selectTimeRange')}
          </Heading>
          <Layout.Horizontal>
            <Container>
              <Menu style={{ minWidth: 'unset', width: '150px' }}>
                {getDateRangeShortcuts(getString).map(shortcut => (
                  <MenuItem
                    key={shortcut.label}
                    text={shortcut.label}
                    onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>) => {
                      e.stopPropagation()
                      onChange(shortcut)
                      setIsOpen(false)
                    }}
                  />
                ))}
              </Menu>
            </Container>
            <Container border={{ left: true }}>
              <DatePicker value={date} maxDate={new Date()} onChange={dateValue => setDate(dateValue)} />
              <Layout.Vertical
                spacing="small"
                border={{ top: true }}
                flex={{ justifyContent: 'center' }}
                margin={{ left: 'small', right: 'small' }}
                padding={{ top: 'medium', bottom: 'medium' }}
              >
                <TimePicker
                  useAmPm
                  value={startTime}
                  maxTime={endTime}
                  onChange={setStartTime}
                  precision={TimePrecision.SECOND}
                />
                <TimePicker
                  useAmPm
                  value={endTime}
                  minTime={startTime}
                  onChange={setEndTime}
                  precision={TimePrecision.SECOND}
                />
              </Layout.Vertical>
            </Container>
          </Layout.Horizontal>
          <Layout.Horizontal padding="small" spacing="small" border={{ top: true }}>
            <Button
              text={getString('common.apply')}
              variation={ButtonVariation.PRIMARY}
              onClick={() => {
                onChange({
                  value: [getDateTime(date, startTime), getDateTime(date, endTime)],
                  label: getString('common.repo_provider.customLabel')
                })
                setIsOpen(false)
              }}
            />
            <Button text={getString('cancel')} variation={ButtonVariation.TERTIARY} onClick={() => setIsOpen(false)} />
          </Layout.Horizontal>
        </Container>
      }
      tooltipProps={{
        isOpen,
        onInteraction: setIsOpen,
        position: PopoverPosition.BOTTOM_LEFT,
        interactionKind: PopoverInteractionKind.CLICK
      }}
    />
  )
}

export default CustomDatePicker
