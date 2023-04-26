/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { serviceListResponse } from '@cd/mock'
import ServicesListView from '../ServicesListView/ServicesListView'
import { ServiceMenu } from '../ServicesListColumns/ServicesListColumns'

describe('ServiceListView', () => {
  test('render Service list', () => {
    const { container } = render(
      <TestWrapper>
        <ServicesListView data={serviceListResponse} onServiceSelect={jest.fn()} loading={false} isForceDeleteEnabled />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('Should render options after click', async () => {
    const services = serviceListResponse?.data?.content?.map(service => service.service) || []

    const { container } = render(
      <TestWrapper>
        <ServiceMenu data={services} isForceDeleteEnabled />
      </TestWrapper>
    )

    fireEvent.click(container.querySelector('[data-icon="Options"]') as HTMLElement)
    expect(container).toMatchSnapshot()
  })
})
