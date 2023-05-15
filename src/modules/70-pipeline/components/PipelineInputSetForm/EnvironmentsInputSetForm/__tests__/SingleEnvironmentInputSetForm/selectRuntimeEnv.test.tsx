/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { getByText, queryByText, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik } from 'formik'
import { noop } from 'lodash-es'

import * as cdNgServices from 'services/cd-ng'

import routes from '@common/RouteDefinitions'
import { findDialogContainer, findPopoverContainer, TestWrapper } from '@common/utils/testUtils'

import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'

// eslint-disable-next-line no-restricted-imports
import { DeployEnvironmentEntityStep } from '@cd/components/PipelineSteps/DeployEnvironmentEntityStep/DeployEnvironmentEntityStep'
// eslint-disable-next-line no-restricted-imports
import { DeployInfrastructureEntityStep } from '@cd/components/PipelineSteps/DeployInfrastructureEntityStep/DeployInfrastructureEntityStep'
// eslint-disable-next-line no-restricted-imports
import { GenericServiceSpec } from '@cd/components/PipelineSteps/K8sServiceSpec/K8sServiceSpec'
// eslint-disable-next-line no-restricted-imports
import { KubernetesInfraSpec } from '@cd/components/PipelineSteps/KubernetesInfraSpec/KubernetesInfraSpec'

import { runtimeEnvDS } from './__mocks__/states/deploymentStage.runtimeEnv'
import { runtimeEnvDST } from './__mocks__/states/deploymentStageTemplate.runtimeEnv'

import environmentAccessListData from './__mocks__/responses/environmentAccessList.json'
import environmentMetadata from './__mocks__/responses/environmentInputYamlAndServiceOverridesMetadata.json'

import infrastructureListData from './__mocks__/responses/infrastructuresList.json'
import infrastructureMetadata from './__mocks__/responses/infrastructureYamlMetadataList.json'
import { StageFormContextTestWrapper } from './testUtils'

jest.spyOn(console, 'warn').mockImplementation()
describe('Single Environment Input Set Form - Runtime Env in pipeline studio', () => {
  beforeEach(() => {
    factory.registerStep(new DeployEnvironmentEntityStep())
    factory.registerStep(new DeployInfrastructureEntityStep())
    factory.registerStep(new GenericServiceSpec())
    factory.registerStep(new KubernetesInfraSpec())
  })

  test('environment with multiple input types is selected with infra', async () => {
    jest.spyOn(cdNgServices, 'useGetEnvironmentAccessList').mockReturnValue({
      data: environmentAccessListData,
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)

    jest.spyOn(cdNgServices, 'getEnvironmentAccessListPromise').mockResolvedValue(environmentAccessListData as any)

    jest.spyOn(cdNgServices, 'useGetEnvironmentsInputYamlAndServiceOverrides').mockReturnValue({
      mutate: jest.fn().mockResolvedValue(environmentMetadata),
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)

    jest.spyOn(cdNgServices, 'useGetInfrastructureList').mockReturnValue({
      data: infrastructureListData,
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)

    jest.spyOn(cdNgServices, 'useGetInfrastructureYamlAndRuntimeInputs').mockReturnValue({
      mutate: jest.fn().mockResolvedValue(infrastructureMetadata),
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

    // open environment select modal
    await userEvent.click(screen.getByTestId('cr-field-environment.environmentRef'))

    const environmentSelectDialog = findDialogContainer()

    await waitFor(() =>
      expect(queryByText(environmentSelectDialog!, 'entityReference.apply')?.parentElement).toBeDisabled()
    )

    // select environment
    const environmentWithInputsButton = queryByText(environmentSelectDialog!, 'env with both inputs')
    await waitFor(() => expect(environmentWithInputsButton).toBeVisible())

    await userEvent.click(environmentWithInputsButton!)

    // apply changes
    const applySelectedButton = queryByText(environmentSelectDialog!, 'entityReference.apply')
    await waitFor(() => expect(applySelectedButton?.parentElement).not.toBeDisabled())

    await userEvent.click(applySelectedButton!)

    // wait for data to load
    await waitFor(() => expect(screen.getByText('common.environmentPrefix')).toBeVisible())
    expect(screen.getByText('environmentVariables')).toBeVisible()
    expect(screen.getByText('common.serviceOverridePrefix')).toBeVisible()
    expect(screen.getByText('cd.pipelineSteps.environmentTab.specifyYourInfrastructure')).toBeVisible()

    // fill environment override values
    const inputFields = screen.getAllByRole('textbox')
    await userEvent.type(inputFields[0], 'envVarValue1')
    expect(inputFields[0]).toHaveValue('envVarValue1')

    // fill service override values
    await userEvent.type(inputFields[1], 'svcOverrideVal1')
    expect(inputFields[1]).toHaveValue('svcOverrideVal1')

    // select infrastructure
    await userEvent.click(inputFields[2])

    const infraSelectionPopover = findPopoverContainer()
    await userEvent.click(getByText(infraSelectionPopover!, 'Infra 4'))

    await waitFor(() => expect(screen.getByText('common.infrastructurePrefix')).toBeVisible())

    // fill infra input values
    await userEvent.type(screen.getAllByRole('textbox')[3], 'mynamespace')

    await waitFor(() =>
      expect(screen.getByTestId('finalFormikValues')).toHaveTextContent(
        '{"template":{"templateInputs":{"spec":{"environment":{"environmentRef":"env_with_both_inputs","environmentInputs":{"identifier":"env_with_both_inputs","type":"Production","variables":[{"name":"envVar3","type":"String","value":"envVarValue1"}]},"serviceOverrideInputs":{"variables":[{"name":"svcVar1","type":"String","value":"svcOverrideVal1"}]},"infrastructureDefinitions":[{"identifier":"Infra_4","inputs":{"identifier":"Infra_4","type":"KubernetesDirect","spec":{"namespace":"mynamespace"}}}]}}}}}'
      )
    )
  })
})
