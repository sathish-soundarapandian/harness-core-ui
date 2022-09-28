/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik } from 'formik'

import { MultiTypeInputType } from '@harness/uicore'
import * as cdNgServices from 'services/cd-ng'

import routes from '@common/RouteDefinitions'
import { pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'

import DeployInfrastructures from '../DeployInfrastructures'

import mockInfrastructures from './__mocks__/mockInfrastructures.json'
import mockInfrastructureInputs from './__mocks__/mockInfrastructureInputs.json'

const showError = jest.fn()

jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  useToaster: () => ({
    showError
  })
}))

describe('Deploy infrastructures test', () => {
  test('renders the select and updates selection', async () => {
    jest.spyOn(cdNgServices, 'useGetInfrastructureList').mockReturnValue({
      data: mockInfrastructures,
      loading: false
    } as any)

    jest.spyOn(cdNgServices, 'useGetInfrastructureInputs').mockReturnValue({
      data: mockInfrastructureInputs,
      loading: false,
      refetch: jest.fn()
    } as any)

    render(
      <TestWrapper
        path={routes.toPipelineStudio({ ...pipelinePathProps, ...pipelineModuleParams })}
        pathParams={{
          accountId: 'dummy',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy',
          module: 'cd',
          pipelineIdentifier: 'dummy'
        }}
      >
        <Formik
          initialValues={{
            environment: {
              environmentRef: 'dummy'
            }
          }}
          onSubmit={jest.fn()}
        >
          <DeployInfrastructures
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
            initialValues={{
              infrastructureRef: ''
            }}
          />
        </Formik>
      </TestWrapper>
    )

    userEvent.click(screen.getByRole('textbox'))

    await waitFor(() => {
      expect(screen.getByText('infra1')).toBeInTheDocument()
    })

    userEvent.click(screen.getByText('infra1'))
    expect(screen.getByRole('textbox')).toHaveValue('infra1')
  })

  test('renders initial value', async () => {
    jest.spyOn(cdNgServices, 'useGetInfrastructureList').mockReturnValue({
      data: mockInfrastructures,
      loading: false
    } as any)

    jest.spyOn(cdNgServices, 'useGetInfrastructureInputs').mockReturnValue({
      data: mockInfrastructureInputs,
      loading: false,
      refetch: jest.fn()
    } as any)

    render(
      <TestWrapper
        path={routes.toPipelineStudio({ ...pipelinePathProps, ...pipelineModuleParams })}
        pathParams={{
          accountId: 'dummy',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy',
          module: 'cd',
          pipelineIdentifier: 'dummy'
        }}
      >
        <Formik
          initialValues={{
            environment: {
              environmentRef: 'dummy'
            }
          }}
          onSubmit={jest.fn()}
        >
          <DeployInfrastructures
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
            initialValues={{
              infrastructureRef: 'infra1'
            }}
          />
        </Formik>
      </TestWrapper>
    )

    await waitFor(() => expect(screen.getByRole('textbox')).toHaveValue('infra1'))
  })

  test('loading infrastructures', async () => {
    jest.spyOn(cdNgServices, 'useGetInfrastructureList').mockReturnValue({
      data: [],
      loading: true
    } as any)

    render(
      <TestWrapper
        path={routes.toPipelineStudio({ ...pipelinePathProps, ...pipelineModuleParams })}
        pathParams={{
          accountId: 'dummy',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy',
          module: 'cd',
          pipelineIdentifier: 'dummy'
        }}
      >
        <Formik
          initialValues={{
            environment: {
              environmentRef: 'dummy'
            }
          }}
          onSubmit={jest.fn()}
        >
          <DeployInfrastructures
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
            initialValues={{
              infrastructureRef: ''
            }}
          />
        </Formik>
      </TestWrapper>
    )

    await waitFor(() => expect(screen.getByRole('textbox')).toBeDisabled())
  })

  test('failed to get infrastructure', async () => {
    jest.spyOn(cdNgServices, 'useGetInfrastructureList').mockReturnValue({
      data: [],
      loading: false,
      error: {
        message: 'Failed to fetch'
      }
    } as any)

    render(
      <TestWrapper
        path={routes.toPipelineStudio({ ...pipelinePathProps, ...pipelineModuleParams })}
        pathParams={{
          accountId: 'dummy',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy',
          module: 'cd',
          pipelineIdentifier: 'dummy'
        }}
      >
        <Formik
          initialValues={{
            environment: {
              environmentRef: 'dummy'
            }
          }}
          onSubmit={jest.fn()}
        >
          <DeployInfrastructures
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
            initialValues={{
              infrastructureRef: ''
            }}
          />
        </Formik>
      </TestWrapper>
    )

    await waitFor(() => expect(showError).toHaveBeenCalledWith('Failed to fetch'))
  })
})
