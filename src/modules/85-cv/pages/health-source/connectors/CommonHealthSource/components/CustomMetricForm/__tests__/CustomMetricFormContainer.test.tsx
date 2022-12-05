/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { FormikForm } from '@harness/uicore'
import { Formik } from 'formik'
import { TestWrapper } from '@common/utils/testUtils'
import type { CustomMetricFormContainerProps } from '../CustomMetricForm.types'
import CustomMetricFormContainer from '../CustomMetricFormContainer'
import { mockedCustomMetricFormContainerData } from './CustomMetricFormContainer.mock'

function WrapperComponent(props: CustomMetricFormContainerProps): JSX.Element {
  return (
    <Formik initialValues={props} onSubmit={jest.fn()}>
      <FormikForm>
        <TestWrapper>
          <CustomMetricFormContainer {...props} />
        </TestWrapper>
      </FormikForm>
    </Formik>
  )
}

describe('Unit tests for CustomMetricFormContainer', () => {
  const props = {
    ...mockedCustomMetricFormContainerData,
    setMappedMetrics: jest.fn(),
    setCreatedMetrics: jest.fn(),
    setGroupedCreatedMetrics: jest.fn(),
    setNonCustomFeilds: jest.fn()
  } as any

  test('Ensure CustomMetricFormContainer component loads with the button to add metric', async () => {
    const { getByText } = render(<WrapperComponent {...props} />)
    await waitFor(() => expect(getByText('cv.monitoringSources.addMetric')).toBeInTheDocument())
  })
})
