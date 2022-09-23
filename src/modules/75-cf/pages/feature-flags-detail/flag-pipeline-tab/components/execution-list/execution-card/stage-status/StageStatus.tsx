/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text } from '@harness/uicore'
import type { IconName } from '@harness/icons'
import { Color, FontVariation } from '@harness/design-system'
import type { FeaturePipelineExecution } from 'services/cf'
import css from '../../ExecutionList.module.scss'

interface StageStatusProps {
  executionHistoryItem: FeaturePipelineExecution
}

const StageStatus: React.FC<StageStatusProps> = ({ executionHistoryItem }) => {
  const getIcon = (): IconName => {
    if (executionHistoryItem.failedStagesCount && executionHistoryItem.failedStagesCount > 0) {
      return 'warning-sign'
    } else if (executionHistoryItem.endTs) {
      return 'execution-success'
    } else {
      return 'loading'
    }
  }

  const getIconColor = (): Color => {
    if (executionHistoryItem.failedStagesCount && executionHistoryItem.failedStagesCount > 0) {
      return Color.RED_800
    } else if (executionHistoryItem.endTs) {
      return Color.GREEN_800
    } else {
      return Color.ORANGE_300
    }
  }

  return (
    <Text
      font={{ variation: FontVariation.BODY2 }}
      color={Color.GREY_900}
      icon={getIcon()}
      iconProps={{ color: getIconColor() }}
      className={css.stageStatus}
      data-testid="stage-count"
    >
      {executionHistoryItem.failedStagesCount
        ? executionHistoryItem.failedStagesCount
        : executionHistoryItem.succeededStagesCount}
      /{executionHistoryItem.totalStagesCount}
    </Text>
  )
}

export default StageStatus
