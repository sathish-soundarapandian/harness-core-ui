import { Container, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import React from 'react'
import cx from 'classnames'
import type { QuestionOption } from 'services/assessments'
import { useStrings } from 'framework/strings'
import { getLevelImage, getLevelTransImage } from './LevelContent.utils'
import css from './LevelContent.module.scss'

interface LevelContentProps {
  level: string
  answer: QuestionOption
  maturityLevel: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3'
}

const LevelContent = ({ answer, level, maturityLevel }: LevelContentProps): JSX.Element => {
  const { getString } = useStrings()
  const levelString = parseInt(level?.slice(-1)) < parseInt(maturityLevel?.slice(-1)) ? 'NA' : level
  const levelImage = getLevelImage(levelString)
  const isCurrentLevel = maturityLevel === level
  const levelTransImage = getLevelTransImage(level, maturityLevel)

  return (
    <>
      <Container flex>
        <div className={cx(css.levelImageContainer, { [css.imageContianerSelected]: isCurrentLevel })}>
          <img src={levelImage} alt="" className={cx(css.questionLevel, { [css.selected]: isCurrentLevel })} />
        </div>
        <Container width={'80%'}>
          <Container className={css.questionOptionText}>
            <Text
              font={{ variation: isCurrentLevel ? FontVariation.H3 : FontVariation.H4 }}
              color={levelString === 'NA' ? Color.GREY_300 : undefined}
            >{`${isCurrentLevel ? getString('assessments.youAreAt') : ''} ${getString(
              'assessments.levelString'
            )} ${level?.slice(-1)}`}</Text>
            <Text>{answer.optionText}</Text>
          </Container>
        </Container>
      </Container>
      {levelTransImage && (
        <div className={css.levelImageContainer}>
          <img src={levelTransImage} alt="" className={css.questionLevel} />
        </div>
      )}
    </>
  )
}

export default LevelContent
