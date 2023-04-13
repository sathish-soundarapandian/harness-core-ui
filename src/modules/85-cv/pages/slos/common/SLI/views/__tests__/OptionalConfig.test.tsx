/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Formik } from 'formik'
import { TestWrapper } from '@common/utils/testUtils'
import { SLOV2FormFields } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import OptionalConfig from '../OptionalConfig/OptionalConfig'

describe('Validate OptionalConfig', () => {
  test('should render OptionalConfig in create mode', () => {
    const { getByText } = render(
      <TestWrapper>
        <Formik formName="" initialValues={{}} onSubmit={() => undefined}>
          {_ => {
            return <OptionalConfig />
          }}
        </Formik>
      </TestWrapper>
    )
    expect(getByText('cv.slos.slis.optionalConfig.consecutiveDuration')).toBeInTheDocument()
    expect(getByText('cv.slos.slis.optionalConfig.consecutiveMinutesFromTheStartAs')).toBeInTheDocument()
  })
  test('should render OptionalConfig in edit mode', () => {
    const { container } = render(
      <TestWrapper>
        <Formik
          formName=""
          initialValues={{
            [SLOV2FormFields.CONSIDER_CONSECUTIVE_MINUTES]: 10,
            [SLOV2FormFields.CONSIDER_ALL_CONSECUTIVE_MINUTES_FROM_START_AS_BAD]: true
          }}
          onSubmit={() => undefined}
        >
          {_ => {
            return <OptionalConfig />
          }}
        </Formik>
      </TestWrapper>
    )
    expect(container.querySelector('[name="considerConsecutiveMinutes"]')).toHaveValue(10)
    expect(container.querySelector('[name="considerAllConsecutiveMinutesFromStartAsBad"]')).toHaveValue('cv.bad')
  })
})
