import React from 'react'
import { Formik } from 'formik'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CustomMetricV2 from '../CustomMetricV2'
import type { CommonCustomMetricsType } from '../CustomMetric.types'

describe('CustomMetricV2', () => {
  test('should render the add custom metric button, even if we dont have custom metrics value passed', () => {
    render(
      <TestWrapper>
        <Formik onSubmit={() => Promise.resolve()} initialValues={null as unknown as Record<string, string>}>
          <CustomMetricV2 headingText="test" newCustomMetricDefaultValues={{} as CommonCustomMetricsType}>
            hello
          </CustomMetricV2>
        </Formik>
      </TestWrapper>
    )

    expect(screen.getByText('cv.healthSource.connectors.customMetricsWithoutOptional')).toBeInTheDocument()
  })
})
