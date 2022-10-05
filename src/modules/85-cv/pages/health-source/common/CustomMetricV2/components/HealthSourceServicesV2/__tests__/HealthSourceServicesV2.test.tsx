import React from 'react'
import { Formik } from 'formik'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import HealthSourceServicesV2 from '..'
import { CustomMetricsV2HelperContext } from '../../../CustomMetricV2.constants'

describe('AppDIgnoreThresholdTabContent', () => {
  test('should render the component', () => {
    const { container } = render(
      <TestWrapper>
        <Formik initialValues={{ selectedCustomMetricIndex: 0 }} onSubmit={() => Promise.resolve()}>
          <CustomMetricsV2HelperContext.Provider
            value={{
              groupedCreatedMetrics: {},
              metricPacksResponse: {
                data: { resource: [] },
                loading: false,
                cancel: () => null,
                error: null,
                absolutePath: '',
                refetch: () => Promise.resolve(),
                response: null
              }
            }}
          >
            <HealthSourceServicesV2 />
          </CustomMetricsV2HelperContext.Provider>
        </Formik>
      </TestWrapper>
    )

    const sliCheckbox = container.querySelector('input[name="customMetrics.0.sli.enabled"]')
    const serviceHealthCheckbox = container.querySelector(
      'input[name="customMetrics.0.analysis.liveMonitoring.enabled"]'
    )
    const cvCheckbox = container.querySelector('input[name="customMetrics.0.analysis.deploymentVerification.enabled"]')

    expect(sliCheckbox).toBeInTheDocument()
    expect(serviceHealthCheckbox).toBeInTheDocument()
    expect(cvCheckbox).toBeInTheDocument()
  })
})
