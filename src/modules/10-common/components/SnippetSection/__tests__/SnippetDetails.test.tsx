/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, getByText, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import type { GetYamlSchemaQueryParams } from 'services/cd-ng'
import SnippetDetails from '../SnippetDetails'
import snippets from './mocks/snippets.json'

const props = {
  entityType: 'Connectors' as GetYamlSchemaQueryParams['entityType'],
  snippets: snippets?.data?.yamlSnippets,
  onSnippetCopy: jest.fn(),
  snippetYaml: ''
}

describe('Snippet Test', () => {
  test('Initial render should match snapshots', () => {
    const { container } = render(
      <TestWrapper>
        <SnippetDetails {...props} />
      </TestWrapper>
    )
    expect(getByText(container, `Snippets`)).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('Search a snippet', async () => {
    const { container } = render(
      <TestWrapper>
        <SnippetDetails {...props} />
      </TestWrapper>
    )
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="snippet-search"]')!, {
        target: { value: 'dummy name' }
      })
    })
    expect(getByText(container, 'No snippets found.')).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})
