/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik } from 'formik'
import { noop } from 'lodash-es'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvServices from 'services/cv'
import PagerDutyChangeSource from '../PagerDutyChangeSource'
import type { UpdatedChangeSourceDTO } from '../../../ChangeSourceDrawer.types'

jest.mock('services/cd-ng', () => ({
  ...jest.requireActual('services/cd-ng'),
  useGetConnectorList: () => {
    return {
      data: {},
      refetch: jest.fn()
    }
  },
  useGetConnector: () => {
    return {
      data: {},
      refetch: jest.fn()
    }
  }
}))

interface InitValue {
  isEdit?: boolean
  spec: {
    connectorRef?: string
    pagerDutyServiceId?: string
  }
}

const TestComponent = ({ initialValues }: { initialValues: InitValue }): React.ReactElement => (
  <TestWrapper>
    <Formik<UpdatedChangeSourceDTO> initialValues={{ spec: initialValues.spec }} onSubmit={noop}>
      {formik => {
        return <PagerDutyChangeSource formik={formik} isEdit={initialValues.isEdit} />
      }}
    </Formik>
  </TestWrapper>
)

describe('Test PagerDuty Change Source', () => {
  test('PagerDuty ChangeSource shows empty service message', async () => {
    jest.spyOn(cvServices, 'useGetServicesFromPagerDuty').mockImplementation(
      () =>
        ({
          loading: false,
          error: null,
          data: {},
          refetch: jest.fn()
        } as any)
    )
    const { container, getByText } = render(
      <TestComponent
        initialValues={{
          isEdit: true,
          spec: {
            pagerDutyServiceId: '',
            connectorRef: 'PagerDutyConnector'
          }
        }}
      />
    )

    fireEvent.click(container.querySelector(`.bp3-input-action [data-icon="chevron-down"]`)!)
    const menuItemLabels = container.querySelectorAll('[class*="menuItemLabel"]')
    expect(menuItemLabels.length).toEqual(0)

    await waitFor(() => expect(getByText('cv.changeSource.PageDuty.pagerDutyService')).toBeTruthy())
    await waitFor(() => expect(getByText('cv.changeSource.PageDuty.pagerDutyEmptyService')).toBeTruthy())
    expect(container.querySelector('input[name="spec.pagerDutyServiceId"]')).toBeDefined()
  })

  test('PagerDuty ChangeSource renders in edit mode', async () => {
    const refetch = jest.fn()

    jest.spyOn(cvServices, 'useGetServicesFromPagerDuty').mockImplementation(
      () =>
        ({
          loading: false,
          error: null,
          data: {
            metaData: {},
            resource: [
              { id: 'P9DDPEV', name: 'cvng' },
              { id: 'PU7R5AE', name: 'Sowmya' }
            ],
            responseMessages: []
          },
          refetch
        } as any)
    )
    const { container } = render(
      <TestComponent
        initialValues={{
          isEdit: true,
          spec: {
            pagerDutyServiceId: 'P9DDPEV',
            connectorRef: 'PagerDutyConnector'
          }
        }}
      />
    )

    await waitFor(() => expect(refetch).toHaveBeenCalled())
    await waitFor(() => expect(container.querySelector('input[value="cvng"]')).toBeTruthy())
    await waitFor(() => expect(container.querySelector('.connectorField .bp3-disabled')).toBeDisabled())
  })

  test('PagerDuty ChangeSource verify service count', async () => {
    const refetch = jest.fn()

    jest.spyOn(cvServices, 'useGetServicesFromPagerDuty').mockImplementation(
      () =>
        ({
          loading: false,
          error: null,
          data: {
            metaData: {},
            resource: [
              { id: 'P9DDPEV', name: 'cvng' },
              { id: 'PU7R5AE', name: 'Sowmya' }
            ],
            responseMessages: []
          },
          refetch
        } as any)
    )
    const { container } = render(
      <TestComponent
        initialValues={{
          isEdit: false,
          spec: {
            connectorRef: 'PagerDutyConnector'
          }
        }}
      />
    )

    // renders both service value in dropdown
    act(() => {
      fireEvent.click(container.querySelector(`.bp3-input-action [data-icon="chevron-down"]`)!)
    })
    const menuItemLabels = container.querySelectorAll('[class*="menuItemLabel"]')
    await waitFor(() => expect(menuItemLabels.length).toEqual(2))
    await waitFor(() => expect(menuItemLabels[0].innerHTML).toEqual('cvng'))
    await waitFor(() => expect(menuItemLabels[1].innerHTML).toEqual('Sowmya'))
  })
})
