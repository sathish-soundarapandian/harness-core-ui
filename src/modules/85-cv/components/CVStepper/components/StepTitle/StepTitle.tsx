/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { Text, Layout, FontVariation, Color, Icon } from '@harness/uicore'
import type { StepTitleInterface } from '../../CVStepper.types'

export const StepTitle = ({ step, index, isDisabled, isCompleted, onClick }: StepTitleInterface): JSX.Element => {
  return (
    <Layout.Horizontal
      style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
      key={`${step.id}_horizontal`}
      onClick={() => (isDisabled ? noop : onClick(index))}
      flex={{ alignItems: 'center', justifyContent: 'start' }}
    >
      <Icon
        name={isCompleted ? 'ring' : 'tick-circle'}
        size={20}
        margin="small"
        color={isDisabled ? 'primary9' : 'primary7'}
      />
      <Text font={{ variation: FontVariation.H5 }} color={!isDisabled ? Color.PRIMARY_7 : Color.PRIMARY_10}>
        {step.title}
      </Text>
    </Layout.Horizontal>
  )
}
