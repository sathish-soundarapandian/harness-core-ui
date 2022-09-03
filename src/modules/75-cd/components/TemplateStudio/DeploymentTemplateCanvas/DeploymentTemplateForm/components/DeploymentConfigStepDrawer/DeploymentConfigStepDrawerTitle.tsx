/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, Icon, Text } from '@wings-software/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { get } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { useDeploymentContext } from '@cd/context/DeploymentContext/DeploymentContextProvider'
import type { StepElementConfig, TemplateStepNode } from 'services/pipeline-ng'
import css from './DeploymentConfigStepDrawer.module.scss'

export function DeploymentConfigStepDrawerTitle(props: {
  discardChanges: () => void
  applyChanges?: () => void
}): JSX.Element {
  const { stepsFactory, drawerData, isReadOnly, templateDetailsByRef } = useDeploymentContext()
  const stepNode = drawerData.data?.stepConfig?.node
  const stepType =
    (stepNode as StepElementConfig)?.type ||
    get(templateDetailsByRef, (stepNode as TemplateStepNode)?.template.templateRef)?.templateType
  const { getString } = useStrings()
  return (
    <div className={css.stepConfig}>
      <div className={css.title}>
        <Icon
          name={stepsFactory.getStepIcon(stepType || '')}
          color={stepsFactory.getStepIconColor(stepType || '')}
          size={24}
        />
        <Text
          lineClamp={1}
          color={Color.BLACK}
          tooltipProps={{ dataTooltipId: `${stepType}_stepName_${drawerData.type}` }}
          font={{ variation: FontVariation.H4 }}
        >
          {stepsFactory.getStepName(stepType || '')}
        </Text>
      </div>
      <div>
        <Button
          minimal
          className={css.discard}
          disabled={isReadOnly}
          text={getString('pipeline.discard')}
          onClick={props.discardChanges}
        />
      </div>
    </div>
  )
}
