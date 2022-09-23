/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import { CustomApprovalTab } from '../CustomApprovalTab'
import approvalData from './CustomAprovalData.json'

jest.mock('@common/components/Duration/Duration', () => ({
  Duration() {
    return <div>MOCK DURATION</div>
  }
}))

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('<CustomApprovalTab/> tests', () => {
  test('is in waiting state', () => {
    const { container } = render(
      <TestWrapper>
        <CustomApprovalTab isWaiting={true} approvalData={approvalData as any} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('not in waiting state ', () => {
    const { container } = render(
      <TestWrapper>
        <CustomApprovalTab isWaiting={false} approvalData={approvalData as any} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('rejected scenario', () => {
    const rejectedData = { ...approvalData } as any
    rejectedData.status = 'REJECTED'
    const { container } = render(
      <TestWrapper>
        <CustomApprovalTab isWaiting={false} approvalData={rejectedData as any} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('failed scenario', () => {
    const rejectedData = { ...approvalData } as any
    rejectedData.status = 'FAILED'
    const { container } = render(
      <TestWrapper>
        <CustomApprovalTab isWaiting={false} approvalData={rejectedData as any} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('expired scenario', () => {
    const rejectedData = { ...approvalData } as any
    rejectedData.status = 'EXPIRED'
    const { container } = render(
      <TestWrapper>
        <CustomApprovalTab isWaiting={false} approvalData={rejectedData as any} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
