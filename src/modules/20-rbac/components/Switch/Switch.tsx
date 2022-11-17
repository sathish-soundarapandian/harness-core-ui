/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { Switch as CoreSwitch, SwitchProps as CoreSwitchProps, Popover } from '@harness/uicore'
import { PopoverInteractionKind } from '@blueprintjs/core'
import type { FeatureRequest } from 'framework/featureStore/featureStoreUtil'
import { useFeature } from '@common/hooks/useFeatures'
import { FeatureWarningTooltip } from '@common/components/FeatureWarning/FeatureWarningWithTooltip'

interface SwitchProps extends CoreSwitchProps {
  featureProps: FeatureProps
}

interface FeatureProps {
  featureRequest: FeatureRequest
}

const FeatureSwitch: React.FC<SwitchProps> = ({ featureProps, ...restProps }) => {
  const { enabled: featureEnabled } = useFeature({
    featureRequest: featureProps?.featureRequest
  })

  const toolTip = <FeatureWarningTooltip featureName={featureProps.featureRequest.featureName} />

  if (featureEnabled) {
    return <CoreSwitch {...restProps} />
  }

  return (
    <Popover interactionKind={PopoverInteractionKind.HOVER} content={toolTip}>
      <CoreSwitch {...restProps} disabled />
    </Popover>
  )
}

export default FeatureSwitch
