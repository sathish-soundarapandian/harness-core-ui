/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { cloneDeep } from 'lodash-es'
import userEvent from '@testing-library/user-event'
import { Classes } from '@blueprintjs/core'
import * as cvServices from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import { DeploymentProgressAndNodes, DeploymentProgressAndNodesProps } from '../DeploymentProgressAndNodes'
import { BaselineDeploymentMockData } from './DeploymentProgressAndNodes.mock'

const showError = jest.fn()

jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  useToaster: jest.fn(() => ({ showError }))
}))

const CanaryDeploymentMockData: DeploymentProgressAndNodesProps = {
  data: {
    spec: {
      analysedServiceIdentifier: 'sumo_service_v2',
      analysedEnvIdentifier: 'sumo_env_v2',
      monitoredServiceType: 'DEFAULT',
      monitoredServiceIdentifier: 'KQE5GbbKTD6w39T6_jwUog',
      analysisType: 'BLUE_GREEN',
      sensitivity: 'HIGH',
      durationInMinutes: 5,
      isFailOnNoAnalysis: false
    },
    appliedDeploymentAnalysisType: 'CANARY',
    verificationStatus: 'VERIFICATION_PASSED',
    verificationProgressPercentage: 100,
    verificationStartTimestamp: 1674145324888,
    testNodes: {
      nodeType: 'POST_DEPLOYMENT',
      nodes: [
        {
          type: 'DEPLOYMENT_NODE',
          nodeIdentifier: 'Ansuman Satapathy.3c061712-021c-4dcb-a6aa-159fb7c46f02',
          verificationResult: 'PASSED',
          failedMetrics: 0,
          failedLogClusters: 0
        }
      ]
    },
    controlNodes: {
      nodeType: 'PRE_DEPLOYMENT',
      nodes: [
        {
          type: 'DEPLOYMENT_NODE',
          nodeIdentifier: 'Ansuman Satapathy.3c061712-021c-4dcb-a6aa-159fb7c46f02'
        }
      ]
    },
    metricsAnalysis: {
      healthy: 1,
      warning: 0,
      unhealthy: 0,
      noAnalysis: 0
    },
    logClusters: {
      knownClustersCount: 0,
      unknownClustersCount: 0,
      unexpectedFrequencyClustersCount: 0
    },
    errorClusters: {
      knownClustersCount: 0,
      unknownClustersCount: 0,
      unexpectedFrequencyClustersCount: 0
    }
  },
  className: 'ExecutionVerificationSummary-module_details_xcmdgQ',
  isConsoleView: true
}

describe('Deployment progress and nodes unit tests', () => {
  beforeEach(() => {
    Element.prototype.getBoundingClientRect = jest.fn(() => {
      return {
        width: 500,
        height: 1000,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
      } as any
    })
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  afterAll(() => {
    jest.resetAllMocks()
  })
  test('Ensure baseline info is rendered with green bar', async () => {
    const { container } = render(
      <TestWrapper>
        <DeploymentProgressAndNodes {...BaselineDeploymentMockData} />
      </TestWrapper>
    )

    expect(container.querySelector('[class*="bp3-intent-success"]'))
    expect(container.querySelector(`.${Classes.PROGRESS_METER}`)?.getAttribute('style')).toEqual('width: 100%;')
  })
  test('Ensure production info for a canary deeployment is rendered with green bar', async () => {
    const { container } = render(
      <TestWrapper>
        <DeploymentProgressAndNodes {...CanaryDeploymentMockData} />
      </TestWrapper>
    )
    expect(container.querySelector('[class*="bp3-intent-danger"]'))
    expect(container.querySelector(`.${Classes.PROGRESS_METER}`)?.getAttribute('style')).toEqual('width: 100%;')

    const deploymentNodes = container.querySelectorAll('[class~="hexagon"]')
    expect(deploymentNodes.length).toBe(2)
  })

  test('Ensure node selection works', async () => {
    const onSelectMock = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <DeploymentProgressAndNodes {...CanaryDeploymentMockData} onSelectNode={onSelectMock} />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('AFTER')).not.toBeNull())
    fireEvent.click(container.querySelector('[class*="canaryNodes"] [class~="hexagonContainer"]')!)
    await waitFor(() =>
      expect(onSelectMock).toHaveBeenLastCalledWith({
        failedLogClusters: 0,
        failedMetrics: 0,
        nodeIdentifier: 'Ansuman Satapathy.3c061712-021c-4dcb-a6aa-159fb7c46f02',
        type: 'DEPLOYMENT_NODE',
        verificationResult: 'PASSED'
      })
    )
    expect(container.querySelector('[class*="hexagonContainer"] [class*="selected"]')).not.toBeNull()

    // when on select callback is not passed make sure hexagon is not selected
    const { container: container2 } = render(
      <TestWrapper>
        <DeploymentProgressAndNodes {...CanaryDeploymentMockData} />
      </TestWrapper>
    )

    fireEvent.click(container2.querySelector('[class~="hexagonContainer"]')!)
    await waitFor(() => expect(container2.querySelector('[class*="hexagonContainer"][class*="selected"]')).toBeNull())
  })

  test('Ensure that correct messaging is displayed when progress is 0', async () => {
    const onSelectMock = jest.fn()
    const clonedMock = cloneDeep(CanaryDeploymentMockData)
    clonedMock.data!.verificationProgressPercentage = 0
    clonedMock.data!.verificationStatus = 'IN_PROGRESS'

    const { getByText } = render(
      <TestWrapper>
        <DeploymentProgressAndNodes {...clonedMock} onSelectNode={onSelectMock} />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('pipeline.verification.waitForAnalysis')).not.toBeNull())
  })

  test('should show nodes for rolling deployment type', () => {
    const { container, getByText } = render(
      <TestWrapper>
        <DeploymentProgressAndNodes {...CanaryDeploymentMockData} />
      </TestWrapper>
    )

    expect(getByText(/BEFORE/)).toBeInTheDocument()
    expect(getByText(/AFTER/)).toBeInTheDocument()
    const deploymentNodes = container.querySelectorAll('[class~="hexagon"]')
    expect(deploymentNodes.length).toBe(2)
  })

  describe('Baseline based verification', () => {
    test('Should not show pin baseline button when applicableForBaseline property is false in baseline overview', () => {
      render(
        <TestWrapper defaultFeatureFlagValues={{ SRM_ENABLE_BASELINE_BASED_VERIFICATION: true }}>
          <DeploymentProgressAndNodes {...BaselineDeploymentMockData} />
        </TestWrapper>
      )

      expect(screen.queryByTestId(/pinBaselineButton/)).not.toBeInTheDocument()
    })

    test('Should not render pin baseline button and status message when feature flag is disabled', () => {
      const baselinePropsWithData: DeploymentProgressAndNodesProps = {
        ...BaselineDeploymentMockData,
        data: {
          ...BaselineDeploymentMockData.data,
          baselineOverview: {
            applicableForBaseline: true,
            baseline: true
          }
        }
      }
      render(
        <TestWrapper>
          <DeploymentProgressAndNodes {...baselinePropsWithData} />
        </TestWrapper>
      )

      expect(screen.queryByTestId(/pinBaselineButton/)).not.toBeInTheDocument()
      expect(screen.queryByTestId(/baselineStatusMessage/)).not.toBeInTheDocument()
    })

    test('Should show pin baseline button when applicableForBaseline property is true in baseline overview', () => {
      const baselinePropsWithData: DeploymentProgressAndNodesProps = {
        ...BaselineDeploymentMockData,
        data: {
          ...BaselineDeploymentMockData.data,
          baselineOverview: {
            applicableForBaseline: true,
            baseline: true
          }
        }
      }
      render(
        <TestWrapper defaultFeatureFlagValues={{ SRM_ENABLE_BASELINE_BASED_VERIFICATION: true }}>
          <DeploymentProgressAndNodes {...baselinePropsWithData} />
        </TestWrapper>
      )

      expect(screen.getByTestId(/pinBaselineButton/)).toBeInTheDocument()
      expect(screen.getByTestId(/pinBaselineButton/)).toHaveTextContent('pinpipeline.verification.unpinBaseline')
    })

    test('Should show pin baseline button when applicableForBaseline property is true in baseline overview', async () => {
      const updateBaselineMock = jest.fn()
      jest.spyOn(cvServices, 'useUpdateBaseline1').mockReturnValue({
        mutate: updateBaselineMock,
        cancel: function (): void {
          throw new Error('Function not implemented.')
        },
        error: null,
        loading: false
      })
      const baselinePropsWithData: DeploymentProgressAndNodesProps = {
        ...BaselineDeploymentMockData,
        data: {
          ...BaselineDeploymentMockData.data,
          baselineOverview: {
            applicableForBaseline: true,
            baseline: false
          }
        }
      }
      render(
        <TestWrapper defaultFeatureFlagValues={{ SRM_ENABLE_BASELINE_BASED_VERIFICATION: true }}>
          <DeploymentProgressAndNodes {...baselinePropsWithData} />
        </TestWrapper>
      )

      const pinBaselineButton = screen.getByTestId(/pinBaselineButton/)

      expect(pinBaselineButton).toBeInTheDocument()
      expect(pinBaselineButton).toHaveTextContent('pinpipeline.verification.pinBaseline')

      await act(async () => {
        await userEvent.click(pinBaselineButton)
      })

      await waitFor(() => expect(updateBaselineMock).toHaveBeenCalledWith({ baseline: true }))
    })

    test('Should show error toast when update baseline API errors', async () => {
      const updateBaselineMock = jest.fn().mockReturnValue(Promise.reject())
      jest.spyOn(cvServices, 'useUpdateBaseline1').mockReturnValue({
        mutate: updateBaselineMock,
        cancel: function (): void {
          throw new Error('Function not implemented.')
        },
        error: {
          data: {
            message: 'Some error'
          },
          message: 'some error'
        },
        loading: false
      })
      const baselinePropsWithData: DeploymentProgressAndNodesProps = {
        ...BaselineDeploymentMockData,
        data: {
          ...BaselineDeploymentMockData.data,
          baselineOverview: {
            applicableForBaseline: true,
            baseline: false
          }
        }
      }
      render(
        <TestWrapper defaultFeatureFlagValues={{ SRM_ENABLE_BASELINE_BASED_VERIFICATION: true }}>
          <DeploymentProgressAndNodes {...baselinePropsWithData} />
        </TestWrapper>
      )

      const pinBaselineButton = screen.getByTestId(/pinBaselineButton/)

      await act(async () => {
        await userEvent.click(pinBaselineButton)
      })

      await waitFor(() => expect(updateBaselineMock).toHaveBeenCalledWith({ baseline: true }))
      await waitFor(() => expect(showError).toHaveBeenCalledWith('Some error'))
    })

    test('Should show confirmation modal when pin baseline button is clicked with already available baseline', async () => {
      const updateBaselineMock = jest.fn()
      jest.spyOn(cvServices, 'useUpdateBaseline1').mockReturnValue({
        mutate: updateBaselineMock,
        cancel: function (): void {
          throw new Error('Function not implemented.')
        },
        error: null,
        loading: false
      })
      const baselinePropsWithData: DeploymentProgressAndNodesProps = {
        ...BaselineDeploymentMockData,
        data: {
          ...BaselineDeploymentMockData.data,
          baselineOverview: {
            applicableForBaseline: true,
            baseline: false,
            baselineVerificationJobInstanceId: 'new'
          }
        }
      }
      render(
        <TestWrapper defaultFeatureFlagValues={{ SRM_ENABLE_BASELINE_BASED_VERIFICATION: true }}>
          <DeploymentProgressAndNodes {...baselinePropsWithData} />
        </TestWrapper>
      )

      const pinBaselineButton = screen.getByTestId(/pinBaselineButton/)

      expect(pinBaselineButton).toBeInTheDocument()
      expect(pinBaselineButton).toHaveTextContent('pinpipeline.verification.pinBaseline')

      await act(async () => {
        await userEvent.click(pinBaselineButton)
      })

      await waitFor(() => expect(updateBaselineMock).not.toHaveBeenCalled())

      const confimationButton = screen.getByTestId(/pinBaslineButton_confirmationButton/)

      await waitFor(() => expect(confimationButton).toBeInTheDocument())

      await act(async () => {
        await userEvent.click(confimationButton)
      })

      await waitFor(() => expect(updateBaselineMock).toHaveBeenCalledWith({ baseline: true }))
    })

    test('Should show confirmation modal when pin baseline button is clicked and cancel button click should not make any API call', async () => {
      const updateBaselineMock = jest.fn()
      jest.spyOn(cvServices, 'useUpdateBaseline1').mockReturnValue({
        mutate: updateBaselineMock,
        cancel: function (): void {
          throw new Error('Function not implemented.')
        },
        error: null,
        loading: false
      })
      const baselinePropsWithData: DeploymentProgressAndNodesProps = {
        ...BaselineDeploymentMockData,
        data: {
          ...BaselineDeploymentMockData.data,
          baselineOverview: {
            applicableForBaseline: true,
            baseline: false,
            baselineVerificationJobInstanceId: 'new'
          }
        }
      }
      render(
        <TestWrapper defaultFeatureFlagValues={{ SRM_ENABLE_BASELINE_BASED_VERIFICATION: true }}>
          <DeploymentProgressAndNodes {...baselinePropsWithData} />
        </TestWrapper>
      )

      const pinBaselineButton = screen.getByTestId(/pinBaselineButton/)

      expect(pinBaselineButton).toBeInTheDocument()
      expect(pinBaselineButton).toHaveTextContent('pinpipeline.verification.pinBaseline')

      await act(async () => {
        await userEvent.click(pinBaselineButton)
      })

      await waitFor(() => expect(updateBaselineMock).not.toHaveBeenCalled())

      const cancelButton = screen.getByTestId(/pinBaslineButton_cancelButton/)

      await waitFor(() => expect(cancelButton).toBeInTheDocument())

      await act(async () => {
        await userEvent.click(cancelButton)
      })

      await waitFor(() => expect(updateBaselineMock).not.toHaveBeenCalled())
    })

    test('Should not show confirmation modal when unpin baseline button is clicked with already available baseline', async () => {
      const updateBaselineMock = jest.fn()
      jest.spyOn(cvServices, 'useUpdateBaseline1').mockReturnValue({
        mutate: updateBaselineMock,
        cancel: function (): void {
          throw new Error('Function not implemented.')
        },
        error: null,
        loading: false
      })
      const baselinePropsWithData: DeploymentProgressAndNodesProps = {
        ...BaselineDeploymentMockData,
        data: {
          ...BaselineDeploymentMockData.data,
          baselineOverview: {
            applicableForBaseline: true,
            baseline: true,
            baselineVerificationJobInstanceId: 'new'
          }
        }
      }
      render(
        <TestWrapper defaultFeatureFlagValues={{ SRM_ENABLE_BASELINE_BASED_VERIFICATION: true }}>
          <DeploymentProgressAndNodes {...baselinePropsWithData} />
        </TestWrapper>
      )

      const pinBaselineButton = screen.getByTestId(/pinBaselineButton/)

      expect(pinBaselineButton).toBeInTheDocument()
      expect(pinBaselineButton).toHaveTextContent('pinpipeline.verification.unpinBaseline')

      await act(async () => {
        await userEvent.click(pinBaselineButton)
      })

      const confimationButton = screen.queryByTestId(/pinBaslineButton_confirmationButton/)
      expect(confimationButton).not.toBeInTheDocument()

      await waitFor(() => expect(updateBaselineMock).toHaveBeenCalledWith({ baseline: false }))
    })

    test('Should show passed baseline status message when verification is passed with baseline data', async () => {
      const baselinePropsWithData: DeploymentProgressAndNodesProps = {
        ...BaselineDeploymentMockData,
        data: {
          ...BaselineDeploymentMockData.data,
          baselineOverview: {
            applicableForBaseline: true,
            baseline: true,
            baselineVerificationJobInstanceId: 'new'
          }
        }
      }

      render(
        <TestWrapper defaultFeatureFlagValues={{ SRM_ENABLE_BASELINE_BASED_VERIFICATION: true }}>
          <DeploymentProgressAndNodes {...baselinePropsWithData} />
        </TestWrapper>
      )

      expect(screen.getByTestId(/baselineStatusMessage/)).toHaveTextContent(
        'pipeline.verification.baselineMessages.passed'
      )
    })

    test('Should show passed baseline status message when verification is passed with no baseline data', async () => {
      const baselinePropsWithData: DeploymentProgressAndNodesProps = {
        ...BaselineDeploymentMockData,
        data: {
          ...BaselineDeploymentMockData.data,
          baselineOverview: {
            applicableForBaseline: true,
            baseline: true
          }
        }
      }

      render(
        <TestWrapper defaultFeatureFlagValues={{ SRM_ENABLE_BASELINE_BASED_VERIFICATION: true }}>
          <DeploymentProgressAndNodes {...baselinePropsWithData} />
        </TestWrapper>
      )

      expect(screen.getByTestId(/baselineStatusMessage/)).toHaveTextContent(
        'pipeline.verification.baselineMessages.passedWithNoBaseline'
      )
    })

    test('Should show baseline expited message when baseline verification is expired', async () => {
      const baselinePropsWithData: DeploymentProgressAndNodesProps = {
        ...BaselineDeploymentMockData,
        data: {
          ...BaselineDeploymentMockData.data,
          baselineOverview: {
            applicableForBaseline: true,
            baseline: true,
            baselineExpired: true,
            baselineExpiryTimestamp: 1676545440000
          }
        }
      }

      render(
        <TestWrapper defaultFeatureFlagValues={{ SRM_ENABLE_BASELINE_BASED_VERIFICATION: true }}>
          <DeploymentProgressAndNodes {...baselinePropsWithData} />
        </TestWrapper>
      )

      expect(screen.getByTestId(/baselineStatusMessage/)).toHaveTextContent(
        'pipeline.verification.baselineMessages.expired'
      )
    })

    test('Should show verification failed message when verification is failed', () => {
      const baselinePropsWithData: DeploymentProgressAndNodesProps = {
        ...BaselineDeploymentMockData,

        data: {
          ...BaselineDeploymentMockData.data,
          verificationStatus: 'VERIFICATION_FAILED'
        }
      }

      render(
        <TestWrapper defaultFeatureFlagValues={{ SRM_ENABLE_BASELINE_BASED_VERIFICATION: true }}>
          <DeploymentProgressAndNodes {...baselinePropsWithData} />
        </TestWrapper>
      )

      expect(screen.getByTestId(/baselineStatusMessage/)).toHaveTextContent(
        'pipeline.verification.baselineMessages.failed'
      )
    })

    test('Should not show status message when no matching scenario is found', () => {
      const baselinePropsWithData: DeploymentProgressAndNodesProps = {
        ...BaselineDeploymentMockData,

        data: {
          ...BaselineDeploymentMockData.data,
          verificationStatus: 'ABORTED'
        }
      }

      render(
        <TestWrapper defaultFeatureFlagValues={{ SRM_ENABLE_BASELINE_BASED_VERIFICATION: true }}>
          <DeploymentProgressAndNodes {...baselinePropsWithData} />
        </TestWrapper>
      )

      expect(screen.queryByTestId(/baselineStatusMessage/)).not.toBeInTheDocument()
    })

    test('Should show dash (-) if deployment tag is null string value', () => {
      render(
        <TestWrapper defaultFeatureFlagValues={{ SRM_ENABLE_BASELINE_BASED_VERIFICATION: true }}>
          <DeploymentProgressAndNodes {...BaselineDeploymentMockData} />
        </TestWrapper>
      )

      expect(screen.getByTestId(/baselineTestName/)).toHaveTextContent('tag1')
      expect(screen.getByTestId(/currentTestName/)).toHaveTextContent('-')
    })
  })
})
