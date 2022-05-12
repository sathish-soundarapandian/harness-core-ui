/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { AccessPoint } from 'services/lw'
import DeleteAccessPoint from '../DeleteAccessPoint'

const mockedAp: AccessPoint = {
  id: 'ap-c95',
  name: 'testing-source-1',
  account_id: 'accId',
  cloud_account_id: 'TestGcp',
  host_name: 'warmup1.io',
  region: 'us-central1',
  vpc: 'rishi-test',
  type: 'gcp',
  status: 'created',
  editables: ['metadata.security_groups', 'metadata.certificate_id']
}

jest.mock('services/lw', () => ({
  useDeleteAccessPoints: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: jest.fn()
  }))
}))

describe('Delete access points button tests', () => {
  test('should not show delete button in case of empty list', () => {
    const { container } = render(
      <TestWrapper>
        <DeleteAccessPoint accessPoints={[]} accountId="accId" refresh={jest.fn()} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('should show delete button in case of list items', () => {
    const { container } = render(
      <TestWrapper>
        <DeleteAccessPoint accessPoints={[mockedAp]} accountId="accId" refresh={jest.fn()} />
      </TestWrapper>
    )

    const deleteBtn = container.querySelector('button')
    expect(deleteBtn).toBeDefined()

    act(() => {
      fireEvent.click(deleteBtn!)
    })

    expect(document.querySelector('.bp3-dialog')).toBeInTheDocument()

    const confirmBtn = document.querySelector('.bp3-dialog button[type="submit"]')
    expect(confirmBtn).toBeDefined()
    act(() => {
      fireEvent.click(confirmBtn!)
    })
  })
})
