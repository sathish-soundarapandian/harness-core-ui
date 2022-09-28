/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { Text } from '@wings-software/uicore'
import { FontVariation } from '@harness/design-system'
import { Classes, Switch } from '@blueprintjs/core'
import cx from 'classnames'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { FeatureFlagActivationStatus } from '@cf/utils/CFUtils'
import { useStrings } from 'framework/strings'
import type { FeatureState } from 'services/cf'
import DisabledFeatureTooltip from '@cf/pages/feature-flags-detail/targeting-rules-tab/components/disabled-feature-tooltip/DisabledFeatureTooltip'
import css from '../FlagActivation/FlagActivation.module.scss'

export interface FlagToggleSwitchProps {
  currentState: string
  currentEnvironmentState?: FeatureState
  handleToggle: () => void
  disabled?: boolean
}

const FlagToggleSwitch = (props: FlagToggleSwitchProps): ReactElement => {
  const { currentEnvironmentState, handleToggle, currentState, disabled } = props

  const { getString } = useStrings()

  const isFlagSwitchChanged = currentEnvironmentState !== currentState
  const switchOff = (currentState || FeatureFlagActivationStatus.OFF) === FeatureFlagActivationStatus.OFF

  return (
    <DisabledFeatureTooltip permission={PermissionIdentifier.TOGGLE_FF_FEATUREFLAG}>
      <Switch
        labelElement={
          <Text inline font={{ variation: FontVariation.FORM_INPUT_TEXT }}>
            {isFlagSwitchChanged
              ? getString(switchOff ? 'cf.featureFlags.flagWillTurnOff' : 'cf.featureFlags.flagWillTurnOn')
              : getString(switchOff ? 'cf.featureFlags.flagOff' : 'cf.featureFlags.flagOn')}
          </Text>
        }
        data-testid="flag-status-switch"
        onChange={handleToggle}
        alignIndicator="left"
        className={cx(Classes.LARGE, css.switch)}
        checked={currentState === FeatureFlagActivationStatus.ON}
        disabled={disabled}
      />
    </DisabledFeatureTooltip>
  )
}

export default FlagToggleSwitch
