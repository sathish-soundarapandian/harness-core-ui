/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import * as cdNg from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import TestConnection from '@connectors/components/CreateConnector/PdcConnector/StepDetails/TestConnection'

const onCloseFn = jest.fn()
const gotoStep = jest.fn()
const previousStep = jest.fn()
const mockAccountId = 'accountId1'

const prevStepData = {
  identifier: '',
  name: 'testConnection',
  isStep: true,
  isLastStep: false,
  type: 'pdcTest',
  previousStep,
  stepIndex: 1,
  sshKeyRef: 'sshKey1',
  hosts: 'localhost'
}

jest.mock('services/cd-ng', () => ({
  useGetTestConnectionResult: jest.fn().mockImplementation(({ queryParams, identifier }) => ({
    mutate: jest.fn().mockImplementation(
      () =>
        new Promise((resolve, reject) => {
          identifier === ''
            ? reject({ data: { responseMessages: [] } })
            : resolve(
                queryParams?.accountId === mockAccountId
                  ? {
                      data: {
                        status: 'SUCCESS'
                      }
                    }
                  : {
                      data: {
                        errors: [
                          {
                            reason: 'Failed',
                            message: 'Error connectiong'
                          }
                        ]
                      }
                    }
              )
        })
    )
  }))
}))

describe('Test TestConnection component', () => {
  test('Render component with api error', async () => {
    const { container, queryAllByText } = render(
      <TestWrapper path="/test" pathParams={{ accountId: 'test1' }}>
        <TestConnection
          onClose={onCloseFn}
          gotoStep={gotoStep}
          prevStepData={{ ...prevStepData, identifier: 'identifier1' }}
        />
      </TestWrapper>
    )

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    const editHostsBtn = queryAllByText('connectors.pdc.editHosts')[0]
    fireEvent.click(editHostsBtn!)

    expect(gotoStep).toBeCalled()
  })
  test('Render component with api pass ok', async () => {
    jest.spyOn(cdNg, 'useGetTestConnectionResult').mockImplementationOnce(
      () =>
        ({
          mutate: jest.fn(
            () =>
              new Promise(resolve =>
                resolve({
                  data: {
                    status: 'SUCCESS'
                  }
                })
              )
          )
        } as any)
    )
    const { container } = render(
      <TestWrapper path={routes.toProjects({ accountId: mockAccountId })} pathParams={{ accountId: mockAccountId }}>
        <TestConnection
          onClose={onCloseFn}
          gotoStep={gotoStep}
          prevStepData={{ ...prevStepData, identifier: 'identifier2' }}
        />
      </TestWrapper>
    )

    expect(container.innerHTML).toContain('finish')

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    expect(onCloseFn).toBeCalled()
  })
  test('Render component, throw error on testconnection', async () => {
    jest.spyOn(cdNg, 'useGetTestConnectionResult').mockImplementationOnce(
      () =>
        ({
          mutate: jest.fn(
            () =>
              new Promise((_resolve, reject) =>
                reject({
                  data: {
                    responseMessages: []
                  }
                })
              )
          )
        } as any)
    )
    const { container } = render(
      <TestWrapper path={routes.toProjects({ accountId: mockAccountId })} pathParams={{ accountId: mockAccountId }}>
        <TestConnection onClose={onCloseFn} gotoStep={gotoStep} prevStepData={prevStepData} />
      </TestWrapper>
    )

    expect(container.innerHTML).toContain('finish')

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    expect(onCloseFn).toBeCalled()
  })
})
