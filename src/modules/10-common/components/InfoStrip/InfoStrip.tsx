/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Icon, IconName } from '@harness/uicore'
import { Intent } from '@harness/design-system'
import css from './InfoStrip.module.scss'
interface InfoStripProps {
  intent: Intent
  className?: string
  content: string | React.ReactElement
}
const INTENT_TO_CLASS_MAP: { [key: string]: string } = {
  [Intent.PRIMARY]: css.primary,
  [Intent.WARNING]: css.warning,
  [Intent.DANGER]: css.danger
}
const INTENT_TO_ICON_MAP: { [key: string]: IconName } = {
  [Intent.PRIMARY]: 'info-sign',
  [Intent.WARNING]: 'warning-sign',
  [Intent.DANGER]: 'warning-sign'
}
const InfoStrip = (props: InfoStripProps): React.ReactElement => {
  return (
    <div className={cx(css.infoStrip, INTENT_TO_CLASS_MAP[props.intent], props.className)}>
      <Icon intent={props.intent} inline name={INTENT_TO_ICON_MAP[props.intent]} className={css.iconStyle} />
      {<span>{props.content}</span>}
    </div>
  )
}
export default InfoStrip
