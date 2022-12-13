/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, FormikForm } from '@harness/uicore'
import { Classes } from '@blueprintjs/core'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { CommonSelectedAppsSideNavProps, CommonSelectedAppsSideNav } from '../CommonSelectedAppsSideNav'

function WrapperComponent(props: CommonSelectedAppsSideNavProps): JSX.Element {
  return (
    <TestWrapper>
      <Formik initialValues={{}} onSubmit={jest.fn()} formName="testForm">
        <FormikForm>
          <CommonSelectedAppsSideNav {...props} />
        </FormikForm>
      </Formik>
    </TestWrapper>
  )
}

describe('Unit tests forCommonSelectedAppsSideNav', () => {
  const openEditMetricModal = jest.fn()
  test('Ensure loading state is rendered correctly', async () => {
    const { container } = render(<WrapperComponent loading={true} openEditMetricModal={openEditMetricModal} />)
    await waitFor(() => expect(container.querySelectorAll(`[class*="${Classes.SKELETON}"]`).length).toBe(5))
  })
  test('Ensure that when apps are provided, the list is rendered', async () => {
    const { container } = render(
      <WrapperComponent
        openEditMetricModal={openEditMetricModal}
        selectedMetrics={Array(50)
          .fill(null)
          .map((_, i) => i.toString())}
      />
    )
    await waitFor(() => expect(container.querySelectorAll(`[class*="selectedApp"]`).length).toBe(50))
  })
})
