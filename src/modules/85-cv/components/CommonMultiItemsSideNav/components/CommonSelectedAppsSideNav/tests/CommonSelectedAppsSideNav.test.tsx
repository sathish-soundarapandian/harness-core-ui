/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, FormikForm } from '@harness/uicore'
import { render, waitFor } from '@testing-library/react'
import { commonHealthSourceProviderPropsMock } from '@cv/components/CommonMultiItemsSideNav/tests/CommonMultiItemsSideNav.mock'
import CommonHealthSourceProvider from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/components/CommonHealthSourceContext/CommonHealthSourceContext'
import { TestWrapper } from '@common/utils/testUtils'
import { CommonSelectedAppsSideNavProps, CommonSelectedAppsSideNav } from '../CommonSelectedAppsSideNav'
import { groupedSelectedApps } from './CommonSelectedAppsSideNav.mock'

function WrapperComponent(props: CommonSelectedAppsSideNavProps): JSX.Element {
  return (
    <TestWrapper>
      <CommonHealthSourceProvider {...commonHealthSourceProviderPropsMock}>
        <Formik initialValues={{}} onSubmit={jest.fn()} formName="testForm">
          <FormikForm>
            <CommonSelectedAppsSideNav {...props} groupedSelectedApps={groupedSelectedApps} />
          </FormikForm>
        </Formik>
      </CommonHealthSourceProvider>
    </TestWrapper>
  )
}

describe('Unit tests forCommonSelectedAppsSideNav', () => {
  const openEditMetricModal = jest.fn()
  test('Ensure that when apps are provided, the list is rendered', async () => {
    const { container } = render(<WrapperComponent openEditMetricModal={openEditMetricModal} />)
    await waitFor(() => expect(container.querySelectorAll(`[class*="selectedApp"]`).length).toBe(2))
  })
})
