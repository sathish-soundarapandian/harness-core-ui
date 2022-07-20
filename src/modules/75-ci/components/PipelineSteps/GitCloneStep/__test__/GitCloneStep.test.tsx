/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import userEvent from '@testing-library/user-event'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import * as cdng from 'services/cd-ng'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import {
  AccountConnectorResponse,
  RepositoryURLConnectorResponse,
  onEditInitialValuesFixed,
  onEditInitialValuesFixed2,
  onEditInitialValuesAllRuntimeInputs
} from './mock'
import { GitCloneStep } from '../GitCloneStep'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('Git Clone Step', () => {
  beforeAll(() => {
    factory.registerStep(new GitCloneStep())
  })

  describe('Step Render', () => {
    test('initial render', () => {
      const { container } = render(
        <TestStepWidget initialValues={{}} type={StepType.GitClone} stepViewType={StepViewType.Edit} />
      )

      expect(container).toMatchSnapshot()
    })

    test('should render onEdit fixed values properly', () => {
      jest.spyOn(cdng, 'useGetConnector').mockReturnValue(AccountConnectorResponse as any)

      const { container } = render(
        <TestStepWidget
          initialValues={onEditInitialValuesFixed}
          type={StepType.GitClone}
          stepViewType={StepViewType.Edit}
        />
      )

      expect(container).toMatchSnapshot()
    })

    test('should render onEdit fixed values properly with repo connector', () => {
      jest.spyOn(cdng, 'useGetConnector').mockReturnValue(RepositoryURLConnectorResponse as any)

      const { container } = render(
        <TestStepWidget
          initialValues={onEditInitialValuesFixed2}
          type={StepType.GitClone}
          stepViewType={StepViewType.Edit}
        />
      )
      expect(container.querySelector('[name="spec.repoName"]')).toHaveAttribute(
        'value',
        'https://github.com/mtran7/GitExpRepo'
      )
      expect(container.querySelector('[name="spec.build.spec.branch"]')).toHaveAttribute('value', RUNTIME_INPUT_VALUE)
    })

    test('should render onEdit runtime input values properly', () => {
      const { container } = render(
        <TestStepWidget
          initialValues={onEditInitialValuesAllRuntimeInputs}
          type={StepType.GitClone}
          stepViewType={StepViewType.Edit}
        />
      )

      expect(container).toMatchSnapshot()
    })
  })

  describe('InputSet View Render', () => {
    test('should render properly', () => {
      const { container } = render(
        <TestStepWidget initialValues={{}} type={StepType.GitClone} stepViewType={StepViewType.InputSet} />
      )

      expect(container).toMatchSnapshot()
    })

    test('should render all fields', async () => {
      const template = {
        type: StepType.GitClone,
        identifier: 'My_GitClone_Step',
        description: RUNTIME_INPUT_VALUE,
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          connectorRef: RUNTIME_INPUT_VALUE,
          repoName: RUNTIME_INPUT_VALUE,
          build: RUNTIME_INPUT_VALUE,
          cloneDirectory: RUNTIME_INPUT_VALUE,
          depth: RUNTIME_INPUT_VALUE,
          sslVerify: RUNTIME_INPUT_VALUE,
          runAsUser: RUNTIME_INPUT_VALUE,
          resources: {
            limits: {
              cpu: RUNTIME_INPUT_VALUE,
              memory: RUNTIME_INPUT_VALUE
            }
          }
        }
      }

      const allValues = {
        type: StepType.GitClone,
        name: 'Test A',
        identifier: 'My_GitClone_Step',
        description: RUNTIME_INPUT_VALUE,
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          connectorRef: RUNTIME_INPUT_VALUE,
          repoName: RUNTIME_INPUT_VALUE,
          build: RUNTIME_INPUT_VALUE,
          cloneDirectory: RUNTIME_INPUT_VALUE,
          depth: RUNTIME_INPUT_VALUE,
          sslVerify: RUNTIME_INPUT_VALUE,
          runAsUser: RUNTIME_INPUT_VALUE,
          resources: {
            limits: {
              cpu: RUNTIME_INPUT_VALUE,
              memory: RUNTIME_INPUT_VALUE
            }
          }
        }
      }

      const onUpdate = jest.fn()

      const { container } = render(
        <TestStepWidget
          initialValues={{}}
          type={StepType.GitClone}
          template={template}
          allValues={allValues}
          stepViewType={StepViewType.InputSet}
          onUpdate={onUpdate}
        />
      )

      expect(container).toMatchSnapshot()
    })

    test('should not render any fields', async () => {
      const template = {
        type: StepType.GitClone,
        identifier: 'My_GitClone_Step'
      }

      const allValues = {
        type: StepType.GitClone,
        identifier: 'My_GitClone_Step',
        name: 'My GitClone Step',
        description: 'Description',
        timeout: '10s',
        spec: {
          connectorRef: 'mtranacctconnector',
          repoName: 'abct',
          cloneDirectory: '/harness',
          depth: 1,
          sslVerify: false,
          runAsUser: '1000',
          resources: {
            limits: {
              memory: '1G',
              cpu: '100m'
            }
          },
          build: {
            type: 'branch',
            spec: {
              branch: 'azz'
            }
          }
        }
      }

      const onUpdate = jest.fn()

      const { container } = render(
        <TestStepWidget
          initialValues={{}}
          type={StepType.GitClone}
          template={template}
          allValues={allValues}
          stepViewType={StepViewType.InputSet}
          onUpdate={onUpdate}
        />
      )

      expect(container).toMatchSnapshot()
    })
  })

  describe('Interactivity', () => {
    test('should render tag name on switching build type', async () => {
      jest.spyOn(cdng, 'useGetConnector').mockReturnValue(AccountConnectorResponse as any)

      render(
        <TestStepWidget
          initialValues={onEditInitialValuesFixed}
          type={StepType.GitClone}
          stepViewType={StepViewType.Edit}
        />
      )
      const gitTagRadio = document.body.querySelector('[value="tag"]')
      const gitBranch = document.body.querySelector('[name="spec.build.spec.branch"]')
      await waitFor(() => {
        expect(gitBranch).toHaveAttribute('value', 'azz')
      })
      if (gitTagRadio) {
        userEvent.click(gitTagRadio)
      } else {
        throw Error('cannot find tag radio button')
      }

      await waitFor(() => {
        expect(document.body.querySelector('[name="spec.build.spec.branch"]')).not.toBeInTheDocument()
        expect(document.body.querySelector('[name="spec.build.spec.tag"]')).toBeInTheDocument()
      })
    })
  })
})
