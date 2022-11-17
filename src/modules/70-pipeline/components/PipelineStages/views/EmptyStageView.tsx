/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Icon, Layout } from '@harness/uicore'
import { useStrings } from 'framework/strings'

import css from './AddStageView.module.scss'

function EmptyStageView(): React.ReactElement {
  const { getString } = useStrings()

  return (
    <div className={css.emptyStageView}>
      <Icon
        name="main-close"
        size={12}
        className={css.closeIcon}
        onClick={() => window.dispatchEvent(new CustomEvent('CLOSE_CREATE_STAGE_POPOVER'))}
      />
      <Layout.Vertical margin={{ top: 'xxlarge', bottom: 'xxlarge', right: 'medium', left: 'medium' }}>
        <Layout.Horizontal margin={{ bottom: 'medium', top: 'large' }} flex={{ justifyContent: 'center' }}>
          <Icon name="add-stage" size={74} />
        </Layout.Horizontal>
        <div className={cx(css.stageDescription, css.hoverStageDescription)}>
          {getString('pipeline.addStage.description')}
        </div>
      </Layout.Vertical>
    </div>
  )
}

export default EmptyStageView
