/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { getByText, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik } from 'formik'
import { noop } from 'lodash-es'

import * as cdNgServices from 'services/cd-ng'

import routes from '@common/RouteDefinitions'
import { findPopoverContainer, TestWrapper } from '@common/utils/testUtils'

import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'

// eslint-disable-next-line no-restricted-imports
import { DeployEnvironmentEntityStep } from '@cd/components/PipelineSteps/DeployEnvironmentEntityStep/DeployEnvironmentEntityStep'
// eslint-disable-next-line no-restricted-imports
import { DeployInfrastructureEntityStep } from '@cd/components/PipelineSteps/DeployInfrastructureEntityStep/DeployInfrastructureEntityStep'

import { runtimeEnvDS } from './__mocks__/states/deploymentStage.runtimeEnv'
import { runtimeEnvDST } from './__mocks__/states/deploymentStageTemplate.runtimeEnv'

import environmentAccessListData from './__mocks__/responses/environmentAccessList.json'

import { StageFormContextTestWrapper } from './testUtils'

describe('Single Environment Input Set Form - Env and Infra Expression', () => {
  beforeEach(() => {
    factory.registerStep(new DeployEnvironmentEntityStep())
    factory.registerStep(new DeployInfrastructureEntityStep())
  })

  test('environment and expression in run form', async () => {
    jest.spyOn(cdNgServices, 'useGetEnvironmentAccessList').mockReturnValue({
      data: environmentAccessListData,
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)

    render(
      <TestWrapper
        defaultFeatureFlagValues={{
          CDS_OrgAccountLevelServiceEnvEnvGroup: true
        }}
        path={routes.toPipelineStudio({
          accountId: ':accountId',
          orgIdentifier: ':orgIdentifier',
          projectIdentifier: ':projectIdentifier',
          pipelineIdentifier: ':pipelineIdentifier'
        })}
        pathParams={{
          accountId: 'dummyAcc',
          orgIdentifier: 'dummyOrg',
          projectIdentifier: 'dummyProj',
          pipelineIdentifier: 'dummyPipeline'
        }}
      >
        <Formik initialValues={{}} onSubmit={noop}>
          {formik => (
            <>
              <StageFormContextTestWrapper
                path={'template.templateInputs.spec'}
                deploymentStage={runtimeEnvDS}
                deploymentStageTemplate={runtimeEnvDST as cdNgServices.DeploymentStageConfig}
                viewType={StepViewType.DeploymentForm}
                stageIdentifier={'RT_env'}
              />
              <div data-testid="finalFormikValues">{JSON.stringify(formik.values)}</div>
            </>
          )}
        </Formik>
      </TestWrapper>
    )

    await waitFor(() =>
      expect(screen.getByText('cd.pipelineSteps.environmentTab.specifyYourEnvironment')).toBeVisible()
    )

    // change env type to expression
    await userEvent.click(screen.getByTestId('multi-type-button'))
    await userEvent.click(getByText(findPopoverContainer()!, 'Expression'))
    await waitFor(() => expect(findPopoverContainer()).toBeNull())

    // enter environment expression value
    const envExpressionInput = screen.getByPlaceholderText('<+expression>')

    // type half of expression, infra should not be visible
    await userEvent.type(envExpressionInput, '<+pipeline')
    expect(screen.queryByText('cd.pipelineSteps.environmentTab.specifyYourInfrastructure')).toBeNull()

    // complete expression, infra should be visible
    await userEvent.type(envExpressionInput, '.var.env>')
    expect(screen.getByText('cd.pipelineSteps.environmentTab.specifyYourInfrastructure')).toBeVisible()

    // change infra type to expression, 0 is env 1 is infra
    await userEvent.click(screen.getAllByTestId('multi-type-button')[1])
    await userEvent.click(getByText(findPopoverContainer()!, 'Expression'))
    await waitFor(() => expect(findPopoverContainer()).toBeNull())

    // enter infra expression value
    const infraExpressionInput = screen.getAllByPlaceholderText('<+expression>')[1]

    await userEvent.type(infraExpressionInput, '<+pipeline.var.infra>')

    // assert final formik value
    await waitFor(() =>
      expect(screen.getByTestId('finalFormikValues')).toHaveTextContent(
        '{"template":{"templateInputs":{"spec":{"environment":{"environmentRef":"<+pipeline.var.env>","infrastructureDefinitions":[{"identifier":"<+pipeline.var.infra>"}]}}}}}'
      )
    )
  })
})
