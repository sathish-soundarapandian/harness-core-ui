/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { Text, Layout, FontVariation, Icon } from '@harness/uicore'
import type { StepTitleInterface } from './StepTitle.types'
import { getStateByStatus } from './StepTitle.utils'
import { StepStatus } from '../../Step.constants'

export const StepTitle = ({ step, index, isCurrent, stepStatus, onClick }: StepTitleInterface): JSX.Element => {
  const isErrorOrSuccess = stepStatus !== StepStatus.INCONCLUSIVE
  const { icon, labelColor, iconColor, cursor } = getStateByStatus(stepStatus)
  return (
    <Layout.Vertical spacing="small">
      <Layout.Horizontal
        data-testid={`steptitle_${step.id}`}
        style={{ cursor: isErrorOrSuccess ? 'pointer' : cursor }}
        key={`${step.id}_horizontal`}
        onClick={() => (isErrorOrSuccess ? onClick(index) : noop)}
        flex={{ alignItems: 'center', justifyContent: 'start' }}
      >
        {isCurrent ? (
          <Icon name={isErrorOrSuccess ? icon : 'edit'} size={20} margin="small" color={iconColor} />
        ) : (
          <Icon name={icon} size={20} margin="small" color={iconColor} />
        )}
        <Text font={{ variation: FontVariation.H5 }} color={labelColor}>
          {step.title}
        </Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}
