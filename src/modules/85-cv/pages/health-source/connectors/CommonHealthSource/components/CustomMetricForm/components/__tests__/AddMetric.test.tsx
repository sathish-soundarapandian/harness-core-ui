/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, FormikForm } from '@harness/uicore'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { CustomHealthMetricDefinition } from 'services/cv'
import AddMetric, { AddMetricProps } from '../AddMetric'

function WrapperComponent(props: AddMetricProps): JSX.Element {
  return (
    <TestWrapper>
      <Formik initialValues={{}} onSubmit={jest.fn()} formName="testForm">
        <FormikForm>
          <AddMetric {...props} />
        </FormikForm>
      </Formik>
    </TestWrapper>
  )
}

describe('Unit tests for AddMetric', () => {
  const props = {
    enableDefaultGroupName: false,
    currentSelectedMetricDetail: {} as CustomHealthMetricDefinition,
    groupNames: [{ label: 'group1', value: 'group1' }],
    setGroupName: jest.fn()
  }
  test('Ensure AddMetric component loads with groupName when default groupName is disabled in Health source config', async () => {
    const { container } = render(<WrapperComponent {...props} />)
    await waitFor(() => expect(container.querySelector(`input[name="groupName"]`)).toBeInTheDocument())
  })

  test('Ensure AddMetric component doesnt loads with groupName when default groupName is enabled in Health source config', async () => {
    const newProps = { ...props, enableDefaultGroupName: true }
    const { container } = render(<WrapperComponent {...newProps} />)
    await waitFor(() => expect(container.querySelector(`input[name="groupName"]`)).not.toBeInTheDocument())
  })
})
