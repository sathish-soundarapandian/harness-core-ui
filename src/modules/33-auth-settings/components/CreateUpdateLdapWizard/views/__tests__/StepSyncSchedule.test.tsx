/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { act, fireEvent, render } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import StepSyncSchedule from '../StepSyncSchedule'

const updateStepDataFn = jest.fn()
describe('Step Sync Schedule', () => {
  test('Test step with default props', async () => {
    const { getByTestId } = render(
      <TestWrapper pathParams={{ accountId: 'testAcc' }}>
        <StepSyncSchedule updateStepData={updateStepDataFn} />
      </TestWrapper>
    )
    expect(getByTestId('cron-expression')).not.toBeNull()
    expect(getByTestId('cron-expression').innerHTML).toEqual('0/15 * * * *')
    await act(async () => {
      fireEvent.click(getByTestId('submit-cron-expression-step'))
    })
    expect(updateStepDataFn).toBeCalled()
  })
})
