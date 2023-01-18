/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { Formik, FormikForm, MultiTypeInputType } from '@harness/uicore'
import { queryByNameAttribute, TestWrapper } from '@common/utils/testUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import TerragruntInputStep from '../InputSteps/TerragruntInputStep'
import { initialValues, template } from './TerragruntTestHelper'
jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('Test Terragrunt input set', () => {
  test('should render edit view as new step', () => {
    const { container } = render(
      <TestWrapper>
        <Formik initialValues={{}} onSubmit={() => undefined} formName="wrapperComponentTestForm">
          <FormikForm>
            <TerragruntInputStep
              initialValues={initialValues as any}
              stepType={StepType.TerragruntDestroy}
              stepViewType={StepViewType.InputSet}
              inputSetData={{
                template
              }}
              path="test"
              allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]}
            />
          </FormikForm>
        </Formik>
      </TestWrapper>
    )
    expect(queryByNameAttribute('test.timeout', container)).toBeInTheDocument()
    expect(queryByNameAttribute('test.spec.provisionerIdentifier', container)).toBeInTheDocument()
    expect(queryByNameAttribute('test.spec.configuration.spec.moduleConfig.path', container)).toBeInTheDocument()
    expect(queryByNameAttribute('test.spec.configuration.spec.workspace', container)).toBeInTheDocument()
    expect(
      queryByNameAttribute('test.spec.configuration.spec.configFiles.store.spec.branch', container)
    ).toBeInTheDocument()
    expect(
      queryByNameAttribute('test.spec.configuration.spec.configFiles.store.spec.folderPath', container)
    ).toBeInTheDocument()
    expect(
      queryByNameAttribute('test.spec.configuration.spec.varFiles[0].varFile.spec.content', container)
    ).toBeInTheDocument()
    expect(
      queryByNameAttribute('test.spec.configuration.spec.varFiles[1].varFile.spec.store.spec.branch', container)
    ).toBeInTheDocument()
    expect(
      queryByNameAttribute('test.spec.configuration.spec.backendConfig.spec.content', container)
    ).toBeInTheDocument()
    expect(queryByNameAttribute('test.spec.configuration.spec.targets[0]', container)).toBeInTheDocument()
  })
})
