/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import { CDStageDetails } from '../CDStageDetails'
import props from './props.json'
import propsWithGitOpsApps from './propsWithGitOpsApps.json'
import propsWithClusters from './props_gitops.json'

describe('<CDStageDetails /> tests', () => {
  test('snapshot test', () => {
    render(
      <TestWrapper>
        <CDStageDetails {...(props as any)} />
      </TestWrapper>
    )

    expect(screen.getByText('serviceOrServices')).toBeInTheDocument()
    expect(screen.getByText('environmentOrEnvironments')).toBeInTheDocument()
    expect(screen.getByText('infrastructureText')).toBeInTheDocument()
  })
  test('test gitops apps', () => {
    const { container } = render(
      <TestWrapper>
        <CDStageDetails {...(propsWithGitOpsApps as any)} />
      </TestWrapper>
    )

    const gitOpsAppsNode = container.querySelector('[data-test-id="GitopsApplications"]')
    expect(gitOpsAppsNode).toMatchSnapshot()
  })

  test('test gitops with environments and clusters', () => {
    render(
      <TestWrapper>
        <CDStageDetails {...(propsWithClusters as any)} />
      </TestWrapper>
    )
    expect(screen.getByText('serviceOrServices')).toBeInTheDocument()
    expect(screen.getByText('environmentOrEnvironments')).toBeInTheDocument()
    expect(screen.getByText('common.clusters')).toBeInTheDocument()
  })
})
