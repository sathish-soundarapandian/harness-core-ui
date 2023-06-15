/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ActivityList from '../ActivityList'
import connectivitySummary from '../../ActivityHistory/__tests__/mockData/connectivitySummary.json'
import activityData from '../../ActivityHistory/__tests__/mockData/activityData.json'

describe('Activity List', () => {
  test('render all activity', () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors/dmfjhkd" pathParams={{ accountId: 'dummy' }}>
        <ActivityList
          activityList={activityData as any}
          connectivitySummary={connectivitySummary as any}
          entityIdentifier="entityId"
          dateRange={['From' as unknown as Date, 'To' as unknown as Date]}
          refetchActivities={jest.fn()}
          refetchConnectivitySummary={jest.fn()}
          showConnectivityChecks={true}
          showOtherActivity={true}
        />
      </TestWrapper>
    )
    expect(getByText('activityHistory.connectivityCheck')).toBeDefined()
    expect(container).toMatchSnapshot()
  })
  test('render only connectivity check activity', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors/dmfjhkd" pathParams={{ accountId: 'dummy' }}>
        <ActivityList
          activityList={activityData as any}
          connectivitySummary={connectivitySummary as any}
          entityIdentifier="entityId"
          dateRange={['From' as unknown as Date, 'To' as unknown as Date]}
          refetchActivities={jest.fn()}
          refetchConnectivitySummary={jest.fn()}
          showConnectivityChecks={true}
          showOtherActivity={false}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
