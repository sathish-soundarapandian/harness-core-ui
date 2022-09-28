import React from 'react'
import { Container, Formik, FormikForm } from '@harness/uicore'
import { fireEvent, render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { formikInitialValues } from '@cv/pages/health-source/connectors/AppDynamics/Components/AppDMetricThreshold/__tests__/AppDMetricThreshold.mock'
import AppDMetricThresholdTab from '../AppDMetricThresholdTab'

jest.mock('../AppDIgnoreThresholdTabContent', () => () => <Container data-testid="AppDIgnoreThresholdTabContent" />)
jest.mock('../AppDFailFastThresholdTabContent', () => () => <Container data-testid="AppDFailFastThresholdTabContent" />)

describe('AppDMetricThresholdTab', () => {
  test('should render the component by selecting Ignore threshold by default', () => {
    render(
      <TestWrapper>
        <Formik initialValues={formikInitialValues} onSubmit={jest.fn()} formName="appDHealthSourceform">
          <FormikForm>
            <AppDMetricThresholdTab />
          </FormikForm>
        </Formik>
      </TestWrapper>
    )

    expect(screen.getByTestId('AppDIgnoreThresholdTabContent')).toBeInTheDocument()
    expect(screen.queryByTestId('AppDFailFastThresholdTabContent')).not.toBeInTheDocument()
    expect(screen.getByText('cv.monitoringSources.appD.ignoreThresholds (1)')).toBeInTheDocument()

    fireEvent.click(screen.getByText(/cv.monitoringSources.appD.failFastThresholds/))

    expect(screen.getByText('cv.monitoringSources.appD.failFastThresholds (1)')).toBeInTheDocument()
    expect(screen.queryByTestId('AppDIgnoreThresholdTabContent')).not.toBeInTheDocument()
    expect(screen.getByTestId('AppDFailFastThresholdTabContent')).toBeInTheDocument()
  })
})
