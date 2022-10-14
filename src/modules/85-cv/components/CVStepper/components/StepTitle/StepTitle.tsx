/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { Text, Layout, FontVariation, Color, Icon, IconName } from '@harness/uicore'
import type { StepTitleInterface } from '../../CVStepper.types'

const getState = (
  isValid: boolean
): {
  icon: IconName
  cursor: string
  iconColor: string
  labelColor: string
} => {
  const state = {
    cursor: isValid ? 'pointer' : 'not-allowed',
    icon: (isValid ? 'tick-circle' : 'error') as IconName,
    iconColor: isValid ? 'primary7' : 'error',
    labelColor: isValid ? Color.PRIMARY_7 : Color.ERROR
  }
  return state
}

const defaultState = {
  cursor: 'not-allowed',
  icon: 'ring' as IconName,
  iconColor: 'primary9',
  labelColor: Color.PRIMARY_10
}

export const StepTitle = ({ step, index, isValid, isCurrent, onClick }: StepTitleInterface): JSX.Element => {
  const shouldShowErrorOrSuccess = typeof isValid === 'boolean'
  const { icon, labelColor, iconColor, cursor } = shouldShowErrorOrSuccess ? getState(isValid) : defaultState
  return (
    <Layout.Horizontal
      style={{ cursor: shouldShowErrorOrSuccess ? 'pointer' : cursor }}
      key={`${step.id}_horizontal`}
      onClick={() => (shouldShowErrorOrSuccess ? onClick(index) : noop)}
      flex={{ alignItems: 'center', justifyContent: 'start' }}
    >
      {isCurrent ? (
        <Icon name={shouldShowErrorOrSuccess ? icon : 'edit'} size={20} margin="small" color={iconColor} />
      ) : (
        <Icon name={icon} size={20} margin="small" color={iconColor} />
      )}
      <Text font={{ variation: FontVariation.H5 }} color={labelColor}>
        {step.title}
      </Text>
    </Layout.Horizontal>
  )
}
