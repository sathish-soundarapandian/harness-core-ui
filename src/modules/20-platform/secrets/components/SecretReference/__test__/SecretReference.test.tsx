/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, getByText, queryByAttribute, waitFor } from '@testing-library/react'
import { noop } from 'lodash-es'

import { TestWrapper } from '@common/utils/testUtils'
import SecretReference from '../SecretReference'
import mockData from './listSecretsMock.json'

describe('Secret Reference', () => {
  test('render with secret type text', async () => {
    const { container } = render(
      <TestWrapper>
        <SecretReference type="SecretText" accountIdentifier="dummy" mock={mockData as any} onSelect={noop} />
      </TestWrapper>
    )
    await waitFor(() => getByText(container, 'entityReference.apply'))
    expect(getByText(container, 'account')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })

  test('render with secret type file', async () => {
    const { container } = render(
      <TestWrapper>
        <SecretReference type="SecretFile" accountIdentifier="dummy" mock={mockData as any} onSelect={noop} />
      </TestWrapper>
    )
    await waitFor(() => getByText(container, 'entityReference.apply'))
    expect(getByText(container, 'account')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })

  test('render with no secret type', async () => {
    const { container } = render(
      <TestWrapper>
        <SecretReference accountIdentifier="dummy" mock={mockData as any} onSelect={noop} />
      </TestWrapper>
    )
    await waitFor(() => getByText(container, 'entityReference.apply'))
    expect(getByText(container, 'account')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })
  test('render with spinner', async () => {
    const { container } = render(
      <TestWrapper>
        <SecretReference accountIdentifier="dummy" mock={mockData as any} onSelect={noop} />
      </TestWrapper>
    )
    expect(getByText(container, 'account')).toBeTruthy()
    expect(queryByAttribute('data-icon', container, /spinner/)).toBeTruthy()
    expect(container).toMatchSnapshot()
  })
  test('render with no data', async () => {
    mockData.data.empty = true
    mockData.data.content = []
    const { container } = render(
      <TestWrapper>
        <SecretReference accountIdentifier="dummy" mock={mockData as any} onSelect={noop} />
      </TestWrapper>
    )
    await waitFor(() => getByText(container, 'entityReference.apply'))
    expect(getByText(container, 'secrets.secret.noSecretsFound')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })
})
