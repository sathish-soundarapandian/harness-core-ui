import React from 'react'
import cx from 'classnames'
import css from './StageControls.module.scss'

export interface StageControlsProps {
  children: React.ReactNode
  className?: string
}

export function StageControls({ children, className }: StageControlsProps): React.ReactElement {
  const childrenArr = React.Children.toArray(children) as React.ReactElement[]

  const content = childrenArr.reduce<React.ReactNode[]>((acc, child, idx) => {
    return [
      ...acc,
      React.cloneElement(child, { ...child.props, className: cx(css.stageControlButton, child.props.className) }),
      ...(idx !== childrenArr.length - 1 ? [<StageControlSeparator key={`separator_${idx}`} />] : [])
    ]
  }, [])

  return <div className={cx(css.stageControls, className)}>{content}</div>
}

function StageControlSeparator(): JSX.Element {
  return <div className={css.separator} />
}
