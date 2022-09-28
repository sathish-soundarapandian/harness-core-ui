import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { Formik, FormikForm, Utils } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvServices from 'services/cv'
import { splunkQueryPropsMock } from './SplunkMetricQueryViewer.mock'
import SplunkMetricsQueryViewer from '../SplunkMetricsQueryViewer'

const onChangeQueryMock = jest.fn()

const WrapperComponent = () => {
  return (
    <TestWrapper
      path="account/:accountId/cd/pipeline-studio/orgs/:orgIdentifier/projects/:projectIdentifier/pipelines/P1/ui/"
      pathParams={{
        identifier: 'dummy',
        accountId: 'account',
        orgIdentifier: 'org1',
        projectIdentifier: 'project1'
      }}
    >
      <Formik initialValues={{}} onSubmit={jest.fn()} formName="wrapperComponentTestForm">
        <FormikForm>
          <SplunkMetricsQueryViewer {...splunkQueryPropsMock} onChange={onChangeQueryMock} />
        </FormikForm>
      </Formik>
    </TestWrapper>
  )
}

const fetchSplunkQuery = jest.fn()

describe('SplunkMetricsQueryViewer', () => {
  beforeAll(() => {
    jest.spyOn(cvServices, 'useGetSplunkMetricSampleData').mockReturnValue({
      loading: false,
      error: null,
      data: {
        metaData: {},
        resource: [
          { txnName: 'default', metricName: 'sample', metricValue: 1282.0, timestamp: 1654798680000 },
          { txnName: 'default', metricName: 'sample', metricValue: 1654.1818181818182, timestamp: 1654798800000 }
        ],
        responseMessages: []
      },
      refetch: fetchSplunkQuery
    } as any)
  })
  test('should render correct UI with Highchart', () => {
    jest.spyOn(Utils, 'randomId').mockReturnValue('abc')
    const { container } = render(<WrapperComponent />)

    expect(container.querySelector('.highcharts-container')).toBeInTheDocument()

    fireEvent.click(screen.getByText(/cv.monitoringSources.gcoLogs.fetchRecords/))

    expect(fetchSplunkQuery).toHaveBeenCalledWith({
      queryParams: {
        accountId: 'account',
        connectorIdentifier: 'splunk_trial',
        orgIdentifier: 'org1',
        projectIdentifier: 'project1',
        query: 'my test query',
        requestGuid: 'abc'
      }
    })
  })

  test('should not render the chart, if there is no data available from query fetch', () => {
    jest.spyOn(cvServices, 'useGetSplunkMetricSampleData').mockReturnValue({
      loading: false,
      error: null,
      data: {
        metaData: {},
        resource: [],
        responseMessages: []
      },
      refetch: fetchSplunkQuery
    } as any)
    jest.spyOn(Utils, 'randomId').mockReturnValue('abc')
    const { container } = render(<WrapperComponent />)

    expect(container.querySelector('.highcharts-container')).not.toBeInTheDocument()
  })

  test('should call onchange props, if the query changes', () => {
    const { container } = render(<WrapperComponent />)

    const queryTextArea = container.querySelector("textarea[name='query']")

    fireEvent.change(queryTextArea as Element, { target: { value: 'new query updated' } })

    expect(onChangeQueryMock).toHaveBeenCalledWith('isStaleRecord', true)
  })

  test('should open the drawer, once expand button is clicked on textarea', () => {
    const { container } = render(<WrapperComponent />)

    fireEvent.click(container.querySelector("[data-icon='fullscreen']") as Element)

    expect(screen.getByTestId('SplunkMetricQuery_drawer')).toBeInTheDocument()
  })
})
