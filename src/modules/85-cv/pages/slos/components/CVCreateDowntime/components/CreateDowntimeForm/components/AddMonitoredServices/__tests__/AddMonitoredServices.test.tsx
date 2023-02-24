/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, act } from '@testing-library/react'
import { Formik } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { EntitiesRuleType } from '@cv/pages/slos/components/CVCreateDowntime/CVCreateDowntime.types'
import AddMonitoredServices from '../AddMonitoredServices'
import { msList } from '../components/__tests__/MSList.mock'

jest.mock(
  '@cv/pages/slos/components/CVCreateDowntime/components/CreateDowntimeForm/components/AddMonitoredServices/components/MSList.tsx',
  () => ({
    __esModule: true,
    default: function MSList() {
      return <div data-testid="MS-List" />
    }
  })
)

describe('AddMonitoredServices', () => {
  test('should render error page', async () => {
    const { getByText } = render(
      <TestWrapper>
        <Formik initialValues={{ msList: [] }} onSubmit={jest.fn()} formName={'addMSForm'}>
          {() => (
            <AddMonitoredServices
              isCreateFlow={true}
              refetchMsList={jest.fn()}
              msListLoading={false}
              msListError={{
                message: '',
                data: { message: 'Oops, something went wrong on our end. Please contact Harness Support.' }
              }}
            />
          )}
        </Formik>
      </TestWrapper>
    )

    expect(getByText('Oops, something went wrong on our end. Please contact Harness Support.')).toBeInTheDocument()
    expect(getByText('Retry')).toBeInTheDocument()

    act(() => {
      fireEvent.click(getByText('Retry'))
    })
  })

  test('should render all the selected monitored services', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <Formik
          initialValues={{ msList, entitiesRuleType: EntitiesRuleType.IDENTIFIERS }}
          onSubmit={jest.fn()}
          formName={'addMSForm'}
        >
          {() => <AddMonitoredServices msListLoading={false} refetchMsList={jest.fn()} isCreateFlow={true} />}
        </Formik>
      </TestWrapper>
    )

    expect(getByText('cv.sloDowntime.msList')).toBeInTheDocument()
    expect(container.querySelector('[id="newone_datadog"]')).toBeInTheDocument()
    expect(getByText('cv.sloDowntime.selectMonitoredServices')).toBeInTheDocument()

    act(() => {
      fireEvent.click(container.getElementsByClassName('bp3-icon-small-cross')[0])
    })

    act(() => {
      fireEvent.click(getByText('cv.sloDowntime.selectMonitoredServices'))
    })
  })
})
