/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { Formik, FormikForm } from '@harness/uicore'

import { TestWrapper } from '@common/utils/testUtils'

import { CIBuildInfrastructureType } from '@pipeline/utils/constants'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import StepCommonFields, { StepCommonFieldsProps } from '../StepCommonFields'

interface TestProps {
  initialValues?: any
}

const TestComponent = ({
  initialValues,
  buildInfrastructureType,
  stepViewType,
  disableRunAsUser
}: TestProps & StepCommonFieldsProps): React.ReactElement => (
  <TestWrapper>
    {/* eslint-disable-next-line @typescript-eslint/no-empty-function */}
    <Formik initialValues={initialValues} onSubmit={() => {}} formName="stepCommonFieldsForm">
      <FormikForm>
        <StepCommonFields
          buildInfrastructureType={buildInfrastructureType}
          stepViewType={stepViewType}
          disableRunAsUser={disableRunAsUser}
        />
      </FormikForm>
    </Formik>
  </TestWrapper>
)

describe('<StepCommonFields /> tests', () => {
  test('Should render properly with no data', () => {
    const { container } = render(<TestComponent buildInfrastructureType={CIBuildInfrastructureType.KubernetesDirect} />)
    expect(container).toMatchSnapshot()
  })
  test('Should render properly with passed initial values', () => {
    const { container } = render(
      <TestComponent
        initialValues={{
          spec: {
            limitMemory: '128Mi',
            limitCPU: '0.1',
            timeout: '120s'
          }
        }}
        buildInfrastructureType={CIBuildInfrastructureType.KubernetesDirect}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('Conditional rendering of specific fields based on Infrastructure type', () => {
    const { getByText, rerender } = render(
      <TestComponent buildInfrastructureType={CIBuildInfrastructureType.KubernetesDirect} />
    )
    const setContainerResourcesSection = getByText('pipelineSteps.setContainerResources')
    expect(getByText('pipeline.stepCommonFields.runAsUser')).toBeInTheDocument()
    expect(setContainerResourcesSection).toBeInTheDocument()

    rerender(
      <TestComponent buildInfrastructureType={CIBuildInfrastructureType.KubernetesDirect} disableRunAsUser={true} />
    )
    expect(screen.queryByText('pipeline.stepCommonFields.runAsUser')).toBeNull()

    rerender(<TestComponent buildInfrastructureType={CIBuildInfrastructureType.Cloud} />)
    expect(getByText('pipeline.stepCommonFields.runAsUser')).toBeInTheDocument()
    expect(screen.queryByText('pipelineSteps.setContainerResources')).toBeNull()

    rerender(<TestComponent buildInfrastructureType={CIBuildInfrastructureType.Docker} />)
    expect(screen.queryByText('pipeline.stepCommonFields.runAsUser')).toBeNull()
    expect(screen.queryByText('pipelineSteps.setContainerResources')).toBeNull()

    rerender(
      <TestComponent buildInfrastructureType={CIBuildInfrastructureType.Docker} stepViewType={StepViewType.Template} />
    )
    expect(getByText('pipeline.stepCommonFields.runAsUser')).toBeInTheDocument()
  })
})
