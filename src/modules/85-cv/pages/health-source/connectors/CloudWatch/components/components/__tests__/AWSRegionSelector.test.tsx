import React from 'react'
import { render, screen } from '@testing-library/react'
import * as cvService from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import AWSRegionSelector from '../AWSRegionSelector'

describe('AWSRegionSelector', () => {
  test('should render the correct placeholder while loading', () => {
    jest.spyOn(cvService, 'useGetRegions').mockImplementation(
      () =>
        ({
          data: [],
          refetch: jest.fn(),
          error: null,
          loading: true
        } as any)
    )
    render(
      <TestWrapper>
        <AWSRegionSelector />
      </TestWrapper>
    )

    const regionDropdown = screen.getByPlaceholderText('- loading -')

    expect(regionDropdown).toBeInTheDocument()
  })

  test('should render the correct placeholder while data got fetched', () => {
    jest.spyOn(cvService, 'useGetRegions').mockImplementation(
      () =>
        ({
          data: ['region 1', 'region 2'],
          refetch: jest.fn(),
          error: null,
          loading: false
        } as any)
    )
    render(
      <TestWrapper>
        <AWSRegionSelector />
      </TestWrapper>
    )

    const regionDropdown = screen.getByPlaceholderText(
      '- cv.healthSource.connectors.CloudWatch.awsSelectorPlaceholder -'
    )

    expect(regionDropdown).toBeInTheDocument()
  })
})
