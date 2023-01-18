/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon } from '@harness/uicore'
import cx from 'classnames'
import { Link } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import css from './MenuItem.module.scss'

const OpenInNewTab: React.FC<{ url: string }> = ({ url }) => {
  const { getString } = useStrings()
  return (
    <li>
      <Link
        className={cx('bp3-menu-item', css.openNewTabStyle)}
        target="_blank"
        to={url}
        onClick={/* istanbul ignore next */ e => e.stopPropagation()}
      >
        <Icon name="launch" className={css.linkIcon} />
        {getString('common.openInNewTab')}
      </Link>
    </li>
  )
}

export default OpenInNewTab
