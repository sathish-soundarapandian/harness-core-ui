/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { CIExecutionSummary } from '../CIExecutionSummary'
import {
  prData,
  successNodeMapValue,
  failedToInitializeData,
  failedToInitializeNodeMapValue,
  branchData
} from './CIExecutionSummaryMockResponses'

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (str: string) => str
  })
}))

describe('CIExecutionSummary tests', () => {
  test('Shows Successful summary', () => {
    const nodeMap = new Map()
    nodeMap.set('B_0CPXOkTDqp48_5HveraQ', successNodeMapValue)
    const { container } = render(<CIExecutionSummary data={prData} nodeMap={nodeMap} />)
    expect(container).toMatchSnapshot()
  })

  test('Shows Fails to Initialize Step - no commits', () => {
    const nodeMap = new Map()
    nodeMap.set('i29zaDnZS7S5vJJnxTnsaQ', failedToInitializeNodeMapValue)
    const { container } = render(<CIExecutionSummary data={failedToInitializeData} nodeMap={nodeMap} />)
    expect(container).toMatchSnapshot()
  })

  test('Renders ok for branch execution', () => {
    const nodeMap = new Map()
    nodeMap.set('B_0CPXOkTDqp48_5HveraQ', successNodeMapValue)
    const { getByText } = render(<CIExecutionSummary data={branchData} nodeMap={nodeMap} />)
    expect(getByText('ti-ui')).toBeInTheDocument()
    expect(getByText('main')).toBeInTheDocument()
    expect(getByText('f79d568')).toBeInTheDocument()
    expect(getByText('rebase')).toBeInTheDocument()
  })
})
