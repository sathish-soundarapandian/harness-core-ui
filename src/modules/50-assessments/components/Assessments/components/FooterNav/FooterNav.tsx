import { Button, ButtonVariation } from '@harness/uicore'
import React from 'react'
import css from './FooterNav.module.scss'

interface FooterNavProps {
  disablePrevious: boolean
  disableForward: boolean
  previousClick: () => void
  forwardClick: () => void
}

export default function FooterNav({
  disableForward,
  disablePrevious,
  previousClick,
  forwardClick
}: FooterNavProps): JSX.Element {
  return (
    <div className={css.footerNav}>
      <Button
        variation={ButtonVariation.TERTIARY}
        icon="main-chevron-left"
        margin="small"
        padding="small"
        disabled={disablePrevious}
        onClick={previousClick}
      />
      <Button
        variation={ButtonVariation.TERTIARY}
        icon="main-chevron-right"
        padding="small"
        disabled={disableForward}
        onClick={forwardClick}
      />
    </div>
  )
}
