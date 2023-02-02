/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { getDowntimeInitialFormData } from '@cv/pages/slos/components/CVCreateDowntime/CVCreateDowntime.utils'
import {
  oneTimeDurationBasedDowntimeResponse,
  oneTimeEndTimeBasedDowntimeResponse,
  recurrenceBasedDowntimeResponse
} from '@cv/pages/slos/components/CVCreateDowntime/__tests__/CVCreateDowntime.mock'
import { CreateDowntimeSteps } from '../../../CreateDowntimeForm.types'
import { CreateDowntimePreview } from '../CreateDowntimePreview'

describe('CreateDowntimePreview', () => {
  test('should render CreateDowntimePreview with empty value', async () => {
    const { container } = render(
      <TestWrapper>
        <CreateDowntimePreview id={'' as any} data={{} as any} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('should render CreateDowntimePreview with correct one time end time based downtime values', async () => {
    const { container, rerender } = render(
      <TestWrapper>
        <CreateDowntimePreview
          id={CreateDowntimeSteps.DEFINE_DOWNTIME}
          data={getDowntimeInitialFormData(oneTimeEndTimeBasedDowntimeResponse.resource.downtime as any)}
        />
      </TestWrapper>
    )
    rerender(
      <TestWrapper>
        <CreateDowntimePreview
          id={CreateDowntimeSteps.SELECT_DOWNTIME_WINDOW}
          data={getDowntimeInitialFormData(oneTimeEndTimeBasedDowntimeResponse.resource.downtime as any)}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render CreateDowntimePreview with correct one time duration based downtime values', async () => {
    const { container, rerender } = render(
      <TestWrapper>
        <CreateDowntimePreview
          id={CreateDowntimeSteps.DEFINE_DOWNTIME}
          data={getDowntimeInitialFormData(oneTimeDurationBasedDowntimeResponse.resource.downtime as any)}
        />
      </TestWrapper>
    )
    rerender(
      <TestWrapper>
        <CreateDowntimePreview
          id={CreateDowntimeSteps.SELECT_DOWNTIME_WINDOW}
          data={getDowntimeInitialFormData(oneTimeDurationBasedDowntimeResponse.resource.downtime as any)}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render CreateDowntimePreview with correct recurring downtime values', async () => {
    const { container, rerender } = render(
      <TestWrapper>
        <CreateDowntimePreview
          id={CreateDowntimeSteps.DEFINE_DOWNTIME}
          data={getDowntimeInitialFormData(recurrenceBasedDowntimeResponse.resource.downtime as any)}
        />
      </TestWrapper>
    )
    rerender(
      <TestWrapper>
        <CreateDowntimePreview
          id={CreateDowntimeSteps.SELECT_DOWNTIME_WINDOW}
          data={getDowntimeInitialFormData(recurrenceBasedDowntimeResponse.resource.downtime as any)}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
