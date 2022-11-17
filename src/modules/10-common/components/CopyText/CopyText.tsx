/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, Utils, IconName } from '@harness/uicore'
import cx from 'classnames'
import { Classes } from '@blueprintjs/core'
import { String } from 'framework/strings'
import css from './CopyText.module.scss'

export interface CopyTextProps {
  children?: React.ReactNode
  iconName?: IconName
  className?: string
  valueClassName?: string
  textToCopy: string
  iconAlwaysVisible?: boolean
  stopPropagation?: boolean
}

export function CopyText(props: CopyTextProps): React.ReactElement {
  const { iconAlwaysVisible = false, stopPropagation = false } = props
  const [copied, setCopied] = React.useState(false)
  const icon = props.iconName || 'copy-alt'
  function handleClick(e: React.MouseEvent<Element, MouseEvent>): void {
    Utils.copy(props.textToCopy)
    setCopied(true)
    if (stopPropagation) {
      e.stopPropagation()
    }
  }

  function onClosed(): void {
    setCopied(false)
  }

  return (
    <div className={cx(css.main, props.className)}>
      <div className={cx(css.text, props.valueClassName)}>{props.children}</div>
      {window.isSecureContext && (
        <Button
          data-testid="copy-btn"
          disabled={!window.isSecureContext}
          data-name={icon}
          icon={copied ? 'execution-success' : icon}
          minimal
          intent="primary"
          small
          className={cx(css.copyIcon, copied && css.successIcon)}
          tooltip={<String className={css.tooltip} stringID={copied ? 'copiedToClipboard' : 'clickToCopy'} />}
          tooltipProps={{
            wrapperTagName: 'div',
            className: iconAlwaysVisible ? cx(css.alwaysVisible, Classes.DARK) : css.btnWrapper,
            onClosed
          }}
          onClick={handleClick}
        />
      )}
    </div>
  )
}
