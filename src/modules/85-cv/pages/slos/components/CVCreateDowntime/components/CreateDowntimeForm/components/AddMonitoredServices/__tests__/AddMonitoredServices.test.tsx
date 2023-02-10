import React from 'react'
import { fireEvent, render, act } from '@testing-library/react'
import { Formik } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import AddMonitoredServices from '../AddMonitoredServices'
import { msList } from '../components/__tests__/MSList.mock'

describe('AddMonitoredServices', () => {
  test('should render error page', async () => {
    const { getByText } = render(
      <TestWrapper>
        <Formik initialValues={{ msList: [] }} onSubmit={jest.fn()} formName={'addMSForm'}>
          {() => (
            <AddMonitoredServices
              isCreateFlow={true}
              refetchMsList={jest.fn()}
              msListError={'Oops, something went wrong on our end. Please contact Harness Support.'}
            />
          )}
        </Formik>
      </TestWrapper>
    )

    expect(getByText('Oops, something went wrong on our end. Please contact Harness Support.')).toBeInTheDocument()
    expect(getByText('Retry')).toBeInTheDocument()

    act(() => {
      fireEvent.click(getByText('Retry'))
    })
  })

  test('should render all the selected monitored services', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <Formik initialValues={{ msList }} onSubmit={jest.fn()} formName={'addMSForm'}>
          {() => <AddMonitoredServices isCreateFlow={true} />}
        </Formik>
      </TestWrapper>
    )

    expect(getByText('cv.sloDowntime.msList')).toBeInTheDocument()
    expect(container.querySelector('[id="newone_datadog"]')).toBeInTheDocument()
    expect(getByText('cv.sloDowntime.selectMonitoredServices')).toBeInTheDocument()

    act(() => {
      fireEvent.click(container.getElementsByClassName('bp3-icon-small-cross')[0])
    })
  })
})
