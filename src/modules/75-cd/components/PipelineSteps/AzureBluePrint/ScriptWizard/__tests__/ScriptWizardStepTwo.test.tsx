/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { MultiTypeInputType } from '@harness/uicore'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import connectorsData from '@pipeline/components/ManifestSelection/__tests__/connectors_mock.json'
import { ScriptWizardStepTwo } from '../ScriptWizardStepTwo'

jest.mock('services/cd-ng', () => ({
  useGetConnectorListV2: jest
    .fn()
    .mockImplementation(() => ({ mutate: (): Promise<unknown> => Promise.resolve(connectorsData) })),
  useGetConnector: () => {
    return {
      data: connectorsData,
      refetch: jest.fn()
    }
  }
}))

jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  useToaster: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn()
  })
}))

const renderComponent = (props: any) => {
  return render(
    <TestWrapper>
      <ScriptWizardStepTwo
        expressions={[]}
        allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
        initialValues={props}
        handleSubmit={jest.fn()}
      />
    </TestWrapper>
  )
}

describe('ScriptWizardStepTwo', () => {
  test('should render stepTwo', async () => {
    const initialValues = {
      spec: {
        configuration: {
          template: {
            store: {
              type: 'Bitbucket',
              spec: {
                connectorRef: 'account.BBsaasAmit',
                gitFetchType: 'Commit',
                paths: 'filePath',
                commitId: 'commitId'
              }
            }
          }
        }
      }
    }
    const { container, getByText } = renderComponent(initialValues)
    expect(container).toMatchSnapshot()
    const submit = await getByText('submit')
    expect(submit).toBeDefined()
  })

  test('runtime inputs', async () => {
    const initialValues = {
      spec: {
        configuration: {
          template: {
            store: {
              type: 'Bitbucket',
              spec: {
                connectorRef: '<+input>',
                gitFetchType: 'Commit',
                paths: ['<+input>'],
                repoName: '<+input>',
                commitId: '<+input>'
              }
            }
          }
        }
      }
    }

    const { container } = renderComponent(initialValues)
    expect(container).toMatchSnapshot()
  })

  test('git fetch type branch as runtime', async () => {
    const initialValues = {
      spec: {
        configuration: {
          template: {
            store: {
              type: 'Bitbucket',
              spec: {
                connectorRef: '<+input>',
                gitFetchType: 'Branch',
                paths: '<+input>',
                repoName: '<+input>',
                branch: '<+input>'
              }
            }
          }
        }
      }
    }

    const { container } = renderComponent(initialValues)
    expect(container).toMatchSnapshot()
  })

  test('empty values', async () => {
    const initialValues = {
      spec: {
        configuration: {
          template: {
            store: {
              type: 'Bitbucket'
            }
          }
        }
      }
    }

    const { container } = renderComponent(initialValues)
    expect(container).toMatchSnapshot()
  })
})
