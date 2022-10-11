/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { Formik, FormikForm } from '@wings-software/uicore'
import * as Yup from 'yup'
import { act } from 'react-test-renderer'
import { TestWrapper } from '@common/utils/testUtils'
import WeeklyTab from '../components/WeeklyTab/WeeklyTab'

describe('Weekly Tab Panel', () => {
  test('Test Weekly Tab Panel', async () => {
    const { getByTestId } = render(
      <TestWrapper>
        <Formik
          formName="schedulePanelTestForm"
          enableReinitialize={true}
          initialValues={{
            dayOfMonth: '*',
            dayOfWeek: [],
            expression: '0 0/15 * 1/1 * ? *',
            hours: '0/15',
            minutes: '0',
            month: '1/1'
          }}
          validationSchema={Yup.object().shape({
            expression: Yup.string().trim().required('required')
          })}
          onSubmit={jest.fn()}
        >
          {formikProps => {
            return (
              <FormikForm>
                <WeeklyTab formikProps={formikProps} hideSeconds={false} />
              </FormikForm>
            )
          }}
        </Formik>
      </TestWrapper>
    )
    const mondayBtn = getByTestId('day-MON')
    const tuesdayBtn = getByTestId('day-TUE')
    expect(mondayBtn).not.toBeNull()
    await act(async () => {
      fireEvent.click(mondayBtn)
      fireEvent.click(tuesdayBtn)
    })
    expect(getByTestId('cron-expression').innerHTML).toEqual('0 0/15 * 1/1 MON,TUE ? *')
  })
  test('Test Weekly Tab Panel with default days of week', async () => {
    const { getByTestId } = render(
      <TestWrapper>
        <Formik
          formName="schedulePanelTestForm"
          enableReinitialize={true}
          initialValues={{
            dayOfMonth: '*',
            expression: '0 0/15 * 1/1 * ? *',
            hours: '0/15',
            minutes: '0',
            month: '1/1'
          }}
          validationSchema={Yup.object().shape({
            expression: Yup.string().trim().required('required')
          })}
          onSubmit={jest.fn()}
        >
          {formikProps => {
            return (
              <FormikForm>
                <WeeklyTab formikProps={formikProps} hideSeconds={false} />
              </FormikForm>
            )
          }}
        </Formik>
      </TestWrapper>
    )
    const mondayBtn = getByTestId('day-MON')
    const tuesdayBtn = getByTestId('day-TUE')
    expect(mondayBtn).not.toBeNull()
    await act(async () => {
      fireEvent.click(mondayBtn)
      fireEvent.click(tuesdayBtn)
    })
    expect(getByTestId('cron-expression').innerHTML).toEqual('0 0/15 * 1/1 TUE ? *')
  })
})
