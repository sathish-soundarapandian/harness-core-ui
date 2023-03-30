/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { HarnessEnvironmentAsFormField, HarnessServiceAsFormField } from '../HarnessServiceAndEnvironment'
import { getQueryParams, getScopedServiceEnvironmentOption } from '../HarnessServiceAndEnvironment.utils'

describe('Validate HarnessEnvironmentAsFormField', () => {
  test('should render HarnessEnvironmentAsFormField ', () => {
    const customRenderProps = { name: 'environmentRef', label: 'environmentLabel' }
    const environmentProps = { onSelect: jest.fn(), options: [], onNewCreated: jest.fn() }
    const { container, getByText, getByTestId, rerender } = render(
      <TestWrapper>
        <HarnessEnvironmentAsFormField customRenderProps={customRenderProps} environmentProps={environmentProps} />
      </TestWrapper>
    )
    expect(getByText('environmentLabel')).toBeInTheDocument()
    expect(container.querySelector('[name="environment"]')).toBeInTheDocument()

    rerender(
      <TestWrapper>
        <HarnessEnvironmentAsFormField
          customRenderProps={customRenderProps}
          environmentProps={environmentProps}
          isMultiSelectField
        />
      </TestWrapper>
    )
    expect(getByTestId('sourceFilter')).toBeInTheDocument()
  })
})

describe('Validate HarnessServiceAsFormField', () => {
  test('should render HarnessServiceAsFormField ', () => {
    const customRenderProps = { name: 'serviceRef', label: 'serviceLabel' }
    const serviceProps = { onSelect: jest.fn(), options: [], onNewCreated: jest.fn() }
    const { container, getByText, getByTestId, rerender } = render(
      <TestWrapper>
        <HarnessServiceAsFormField customRenderProps={customRenderProps} serviceProps={serviceProps} />
      </TestWrapper>
    )
    expect(getByText('serviceLabel')).toBeInTheDocument()
    expect(container.querySelector('[name="service"]')).toBeInTheDocument()

    rerender(
      <TestWrapper>
        <HarnessServiceAsFormField
          isMultiSelectField
          serviceProps={serviceProps}
          customRenderProps={customRenderProps}
        />
      </TestWrapper>
    )
    expect(getByTestId('multiSelectService')).toBeInTheDocument()
  })
})

describe('Validate GetScopedServiceEnvironmentOption', () => {
  test('returns empty array if content is empty', () => {
    const options = getScopedServiceEnvironmentOption({ content: [] })
    expect(options).toEqual([])
  })

  test('returns array of SelectOption objects if content is not empty', () => {
    const content = [
      { identifier: 'id1', name: 'Option 1' },
      { identifier: 'id2', name: 'Option 2' }
    ]
    const options = getScopedServiceEnvironmentOption({ content })

    expect(options).toHaveLength(2)
    expect(options[0]).toEqual({ label: content[0].name, value: content[0].identifier })
    expect(options[1]).toEqual({ label: content[1].name, value: content[1].identifier })
  })

  test('returns array of SelectOption objects with scoped identifiers', () => {
    const content = [
      { identifier: 'id1', name: 'Option 1', accountId: 'scope1' },
      { identifier: 'id2', name: 'Option 2', orgIdentifier: 'scope2' },
      { identifier: 'id3', name: 'Option 3', projectIdentifier: 'scope3' }
    ]
    const scopedIdentifiers = true
    const options = getScopedServiceEnvironmentOption({ content, scopedIdentifiers })

    expect(options).toHaveLength(3)
    expect(options[0]).toEqual({ label: content[0].name, value: `account.${content[0].identifier}` })
    expect(options[1]).toEqual({ label: content[1].name, value: `org.${content[1].identifier}` })
    expect(options[2]).toEqual({ label: content[2].name, value: `${content[2].identifier}` })
  })
})

describe('Validate GetQueryParams', () => {
  test('With includeAccountAndOrgLevel as false', () => {
    const queryParam = {
      accountId: 'accountId',
      orgIdentifier: 'orgIdentifier',
      projectIdentifier: 'projectIdentifier'
    }
    expect(getQueryParams({ params: queryParam })).toEqual(queryParam)
    expect(getQueryParams({ params: queryParam, includeAccountAndOrgLevel: true })).toEqual({
      accountId: queryParam.accountId
    })
  })
})
