/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import css from './PipelineVariables.module.scss'

function VariableAccordionSummary(props: { children: React.ReactNode; hideIcons?: boolean }) {
  return (
    <div className={css.accordionSummary}>
      {!props.hideIcons && (
        <>
          <Icon name="accordion-collapsed" className={css.iconCollapsed} size={12} />
          <Icon name="accordion-expanded" className={css.iconExpanded} size={12} />
        </>
      )}
      <Text font={{ variation: FontVariation.H6 }}>{props.children}</Text>
    </div>
  )
}

export default VariableAccordionSummary
