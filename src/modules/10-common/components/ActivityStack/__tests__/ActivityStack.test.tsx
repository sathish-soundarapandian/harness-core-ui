/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text } from '@harness/uicore'
import { render } from '@testing-library/react'
import ActivityStack from '../ActivityStack'
import { activityData } from './ActivityMock'

describe('Activity Stack test', () => {
  test('initializes ok ', async () => {
    const { container } = render(
      <ActivityStack
        items={activityData}
        tooltip={item => (
          <Layout.Vertical padding="medium">
            <Text>{item.activity}</Text>
            <Text>{item.updatedBy}</Text>
          </Layout.Vertical>
        )}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
