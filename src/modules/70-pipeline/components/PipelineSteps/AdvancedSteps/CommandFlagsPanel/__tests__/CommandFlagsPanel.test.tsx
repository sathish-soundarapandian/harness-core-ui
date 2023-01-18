/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent, getByText, getAllByTestId } from '@testing-library/react'
import { Formik } from 'formik'
import { TestWrapper } from '@common/utils/testUtils'
import CommandFlagsPanel from '../CommandFlagsPanel'
export const commandFlagsMock = {
  status: 'SUCCESS',
  data: ['Apply', 'Delete', 'Update'],
  metaData: undefined,
  correlationId: '23659f77-9c8a-4338-8163-06a65a7e5823'
}

jest.mock('services/cd-ng', () => ({
  useK8sCmdFlags: jest.fn().mockImplementation(() => {
    return {
      data: commandFlagsMock
    }
  })
}))
jest.mock('@common/components/MonacoTextField/MonacoTextField', () => ({
  MonacoTextField: function MonacoTextField() {
    return <textarea />
  }
}))
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'UUID'),
  v5: jest.fn(() => 'MockedUUID')
}))

describe('Command Flags Panel Test', () => {
  test('renders empty command flags panel correctly', () => {
    const { container } = render(
      <TestWrapper>
        <Formik
          initialValues={{
            commandFlags: []
          }}
          onSubmit={() => void 0}
          formName="conditionalExecutionPanelForm"
        >
          {formikProps => {
            return (
              <CommandFlagsPanel
                formik={formikProps}
                step={{
                  name: 'Rollout Deployment',
                  identifier: 'rolloutDeployment',
                  type: 'K8sRollingDeploy',
                  timeout: '10m',
                  spec: {
                    skipDryRun: false,
                    pruningEnabled: false
                  }
                }}
              />
            )
          }}
        </Formik>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('add / delete button functionality', async () => {
    const { container, getByPlaceholderText } = render(
      <TestWrapper>
        <Formik
          initialValues={{
            commandFlags: []
          }}
          onSubmit={() => void 0}
          formName="conditionalExecutionPanelForm"
        >
          {formikProps => {
            return (
              <CommandFlagsPanel
                formik={formikProps}
                step={{
                  name: 'Rollout Deployment',
                  identifier: 'rolloutDeployment',
                  type: 'K8sRollingDeploy',
                  timeout: '10m',
                  spec: {
                    skipDryRun: false,
                    pruningEnabled: false
                  }
                }}
              />
            )
          }}
        </Formik>
      </TestWrapper>
    )
    const addBtn = getByText(container, 'add')
    await waitFor(() => expect(addBtn).toBeInTheDocument())
    fireEvent.click(addBtn)
    const defaultSelectDropdown = getByPlaceholderText('- pipeline.fieldPlaceholders.commandType -')
    await waitFor(() => expect(defaultSelectDropdown).toBeInTheDocument())
    fireEvent.click(addBtn)
    const deleteBtn = getAllByTestId(container, 'deleteCommandFlag')[1]
    await waitFor(() => expect(deleteBtn).toBeInTheDocument())
    fireEvent.click(deleteBtn)
    expect(container.querySelector('input[name="commandFlags[1].commandType"]')).toBeNull()
  })
})
