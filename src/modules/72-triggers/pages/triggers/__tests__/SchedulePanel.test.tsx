/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, queryByText, fireEvent } from '@testing-library/react'
import { Formik, FormikForm, Button } from '@wings-software/uicore'
import { renderHook } from '@testing-library/react-hooks'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import { useStrings } from 'framework/strings'
import { TestWrapper } from '@common/utils/testUtils'
import type { NGTriggerSourceV2 } from 'services/pipeline-ng'
import { getTriggerConfigDefaultProps, getTriggerConfigInitialValues } from './scheduleMockConstants'
import { getValidationSchema, TriggerTypes } from '../utils/TriggersWizardPageUtils'
import SchedulePanel from '../views/SchedulePanel'
import { scheduleTabsId } from '../views/subviews/ScheduleUtils'
const defaultTriggerConfigDefaultProps = getTriggerConfigDefaultProps({})

const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
  <TestWrapper>{children}</TestWrapper>
)
const { result } = renderHook(() => useStrings(), { wrapper })

const fillTimeSelect = async ({
  hoursIndex,
  minutesIndex,
  minutesValue,
  amPmIndex
}: {
  hoursIndex?: number
  minutesIndex?: number
  minutesValue?: string // remote shows incorrect items in options popup
  amPmIndex?: number
}): Promise<void> => {
  if (hoursIndex) {
    const hourSelect = document.querySelectorAll(
      '[data-name="timeselect"] [class*="selectStyle"] [icon="chevron-down"] svg'
    )[0]

    if (!hourSelect) {
      throw Error('No input')
    }
    fireEvent.click(hourSelect)
    await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(12))

    const hourOptions = document.querySelectorAll('[data-name="timeselect"] [class*="bp3-menu"] li')
    fireEvent.click(hourOptions[hoursIndex])
  }

  if (minutesValue) {
    const minutesSelect = document.querySelectorAll(
      '[data-name="timeselect"] [class*="selectStyle"] [icon="chevron-down"] svg'
    )[1]

    if (!minutesSelect) {
      throw Error('No input')
    }
    fireEvent.click(minutesSelect)

    await waitFor(() => expect(document.querySelectorAll('[data-name="timeselect"] [class*="bp3-menu"] li')).toBeTruthy) // has 60 local || 72 remote
    const minutesOptions = document.querySelectorAll('[data-name="timeselect"] [class*="bp3-menu"] li')
    if (minutesOptions) {
      let matchedIndex
      for (let i = 0; i < minutesOptions.length; i++) {
        if (minutesOptions[i]?.innerHTML.includes(minutesValue)) {
          matchedIndex = i
          break
        }
      }

      if (matchedIndex) {
        fireEvent.click(minutesOptions[matchedIndex])
      }
    }
  } else if (minutesIndex) {
    const minutesSelect = document.querySelectorAll(
      '[data-name="timeselect"] [class*="selectStyle"] [icon="chevron-down"] svg'
    )[1]

    if (!minutesSelect) {
      throw Error('No input')
    }
    fireEvent.click(minutesSelect)

    await waitFor(() => expect(document.querySelectorAll('[data-name="timeselect"] [class*="bp3-menu"] li')).toBeTruthy) // has 60 local || 72 remote
    const minutesOptions = document.querySelectorAll('[data-name="timeselect"] [class*="bp3-menu"] li')
    fireEvent.click(minutesOptions[minutesIndex])
  }

  if (amPmIndex) {
    const amPmSelect = document.querySelectorAll(
      '[data-name="timeselect"] [class*="selectStyle"] [icon="chevron-down"] svg'
    )[2]

    if (!amPmSelect) {
      throw Error('No ampm input')
    }
    fireEvent.click(amPmSelect)

    await waitFor(() =>
      expect(document.querySelectorAll('[data-name="timeselect"] [class*="bp3-menu"] li')).toHaveLength(2)
    )
    const amPmOptions = document.querySelectorAll('[data-name="timeselect"] [class*="bp3-menu"] li')
    fireEvent.click(amPmOptions[amPmIndex])
  }
}

function WrapperComponent(props: { initialValues: any }): JSX.Element {
  const { initialValues } = props
  return (
    <TestWrapper>
      <Formik
        formName="schedulePanelTestForm"
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={getValidationSchema(
          TriggerTypes.SCHEDULE as unknown as NGTriggerSourceV2['type'],
          result.current.getString
        )}
        onSubmit={jest.fn()}
      >
        {formikProps => {
          return (
            <FormikForm>
              <SchedulePanel {...defaultTriggerConfigDefaultProps} formikProps={formikProps} />
              <Button text="Submit" className="submitButton" type="submit" />
            </FormikForm>
          )
        }}
      </Formik>
    </TestWrapper>
  )
}

// eslint-disable-next-line jest/no-disabled-tests
describe('SchedulePanel Triggers tests', () => {
  describe('Renders/snapshots', () => {
    test('Initial Render - Schedule Panel', async () => {
      const { container } = render(<WrapperComponent initialValues={getTriggerConfigInitialValues({})} />)
      await waitFor(() => queryByText(container, result.current.getString('common.schedule')))
      expect(container).toMatchSnapshot()
    })
  })
  describe('Interactivity: Schedule Tabs', () => {
    test('Minutes selection updates expression breakdown and expression', async () => {
      const { container } = render(
        <WrapperComponent
          initialValues={getTriggerConfigInitialValues({
            expression: '0/5 * * * *',
            selectedScheduleTab: scheduleTabsId.MINUTES
          })}
        />
      )
      await waitFor(() => queryByText(container, result.current.getString('common.schedule')))

      setFieldValue({ container, type: InputTypes.SELECT, fieldId: 'minutes', value: '30' })

      // should show disabled fields, slash before 30, expression breakdown, and expression as in snapshot
      expect(container).toMatchSnapshot()
    })

    test('Hourly selection updates expression breakdown and expression', async () => {
      const { container } = render(
        <WrapperComponent
          initialValues={getTriggerConfigInitialValues({
            expression: '0/5 * * * *',
            selectedScheduleTab: scheduleTabsId.MINUTES
          })}
        />
      )

      const hourlyTab = document.body.querySelector('[class*="bp3-tab-list"] [data-tab-id="Hourly"]')
      if (!hourlyTab) {
        throw Error('No hourly tab')
      }
      fireEvent.click(hourlyTab)

      await waitFor(() =>
        queryByText(container, result.current.getString('triggers.schedulePanel.minutesAfterTheHour'))
      )
      const firstSelect = document.querySelector('[data-name="toothpick"] [icon="chevron-down"] svg')

      if (!firstSelect) {
        throw Error('No input')
      }
      fireEvent.click(firstSelect)
      await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(7))

      const options = document.querySelectorAll('[class*="bp3-menu"] li')
      fireEvent.click(options[3])
      await waitFor(() => expect(queryByText(container, '0 0/4 * * *')).not.toBeNull())

      const secondSelect = document.querySelectorAll('[data-name="toothpick"] [icon="chevron-down"] svg')[1]

      if (!secondSelect) {
        throw Error('No input')
      }
      fireEvent.click(secondSelect)

      await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(60))
      const secondOptions = document.querySelectorAll('[class*="bp3-menu"] li')
      fireEvent.click(secondOptions[3])

      // should show disabled fields, slash before 30, expression breakdown, and expression as in snapshot
      expect(container).toMatchSnapshot('Updated hourly')
    })

    test('Daily selection updates expression breakdown and expression', async () => {
      const { container } = render(
        <WrapperComponent
          initialValues={getTriggerConfigInitialValues({
            expression: '0/5 * * * *',
            selectedScheduleTab: scheduleTabsId.MINUTES
          })}
        />
      )

      const dailyTab = document.body.querySelector('[class*="bp3-tab-list"] [data-tab-id="Daily"]')
      if (!dailyTab) {
        throw Error('No Daily tab')
      }
      fireEvent.click(dailyTab)

      await waitFor(() => queryByText(container, result.current.getString('triggers.schedulePanel.runDailyAt')))
      const hourSelect = document.querySelectorAll(
        '[data-name="timeselect"] [class*="selectStyle"] [icon="chevron-down"] svg'
      )[0]

      if (!hourSelect) {
        throw Error('No input')
      }
      fireEvent.click(hourSelect)
      await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(12))

      const hourOptions = document.querySelectorAll('[class*="bp3-menu"] li')
      fireEvent.click(hourOptions[11])
      await waitFor(() => expect(queryByText(container, '0 0 * * *')).not.toBeNull())

      const minutesSelect = document.querySelectorAll(
        '[data-name="timeselect"] [class*="selectStyle"] [icon="chevron-down"] svg'
      )[1]

      if (!minutesSelect) {
        throw Error('No input')
      }
      fireEvent.click(minutesSelect)

      await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(60))
      const minutesOptions = document.querySelectorAll('[class*="bp3-menu"] li')
      fireEvent.click(minutesOptions[3])
      await waitFor(() => expect(queryByText(container, '3 0 * * *')).not.toBeNull())

      const amPmSelect = document.querySelectorAll(
        '[data-name="timeselect"] [class*="selectStyle"] [icon="chevron-down"] svg'
      )[2]

      if (!amPmSelect) {
        throw Error('No ampm input')
      }
      fireEvent.click(amPmSelect)

      await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(2))
      const amPmOptions = document.querySelectorAll('[class*="bp3-menu"] li')
      fireEvent.click(amPmOptions[1])
      // tests pm adds 12 hours
      await waitFor(() => expect(queryByText(container, '3 12 * * *')).not.toBeNull())
    })
    // eslint-disable-next-line jest/no-disabled-tests
    test('Weekly selection updates expression breakdown and expression', async () => {
      const { container } = render(
        <WrapperComponent
          initialValues={getTriggerConfigInitialValues({
            expression: '0/5 * * * *',
            selectedScheduleTab: scheduleTabsId.MINUTES
          })}
        />
      )

      const weeklyTab = document.body.querySelector('[class*="bp3-tab-list"] [data-tab-id="Weekly"]')
      if (!weeklyTab) {
        throw Error('No Weekly tab')
      }
      fireEvent.click(weeklyTab)

      await waitFor(() => queryByText(container, result.current.getString('triggers.schedulePanel.runOn')))
      // tested minutes select
      fillTimeSelect({ hoursIndex: 2, minutesValue: '04', amPmIndex: 0 })
      await waitFor(() => expect(queryByText(container, '0 4 * * MON')).not.toBeNull())
    })

    // eslint-disable-next-line jest/no-disabled-tests
    test('Monthly selection updates expression breakdown and expression', async () => {
      const { container } = render(
        <WrapperComponent
          initialValues={getTriggerConfigInitialValues({
            expression: '0/5 * * * *',
            selectedScheduleTab: scheduleTabsId.MINUTES
          })}
        />
      )

      const monthlyTab = document.body.querySelector('[class*="bp3-tab-list"] [data-tab-id="Monthly"]')
      if (!monthlyTab) {
        throw Error('No Monthly tab')
      }
      fireEvent.click(monthlyTab)

      await waitFor(() => queryByText(container, result.current.getString('triggers.schedulePanel.runOnSpecificDay')))
      fillTimeSelect({ hoursIndex: 10, amPmIndex: 1 })
      await waitFor(() => expect(queryByText(container, '0 23 1 1/1 *')).not.toBeNull())

      const monthSelect = document.querySelector('[class*="selectMonth"] [icon="chevron-down"] svg')

      if (!monthSelect) {
        throw Error('No month select')
      }
      fireEvent.click(monthSelect)
      await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(12))
      const monthOptions = document.querySelectorAll('[class*="bp3-menu"] li')
      fireEvent.click(monthOptions[1]) // February

      const daySelect = document.querySelector('[data-name="toothpick"] [icon="chevron-down"] svg')
      if (!daySelect) {
        throw Error('No day select')
      }
      fireEvent.click(daySelect)
      await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(29))
      const dayOptions = document.querySelectorAll('[class*="bp3-menu"] li')
      fireEvent.click(dayOptions[15])

      await waitFor(() => expect(queryByText(container, '0 23 16 2/1 *')).not.toBeNull())

      const numMonthSelect = document.querySelectorAll('[data-name="toothpick"] [icon="chevron-down"] svg')[1]
      if (!numMonthSelect) {
        throw Error('No numMonth select')
      }
      fireEvent.click(numMonthSelect)
      await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(12))
      const numMonthOptions = document.querySelectorAll('[class*="bp3-menu"] li')
      fireEvent.click(numMonthOptions[10])

      await waitFor(() => expect(queryByText(container, '0 23 16 2/11 *')).not.toBeNull())
    })

    // eslint-disable-next-line jest/no-disabled-tests
    test('Yearly selection updates expression breakdown and expression', async () => {
      const { container } = render(
        <WrapperComponent
          initialValues={getTriggerConfigInitialValues({
            expression: '0/5 * * * *',
            selectedScheduleTab: scheduleTabsId.MINUTES
          })}
        />
      )

      const yearlyTab = document.body.querySelector('[class*="bp3-tab-list"] [data-tab-id="Yearly"]')
      if (!yearlyTab) {
        throw Error('No yearly tab')
      }
      fireEvent.click(yearlyTab)

      await waitFor(() =>
        queryByText(container, result.current.getString('triggers.schedulePanel.runOnSpecificDayMonth'))
      )

      const monthSelect = document.querySelectorAll('[data-name="toothpick"] [icon="chevron-down"] svg')[0]

      if (!monthSelect) {
        throw Error('No month select')
      }
      fireEvent.click(monthSelect)
      await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(12))
      const monthOptions = document.querySelectorAll('[class*="bp3-menu"] li')
      fireEvent.click(monthOptions[3]) // April

      await waitFor(() => expect(queryByText(container, '0 1 1 4 *')).not.toBeNull())

      const daySelect = document.querySelectorAll('[data-name="toothpick"] [icon="chevron-down"] svg')[1]
      if (!daySelect) {
        throw Error('No day select')
      }
      fireEvent.click(daySelect)
      await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(30))
      const dayOptions = document.querySelectorAll('[class*="bp3-menu"] li')
      fireEvent.click(dayOptions[14])

      await waitFor(() => expect(queryByText(container, '0 1 15 4 *')).not.toBeNull())

      fillTimeSelect({ hoursIndex: 10, amPmIndex: 1 })
      await waitFor(() => expect(queryByText(container, '0 23 15 4 *')).not.toBeNull())
    })

    test('Custom selection updates expression breakdown and expression', async () => {
      const { container } = render(
        <WrapperComponent
          initialValues={getTriggerConfigInitialValues({
            expression: '0/5 * * * *',
            selectedScheduleTab: scheduleTabsId.MINUTES
          })}
        />
      )

      const customTab = document.body.querySelector('[class*="bp3-tab-list"] [data-tab-id="Custom"]')
      if (!customTab) {
        throw Error('No custom tab')
      }
      fireEvent.click(customTab)

      await waitFor(() => queryByText(container, result.current.getString('triggers.schedulePanel.enterCustomCron')))

      await waitFor(() => expect(queryByText(container, '0/5 * * * *')).not.toBeNull()) // persists last

      setFieldValue({ container, type: InputTypes.TEXTFIELD, fieldId: 'expression', value: '' })

      await waitFor(() => expect(document.body.querySelector('[class*="errorField"]')).not.toBeNull())
      expect(queryByText(container, result.current.getString('invalidText'))).toBeNull() // all invalid text hidden

      setFieldValue({ container, type: InputTypes.TEXTFIELD, fieldId: 'expression', value: '0 1 1 1/1' })

      await waitFor(() => expect(queryByText(container, result.current.getString('invalidText'))).not.toBeNull())

      setFieldValue({ container, type: InputTypes.TEXTFIELD, fieldId: 'expression', value: '0 1 1 1/1 SAT' })

      await waitFor(() => expect(queryByText(container, result.current.getString('invalidText'))).toBeNull())
    })
  })
})
