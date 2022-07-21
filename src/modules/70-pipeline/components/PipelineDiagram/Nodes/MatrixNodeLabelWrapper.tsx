import { Color, Icon, Layout, Text } from '@harness/uicore'
import React from 'react'
import cx from 'classnames'
import css from './MatrixNodeLabelWrapper.module.scss'

export default function MatrixNodeLabelWrapper({
  nodeType,
  isParallelNode,
  isNestedStepGroup
}: {
  nodeType: string
  isParallelNode?: boolean
  isNestedStepGroup?: boolean
}): JSX.Element {
  return (
    <Layout.Horizontal
      className={cx(css.matrixLabel, {
        [css.marginTop]: isParallelNode,
        [css.stepGroupMatrixLabel]: isNestedStepGroup
      })}
    >
      <Icon size={16} name="looping" style={{ marginRight: '5px' }} color={Color.WHITE} />
      <Text color={Color.WHITE} font="small" style={{ paddingRight: '5px' }}>
        {nodeType}
      </Text>
    </Layout.Horizontal>
  )
}
