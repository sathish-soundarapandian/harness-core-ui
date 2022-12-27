import React from 'react'
import { MultiTypeInputType } from '@harness/uicore'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { ServiceSpec, useGetArtifactSourceInputs } from 'services/cd-ng'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StageFormContext } from '@pipeline/context/StageFormContext'
import PrimaryArtifactRef from '../PrimaryArtifactRef'
import type { K8SDirectServiceStep } from '../../K8sServiceSpecInterface'
import {
  formik,
  templatewithRuntime,
  templateWithoutRuntime,
  initialValuesWithRuntime,
  initialValuesWithoutRuntime,
  stageContextValue
} from './mocks'

jest.fn().mockImplementation(() => {
  return { data: {}, refetch: jest.fn(), error: null, loading: false }
})
jest.mock('services/cd-ng', () => ({
  useGetArtifactSourceInputs: jest.fn(() => ({
    data: {
      data: {
        sourceIdentifiers: ['source1'],
        sourceIdentifierToSourceInputMap: {
          source1: 'identifier: "source1"\ntype: "DockerRegistry"\nspec:\n  tag: "<+input>"\n'
        }
      }
    }
  }))
}))

describe('Primary Artifact ref tests', () => {
  test('should render correctly', () => {
    const { container } = render(
      <TestWrapper>
        <PrimaryArtifactRef
          serviceIdentifier="serviceTest"
          stepViewType={StepViewType.DeploymentForm}
          path="stages[0].stage.spec.service.serviceInputs.serviceDefinition.spec"
          formik={formik as any}
          template={templatewithRuntime as ServiceSpec}
          initialValues={initialValuesWithRuntime as K8SDirectServiceStep}
          readonly={false}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('field should be populated in case of single artifact source with runtime input', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <StageFormContext.Provider value={stageContextValue as any}>
          <PrimaryArtifactRef
            serviceIdentifier="serviceTest"
            stepViewType={StepViewType.DeploymentForm}
            template={templatewithRuntime as ServiceSpec}
            formik={formik as any}
            path="stages[0].stage.spec.service.serviceInputs.serviceDefinition.spec"
            initialValues={initialValuesWithRuntime as K8SDirectServiceStep}
            readonly={false}
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          />
        </StageFormContext.Provider>
      </TestWrapper>
    )

    userEvent.click(container.querySelector('[data-icon="chevron-down"]')!)
    const primaryArtifact = getByText('source1')
    userEvent.click(primaryArtifact)
    await waitFor(() => expect(primaryArtifact).toBeInTheDocument())
    expect(stageContextValue.updateStageFormTemplate).toHaveBeenCalled()
  })

  test('field should be populated in case of single artifact source without runtime input', async () => {
    ;(useGetArtifactSourceInputs as jest.Mock).mockImplementation(() => ({
      data: {
        data: {
          sourceIdentifiers: ['artifactSource'],
          sourceIdentifierToSourceInputMap: {}
        }
      }
    }))
    const { container, getByText } = render(
      <TestWrapper>
        <StageFormContext.Provider value={stageContextValue as any}>
          <PrimaryArtifactRef
            serviceIdentifier="serviceWithoutRuntime"
            stepViewType={StepViewType.DeploymentForm}
            template={templateWithoutRuntime as any}
            formik={formik as any}
            path="stages[0].stage.spec.service.serviceInputs.serviceDefinition.spec"
            initialValues={initialValuesWithoutRuntime as K8SDirectServiceStep}
            readonly={false}
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          />
        </StageFormContext.Provider>
      </TestWrapper>
    )

    userEvent.click(container.querySelector('[data-icon="chevron-down"]')!)
    userEvent.click(getByText('artifactSource'))

    expect(stageContextValue.updateStageFormTemplate).toHaveBeenCalled()
  })
})
