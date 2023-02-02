import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import LogsDetailLegendForChart, { LogsDetailLegendForChartPropsType } from '../LogsDetailLegendForChart'

describe('LogsDetailLegendForChart', () => {
  const WrapperComponent = ({ clusterType }: LogsDetailLegendForChartPropsType): JSX.Element => {
    return (
      <TestWrapper>
        <LogsDetailLegendForChart clusterType={clusterType} />
      </TestWrapper>
    )
  }
  test('LogsDetailLegendForChart should return null if no clusterType is passed as prop', () => {
    const { container } = render(<WrapperComponent clusterType={undefined} />)

    expect(container).toBeEmptyDOMElement()
  })

  test('LogsDetailLegendForChart should return baseline legend if it is not an UNKNWON event', async () => {
    render(<WrapperComponent clusterType={'KNOWN'} />)

    const baselineDOMElement = await screen.findByText(/cv.baselineEvents/)
    const knownDOMElement = await screen.findByText(/cv.knownEvents/)

    expect(baselineDOMElement).toBeInTheDocument()
    expect(knownDOMElement).toBeInTheDocument()
  })

  test('LogsDetailLegendForChart should not return baseline legend if it is an UNKNWON event', async () => {
    render(<WrapperComponent clusterType={'UNKNOWN'} />)

    const baselineDOMElement = await screen.queryByText(/cv.baselineEvents/)
    const unknownDOMElement = await screen.findByText(/cv.unknownEvents/)

    expect(baselineDOMElement).not.toBeInTheDocument()
    expect(unknownDOMElement).toBeInTheDocument()
  })
})
