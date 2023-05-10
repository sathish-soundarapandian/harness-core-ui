/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Icon, IconName } from '@harness/uicore'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import SVGMarker from '../SVGMarker'
import css from '../Nodes.module.scss'

const DEFAULT_ICON: IconName = 'play'

function StartNode(props: any): React.ReactElement {
  return (
    <Container
      id={props?.id}
      className={cx({ [props.className]: props.className })}
      flex={{ alignItems: 'center' }}
      height="64px"
    >
      <Container className={css.nodeStart}>
        <Container className={css.markerStartNode}>
          <SVGMarker />
        </Container>
        <Icon name={DEFAULT_ICON} color={Color.GREEN_400} className={css.icon} />
      </Container>
    </Container>
  )
}

export default StartNode
