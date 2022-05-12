/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import type { Budget } from 'services/ce'
import { TestWrapper } from '@common/utils/testUtils'
import ConfigureAlerts from '../CreateBudgetSteps/ConfigureAlerts'

import MockBudget from './PerspectiveBudgetsResponse.json'

const params = {
  accountId: 'TEST_ACC'
}

describe('Test Cases For ConfigureAlerts', () => {
  test('Should be able to render ConfigureAlerts', () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <ConfigureAlerts
          isEditMode={true}
          viewId="mock_id"
          name="mock_name"
          accountId="mock_account_id"
          budget={MockBudget.data[0] as Budget}
          onSuccess={jest.fn()}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
