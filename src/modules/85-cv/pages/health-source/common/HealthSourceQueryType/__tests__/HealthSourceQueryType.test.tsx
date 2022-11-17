/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { Formik, FormikForm } from '@harness/uicore'
import * as Yup from 'yup'
import { TestWrapper } from '@common/utils/testUtils'
import { HealthSourceQueryType } from '../HealthSourceQueryType'
import { queryTypeValidation } from '../HealthSourceQueryType.constants'
import { HealthSourceQueryTypeProps, QueryType } from '../HealthSourceQueryType.types'

const mockGetString = jest.fn().mockImplementation(() => 'cv.componentValidations.queryType')
const SampleComponent: React.FC<{
  initialValue?: string
  validationStrnig?: string
  onSubmit: (props: any) => void
  onChange?: HealthSourceQueryTypeProps['onChange']
}> = ({ initialValue, onSubmit, onChange }) => {
  return (
    <TestWrapper>
      <Formik
        formName="test"
        initialValues={{ queryType: initialValue }}
        onSubmit={onSubmit}
        validationSchema={Yup.object().shape({
          queryType: queryTypeValidation(mockGetString)
        })}
      >
        <FormikForm>
          <HealthSourceQueryType onChange={onChange} />
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
    expect(getByText('cv.componentValidations.queryType')).toBeDefined()
  })

  test('should select default value as service based', async () => {
    const onSubmit = (selectedProps: any) => {
      expect(selectedProps.queryType).toBe('Service Based')
    }
    const { getByTestId } = render(<SampleComponent onSubmit={onSubmit} initialValue={'Service Based'} />)
    await act(async () => {
      fireEvent.click(getByTestId('submitButtonJest'))
    })
  })
  test('should select default value as host based', async () => {
    const onSubmit = (selectedProps: any) => {
      expect(selectedProps.queryType).toBe('Host Based')
    }
    const { getByTestId } = render(<SampleComponent onSubmit={onSubmit} initialValue={'Host Based'} />)
    await act(async () => {
      fireEvent.click(getByTestId('submitButtonJest'))
    })
  })

  test('should change to host based', async () => {
    const onSubmit = (selectedProps: any) => {
      expect(selectedProps.queryType).toBe('cv.queryTypeHost')
    }
    const { getByTestId, getByText } = render(<SampleComponent onSubmit={onSubmit} initialValue={'Service Based'} />)
    await act(async () => {
      fireEvent.click(getByText('cv.queryTypeHost'))
      fireEvent.click(getByTestId('submitButtonJest'))
    })
  })
  test('Ensure on change is called when passed', async () => {
    const onChangeMock = jest.fn()
    const { container } = render(
      <SampleComponent onSubmit={jest.fn()} initialValue={QueryType.HOST_BASED} onChange={onChangeMock} />
    )

    await waitFor(() =>
      expect(container.querySelector(`[value="${QueryType.HOST_BASED}"]`)?.getAttribute('checked')).not.toBeNull()
    )

    fireEvent.click(container.querySelector(`[value="${QueryType.SERVICE_BASED}"]`)!)
    await waitFor(() => expect(onChangeMock).toHaveBeenCalledWith(QueryType.SERVICE_BASED))
  })
})
