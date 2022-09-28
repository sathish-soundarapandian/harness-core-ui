import { clone } from 'lodash-es'
import React from 'react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import GCOLogsMonitoringSource from '../GCOLogsMonitoringSource'
import { gcoLogsData, gcoPayload, sourceData } from './mock'
import { buildGCOMonitoringSourceInfo } from '../GoogleCloudOperationsMonitoringSourceUtils'

describe('Validate GCOLogsMonitoringSource', () => {
  test('should render', () => {
    const onSubmit = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <GCOLogsMonitoringSource data={sourceData} onSubmit={onSubmit} />
      </TestWrapper>
    )
    expect(getByText('cv.monitoringSources.addQuery')).toBeInTheDocument()
    expect(getByText('GCO Logs Query')).toBeInTheDocument()
    expect(getByText('cv.query')).toBeInTheDocument()
    expect(getByText('cv.monitoringSources.gcoLogs.serviceInstance')).toBeInTheDocument()
    expect(getByText('cv.monitoringSources.gcoLogs.messageIdentifier')).toBeInTheDocument()
    expect(container.querySelector('input[value="GCO Logs Query"]')).toBeInTheDocument()
    expect(getByText('submit')).toBeInTheDocument()
    fireEvent.click(getByText('submit'))
    fireEvent.change(container.querySelector('textarea[name="query"]')!, { target: { value: 'test' } })
    expect(container.querySelector('textarea[name="query"]')).toHaveValue('test')
    fireEvent.click(getByText('submit'))
  })

  test('should render with template flag on', () => {
    const onSubmit = jest.fn()
    const templateSourceData = clone(sourceData)
    templateSourceData.connectorRef = { value: RUNTIME_INPUT_VALUE }
    const { container, getByText } = render(
      <TestWrapper>
        <GCOLogsMonitoringSource isTemplate expressions={[]} data={templateSourceData} onSubmit={onSubmit} />
      </TestWrapper>
    )
    expect(getByText('cv.monitoringSources.addQuery')).toBeInTheDocument()
    expect(getByText('GCO Logs Query')).toBeInTheDocument()
    expect(getByText('cv.query')).toBeInTheDocument()
    expect(getByText('cv.monitoringSources.gcoLogs.serviceInstance')).toBeInTheDocument()
    expect(getByText('cv.monitoringSources.gcoLogs.messageIdentifier')).toBeInTheDocument()
    expect(container.querySelector('input[value="GCO Logs Query"]')).toBeInTheDocument()
    expect(container.querySelector('input[ name="serviceInstance"]')).toHaveValue(RUNTIME_INPUT_VALUE)
    expect(container.querySelector('input[name="messageIdentifier"]')).toHaveValue(RUNTIME_INPUT_VALUE)
    fireEvent.click(getByText('submit'))
  })

  test('should validate buildGCOMonitoringSourceInfo', () => {
    expect(
      buildGCOMonitoringSourceInfo(
        {
          accountId: 'zEaak-FLS425IEO7OLzMUg',
          orgIdentifier: 'default',
          projectIdentifier: 'SRM_Template'
        },
        gcoLogsData
      )
    ).toEqual(gcoPayload)
  })
})
