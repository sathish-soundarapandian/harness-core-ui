import React from 'react'
import { render, screen } from '@testing-library/react'
import * as cvService from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import DataInfoSelector from '../DataInfoSelector'

jest.mock('services/cv', () => ({
  useGetAllAwsRegions: jest.fn().mockImplementation(() => {
    return { data: null, loading: true } as any
  }),
  useGetPrometheusWorkspaces: jest.fn().mockImplementation(() => {
    return { data: null, loading: true } as any
  })
}))
describe('DataInfoSelector', () => {
  test('should test whether loading placeholder is being shown in dropdowns during API call in progress', () => {
    render(
      <TestWrapper>
        <DataInfoSelector />
      </TestWrapper>
    )

    expect(screen.getAllByPlaceholderText(/- loading -/)).toHaveLength(2)
  })

  test('should check all the dropdowns are disabled during edit', () => {
    const getAWSSpy = jest.spyOn(cvService, 'useGetAllAwsRegions')
    getAWSSpy.mockReturnValue({
      data: { data: ['region 1', 'region 2'] },
      loading: false,
      absolutePath: '',
      cancel: () => Promise.resolve(void 0),
      refetch: () => Promise.resolve(void 0),
      response: null,
      error: null
    })

    const getWorkspaceSpy = jest.spyOn(cvService, 'useGetPrometheusWorkspaces')
    getWorkspaceSpy.mockReturnValue({
      data: { data: [] },
      loading: false,
      absolutePath: '',
      cancel: () => Promise.resolve(void 0),
      refetch: () => Promise.resolve(void 0),
      response: null,
      error: null
    })

    render(
      <TestWrapper>
        <DataInfoSelector isEdit />
      </TestWrapper>
    )

    expect(
      screen.getByPlaceholderText(/- cv.healthSource.connectors.CloudWatch.awsSelectorPlaceholder -/)
    ).toBeDisabled()
    expect(screen.getByPlaceholderText(/- cv.healthSource.awsWorkspacePlaceholderText -/)).toBeDisabled()
  })
})
