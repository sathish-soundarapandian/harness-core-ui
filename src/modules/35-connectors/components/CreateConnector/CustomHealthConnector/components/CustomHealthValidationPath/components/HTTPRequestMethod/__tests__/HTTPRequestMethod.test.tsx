/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { Formik, FormikForm } from '@harness/uicore'
import * as Yup from 'yup'
import { TestWrapper } from '@common/utils/testUtils'
import { HTTPRequestMethodOption } from '../HTTPRequestMethod'
import { httpRequestMethodValidation } from '../HTTPRequestMethod.constants'
import { HTTPRequestMethod } from '../HTTPRequestMethod.types'

const mockGetString = jest.fn().mockImplementation(() => 'cv.componentValidations.requestMethod')
const SampleComponent: React.FC<{
  initialValue?: string
  validationStrnig?: string
  onSubmit: (props: any) => void
}> = ({ initialValue, onSubmit }) => {
  return (
    <TestWrapper>
      <Formik
        formName="test"
        initialValues={{ requestMethod: initialValue }}
        onSubmit={onSubmit}
        validationSchema={Yup.object().shape({
          requestMethod: httpRequestMethodValidation(mockGetString)
        })}
      >
        <FormikForm>
          <HTTPRequestMethodOption />
          <button type="submit" data-testid={'submitButtonJest'} />
        </FormikForm>
      </Formik>
    </TestWrapper>
  )
}

describe('RuntimeInput Tests for RadioGroup', () => {
  test('should throw validation error', async () => {
    const { getByTestId, getByText } = render(<SampleComponent onSubmit={jest.fn()} />)
    await act(async () => {
      fireEvent.click(getByTestId('submitButtonJest'))
    })
    expect(getByText('cv.componentValidations.requestMethod')).toBeDefined()
  })

  test('should select default value as GET', async () => {
    const onSubmit = (selectedProps: any) => {
      expect(selectedProps.requestMethod).toBe(HTTPRequestMethod.GET)
    }
    const { getByTestId } = render(<SampleComponent onSubmit={onSubmit} initialValue={HTTPRequestMethod.GET} />)
    await act(async () => {
      fireEvent.click(getByTestId('submitButtonJest'))
    })
  })
  test('should select default value as POST', async () => {
    const onSubmit = (selectedProps: any) => {
      expect(selectedProps.requestMethod).toBe(HTTPRequestMethod.POST)
    }
    const { getByTestId } = render(<SampleComponent onSubmit={onSubmit} initialValue={HTTPRequestMethod.POST} />)
    await act(async () => {
      fireEvent.click(getByTestId('submitButtonJest'))
    })
  })

  test('should change to post', async () => {
    const onSubmit = (selectedProps: any) => {
      expect(selectedProps.requestMethod).toBe(HTTPRequestMethod.POST)
    }
    const { getByTestId, getByText } = render(
      <SampleComponent onSubmit={onSubmit} initialValue={HTTPRequestMethod.GET} />
    )
    await act(async () => {
      fireEvent.click(getByText(HTTPRequestMethod.POST))
      fireEvent.click(getByTestId('submitButtonJest'))
    })
  })
})
