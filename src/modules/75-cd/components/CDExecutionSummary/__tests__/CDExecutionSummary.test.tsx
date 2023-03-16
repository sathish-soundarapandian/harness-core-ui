/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import type { ServiceExecutionSummary } from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'

import { CDExecutionSummary } from '../CDExecutionSummary'
import { EnvironmentsList } from '../EnvironmentsList'
import { ServicesList } from '../ServicesList'
import { ServicesTableProps, ServicesTable } from '../ServicesTable'
import props from './props.json'

const environmentProps = {
  environments: ['demo1', 'demo2', 'demo3'],
  className: 'demo'
}

const servicesTableProps: ServicesTableProps = {
  services: [
    {
      identifier: 'nginx',
      displayName: 'todolist',
      deploymentType: 'Kubernetes',
      artifacts: {
        sidecars: [1],
        primary: []
      }
    },
    {
      identifier: 'service1',
      displayName: 'service1',
      deploymentType: 'Kubernetes'
    },
    {
      identifier: 'nginx',
      displayName: 'todolist',
      deploymentType: 'Kubernetes',
      artifacts: {
        primary: []
      }
    }
  ] as ServiceExecutionSummary[]
}

describe('<CDExecutionSummary /> tests', () => {
  test('snapshot test', () => {
    const { container } = render(
      <TestWrapper>
        <CDExecutionSummary {...(props as any)} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('render environmentList', () => {
    const { container } = render(
      <TestWrapper>
        <EnvironmentsList {...environmentProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('render serviceTable', () => {
    const { container } = render(
      <TestWrapper>
        <ServicesTable services={servicesTableProps.services} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('render serviceList', () => {
    const { container } = render(
      <TestWrapper>
        <ServicesList services={servicesTableProps.services} limit={2} className={'demo'} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
