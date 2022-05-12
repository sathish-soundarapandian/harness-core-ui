/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, IconName } from '@wings-software/uicore'
import cx from 'classnames'
import { NodeType } from '../../types'
import SVGMarker from '../SVGMarker'
import css from '../Nodes.module.scss'

const DEFAULT_ICON: IconName = 'stop'
const SELECTED_COLOUR = 'var(--diagram-stop-node)'

function EndNodeStage(props: any): React.ReactElement {
  return (
    <div id={props?.id} className={cx({ [props.className]: props.className }, css.stageNode)}>
      <div
        id={NodeType.EndNode.toString()}
        className={cx(css.nodeStart)}
        style={{ backgroundColor: '#f3f3fa', border: '1px solid #b0b1c4' }}
      >
        <div>
          <Icon name={DEFAULT_ICON} style={{ color: SELECTED_COLOUR }} className={css.icon} />
        </div>
        <div className={css.markerEndNode}>
          <SVGMarker />
        </div>
      </div>
    </div>
  )
}

export default EndNodeStage
