/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { DashboardSelected, ServiceExecutionsCard, ServiceExecutionsCardProps } from '../ServiceExecutionsCard'

const props: ServiceExecutionsCardProps = {
  envIdentifiers: [
    {
      envId: 'testEnvInfra',
      envName: 'testEnvInfra',
      envType: 'PreProduction',
      infrastructureDetails: [
        {
          infrastructureIdentifier: 'testEnvInfra',
          infrastructureName: 'testEnvInfra'
        }
      ]
    },
    {
      envId: 'env09',
      envName: 'env09',
      envType: 'PreProduction',
      infrastructureDetails: [
        {
          infrastructureIdentifier: 'realllyverybignameforinfraheretotesttheUistrengthgoodornot',
          infrastructureName: 'realllyverybignameforinfraheretotesttheUistrengthgoodornot'
        },
        {
          infrastructureIdentifier: 'infra09',
          infrastructureName: 'infra09'
        },
        {
          infrastructureIdentifier: 'infra09',
          infrastructureName: 'infra09'
        },
        {
          infrastructureIdentifier: 'infra03',
          infrastructureName: 'infra09'
        }
      ]
    },
    {
      envId: 'testEnvInfra3',
      envName: 'testEnvInfra3',
      envType: 'PreProduction',
      infrastructureDetails: [
        {
          infrastructureIdentifier: 'testEnvInfra3',
          infrastructureName: 'testEnvInfra3'
        },
        {
          infrastructureIdentifier: 'testEnvInfra31',
          infrastructureName: 'testEnvInfra3'
        },
        {
          infrastructureIdentifier: 'testEnvInfra32',
          infrastructureName: 'testEnvInfra3'
        }
      ]
    }
  ],
  serviceIdentifiers: [
    {
      image: 'imageCustom',
      serviceName: 'serviceName',
      serviceTag: 'tag1'
    },
    {
      image: 'imageCustom2',
      serviceName: 'serviceName2',
      serviceTag: 'tag2'
    },
    {
      image: 'imageCustom3',
      serviceName: 'serviceName3',
      serviceTag: 'tag3'
    },
    {
      image: 'imageCustom4',
      serviceName: 'serviceName4',
      serviceTag: 'tag4'
    }
  ],
  caller: DashboardSelected.SERVICEDETAIL
}

describe('ServiceExecutionsCard ', () => {
  test('initial render', async () => {
    const { container } = render(
      <TestWrapper>
        <ServiceExecutionsCard {...props} />
      </TestWrapper>
    )
    await waitFor(() => expect(container).toMatchSnapshot())
  })
  test('render when called from overview dashboard', () => {
    props.caller = DashboardSelected.OVERVIEW
    props.envIdentifiers?.push({
      envId: 'testEnvInfra1',
      envName: 'testEnvInfra1',
      envType: 'PreProduction',
      infrastructureDetails: [
        {
          infrastructureIdentifier: 'testEnvInfra1',
          infrastructureName: 'testEnvInfra1'
        }
      ]
    })
    const { container } = render(
      <TestWrapper>
        <ServiceExecutionsCard {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('empty state', () => {
    props.envIdentifiers = []
    props.serviceIdentifiers = []
    const { container } = render(
      <TestWrapper>
        <ServiceExecutionsCard {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
