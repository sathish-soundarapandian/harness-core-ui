/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, FontVariation } from '@harness/uicore'
export interface EmptyStateProps {}
import css from '../FeatureFlagsEventViewer.module.scss'

export const EmptyState: React.FC<EmptyStateProps> = () => {
  return (
    <div className={css.emptyState}>
      <Text
          font={{ variation: FontVariation.H4 }}
          lineClamp={1}
          data-testid="empty-message"
      >
        You currently have no events to view
      </Text>
    </div>
  )
} 