/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import executionMetadata from '@pipeline/components/execution/StepDetails/common/ExecutionContent/PolicyEvaluationContent/__mocks__/executionMetadata.json'
import { JiraApprovalTab } from '../JiraApprovalTab'
import approvalData from './JiraAprovalData.json'

jest.mock('@common/components/Duration/Duration', () => ({
  Duration() {
    return <div>MOCK DURATION</div>
  }
}))

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('<JiraApprovalTab/> tests', () => {
  test('isWaiting test', () => {
    const { container } = render(
      <TestWrapper>
        <JiraApprovalTab isWaiting={true} approvalData={approvalData as any} executionMetadata={executionMetadata} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('not isWaiting test', () => {
    const { container } = render(
      <TestWrapper>
        <JiraApprovalTab isWaiting={false} approvalData={approvalData as any} executionMetadata={executionMetadata} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('not isWaiting test - rejected', () => {
    const rejectedData = { ...approvalData } as any
    rejectedData.status = 'REJECTED'
    const { container } = render(
      <TestWrapper>
        <JiraApprovalTab isWaiting={false} approvalData={rejectedData as any} executionMetadata={executionMetadata} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
