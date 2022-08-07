/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, IconName } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import SVGMarker from '../SVGMarker'
import type { NodeProps } from '../../types'
import css from '../Nodes.module.scss'

const DEFAULT_ICON: IconName = 'play'

function StartNodeStage(props: NodeProps<any, any>): React.ReactElement {
  return (
    <div id={props?.data?.id} className={cx(props?.metaData?.className, css.stageNode)}>
      <div className={cx(css.nodeStart)} style={{ backgroundColor: '#f3f3fa', border: '1px solid #b0b1c4' }}>
        <div className={css.markerStartNode}>
          <SVGMarker />
        </div>
        <div>
          <Icon name={DEFAULT_ICON} color={Color.GREEN_400} className={css.icon} />
        </div>
      </div>
    </div>
  )
}

export default StartNodeStage
