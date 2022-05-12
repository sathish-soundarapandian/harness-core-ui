/*
 * Copyright 2020 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Formik, Form } from 'formik'

import { TestWrapper } from '@common/utils/testUtils'

import { FormMultiTypeDurationField, getDurationValidationSchema, isValidTimeString } from '../MultiTypeDuration'

interface TestProps {
  initialValues?: any
}

const TestComponent = ({ initialValues }: TestProps): React.ReactElement => (
  <TestWrapper>
    <Formik initialValues={initialValues} onSubmit={Promise.resolve}>
      <Form>
        <FormMultiTypeDurationField name="test" label={'Duration'} />
      </Form>
    </Formik>
  </TestWrapper>
)

describe('<MultiTypeDuration /> tests', () => {
  test('Should render properly', () => {
    const { container } = render(<TestComponent />)
    expect(container).toMatchSnapshot()
  })
  test('isValidTimeString works correctly', async () => {
    // falsy
    expect(isValidTimeString('test')).toBeFalsy()
    expect(isValidTimeString('1')).toBeFalsy()
    expect(isValidTimeString('20r')).toBeFalsy()
    expect(isValidTimeString('20s/2h')).toBeFalsy()
    // truthy
    expect(isValidTimeString('')).toBeTruthy()
    expect(isValidTimeString('1s')).toBeTruthy()
    expect(isValidTimeString('1m')).toBeTruthy()
    expect(isValidTimeString('1h')).toBeTruthy()
    expect(isValidTimeString('1d')).toBeTruthy()
    expect(isValidTimeString('1w')).toBeTruthy()
  })
  test('getDurationValidationSchema works correctly', async () => {
    const invalidSyntaxErr = 'Invalid syntax provided'
    const customInvalidSyntaxErr = 'Wrong syntax'
    const customMinErr = 'Too low'
    const customMaxErr = 'Too high'
    const fn = getDurationValidationSchema
    // no config is passed
    // rejects
    await expect(fn().validate('1')).rejects.toThrow(invalidSyntaxErr)
    await expect(fn().validate('1r')).rejects.toThrow(invalidSyntaxErr)
    await expect(fn().validate('10s/2w')).rejects.toThrow(invalidSyntaxErr)
    // resolves
    await expect(fn().validate('')).resolves.toBe('')
    await expect(fn().validate('1s')).resolves.toBe('1s')
    // with config
    // - with wrong max/min
    expect(() => fn({ minimum: '5' })).toThrow('Invalid format "5" provided for minimum value')
    expect(() => fn({ maximum: '5' })).toThrow('Invalid format "5" provided for maximum value')
    // - default thresholds errors
    expect(fn({ minimum: '10s' }).validate('1s')).rejects.toThrow('Value must be greater than or equal to "10s"')
    expect(fn({ minimum: '10d' }).validate('1h')).rejects.toThrow('Value must be greater than or equal to "1w 3d"')
    expect(fn({ maximum: '72h' }).validate('50w')).rejects.toThrow('Value must be less than or equal to "3d"')
    expect(fn({ maximum: '10w' }).validate('50w')).rejects.toThrow('Value must be less than or equal to "10w"')
    // - custom invalid syntax message works
    await expect(fn({ inValidSyntaxMessage: customInvalidSyntaxErr }).validate('1')).rejects.toThrow(
      customInvalidSyntaxErr
    )
    // - custom min/max thresholds errors
    expect(fn({ minimum: '10s', minimumErrorMessage: customMinErr }).validate('1s')).rejects.toThrow(customMinErr)
    expect(fn({ maximum: '10w', maximumErrorMessage: customMaxErr }).validate('50w')).rejects.toThrow(customMaxErr)
  })
})
