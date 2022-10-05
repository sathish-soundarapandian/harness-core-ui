import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import useCustomMetricV2HelperContext from '../useCustomMetricV2HelperContext'
import { CustomMetricsV2HelperContext } from '../../CustomMetricV2.constants'
import type { CustomMetricsV2HelperContextType } from '../../CustomMetric.types'

const Wrapper = (): JSX.Element | null => {
  const value = useCustomMetricV2HelperContext()

  if (!value) {
    return null
  } else {
    return <>Hello</>
  }
}

describe('useCustomMetricV2HelperContext', () => {
  test('should throw error if the hook is not called within the correct context', () => {
    expect(() =>
      render(
        <TestWrapper>
          <CustomMetricsV2HelperContext.Provider value={undefined as unknown as CustomMetricsV2HelperContextType}>
            <Wrapper />
          </CustomMetricsV2HelperContext.Provider>
        </TestWrapper>
      )
    ).toThrow('useCustomMetricV2HelperContext must be used in scope of CustomMetricsV2HelperContext')
  })
})
