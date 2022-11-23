/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { Formik } from 'formik'
import { Button } from '@harness/uicore'
import { act } from 'react-test-renderer'
import userEvent from '@testing-library/user-event'
import { useMutateAsGet } from '@common/hooks'
import { TestWrapper } from '@common/utils/testUtils'
import { getDistribution } from '../AddSlos/AddSLOs.utils'
import { AddSLOs } from '../AddSlos/AddSLOs'
import { mockSLODashboardWidgetsData } from '../AddSlos/components/__tests__/SLOList.mock'

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn()
}))

const serviceLevelObjectivesDetails = [
  {
    accountId: 'default',
    orgIdentifier: 'default',
    projectIdentifier: 'Project1',
    serviceLevelObjectiveRef: 'hHJYxnUFTCypZdmYr0Q0tQ',
    weightagePercentage: 50
  },
  {
    accountId: 'default',
    orgIdentifier: 'default',
    projectIdentifier: 'Project1',
    serviceLevelObjectiveRef: '7b-_GIZxRu6VjFqAqqdVDQ',
    weightagePercentage: 50
  }
]

describe('Validate  AddSLO', () => {
  test('should validate getDistribution', () => {
    const updatedServiceLevelObjectivesDetails = getDistribution({
      weight: 30,
      currentIndex: 1,
      manuallyUpdatedSlos: [],
      sloList: serviceLevelObjectivesDetails
    })
    const clonedServiceLevelObjectivesDetails = [...serviceLevelObjectivesDetails]
    clonedServiceLevelObjectivesDetails[0].weightagePercentage = 70
    clonedServiceLevelObjectivesDetails[1].weightagePercentage = 30
    expect(updatedServiceLevelObjectivesDetails).toEqual(clonedServiceLevelObjectivesDetails)
  })

  test('should render AddSLOs with no values', () => {
    // eslint-disable-next-line
    // @ts-ignore
    useMutateAsGet.mockImplementation(() => {
      return {
        data: [],
        loading: true,
        error: null,
        refetch: jest.fn()
      }
    })
    const { getByText } = render(
      <TestWrapper>
        <AddSLOs />
      </TestWrapper>
    )
    expect(getByText('cv.CompositeSLO.AddSLO')).toBeInTheDocument()
  })

  test('should be able to add new SLO', async () => {
    // eslint-disable-next-line
    // @ts-ignore
    useMutateAsGet.mockImplementation(() => {
      return {
        data: mockSLODashboardWidgetsData,
        loading: false,
        error: null,
        refetch: jest.fn()
      }
    })
    const { getByText } = render(
      <TestWrapper>
        <Formik
          initialValues={[
            { ...serviceLevelObjectivesDetails[0], serviceLevelObjectiveRef: 'SLO4' },
            { ...serviceLevelObjectivesDetails[1], serviceLevelObjectiveRef: 'SLO3' }
          ]}
          onSubmit={jest.fn()}
        >
          {() => <AddSLOs />}
        </Formik>
      </TestWrapper>
    )

    expect(getByText('cv.CompositeSLO.AddSLO')).toBeInTheDocument()

    act(() => {
      fireEvent.click(getByText('cv.CompositeSLO.AddSLO'))
    })
    await waitFor(() => expect(document.querySelector('.bp3-drawer')).toBeInTheDocument())

    // check select all
    act(() => {
      fireEvent.click(document.querySelectorAll('[type="checkbox"]')[0]!)
    })
    const addSloButton = document.querySelector('[data-testid="addSloButton"]')
    expect(document.querySelector('[data-testid="addSloButton"]')).not.toBeDisabled()

    // uncheck select all
    act(() => {
      fireEvent.click(document.querySelectorAll('[type="checkbox"]')[0]!)
    })
    expect(document.querySelector('[data-testid="addSloButton"]')).toBeDisabled()

    // select two slos
    act(() => {
      fireEvent.click(document.querySelectorAll('[type="checkbox"]')[1]!)
    })
    act(() => {
      fireEvent.click(document.querySelectorAll('[type="checkbox"]')[2]!)
    })
    expect(document.querySelector('[data-testid="addSloButton"]')).not.toBeDisabled()

    act(() => {
      fireEvent.click(addSloButton!)
    })
    expect(getByText('SLO3')).toBeInTheDocument()
    expect(getByText('SLO4')).toBeInTheDocument()
  })

  test('should render AddSLOs with existing values values', () => {
    const { container, getByText } = render(
      <TestWrapper>
        <Formik initialValues={{ serviceLevelObjectivesDetails }} onSubmit={jest.fn()}>
          {formikProps => (
            <>
              <AddSLOs />
              <Button
                onClick={() => {
                  formikProps.setFieldValue('serviceLevelObjectivesDetails', [])
                }}
              >
                Update
              </Button>
            </>
          )}
        </Formik>
      </TestWrapper>
    )
    expect(getByText('cv.CompositeSLO.AddSLO')).toBeInTheDocument()
    const firstWeight = container.querySelector('[name="weightagePercentage"]')
    act(() => {
      userEvent.type(firstWeight!, '1')
    })
    act(() => {
      fireEvent.click(getByText('Update'))
    })
  })

  test('should be able to delete SLOs', () => {
    const { container, getByText, queryByText } = render(
      <TestWrapper>
        <Formik initialValues={{ serviceLevelObjectivesDetails }} onSubmit={jest.fn()}>
          {() => <AddSLOs />}
        </Formik>
      </TestWrapper>
    )
    expect(container.querySelector('[data-icon="main-trash"]')).toBeInTheDocument()
    expect(getByText('hHJYxnUFTCypZdmYr0Q0tQ')).toBeInTheDocument()
    act(() => {
      fireEvent.click(container.querySelector('[data-icon="main-trash"]')!)
    })
    expect(document.querySelector('.bp3-dialog')).toBeInTheDocument()
    act(() => {
      fireEvent.click(document.querySelectorAll('.bp3-dialog button')[0]!)
    })
    expect(queryByText('hHJYxnUFTCypZdmYr0Q0tQ')).not.toBeInTheDocument()
  })

  test('should be able to reset SLOs weight', () => {
    const init = {
      serviceLevelObjectivesDetails: [
        { ...serviceLevelObjectivesDetails[0], weightagePercentage: 70 },
        { ...serviceLevelObjectivesDetails[1], weightagePercentage: 30 }
      ]
    }
    const { container, getAllByText } = render(
      <TestWrapper>
        <Formik initialValues={init} onSubmit={jest.fn()}>
          {() => <AddSLOs />}
        </Formik>
      </TestWrapper>
    )
    expect(container.querySelector('input[value="70"]')).toBeInTheDocument()
    expect(container.querySelector('input[value="30"]')).toBeInTheDocument()
    expect(getAllByText('reset')[0]).toBeInTheDocument()
    act(() => {
      fireEvent.click(getAllByText('reset')[0])
    })
    expect(container.querySelector('input[value="50"]')).toBeInTheDocument()
  })
})
