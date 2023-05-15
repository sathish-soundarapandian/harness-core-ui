/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import type { StepProps } from '@harness/uicore'

import type { ConnectorInfoDTO } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import { queryByNameAttribute, TestWrapper } from '@common/utils/testUtils'
import type { ConnectorDetailsProps } from '@connectors/interfaces/ConnectorInterface'
import { BackOffStrategy } from '@connectors/pages/connectors/utils/ConnectorHelper'
import StepBackOffStrategy, { StepBackOffStrategyProps } from '../StepBackOffStrategy'

const nextStepFn = jest.fn()
const previousStepFn = jest.fn()
const commonProps = {
  accountId: 'testAccount',
  isEditMode: false,
  orgIdentifier: 'testOrg',
  projectIdentifier: 'testProject',
  setIsEditMode: jest.fn(),
  nextStep: nextStepFn,
  previousStep: previousStepFn
}
const PATH = routes.toConnectorDetails({
  accountId: 'testAccount',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'testProject',
  connectorId: 'AWS_Backoff_Connector'
})
const PATH_PARAMS = {
  accountId: 'testAccount',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'testProject'
}

const renderComponent = (props: StepProps<StepBackOffStrategyProps> & ConnectorDetailsProps) =>
  render(
    <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
      <StepBackOffStrategy {...props} />
    </TestWrapper>
  )

describe('StepBackoffStrategy tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('it should have NO backoff strategy selected when components is rendered as part of CREATE flow', async () => {
    const connector: ConnectorInfoDTO = {
      name: 'AWS Backoff Connector',
      identifier: 'AWS_Backoff_Connector',
      description: '',
      orgIdentifier: 'testOrg',
      projectIdentifier: 'testProject',
      tags: {},
      type: 'Aws',
      spec: {
        credential: {
          crossAccountAccess: null,
          type: 'ManualConfig',
          spec: { accessKey: 'abcdefghi', accessKeyRef: null, secretKeyRef: 'testSecretRef' },
          region: 'us-east-1'
        },
        delegateSelectors: [],
        executeOnDelegate: false
      }
    }
    renderComponent({
      ...commonProps,
      connectorInfo: connector
    })

    const fixedDelayOption = screen.getByText('connectors.aws.fixedDelay')
    expect(fixedDelayOption).toBeInTheDocument()
    expect(fixedDelayOption.parentElement?.parentElement).not.toHaveClass('Card--selected')

    const equalJitterOption = screen.getByText('connectors.aws.equalJitter')
    expect(equalJitterOption).toBeInTheDocument()
    expect(equalJitterOption.parentElement?.parentElement).not.toHaveClass('Card--selected')

    const fullJitterOption = screen.getByText('connectors.aws.fullJitter')
    expect(fullJitterOption).toBeInTheDocument()
    expect(fullJitterOption.parentElement?.parentElement).not.toHaveClass('Card--selected')
  })

  test('it should display correct input fields when Fixed Delay is selected', async () => {
    const connector: ConnectorInfoDTO = {
      name: 'AWS Backoff Connector',
      identifier: 'AWS_Backoff_Connector',
      description: '',
      orgIdentifier: 'testOrg',
      projectIdentifier: 'testProject',
      tags: {},
      type: 'Aws',
      spec: {
        credential: {
          crossAccountAccess: null,
          type: 'ManualConfig',
          spec: { accessKey: 'abcdefghi', accessKeyRef: null, secretKeyRef: 'testSecretRef' },
          region: 'us-east-1'
        },
        delegateSelectors: [],
        executeOnDelegate: false
      }
    }
    const { container } = renderComponent({
      ...commonProps,
      connectorInfo: connector
    })

    const continueBtn = screen.getByText('continue')
    expect(continueBtn).toBeInTheDocument()

    const fixedDelayOption = screen.getByText('connectors.aws.fixedDelay')
    expect(fixedDelayOption).toBeInTheDocument()
    expect(fixedDelayOption.parentElement?.parentElement).not.toHaveClass('Card--selected')

    // Fixed Delay
    await userEvent.click(fixedDelayOption)
    expect(fixedDelayOption.parentElement?.parentElement).toHaveClass('Card--selected')
    // Fixed Backoff
    const fixedBackoffInput = queryByNameAttribute('fixedBackoff', container) as HTMLInputElement
    expect(fixedBackoffInput).toBeInTheDocument()
    expect(fixedBackoffInput.value).toBe('0')
    await userEvent.clear(fixedBackoffInput)
    await userEvent.type(fixedBackoffInput, '300')
    // Retry Count
    const retryCountInput = queryByNameAttribute('retryCount', container) as HTMLInputElement
    expect(retryCountInput).toBeInTheDocument()
    expect(retryCountInput.value).toBe('0')
    await userEvent.clear(retryCountInput)
    await userEvent.type(retryCountInput, '3')

    await userEvent.click(continueBtn)
    await waitFor(() => expect(nextStepFn).toHaveBeenCalledTimes(1))
    await waitFor(() =>
      expect(nextStepFn).toHaveBeenCalledWith({
        description: '',
        identifier: 'AWS_Backoff_Connector',
        name: 'AWS Backoff Connector',
        orgIdentifier: 'testOrg',
        projectIdentifier: 'testProject',
        tags: {},
        type: 'Aws',
        spec: {
          credential: {
            crossAccountAccess: null,
            type: 'ManualConfig',
            spec: { accessKey: 'abcdefghi', accessKeyRef: null, secretKeyRef: 'testSecretRef' },
            region: 'us-east-1'
          },
          delegateSelectors: [],
          executeOnDelegate: false
        },
        awsSdkClientBackOffStrategyOverride: {
          type: BackOffStrategy.FixedDelayBackoffStrategy,
          spec: {
            fixedBackoff: 300,
            retryCount: 3
          }
        }
      })
    )
  })

  test('it should display correct input fields when Equal Jitter is selected', async () => {
    const connector: ConnectorInfoDTO = {
      name: 'AWS Backoff Connector',
      identifier: 'AWS_Backoff_Connector',
      description: '',
      orgIdentifier: 'testOrg',
      projectIdentifier: 'testProject',
      tags: {},
      type: 'Aws',
      spec: {
        credential: {
          crossAccountAccess: null,
          type: 'ManualConfig',
          spec: { accessKey: 'abcdefghi', accessKeyRef: null, secretKeyRef: 'testSecretRef' },
          region: 'us-east-1'
        },
        delegateSelectors: [],
        executeOnDelegate: false
      }
    }
    const { container } = renderComponent({
      ...commonProps,
      connectorInfo: connector
    })

    const equalJitterOption = screen.getByText('connectors.aws.equalJitter')
    expect(equalJitterOption).toBeInTheDocument()
    expect(equalJitterOption.parentElement?.parentElement).not.toHaveClass('Card--selected')

    // Equal Jitter
    await userEvent.click(equalJitterOption)
    expect(equalJitterOption.parentElement?.parentElement).toHaveClass('Card--selected')
    // Base Delay
    const baseDelayInput = queryByNameAttribute('baseDelay', container) as HTMLInputElement
    expect(baseDelayInput).toBeInTheDocument()
    expect(baseDelayInput.value).toBe('0')
    await userEvent.clear(baseDelayInput)
    await userEvent.type(baseDelayInput, '200')
    // Max Backoff Time
    const maxBackoffTimeInput = queryByNameAttribute('maxBackoffTime', container) as HTMLInputElement
    expect(maxBackoffTimeInput).toBeInTheDocument()
    expect(maxBackoffTimeInput.value).toBe('0')
    await userEvent.clear(maxBackoffTimeInput)
    await userEvent.type(maxBackoffTimeInput, '300')
    // Retry Count
    const retryCountInput = queryByNameAttribute('retryCount', container) as HTMLInputElement
    expect(retryCountInput).toBeInTheDocument()
    expect(retryCountInput.value).toBe('0')
    await userEvent.clear(retryCountInput)
    await userEvent.type(retryCountInput, '2')

    const continueBtn = screen.getByText('continue')
    expect(continueBtn).toBeInTheDocument()
    await userEvent.click(continueBtn)
    await waitFor(() => expect(nextStepFn).toHaveBeenCalledTimes(1))
    expect(nextStepFn).toHaveBeenCalledWith({
      name: 'AWS Backoff Connector',
      identifier: 'AWS_Backoff_Connector',
      description: '',
      orgIdentifier: 'testOrg',
      projectIdentifier: 'testProject',
      tags: {},
      type: 'Aws',
      spec: {
        credential: {
          crossAccountAccess: null,
          type: 'ManualConfig',
          spec: { accessKey: 'abcdefghi', accessKeyRef: null, secretKeyRef: 'testSecretRef' },
          region: 'us-east-1'
        },
        delegateSelectors: [],
        executeOnDelegate: false
      },
      awsSdkClientBackOffStrategyOverride: {
        type: BackOffStrategy.EqualJitterBackoffStrategy,
        spec: {
          baseDelay: 200,
          maxBackoffTime: 300,
          retryCount: 2
        }
      }
    })
  })

  test('it should display correct input fields when Full Jitter is selected', async () => {
    const connector: ConnectorInfoDTO = {
      name: 'AWS Backoff Connector',
      identifier: 'AWS_Backoff_Connector',
      description: '',
      orgIdentifier: 'testOrg',
      projectIdentifier: 'testProject',
      tags: {},
      type: 'Aws',
      spec: {
        credential: {
          crossAccountAccess: null,
          type: 'ManualConfig',
          spec: { accessKey: 'abcdefghi', accessKeyRef: null, secretKeyRef: 'testSecretRef' },
          region: 'us-east-1'
        },
        delegateSelectors: [],
        executeOnDelegate: false
      }
    }
    const { container } = renderComponent({
      ...commonProps,
      connectorInfo: connector
    })

    const fullJitterOption = screen.getByText('connectors.aws.fullJitter')
    expect(fullJitterOption).toBeInTheDocument()
    expect(fullJitterOption.parentElement?.parentElement).not.toHaveClass('Card--selected')

    // Full Jitter
    await userEvent.click(fullJitterOption)
    expect(fullJitterOption.parentElement?.parentElement).toHaveClass('Card--selected')
    // Base Delay
    const baseDelayInput = queryByNameAttribute('baseDelay', container) as HTMLInputElement
    expect(baseDelayInput).toBeInTheDocument()
    expect(baseDelayInput.value).toBe('0')
    await userEvent.clear(baseDelayInput)
    await userEvent.type(baseDelayInput, '400')
    // Max Backoff Time
    const maxBackoffTimeInput = queryByNameAttribute('maxBackoffTime', container) as HTMLInputElement
    expect(maxBackoffTimeInput).toBeInTheDocument()
    expect(maxBackoffTimeInput.value).toBe('0')
    await userEvent.clear(maxBackoffTimeInput)
    await userEvent.type(maxBackoffTimeInput, '600')
    // Retry Count
    const retryCountInput = queryByNameAttribute('retryCount', container) as HTMLInputElement
    expect(retryCountInput).toBeInTheDocument()
    expect(retryCountInput.value).toBe('0')
    await userEvent.clear(retryCountInput)
    await userEvent.type(retryCountInput, '4')

    const continueBtn = screen.getByText('continue')
    expect(continueBtn).toBeInTheDocument()
    await userEvent.click(continueBtn)
    await waitFor(() => expect(nextStepFn).toHaveBeenCalledTimes(1))
    expect(nextStepFn).toHaveBeenCalledWith({
      name: 'AWS Backoff Connector',
      identifier: 'AWS_Backoff_Connector',
      description: '',
      orgIdentifier: 'testOrg',
      projectIdentifier: 'testProject',
      tags: {},
      type: 'Aws',
      spec: {
        credential: {
          crossAccountAccess: null,
          type: 'ManualConfig',
          spec: { accessKey: 'abcdefghi', accessKeyRef: null, secretKeyRef: 'testSecretRef' },
          region: 'us-east-1'
        },
        delegateSelectors: [],
        executeOnDelegate: false
      },
      awsSdkClientBackOffStrategyOverride: {
        type: BackOffStrategy.FullJitterBackoffStrategy,
        spec: {
          baseDelay: 400,
          maxBackoffTime: 600,
          retryCount: 4
        }
      }
    })
  })

  test('it should have backoff strategy pre-selected when components is rendered as part of EDIT flow', async () => {
    const connector: ConnectorInfoDTO = {
      name: 'AWS Backoff Connector',
      identifier: 'AWS_Backoff_Connector',
      description: '',
      orgIdentifier: 'testOrg',
      projectIdentifier: 'testProject',
      tags: {},
      type: 'Aws',
      spec: {
        credential: {
          crossAccountAccess: null,
          type: 'ManualConfig',
          spec: { accessKey: 'abcdefghi', accessKeyRef: null, secretKeyRef: 'testSecretRef' },
          region: 'us-east-1'
        },
        awsSdkClientBackOffStrategyOverride: {
          type: BackOffStrategy.EqualJitterBackoffStrategy,
          spec: { baseDelay: 200, maxBackoffTime: 400, retryCount: 4 }
        },
        delegateSelectors: [],
        executeOnDelegate: false
      }
    }

    const { container } = renderComponent({
      ...commonProps,
      isEditMode: true,
      connectorInfo: connector
    })

    const fixedDelayOption = screen.getByText('connectors.aws.fixedDelay')
    expect(fixedDelayOption).toBeInTheDocument()
    expect(fixedDelayOption.parentElement?.parentElement).not.toHaveClass('Card--selected')

    const equalJitterOption = screen.getByText('connectors.aws.equalJitter')
    expect(equalJitterOption).toBeInTheDocument()
    await waitFor(() => expect(equalJitterOption.parentElement?.parentElement).toHaveClass('Card--selected'))

    const fullJitterOption = screen.getByText('connectors.aws.fullJitter')
    expect(fullJitterOption).toBeInTheDocument()
    expect(fullJitterOption.parentElement?.parentElement).not.toHaveClass('Card--selected')

    // Equal Jitter

    // Base Delay
    const baseDelayInput = queryByNameAttribute('baseDelay', container) as HTMLInputElement
    expect(baseDelayInput).toBeInTheDocument()
    expect(baseDelayInput.value).toBe('200')
    // Max Backoff Time
    const maxBackoffTimeInput = queryByNameAttribute('maxBackoffTime', container) as HTMLInputElement
    expect(maxBackoffTimeInput).toBeInTheDocument()
    expect(maxBackoffTimeInput.value).toBe('400')
    // Retry Count
    const retryCountInput = queryByNameAttribute('retryCount', container) as HTMLInputElement
    expect(retryCountInput).toBeInTheDocument()
    expect(retryCountInput.value).toBe('4')

    const continueBtn = screen.getByText('continue')
    expect(continueBtn).toBeInTheDocument()
    await userEvent.click(continueBtn)
    await waitFor(() => expect(nextStepFn).toHaveBeenCalledTimes(1))
    expect(nextStepFn).toHaveBeenCalledWith({
      description: '',
      identifier: 'AWS_Backoff_Connector',
      name: 'AWS Backoff Connector',
      orgIdentifier: 'testOrg',
      projectIdentifier: 'testProject',
      tags: {},
      type: 'Aws',
      awsSdkClientBackOffStrategyOverride: {
        type: BackOffStrategy.EqualJitterBackoffStrategy,
        spec: {
          baseDelay: 200,
          maxBackoffTime: 400,
          retryCount: 4
        }
      },
      spec: {
        credential: {
          crossAccountAccess: null,
          type: 'ManualConfig',
          spec: { accessKey: 'abcdefghi', accessKeyRef: null, secretKeyRef: 'testSecretRef' },
          region: 'us-east-1'
        },
        awsSdkClientBackOffStrategyOverride: {
          type: BackOffStrategy.EqualJitterBackoffStrategy,
          spec: {
            baseDelay: 200,
            maxBackoffTime: 400,
            retryCount: 4
          }
        },
        delegateSelectors: [],
        executeOnDelegate: false
      }
    })
  })

  test('it should unselect backoff strategy if pre-selected strategy is clicked', async () => {
    const connector: ConnectorInfoDTO = {
      name: 'AWS Backoff Connector',
      identifier: 'AWS_Backoff_Connector',
      description: '',
      orgIdentifier: 'testOrg',
      projectIdentifier: 'testProject',
      tags: {},
      type: 'Aws',
      spec: {
        credential: {
          crossAccountAccess: null,
          type: 'ManualConfig',
          spec: { accessKey: 'abcdefghi', accessKeyRef: null, secretKeyRef: 'testSecretRef' },
          region: 'us-east-1'
        },
        awsSdkClientBackOffStrategyOverride: {
          type: BackOffStrategy.EqualJitterBackoffStrategy,
          spec: { baseDelay: 200, maxBackoffTime: 400, retryCount: 4 }
        },
        delegateSelectors: [],
        executeOnDelegate: false
      }
    }

    renderComponent({
      ...commonProps,
      isEditMode: true,
      connectorInfo: connector
    })

    const fixedDelayOption = screen.getByText('connectors.aws.fixedDelay')
    expect(fixedDelayOption).toBeInTheDocument()
    expect(fixedDelayOption.parentElement?.parentElement).not.toHaveClass('Card--selected')

    const equalJitterOption = screen.getByText('connectors.aws.equalJitter')
    expect(equalJitterOption).toBeInTheDocument()
    await waitFor(() => expect(equalJitterOption.parentElement?.parentElement).toHaveClass('Card--selected'))

    const fullJitterOption = screen.getByText('connectors.aws.fullJitter')
    expect(fullJitterOption).toBeInTheDocument()
    expect(fullJitterOption.parentElement?.parentElement).not.toHaveClass('Card--selected')

    // Unselect Equal Jitter
    await userEvent.click(equalJitterOption)
    await waitFor(() => expect(equalJitterOption.parentElement?.parentElement).not.toHaveClass('Card--selected'))

    const continueBtn = screen.getByText('continue')
    expect(continueBtn).toBeInTheDocument()
    await userEvent.click(continueBtn)
    await waitFor(() => expect(nextStepFn).toHaveBeenCalledTimes(1))
    expect(nextStepFn).toHaveBeenCalledWith({
      description: '',
      identifier: 'AWS_Backoff_Connector',
      name: 'AWS Backoff Connector',
      orgIdentifier: 'testOrg',
      projectIdentifier: 'testProject',
      tags: {},
      type: 'Aws',
      spec: {
        credential: {
          crossAccountAccess: null,
          type: 'ManualConfig',
          spec: { accessKey: 'abcdefghi', accessKeyRef: null, secretKeyRef: 'testSecretRef' },
          region: 'us-east-1'
        },
        awsSdkClientBackOffStrategyOverride: {
          type: BackOffStrategy.EqualJitterBackoffStrategy,
          spec: {
            baseDelay: 200,
            maxBackoffTime: 400,
            retryCount: 4
          }
        },
        delegateSelectors: [],
        executeOnDelegate: false
      }
    })
  })

  test('it should have backoff strategy selected which is same as mentioned in prevStepData', async () => {
    const connector: ConnectorInfoDTO = {
      name: 'AWS Backoff Connector',
      identifier: 'AWS_Backoff_Connector',
      description: '',
      orgIdentifier: 'testOrg',
      projectIdentifier: 'testProject',
      tags: {},
      type: 'Aws',
      spec: {
        credential: {
          crossAccountAccess: null,
          type: 'ManualConfig',
          spec: { accessKey: 'abcdefghi', accessKeyRef: null, secretKeyRef: 'testSecretRef' },
          region: 'us-east-1'
        },
        awsSdkClientBackOffStrategyOverride: {
          type: BackOffStrategy.EqualJitterBackoffStrategy,
          spec: { baseDelay: 200, maxBackoffTime: 400, retryCount: 4 }
        },
        delegateSelectors: [],
        executeOnDelegate: false
      }
    }

    const prevStepData: StepBackOffStrategyProps = {
      name: 'AWS Backoff Connector',
      identifier: 'AWS_Backoff_Connector',
      description: '',
      orgIdentifier: 'testOrg',
      projectIdentifier: 'testProject',
      tags: {},
      type: 'Aws',
      spec: {
        credential: {
          crossAccountAccess: null,
          type: 'ManualConfig',
          spec: { accessKey: 'abcdefghi', accessKeyRef: null, secretKeyRef: 'testSecretRef' },
          region: 'us-east-1'
        },
        delegateSelectors: [],
        executeOnDelegate: false
      },
      awsSdkClientBackOffStrategyOverride: {
        type: BackOffStrategy.FullJitterBackoffStrategy,
        spec: { baseDelay: 200, maxBackoffTime: 400, retryCount: 4 }
      }
    }

    renderComponent({
      ...commonProps,
      isEditMode: true,
      connectorInfo: connector,
      prevStepData: prevStepData
    })

    const fixedDelayOption = screen.getByText('connectors.aws.fixedDelay')
    expect(fixedDelayOption).toBeInTheDocument()
    expect(fixedDelayOption.parentElement?.parentElement).not.toHaveClass('Card--selected')

    const equalJitterOption = screen.getByText('connectors.aws.equalJitter')
    expect(equalJitterOption).toBeInTheDocument()
    expect(equalJitterOption.parentElement?.parentElement).not.toHaveClass('Card--selected')

    const fullJitterOption = screen.getByText('connectors.aws.fullJitter')
    expect(fullJitterOption).toBeInTheDocument()
    await waitFor(() => expect(fullJitterOption.parentElement?.parentElement).toHaveClass('Card--selected'))

    const continueBtn = screen.getByText('continue')
    expect(continueBtn).toBeInTheDocument()
    await userEvent.click(continueBtn)
    await waitFor(() => expect(nextStepFn).toHaveBeenCalledTimes(1))
    expect(nextStepFn).toHaveBeenCalledWith({
      description: '',
      identifier: 'AWS_Backoff_Connector',
      name: 'AWS Backoff Connector',
      orgIdentifier: 'testOrg',
      projectIdentifier: 'testProject',
      tags: {},
      type: 'Aws',
      awsSdkClientBackOffStrategyOverride: {
        type: BackOffStrategy.FullJitterBackoffStrategy,
        spec: {
          baseDelay: 200,
          maxBackoffTime: 400,
          retryCount: 4
        }
      },
      spec: {
        credential: {
          crossAccountAccess: null,
          type: 'ManualConfig',
          spec: { accessKey: 'abcdefghi', accessKeyRef: null, secretKeyRef: 'testSecretRef' },
          region: 'us-east-1'
        },
        delegateSelectors: [],
        executeOnDelegate: false
      }
    })
  })

  test('it should call previousStep function with correct arguments when Back button is clicked', async () => {
    const connector: ConnectorInfoDTO = {
      name: 'AWS Backoff Connector',
      identifier: 'AWS_Backoff_Connector',
      description: '',
      orgIdentifier: 'testOrg',
      projectIdentifier: 'testProject',
      tags: {},
      type: 'Aws',
      spec: {
        credential: {
          crossAccountAccess: null,
          type: 'ManualConfig',
          spec: { accessKey: 'abcdefghi', accessKeyRef: null, secretKeyRef: 'testSecretRef' },
          region: 'us-east-1'
        },
        awsSdkClientBackOffStrategyOverride: {
          type: BackOffStrategy.EqualJitterBackoffStrategy,
          spec: { baseDelay: 200, maxBackoffTime: 400, retryCount: 4 }
        },
        delegateSelectors: [],
        executeOnDelegate: false
      }
    }

    const prevStepData: StepBackOffStrategyProps = {
      name: 'AWS Backoff Connector',
      identifier: 'AWS_Backoff_Connector',
      description: '',
      orgIdentifier: 'testOrg',
      projectIdentifier: 'testProject',
      tags: {},
      type: 'Aws',
      spec: {
        credential: {
          crossAccountAccess: null,
          type: 'ManualConfig',
          spec: { accessKey: 'abcdefghi', accessKeyRef: null, secretKeyRef: 'testSecretRef' },
          region: 'us-east-1'
        },
        delegateSelectors: [],
        executeOnDelegate: false
      },
      awsSdkClientBackOffStrategyOverride: {
        type: BackOffStrategy.FullJitterBackoffStrategy,
        spec: { baseDelay: 200, maxBackoffTime: 400, retryCount: 4 }
      }
    }

    renderComponent({
      ...commonProps,
      isEditMode: true,
      connectorInfo: connector,
      prevStepData: prevStepData
    })

    const fixedDelayOption = screen.getByText('connectors.aws.fixedDelay')
    expect(fixedDelayOption).toBeInTheDocument()
    expect(fixedDelayOption.parentElement?.parentElement).not.toHaveClass('Card--selected')

    const equalJitterOption = screen.getByText('connectors.aws.equalJitter')
    expect(equalJitterOption).toBeInTheDocument()
    expect(equalJitterOption.parentElement?.parentElement).not.toHaveClass('Card--selected')

    const fullJitterOption = screen.getByText('connectors.aws.fullJitter')
    expect(fullJitterOption).toBeInTheDocument()
    await waitFor(() => expect(fullJitterOption.parentElement?.parentElement).toHaveClass('Card--selected'))

    const backBtn = screen.getByText('back')
    expect(backBtn).toBeInTheDocument()
    await userEvent.click(backBtn)
    await waitFor(() => expect(previousStepFn).toHaveBeenCalledTimes(1))
    expect(previousStepFn).toHaveBeenCalledWith(prevStepData)
  })
})
