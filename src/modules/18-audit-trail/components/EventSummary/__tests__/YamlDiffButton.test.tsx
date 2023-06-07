/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, act, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import MonacoEditor from '@common/components/MonacoEditor/__mocks__/MonacoEditor'
import * as auditServices from 'services/audit'
import data from './mocks/useGetYamlDiff.json'
import YamlDiffButton from '../YamlDiffButton'

jest.mock('react-monaco-editor', () => ({
  MonacoDiffEditor: MonacoEditor
}))

jest.mock('@common/components/MonacoEditor/MonacoEditor', () => MonacoEditor)

describe('Event summary test', async () => {
  test('render', async () => {
    const renderObj = render(
      <TestWrapper>
        <YamlDiffButton accountIdentifier="px7xd_BFRCi-pfWPYXVjvw" auditId="6217745b7f53a424fd70e323" />
      </TestWrapper>
    )
    expect(renderObj.container).toMatchSnapshot()
  })

  test('click on yaml button', async () => {
    jest
      .spyOn(auditServices, 'useGetYamlDiff')
      .mockImplementation(() => ({ data, loading: false, refetch: jest.fn } as any))
    const renderObj = render(
      <TestWrapper>
        <YamlDiffButton accountIdentifier="px7xd_BFRCi-pfWPYXVjvw" auditId="6217745b7f53a424fd70e323" />
      </TestWrapper>
    )
    const yamlButton = renderObj.container.querySelector('.yamlButton')
    act(() => {
      fireEvent.click(yamlButton as Element)
    })
    const orgText = screen.queryByText('orgIdentifier: HOST')
    expect(orgText).toBeDefined()
    expect(yamlButton).toBeDefined()

    act(() => {
      fireEvent.click(yamlButton as Element)
    })

    const text = screen.queryByText('orgIdentifier: HOST')
    expect(text).toBeNull()
  })

  test('yaml not available', async () => {
    jest
      .spyOn(auditServices, 'useGetYamlDiff')
      .mockImplementation(() => ({ data, loading: false, refetch: jest.fn, error: true } as any))
    const renderObj = render(
      <TestWrapper>
        <YamlDiffButton accountIdentifier="px7xd_BFRCi-pfWPYXVjvw" auditId="6217745b7f53a424fd70e323" />
      </TestWrapper>
    )
    const yamlButton = renderObj.container.querySelector('.yamlButton')
    act(() => {
      fireEvent.click(yamlButton as Element)
    })

    const text = screen.queryByText('auditTrail.noYamlDifference')
    expect(text).toBeDefined()
  })

  test('yaml loading', async () => {
    jest
      .spyOn(auditServices, 'useGetYamlDiff')
      .mockImplementation(() => ({ data, loading: true, refetch: jest.fn, error: true } as any))
    const renderObj = render(
      <TestWrapper>
        <YamlDiffButton accountIdentifier="px7xd_BFRCi-pfWPYXVjvw" auditId="6217745b7f53a424fd70e323" />
      </TestWrapper>
    )
    const yamlButton = renderObj.container.querySelector('.yamlButton')
    act(() => {
      fireEvent.click(yamlButton as Element)
    })

    const text = screen.queryByText('Loading, please wait...')
    expect(text).toBeDefined()
  })
})
