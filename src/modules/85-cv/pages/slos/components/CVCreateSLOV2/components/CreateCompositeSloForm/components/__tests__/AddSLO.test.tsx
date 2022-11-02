/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { Formik } from 'formik'
import { Button } from '@harness/uicore'
import { act } from 'react-test-renderer'
import { TestWrapper } from '@common/utils/testUtils'
import { getDistribution } from '../AddSlos/AddSLOs.utils'
import { AddSLOs } from '../AddSlos/AddSLOs'

const serviceLevelObjectivesDetails = [
  {
    accountId: 'default',
    serviceLevelObjectiveRef: 'hHJYxnUFTCypZdmYr0Q0tQ',
    weightagePercentage: 50
  },
  {
    accountId: 'default',
    serviceLevelObjectiveRef: '7b-_GIZxRu6VjFqAqqdVDQ',
    weightagePercentage: 50
  }
]

describe('Validate  AddSLO', () => {
  test('should validate getDistribution', () => {
    const updatedServiceLevelObjectivesDetails = getDistribution(30, 1, serviceLevelObjectivesDetails)
    const clonedServiceLevelObjectivesDetails = [...serviceLevelObjectivesDetails]
    clonedServiceLevelObjectivesDetails[0].weightagePercentage = 70
    clonedServiceLevelObjectivesDetails[1].weightagePercentage = 30
    expect(updatedServiceLevelObjectivesDetails).toEqual(clonedServiceLevelObjectivesDetails)
  })

  test('should render AddSLOs with no values', () => {
    const { getByText } = render(
      <TestWrapper>
        <AddSLOs />
      </TestWrapper>
    )
    expect(getByText('cv.CompositeSLO.AddSLO')).toBeInTheDocument()
  })

  test('should render AddSLOs with existing values values', () => {
    const { getByText } = render(
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
    act(() => {
      fireEvent.click(getByText('Update'))
    })
  })
})
