import cx from 'classnames'
import { Layout, Text } from '@harness/uicore'
import React, { useMemo } from 'react'
import { useStrings } from 'framework/strings'
import css from './HorizontalSteps.module.scss'

interface HorizontalStepsProps {
  totalSteps: number
  completedIndexes: number[]
  inProgress: number
}

export default function HorizontalSteps(props: HorizontalStepsProps): JSX.Element {
  const { totalSteps, completedIndexes, inProgress } = props
  const { getString } = useStrings()

  const steps = useMemo(() => {
    const stepElements: JSX.Element[] = []
    for (let i = 0; i < totalSteps; i++) {
      stepElements.push(
        <div
          className={cx(
            css.step,
            { [css.completed]: completedIndexes.includes(i) && i !== inProgress },
            { [css.inProgress]: i === inProgress }
          )}
          key={`step-${i + 1}`}
        >
          <Text className={css.text}>{i + 1}</Text>
        </div>
      )
      if (i < totalSteps - 1) {
        stepElements.push(<div className={css.line} key={`line-${i + 1}`}></div>)
      }
    }
    return stepElements
  }, [totalSteps, completedIndexes, inProgress])

  return (
    <Layout.Horizontal className={css.horizontalSteps} padding={{ left: 'large' }}>
      <Text margin={{ right: 'small' }}>{`${getString('assessments.questions')}: `}</Text>
      {steps}
    </Layout.Horizontal>
  )
}
