import { Container, Layout, Text } from '@harness/uicore'
import React from 'react'
import cx from 'classnames'
import type { OptionResponse } from 'services/assessments'
import SuccessImage from '@assessments/assets/Success.svg'
import css from './Option.module.scss'

interface OptionProps {
  option: OptionResponse
  sequence: string
  onClick: (optionId: string | undefined) => void
  isSelected: boolean
}

export default function Option(props: OptionProps): JSX.Element {
  const { option, sequence, onClick, isSelected } = props
  return (
    <>
      <Container
        onClick={() => onClick(option.optionId)}
        className={cx(css.option, { [css.selected]: isSelected })}
        padding="xlarge"
        border={{ color: 'grey50' }}
      >
        <Layout.Horizontal spacing="large">
          <div className={css.sequenceContainer}>
            <Text font={{ size: 'small', weight: 'bold' }} className={css.sequenceText}>
              {sequence}
            </Text>
          </div>
          <div className={css.contentContainer}>
            <Text font={{ size: 'normal' }} className={css.contentText}>
              {option.optionText}
            </Text>
          </div>
          <div className={css.checkmarkContainer}>
            {isSelected && <img src={SuccessImage} width="20" height="20" alt="" />}
          </div>
        </Layout.Horizontal>
      </Container>
    </>
  )
}
