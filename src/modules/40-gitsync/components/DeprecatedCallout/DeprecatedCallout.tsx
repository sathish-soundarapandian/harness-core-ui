import React from 'react'
import { Callout } from '@blueprintjs/core'
import css from './DeprecatedCallout.module.scss'

const DeprecatedCallout: React.FC = () => {
  return (
    <Callout intent="warning" className={css.deprecatedCallout}>
      We noticed that you’re still using older and deprecated version of Git Experience in this project. Harness has now
      introduced a
      <a
        href="https://developer.harness.io/docs/platform/Git-Experience/git-experience-overview"
        target="_blank"
        rel="noreferrer"
      >
        <b>&nbsp;new and simplified version of Git Experience.&nbsp;</b>
      </a>
      and we encourage you to migrate to new Git Experience before January 31, 2023 to continue getting uninterrupted
      support. Please contact
      <a href="https://support.harness.io/hc/en-us" target="_blank" rel="noreferrer">
        <b>&nbsp;Harness Support&nbsp;</b>
      </a>
      to schedule your migration.
    </Callout>
  )
}

export default DeprecatedCallout
