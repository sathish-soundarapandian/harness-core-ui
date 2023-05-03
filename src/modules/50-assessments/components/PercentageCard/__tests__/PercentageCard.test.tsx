import React from 'react'
import { render, screen } from '@testing-library/react'
import PercentageCard from '../PercentageCard'

describe('PercentageCard', () => {
  test('should render the card with given props', () => {
    const title = 'Some Title'
    const percentage = 50
    const percentageTitle = 'Higher'
    const textLineOne = 'Text Line One'
    const textLineTwo = 'Text Line Two'
    render(
      <PercentageCard
        title={title}
        percentage={percentage}
        percentageTitle={percentageTitle}
        textLineOne={textLineOne}
        textLineTwo={textLineTwo}
      />
    )
    const titleElement = screen.getByText(title)
    const percentageElement = screen.getByText(`${percentage}% ${percentageTitle}`)
    const textLineOneElement = screen.getByText(textLineOne)
    const textLineTwoElement = screen.getByText(textLineTwo)
    expect(titleElement).toBeInTheDocument()
    expect(percentageElement).toBeInTheDocument()
    expect(textLineOneElement).toBeInTheDocument()
    expect(textLineTwoElement).toBeInTheDocument()
  })

  test('should render the card with lower percentage title when not provided', () => {
    const title = 'Some Title'
    const percentage = 50
    const textLineOne = 'Text Line One'
    const textLineTwo = 'Text Line Two'
    render(<PercentageCard title={title} percentage={percentage} textLineOne={textLineOne} textLineTwo={textLineTwo} />)
    const percentageElement = screen.getByText(`${percentage}%`)
    expect(percentageElement).toBeInTheDocument()
  })
})
