/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, findByText, fireEvent, render, waitFor } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import { BambooArtifact } from '../BambooArtifact'
import { bambooProps, getEditRunTimeValues, getEditValues, getInitialValues } from './helper'
import { mockArtifactPathsResponse, mockPlansResponse, mockBuildsResponse } from './mock'

const refetch = jest.fn()
jest.mock('services/cd-ng', () => ({
  useGetPlansKey: () => {
    return { data: mockPlansResponse, refetch, error: null, loading: false }
  },
  useGetArtifactPathsForBamboo: jest.fn().mockImplementation(() => {
    return { data: mockArtifactPathsResponse, refetch, error: null, loading: false }
  }),

  useGetBuildsForBamboo: jest.fn().mockImplementation(() => {
    return { data: mockBuildsResponse, refetch, error: null, loading: false }
  })
}))
describe('Bamboo Artifact tests', () => {
  test(`renders fine for the NEW artifact`, () => {
    const { container } = render(
      <TestWrapper>
        <BambooArtifact initialValues={getInitialValues()} {...bambooProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('renders fine on the edit mode with all fixed values', () => {
    const { container } = render(
      <TestWrapper>
        <BambooArtifact initialValues={getEditValues()} {...bambooProps} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('renders fine on the edit mode with runtime values', () => {
    const { container } = render(
      <TestWrapper>
        <BambooArtifact initialValues={getEditRunTimeValues()} {...bambooProps} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('onfocus of plankey field - makes successful api call', async () => {
    const { container } = render(
      <TestWrapper>
        <BambooArtifact initialValues={getInitialValues()} {...bambooProps} />
      </TestWrapper>
    )

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)
    const planDropdwnBn = container.querySelectorAll('[data-icon="chevron-down"]')[0]
    fireEvent.click(planDropdwnBn!)
    expect(portalDivs.length).toBe(1)
    const dropdownPortalDiv = portalDivs[0]
    const selectListMenu = dropdownPortalDiv.querySelector('.bp3-menu')
    const selectItem = await findByText(selectListMenu as HTMLElement, 'PFP-PT')
    act(() => {
      fireEvent.click(selectItem)
    })

    expect(container.querySelector('input[name="spec.planKey"]')).toHaveValue('PFP-PT')
  })

  test('onfocus of artifactPaths field - makes successful api call', async () => {
    const { container } = render(
      <TestWrapper>
        <BambooArtifact
          initialValues={{
            identifier: 'test-bamboo-artifact',
            spec: {
              planKey: 'PFP-PT',
              artifactPaths: '',
              build: ''
            },
            type: 'Bamboo'
          }}
          {...bambooProps}
        />
      </TestWrapper>
    )

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)
    const artifactPathsDropdwnBtn = container.querySelectorAll('[data-icon="chevron-down"]')[1]
    fireEvent.click(artifactPathsDropdwnBtn!)
    expect(portalDivs.length).toBe(1)
    const dropdownPortalDiv = portalDivs[0]
    const selectListMenu = dropdownPortalDiv.querySelector('.bp3-menu')
    const selectItem = await findByText(selectListMenu as HTMLElement, 'store/helloworld.war')
    act(() => {
      fireEvent.click(selectItem)
    })

    expect(container.querySelector('input[name="spec.artifactPaths"]')).toHaveValue('store/helloworld.war')
  })

  test('onfocus of builds field - makes successful api call', async () => {
    const { container } = render(
      <TestWrapper>
        <BambooArtifact
          initialValues={{
            identifier: 'test-bamboo-artifact',
            spec: {
              planKey: 'PFP-PT',
              artifactPaths: 'store/helloworld.war',
              build: ''
            },
            type: 'Bamboo'
          }}
          {...bambooProps}
        />
      </TestWrapper>
    )

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)
    const artifactPathsDropdwnBtn = container.querySelectorAll('[data-icon="chevron-down"]')[2]
    fireEvent.click(artifactPathsDropdwnBtn!)
    expect(portalDivs.length).toBe(1)
    const dropdownPortalDiv = portalDivs[0]
    const selectListMenu = dropdownPortalDiv.querySelector('.bp3-menu')
    const selectItem = await findByText(selectListMenu as HTMLElement, 'Build# 14')
    act(() => {
      fireEvent.click(selectItem)
    })

    expect(container.querySelector('input[name="spec.build"]')).toHaveValue('Build# 14')
  })

  test('onclick of form - should submit form succesfully', async () => {
    const { container } = render(
      <TestWrapper>
        <BambooArtifact
          initialValues={{
            identifier: 'test-bamboo-artifact',
            spec: {
              planKey: 'PFP-PT',
              artifactPaths: 'store/helloworld.war',
              build: '14'
            },
            type: 'Bamboo'
          }}
          {...bambooProps}
        />
      </TestWrapper>
    )

    const submitBtn = container.querySelector('button[type="submit"]')!
    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(bambooProps.handleSubmit).toBeCalled()
      expect(bambooProps.handleSubmit).toHaveBeenCalledWith({
        identifier: 'test-bamboo-artifact',
        spec: {
          artifactPaths: 'store/helloworld.war',
          build: '14',
          connectorRef: 'testConnector',
          planKey: 'PFP-PT'
        }
      })
    })
  })
})
