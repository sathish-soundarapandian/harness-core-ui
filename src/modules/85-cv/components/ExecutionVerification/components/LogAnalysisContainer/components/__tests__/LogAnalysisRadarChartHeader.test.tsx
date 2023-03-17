import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import LogAnalysisRadarChartHeader from '../LogAnalysisRadarChartHeader'

const WrapperComponent = ({ showHealthLegend }: { showHealthLegend?: boolean }): JSX.Element => {
  return (
    <TestWrapper>
      <LogAnalysisRadarChartHeader showHealthLegend={showHealthLegend} />
    </TestWrapper>
  )
}
describe('LogAnalysisRadarChartHeader', () => {
  test('LogAnalysisRadarChartHeader should not show Health legend if showHealthLegend prop is not passed', () => {
    render(<WrapperComponent />)

    expect(screen.queryByTestId(/healthRisks_legend/)).not.toBeInTheDocument()
  })

  test('LogAnalysisRadarChartHeader should show Health legend if showHealthLegend prop is passed', () => {
    render(<WrapperComponent showHealthLegend />)

    expect(screen.getByTestId(/healthRisks_legend/)).toBeInTheDocument()
  })
})
