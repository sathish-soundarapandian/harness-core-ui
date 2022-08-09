import React from 'react'
import { Container, FormikForm, Formik } from '@harness/uicore'

import { fireEvent, render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import {
  formikInitialValues,
  PrometheusThresholdProps as MockPropValues
} from '../../../__tests__/PrometheusMetricThreshold.mock'
import PrometheusMetricThresholdTab from '../PrometheusMetricThresholdTab'
import { PrometheusMetricThresholdContext } from '../../../PrometheusMetricThresholdConstants'

jest.mock('../PrometheusIgnoreThresholdTabContent', () => () => (
  <Container data-testid="PrometheusIgnoreThresholdTabContent" />
))
jest.mock('../PrometheusFailFastThresholdTabContent', () => () => (
  <Container data-testid="PrometheusFailFastThresholdTabContent" />
))

describe('PrometheusMetricThresholdTab', () => {
  test('should render the component by selecting Ignore threshold by default', () => {
    render(
      <TestWrapper>
        <Formik initialValues={formikInitialValues} onSubmit={jest.fn()} formName="prometheusHealthSourceform">
          <FormikForm>
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <PrometheusMetricThresholdContext.Provider value={MockPropValues}>
              <PrometheusMetricThresholdTab />
            </PrometheusMetricThresholdContext.Provider>
          </FormikForm>
        </Formik>
      </TestWrapper>
    )

    expect(screen.getByTestId('PrometheusIgnoreThresholdTabContent')).toBeInTheDocument()
    expect(screen.queryByTestId('PrometheusFailFastThresholdTabContent')).not.toBeInTheDocument()
    expect(screen.getByText('cv.monitoringSources.appD.ignoreThresholds (1)')).toBeInTheDocument()

    fireEvent.click(screen.getByText(/cv.monitoringSources.appD.failFastThresholds/))

    expect(screen.getByText('cv.monitoringSources.appD.failFastThresholds (1)')).toBeInTheDocument()
    expect(screen.queryByTestId('PrometheusIgnoreThresholdTabContent')).not.toBeInTheDocument()
    expect(screen.getByTestId('PrometheusFailFastThresholdTabContent')).toBeInTheDocument()
  })
})
