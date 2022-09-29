/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvServices from 'services/cv'
import * as cdServices from 'services/cd-ng'
import * as useFeatureFlagMock from '@common/hooks/useFeatureFlag'
import { CustomHealthSource } from '../CustomHealthSource'
import {
  emptyCustomMetricData,
  sourceData,
  sourceDataWithValidMetric,
  sourceDataWithValidMetricPopupMock
} from './CustomHealthSource.mock'

jest.mock('@common/components/NameIdDescriptionTags/NameIdDescriptionTags', () => ({
  ...(jest.requireActual('@common/components/NameIdDescriptionTags/NameIdDescriptionTags') as any),
  NameId: function Mock() {
    return <div className="mockNameId" />
  }
}))
describe('Verify CustomHealthSource', () => {
  beforeAll(() => {
    const getSampleData = jest.fn()
    jest
      .spyOn(cvServices, 'useFetchSampleData')
      .mockImplementation(() => ({ loading: false, error: null, mutate: getSampleData } as any))
    jest
      .spyOn(cvServices, 'useFetchParsedSampleData')
      .mockImplementation(() => ({ loading: false, error: null, mutate: jest.fn() } as any))
    jest
      .spyOn(cdServices, 'useGetConnector')
      .mockImplementation(() => ({ loading: false, error: null, data: {} } as any))
    jest
      .spyOn(cvServices, 'useGetMetricPacks')
      .mockImplementation(() => ({ loading: false, error: null, data: {}, refetch: getSampleData } as any))
  })

  test('should render CustomHealthSource', () => {
    const onSubmit = jest.fn()
    const { container } = render(
      <TestWrapper>
        <CustomHealthSource data={sourceData} onSubmit={onSubmit} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  describe('Metric thresholds', () => {
    beforeAll(() => {
      jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(true)
    })
    test('should render metric thresholds', () => {
      jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(true)
      const onSubmit = jest.fn()
      render(
        <TestWrapper>
          <CustomHealthSource data={sourceDataWithValidMetric} onSubmit={onSubmit} />
        </TestWrapper>
      )

      expect(screen.getByText('cv.monitoringSources.appD.ignoreThresholds (1)')).toBeInTheDocument()
      expect(screen.getByText('cv.monitoringSources.appD.failFastThresholds (1)')).toBeInTheDocument()
      const addButton = screen.getByTestId('AddThresholdButton')

      expect(addButton).toBeInTheDocument()

      fireEvent.click(addButton)

      expect(screen.getByText('cv.monitoringSources.appD.ignoreThresholds (2)')).toBeInTheDocument()

      expect(screen.getByText(/submit/)).toBeInTheDocument()

      act(() => {
        fireEvent.click(screen.getByText(/submit/))
      })
    })

    test('should not render metric thresholds when feature flag is turned off', () => {
      jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(false)
      render(
        <TestWrapper>
          <CustomHealthSource data={sourceData} onSubmit={jest.fn()} />
        </TestWrapper>
      )

      expect(screen.queryByText('cv.monitoringSources.appD.ignoreThresholds (0)')).not.toBeInTheDocument()
      expect(screen.queryByText('cv.monitoringSources.appD.failFastThresholds (0)')).not.toBeInTheDocument()
    })

    test('should not render metric thresholds when there is no custom metric', () => {
      jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(true)
      render(
        <TestWrapper>
          <CustomHealthSource data={emptyCustomMetricData} onSubmit={jest.fn()} />
        </TestWrapper>
      )

      expect(screen.queryByText('cv.monitoringSources.appD.ignoreThresholds (0)')).not.toBeInTheDocument()
      expect(screen.queryByText('cv.monitoringSources.appD.failFastThresholds (0)')).not.toBeInTheDocument()
    })

    test('should prompt when custom metric having metric threshold is being deleted', async () => {
      jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(true)
      const onSubmit = jest.fn()
      const { container } = render(
        <TestWrapper>
          <CustomHealthSource data={sourceDataWithValidMetricPopupMock} onSubmit={onSubmit} />
        </TestWrapper>
      )

      expect(screen.getByText('cv.monitoringSources.appD.ignoreThresholds (1)')).toBeInTheDocument()
      expect(screen.getByText('cv.monitoringSources.appD.failFastThresholds (1)')).toBeInTheDocument()

      const deleteButton = container.querySelectorAll('span[data-icon="main-delete"]')[1]

      act(() => {
        userEvent.click(deleteButton)
      })

      expect(document.body.querySelector('[class*="useConfirmationDialog"]')).toBeDefined()

      const modalDeleteBtn = screen.queryAllByText('confirm')[0]
      act(() => {
        userEvent.click(modalDeleteBtn!)
      })

      await waitFor(() => {
        expect(document.body.innerHTML).not.toContain('useConfirmationDialog')
      })

      expect(screen.getByText('cv.monitoringSources.appD.ignoreThresholds (0)')).toBeInTheDocument()
    })
  })
})
