/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Formik } from 'formik'
import { TestWrapper } from '@common/utils/testUtils'
import type { SLOV2Form } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import SLOTarget from '../SLOTarget'

const Wrapper = ({ data }: any) => {
  return (
    <TestWrapper>
      <Formik<SLOV2Form> initialValues={...data} onSubmit={jest.fn()}>
        {formik => <SLOTarget formikProps={formik} />}
      </Formik>
    </TestWrapper>
  )
}

describe('Valiate SLOTarget', () => {
  test('should render SLOTarget', () => {
    const { container } = render(<Wrapper data={{ SLOTargetPercentage: 0, periodLength: 0, periodLengthType: '' }} />)
    expect(container).toMatchSnapshot()
  })

  test('should render SLOTarget for rolling', () => {
    const { container } = render(
      <Wrapper data={{ SLOTargetPercentage: 70, periodType: 'Rolling', periodLength: 10 }} />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render SLOTarget for calendar', () => {
    const { container: monthlyCalendarContainer } = render(
      <Wrapper
        data={{ SLOTargetPercentage: 70, periodType: 'Calender', periodLengthType: 'Monthly', dayOfMonth: 10 }}
      />
    )
    expect(monthlyCalendarContainer).toMatchSnapshot()

    const { container: weeklyCalendarContainer } = render(
      <Wrapper
        data={{ SLOTargetPercentage: 99, periodType: 'Calender', periodLengthType: 'Weekly', dayOfWeek: 'Mon' }}
      />
    )
    expect(weeklyCalendarContainer).toMatchSnapshot()

    const { container: quaterlyCalendarContainer } = render(
      <Wrapper data={{ SLOTargetPercentage: 88, periodType: 'Calender', periodLengthType: 'Quarterly' }} />
    )
    expect(quaterlyCalendarContainer).toMatchSnapshot()
  })
})
