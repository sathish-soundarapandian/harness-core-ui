/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, waitFor, queryByAttribute } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import { useAddHarnessApprovalActivity } from 'services/pipeline-ng'
import { HarnessApprovalTab, HarnessApprovalTabProps } from '../HarnessApprovalTab'
import approvalData from './HarnessApprovalData.json'

jest.mock('@common/components/Duration/Duration', () => ({
  Duration() {
    return <div>MOCK DURATION</div>
  }
}))

jest.mock('moment', () => () => ({
  format: () => 'FORMATED_DATE',
  fromNow: () => 'SOME_TIME_AGO'
}))

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('services/pipeline-ng', () => ({
  useAddHarnessApprovalActivity: jest.fn(() => ({ mutate: jest.fn() }))
}))

describe('<HarnessApprovalTab /> tests', () => {
  const dateToString = jest.spyOn(Date.prototype, 'toLocaleString')

  beforeAll(() => {
    dateToString.mockImplementation(() => 'DUMMY DATE')
  })

  afterAll(() => {
    dateToString.mockRestore()
  })
  describe('Waiting Status', () => {
    const commonProps: HarnessApprovalTabProps = {
      isWaiting: true,
      approvalInstanceId: 'TEST_ID',
      approvalData: approvalData as any,
      updateState: jest.fn(),
      startTs: 1655277571886,
      endTs: 1655277693176,
      authData: null
    }

    beforeEach(() => {
      ;(commonProps.updateState as jest.Mock).mockClear()
    })

    test('shows form if user is authorized', async () => {
      const { container, findByText } = render(
        <TestWrapper>
          <HarnessApprovalTab {...commonProps} authData={{ data: { authorized: true } }} />
        </TestWrapper>
      )

      await findByText('common.approve', { selector: '.bp3-button-text > span' })

      expect(container).toMatchSnapshot()
    })

    test('does not shows form if user is authorized', async () => {
      const { container, getByText } = render(
        <TestWrapper>
          <HarnessApprovalTab {...commonProps} authData={{ data: { authorized: false } }} />
        </TestWrapper>
      )

      expect(() => getByText('common.approve', { selector: '.bp3-button-text > span' })).toThrowError()

      expect(container).toMatchSnapshot()
    })

    test('Approving works', async () => {
      const mutate = jest.fn()
      ;(useAddHarnessApprovalActivity as jest.Mock).mockImplementation(() => ({ mutate }))
      const { findByText, container } = render(
        <TestWrapper>
          <HarnessApprovalTab {...commonProps} authData={{ data: { authorized: true } }} />
        </TestWrapper>
      )

      const queryByName = (id: string): HTMLElement | null => queryByAttribute('name', container, id)

      const approve = await findByText('common.approve', { selector: '.bp3-button-text > span' })

      fireEvent.change(queryByName('approverInputs[0].value')!, { target: { value: 'value1' } })
      fireEvent.change(queryByName('approverInputs[1].value')!, { target: { value: 'value2' } })
      fireEvent.change(queryByName('comments')!, { target: { value: 'my comments' } })

      fireEvent.click(approve)

      await waitFor(() =>
        expect(mutate).toHaveBeenCalledWith({
          action: 'APPROVE',
          approverInputs: [
            { name: 'var1', value: 'value1' },
            { name: 'var2', value: 'value2' }
          ],
          comments: 'my comments'
        })
      )

      await waitFor(() => expect(commonProps.updateState).toHaveBeenCalled())
    })

    test('Rejecting works', async () => {
      const mutate = jest.fn()
      ;(useAddHarnessApprovalActivity as jest.Mock).mockImplementation(() => ({ mutate }))
      const { findByText, container } = render(
        <TestWrapper>
          <HarnessApprovalTab {...commonProps} authData={{ data: { authorized: true } }} />
        </TestWrapper>
      )

      const queryByName = (id: string): HTMLElement | null => queryByAttribute('name', container, id)

      const reject = await findByText('common.reject', { selector: '.bp3-button-text > span' })

      fireEvent.change(queryByName('approverInputs[0].value')!, { target: { value: 'value1' } })
      fireEvent.change(queryByName('approverInputs[1].value')!, { target: { value: 'value2' } })
      fireEvent.change(queryByName('comments')!, { target: { value: 'my comments' } })

      fireEvent.click(reject)

      await waitFor(() =>
        expect(mutate).toHaveBeenCalledWith({
          action: 'REJECT',
          approverInputs: [
            { name: 'var1', value: 'value1' },
            { name: 'var2', value: 'value2' }
          ],
          comments: 'my comments'
        })
      )
      await waitFor(() => expect(commonProps.updateState).toHaveBeenCalled())
    })
  })

  describe('Non-Waiting Status', () => {
    const commonProps: HarnessApprovalTabProps = {
      isWaiting: false,
      approvalInstanceId: 'TEST_ID',
      approvalData: approvalData as any,
      updateState: jest.fn(),
      authData: { data: { authorized: false } }
    }
    test('form is not shown', async () => {
      const { container, getByText } = render(
        <TestWrapper>
          <HarnessApprovalTab {...commonProps} />
        </TestWrapper>
      )

      expect(() => getByText('common.approve', { selector: '.bp3-button-text > span' })).toThrowError()

      expect(container).toMatchSnapshot()
    })
  })
})
