/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import { TestWrapper } from '@common/utils/testUtils'
import { IACMTerraformPluginVariableStep } from '../IACMTerraformVariableStep'

import metaData from './MetaData'
import variablesData from './VariablesData'

const renderComponent = (props: any) => {
  return render(
    <TestWrapper>
      <IACMTerraformPluginVariableStep
        initialValues={props.initialValues}
        {...{
          stageIdentifier: 'qaStage',
          metadataMap: props.metadataMap,
          variablesData: props.variablesData
        }}
        stepType={StepType.IACMTerraformPlugin}
      />
    </TestWrapper>
  )
}

describe('IACMTerraformPlugin stack Variable view ', () => {
  test('should render with inline config', () => {
    const data = {
      initialValues: {
        spec: {
          command: 'aem'
        },
        name: 'roll',
        identifier: 'roll',
        timeout: '10m',
        type: StepType.IACMTerraformPlugin
      },
      variablesData: variablesData,
      metadataMap: metaData
    }
    const { getByText } = renderComponent(data)
    const command = getByText('command')
    expect(command).toBeInTheDocument()

    const aem = getByText('aem')
    expect(aem).toBeInTheDocument()
  })
})
