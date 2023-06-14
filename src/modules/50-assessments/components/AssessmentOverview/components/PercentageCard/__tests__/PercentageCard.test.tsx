import React from 'react'
import { render, screen } from '@testing-library/react'
import PercentageCard from '../PercentageCard'

describe('PercentageCard', () => {
  test('should render the card with given props', () => {
    const percentage = 50
    const percentageTitle = 'Higher'
    const textLineOne = 'Text Line One'
    const textLineTwo = 'Text Line Two'
    render(
      <PercentageCard
        percentage={percentage}
        percentageTitle={percentageTitle}
        textLineOne={textLineOne}
        textLineTwo={textLineTwo}
      />
    )
    const percentageElement = screen.getByText(`${percentage}%`)
    const textLineOneElement = screen.getByText(textLineOne)
    const textLineTwoElement = screen.getByText(textLineTwo)
    expect(percentageElement).toBeInTheDocument()
    expect(textLineOneElement).toBeInTheDocument()
    expect(textLineTwoElement).toBeInTheDocument()
  })

  test('should render the card with lower percentage title when not provided', () => {
    const percentage = 50
    const textLineOne = 'Text Line One'
    const textLineTwo = 'Text Line Two'
    render(
      <PercentageCard
        percentage={percentage}
        textLineOne={textLineOne}
        textLineTwo={textLineTwo}
        percentageTitle={''}
      />
    )
    const percentageElement = screen.getByText(`${percentage}%`)
    expect(percentageElement).toBeInTheDocument()
  })
})
