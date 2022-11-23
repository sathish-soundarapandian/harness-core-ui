/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, IconName, Layout, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { SelectedAddStageTypeData } from './AddStageView'
import css from './AddStageView.module.scss'

interface StageHoverViewProps {
  selectedStageType: SelectedAddStageTypeData | undefined
}
function StageHoverView({ selectedStageType }: StageHoverViewProps): React.ReactElement {
  const { getString } = useStrings()
  return (
    <div className={css.hoverStageSection}>
      {selectedStageType?.isComingSoon && <div className={css.comingSoonBanner}>{getString('common.comingSoon2')}</div>}
      <Icon
        name="main-close"
        size={12}
        className={css.closeIcon}
        onClick={() => window.dispatchEvent(new CustomEvent('CLOSE_CREATE_STAGE_POPOVER'))}
      />
      <Layout.Vertical
        flex={{ justifyContent: 'space-between' }}
        height={'100%'}
        style={{ paddingTop: selectedStageType?.isComingSoon ? 'var(--spacing-8)' : '' }}
      >
        <Layout.Vertical>
          <Layout.Horizontal margin={{ bottom: 'medium' }} flex={{ justifyContent: 'flex-start' }}>
            <Text font={{ variation: FontVariation.H6 }} className={css.hoverTitle}>
              {selectedStageType?.title}
            </Text>
          </Layout.Horizontal>
          <Text font={{ variation: FontVariation.BODY2 }} className={css.stageDescription}>
            {selectedStageType?.description}
          </Text>
        </Layout.Vertical>
        <Icon size={120} name={selectedStageType?.hoverIcon as IconName} />
      </Layout.Vertical>
    </div>
  )
}

export default StageHoverView
