import React from 'react'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as useFeatureFlagMock from '@common/hooks/useFeatureFlag'
import { TestWrapper } from '@common/utils/testUtils'
import CloudWatch from '../CloudWatch'
import { mockDataTemplate, riskCategoryMock, sampleDataMockResponse } from './CloudWatch.mock'

jest.mock('services/cv', () => ({
  useGetRiskCategoryForCustomHealthMetric: jest.fn().mockImplementation(() => {
    return { loading: false, error: null, data: riskCategoryMock } as any
  }),
  useGetRegions: jest.fn().mockImplementation(() => {
    return { data: { data: ['region 1', 'region 2'] } } as any
  }),
  useGetSampleDataForQuery: jest.fn().mockImplementation(() => {
    return { data: { data: sampleDataMockResponse } } as any
  })
}))

describe('CloudWatchTemplates', () => {
  beforeAll(() => {
    jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(true)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('should render CloudWatch template elements if it is template', () => {
    const onSubmit = jest.fn()
    const { container } = render(
      <TestWrapper>
        <CloudWatch isTemplate data={mockDataTemplate} onSubmit={onSubmit} />
      </TestWrapper>
    )

    const assignAccordion = screen.getByText(/cv.monitoringSources.assign/)

    act(() => {
      userEvent.click(assignAccordion!)
    })

    const serviceInstancePathInput = container.querySelector(
      "input[name='customMetrics.0.responseMapping.serviceInstanceJsonPath']"
    )

    const expressionInput = container.querySelector("textarea[name='customMetrics.0.expression']")

    expect(serviceInstancePathInput).toBeDisabled()
    expect(serviceInstancePathInput).toHaveValue('<+input>')
    expect(expressionInput).toHaveValue('<+monitoredService.name>')

    act(() => {
      userEvent.click(screen.getByText('submit'))
    })

    expect(onSubmit).toHaveBeenCalled()
  })
})
