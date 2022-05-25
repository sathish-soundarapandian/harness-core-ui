/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import css from './Nodes.module.scss'
function SVGMarker({ className }: { className?: string }): React.ReactElement {
  return (
    <svg id="link-port" viewBox="0 0 10 10">
      <circle className={cx(css.marker, className)} r="2" cy="5" cx="5" />
    </svg>
  )
}
export default SVGMarker
