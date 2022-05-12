/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Form } from 'formik'
import { Formik } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StageAdvancedInputSetForm } from '../StageAdvancedInputSetForm'

const mockGetCallFunction = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateSelectorsUpTheHierarchy: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return []
  })
}))
const props = {
  deploymentStageTemplate: {
    spec: {
      serviceConfig: {
        stageOverrides: {
          artifacts: {
            primary: {
              spec: {
                connectorRef: '<+input'
              },
              type: 'DockerRegistry' as const
            }
          }
        }
      },
      infrastructure: {
        spec: {
          namespace: 'test',
          serviceAccountName: 'name1',
          initTimeout: '1w',
          annotations: {
            annotation1: '<+input>'
          },
          labels: {
            label1: '<+input>'
          }
        },
        type: 'KubernetesDirect'
      },
      execution: {
        steps: [
          {
            step: {
              identifier: 'test',
              name: 'test',
              type: 'test',
              description: 'ts',
              timeout: '10m'
            }
          }
        ],
        rollbackSteps: []
      },
      serviceDependencies: [
        {
          identifier: 'dep1',
          name: 'dep1',
          type: 'Service',
          spec: {
            connectorRef: 'harnessImage',
            image: 'alpine'
          }
        }
      ]
    },
    when: { condition: '<+input>' }
  },
  path: 'stages[1].stage',
  delegateSelectors: '<+input>'
} as any

describe('StageAdvancedInputSetForm tests', () => {
  describe('viewType DeploymentForm', () => {
    test('initial render', () => {
      const { container } = render(
        <TestWrapper>
          <Formik formName="test-form" initialValues={{}} onSubmit={jest.fn()}>
            <Form>
              <StageAdvancedInputSetForm {...props} viewType={StepViewType.DeploymentForm} />
            </Form>
          </Formik>
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
    })
  })
})
