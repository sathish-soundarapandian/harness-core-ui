/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'urql'
import { fromValue } from 'wonka'
import { TestWrapper } from '@common/utils/testUtils'
import * as ceServices from 'services/ce'
import LevelUpBanner from '@common/components/FeatureWarning/LevelUpBanner'
import BIDashboard, { BIDashboardData } from '../BIDashboard'
import DashboardData from './BIDashboardData.json'

const params = {
  accountId: 'TEST_ACC'
}

jest.mock('services/ce', () => ({
  useListBIDashboards: jest.fn().mockImplementation(() => {
    return {
      data: DashboardData,
      refetch: jest.fn(),
      loading: false
    }
  })
}))

describe('Test cases for BI Dashboard page', () => {
  test('Should render the list of dashboard', () => {
    const responseState = {
      executeQuery: () => {
        return fromValue({})
      }
    }
    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <BIDashboard />
        </Provider>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('Should render dashboard data in case of enterprise edition', () => {
    const isEnterpriseEdition = true
    const responseState = {
      executeQuery: () => {
        return fromValue({})
      }
    }
    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>{isEnterpriseEdition && <BIDashboardData />}</Provider>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('Should render banner data in case of free edition', () => {
    const isEnterpriseEdition = false
    const responseState = {
      executeQuery: () => {
        return fromValue({})
      }
    }
    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          {!isEnterpriseEdition && <LevelUpBanner message={'dashboards.upgrade'} />}
        </Provider>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('Should render connector screen in case of no data', () => {
    jest.spyOn(ceServices, 'useListBIDashboards').mockImplementation(() => ({ data: [], loading: false } as any))
    const responseState = {
      executeQuery: () => {
        return fromValue({})
      }
    }
    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <BIDashboard />
        </Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    expect('You have not added any connectors yet.').toBeDefined()
  })
})
