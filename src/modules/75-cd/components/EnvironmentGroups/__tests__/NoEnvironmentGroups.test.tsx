/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { modulePathProps, projectPathProps } from '@common/utils/routeUtils'

import NoEnvironmentGroups from '../NoEnvironmentGroups'

const defaultProps = {
  searchTerm: '',
  hasFilters: false,
  clearFilters: jest.fn(),
  showModal: jest.fn()
}

describe('No Environment Groups', () => {
  test('no environment groups exist', () => {
    render(
      <TestWrapper
        path={routes.toEnvironmentGroups({ ...projectPathProps, ...modulePathProps })}
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy', module: 'cd' }}
      >
        <NoEnvironmentGroups {...defaultProps} />
      </TestWrapper>
    )
    expect(screen.queryByText('common.environmentGroup.createNew')).toBeInTheDocument()
  })

  test('search returns empty result', () => {
    render(
      <TestWrapper
        path={routes.toEnvironmentGroups({ ...projectPathProps, ...modulePathProps })}
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy', module: 'cd' }}
      >
        <NoEnvironmentGroups {...defaultProps} searchTerm={'test'} />
      </TestWrapper>
    )

    expect(screen.queryByText('common.searchOther')).toBeInTheDocument()
  })

  test('filter returns empty result', async () => {
    render(
      <TestWrapper
        path={routes.toEnvironmentGroups({ ...projectPathProps, ...modulePathProps })}
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy', module: 'cd' }}
      >
        <NoEnvironmentGroups {...defaultProps} hasFilters={true} />
      </TestWrapper>
    )

    await expect(screen.queryByText('common.filters.clearFilters')).toBeInTheDocument()
  })
})
