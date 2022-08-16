/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import * as cdNgServices from 'services/cd-ng'

import routes from '@common/RouteDefinitions'
import { environmentPathProps, projectPathProps } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'

import InfrastructureModal from '../InfrastructureModal'

import yamlSchema from './__mocks__/infrastructureYamlSchema.json'
import createInfrastructureResponse from './__mocks__/createInfrastructureResponse.json'

jest.mock('@pipeline/components/AbstractSteps/StepWidget', () => ({
  ...(jest.requireActual('@pipeline/components/AbstractSteps/StepWidget') as any),
  StepWidget: (props: any) => {
    return (
      <div className="step-widget-mock">
        <button
          name={'updateStepWidget'}
          onClick={() => {
            props.onUpdate(props.initialValues)
          }}
        >
          Step Widget button
        </button>
      </div>
    )
  }
}))

const createInfraFn = jest.fn()

describe('Infrastructure Modal Test', () => {
  beforeEach(() => {
    jest.spyOn(cdNgServices, 'useGetYamlSchema').mockImplementation(() => ({ data: yamlSchema, loading: false } as any))
    jest.spyOn(cdNgServices, 'useUpdateInfrastructure').mockImplementation(() => {
      return {
        loading: false,
        mutate: jest.fn().mockResolvedValue({}),
        cancel: jest.fn(),
        error: null
      }
    })
    jest.spyOn(cdNgServices, 'useCreateInfrastructure').mockImplementation(() => {
      return {
        loading: false,
        mutate: createInfraFn.mockResolvedValue(createInfrastructureResponse),
        cancel: jest.fn(),
        error: null
      }
    })
  })

  test('throws validation errors on save', async () => {
    render(
      <TestWrapper
        path={routes.toEnvironmentDetails({
          accountId: 'dummy',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy',
          module: 'cd',
          environmentIdentifier: 'test_env'
        })}
        pathParams={{ ...projectPathProps, ...environmentPathProps }}
        defaultFeatureFlagValues={{
          SSH_NG: true,
          AZURE_WEBAPP_NG: true,
          SERVERLESS_SUPPORT: true
        }}
      >
        <InfrastructureModal environmentIdentifier="test_env" hideModal={jest.fn()} refetch={jest.fn()} />
      </TestWrapper>
    )

    const buttons = screen.getAllByRole('button')
    userEvent.click(buttons[2]!)

    expect(await screen.findByText('fieldRequired')).toBeVisible()
    expect(screen.getByText('cd.pipelineSteps.serviceTab.deploymentTypeRequired')).toBeInTheDocument()

    const nameInput = screen.getAllByRole('textbox')[0]
    userEvent.type(nameInput, 'Infra 1')

    const kubernetesDeploymentType = screen.getAllByRole('checkbox')[0]
    userEvent.click(kubernetesDeploymentType)

    expect(await screen.findByText('pipelineSteps.deploy.infrastructure.viaCloudProvider')).toBeVisible()

    expect(screen.getByText('pipelineSteps.deploy.infrastructure.directConnection')).toBeInTheDocument()
    expect(screen.getByText('pipelineSteps.deploymentTypes.kubernetes')).toBeInTheDocument()
    expect(screen.getByText('pipelineSteps.deploymentTypes.gk8engine')).toBeInTheDocument()

    userEvent.click(buttons[2]!)

    await waitFor(() => {
      expect(screen.getByText('cd.pipelineSteps.infraTab.deploymentType')).toBeInTheDocument()
    })

    // This is the index of the kubernetes infra thumbnails
    const kubernetesDirectInfraType = screen.getAllByRole('checkbox')[11]
    userEvent.click(kubernetesDirectInfraType)

    expect(await screen.findByText('cd.steps.common.clusterDetails')).toBeVisible()
    expect(screen.getByText('Step Widget button')).toBeInTheDocument()

    userEvent.click(buttons[2]!)

    await waitFor(() => expect(createInfraFn).toHaveBeenCalledTimes(1))
  })

  test('renders edit view, switches to yaml and back and retains values', async () => {
    render(
      <TestWrapper
        path={routes.toEnvironmentDetails({
          accountId: 'dummy',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy',
          module: 'cd',
          environmentIdentifier: 'test_env'
        })}
        pathParams={{ ...projectPathProps, ...environmentPathProps }}
        defaultFeatureFlagValues={{
          SSH_NG: true,
          AZURE_WEBAPP_NG: true,
          SERVERLESS_SUPPORT: true
        }}
      >
        <InfrastructureModal
          environmentIdentifier="test_env"
          hideModal={jest.fn()}
          refetch={jest.fn()}
          selectedInfrastructure={`infrastructureDefinition:\n  name: "K8s Direct"\n  identifier: "K8s_Direct_Id"\n  orgIdentifier: "default"\n  projectIdentifier: "Ashwin_svc_env"\n  environmentRef: "Env_Infra"\n  description: ""\n  tags: {}\n  allowSimultaneousDeployments: false\n  type: "KubernetesDirect"\n  spec:\n    connectorRef: "account.qastresstarget"\n    namespace: "test"\n    releaseName: "release-<+INFRA_KEY>"\n`}
        />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('K8s_Direct_Id')).toBeInTheDocument()
    })

    const buttons = screen.getAllByRole('button')

    // switch to YAML and back
    userEvent.click(buttons[2])

    await waitFor(() => {
      expect(buttons[2]).toHaveClass('PillToggle--item PillToggle--selected')
    })

    userEvent.click(buttons[1])

    await waitFor(() => {
      expect(screen.getByText('K8s_Direct_Id')).toBeInTheDocument()
    })
  })
})
