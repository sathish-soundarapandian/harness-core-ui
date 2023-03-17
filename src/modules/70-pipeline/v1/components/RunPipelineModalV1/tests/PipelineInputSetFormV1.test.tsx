/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Formik, MultiTypeInputType } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import connector from '@connectors/pages/connectors/__tests__/mocks/get-connector-mock.json'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { PipelineInputSetFormV1, PipelineInputSetFormV1Props } from '../PipelineInputSetFormV1'

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: connector, refetch: jest.fn(), error: null, loading: false }
  })
}))

const getCommonProps = (formik: any): PipelineInputSetFormV1Props => ({
  readonly: false,
  viewType: StepViewType.InputSet,
  maybeContainerClass: '',
  allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
  formik: formik
})

const getPropsForCIStage = (formik: any): PipelineInputSetFormV1Props => ({
  originalPipeline: {
    version: 1,
    name: 'Yaml Simp 4',
    inputs: {
      image: {
        type: 'string',
        desc: 'image name',
        default: 'golang',
        required: true
      }
    },
    repository: {
      connector: 'github'
    },
    stages: [
      {
        name: 'output variable',
        type: 'ci',
        spec: {
          steps: [
            {
              name: 'one test',
              type: 'script',
              spec: {
                image: '<+inputs.image>',
                run: 'export foo=bar',
                shell: 'sh',
                outputs: ['foo']
              }
            },
            {
              name: 'two',
              type: 'script',
              spec: {
                image: 'alpine',
                run: 'echo <+steps.one_test.output.outputVariables.foo>',
                pull: 'always'
              }
            }
          ]
        }
      }
    ]
  },
  ...getCommonProps(formik)
})

describe('CI enabled', () => {
  test('CI present in one of the stages', () => {
    const { container } = render(
      <Formik initialValues={{}} formName="PipelineInputSetFormV1Test" onSubmit={jest.fn()}>
        {formik => (
          <TestWrapper>
            <PipelineInputSetFormV1 {...getPropsForCIStage(formik)} />
          </TestWrapper>
        )}
      </Formik>
    )

    expect(container).toMatchSnapshot('CI codebase input set form')
  })

  test('CI READONLY mode', () => {
    const { container } = render(
      <Formik initialValues={{}} formName="PipelineInputSetFormV1Test" onSubmit={jest.fn()}>
        {formik => (
          <TestWrapper>
            <PipelineInputSetFormV1 {...getPropsForCIStage(formik)} readonly={true} />
          </TestWrapper>
        )}
      </Formik>
    )

    expect(container).toMatchSnapshot('CI stage readonly mode')
  })
})
