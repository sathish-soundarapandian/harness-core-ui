/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, Icon, Text, ButtonVariation, ButtonSize } from '@wings-software/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { usePipelineContext } from '../PipelineContext/PipelineContext'
import type { StepData } from '../../AbstractSteps/AbstractStepFactory'
import css from './RightDrawer.module.scss'

export function RightDrawerTitle(props: {
  stepType: string
  helpPanelVisible: boolean
  toolTipType: string
  stepData: StepData | null | undefined
  disabled: boolean
  discardChanges: () => void
  applyChanges: () => void
}): JSX.Element {
  const { stepsFactory } = usePipelineContext()
  const { stepType, toolTipType, stepData, helpPanelVisible, disabled } = props
  const { getString } = useStrings()
  return (
    <div className={css.stepConfig}>
      <div className={css.title}>
        <Icon
          name={stepsFactory.getStepIcon(stepType || '')}
          {...(stepsFactory.getStepIconColor(stepType || '')
            ? { color: stepsFactory.getStepIconColor(stepType || '') }
            : {})}
          style={{ color: stepsFactory.getStepIconColor(stepType || '') }}
          size={24}
        />
        <Text
          lineClamp={1}
          color={Color.BLACK}
          tooltipProps={{ dataTooltipId: `${stepType}_stepName${toolTipType}` }}
          font={{ variation: FontVariation.H4 }}
        >
          {stepData ? stepData?.name : stepsFactory.getStepName(stepType || '')}
        </Text>
      </div>
      <div className={helpPanelVisible ? css.showHelpPanel : undefined}>
        <Button
          variation={ButtonVariation.SECONDARY}
          size={ButtonSize.SMALL}
          className={css.applyChanges}
          disabled={disabled}
          text={getString('applyChanges')}
          onClick={props.applyChanges}
        />
        <Button minimal className={css.discard} text={getString('pipeline.discard')} onClick={props.discardChanges} />
      </div>
    </div>
  )
}
