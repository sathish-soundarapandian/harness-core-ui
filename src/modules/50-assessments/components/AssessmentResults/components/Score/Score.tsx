import { Container, Text } from '@harness/uicore'
import React from 'react'
import cx from 'classnames'
import { getScoreMappings } from './Score.utils'
import css from './Score.module.scss'

interface ScoreProps {
  userScore?: number
}

export default function Score(props: ScoreProps): JSX.Element {
  const { userScore } = props
  const { isUserScoreLow, isUserScoreMedium, isUserScoreHigh } = getScoreMappings(userScore as number)

  if (userScore || userScore === 0) {
    return (
      <Container className={css.scoreContainer}>
        <Text
          className={cx(css.scoreText, {
            [css.lowScore]: isUserScoreLow,
            [css.mediumScore]: isUserScoreMedium,
            [css.highScore]: isUserScoreHigh
          })}
        >
          {`${userScore} %`}
        </Text>
      </Container>
    )
  } else {
    return <></>
  }
}
