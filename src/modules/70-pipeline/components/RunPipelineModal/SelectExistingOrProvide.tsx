/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FormEvent } from 'react'
import { Popover, PopoverInteractionKind, PopoverPosition, Switch } from '@blueprintjs/core'
import { Text, Layout } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import css from './RunPipelineForm.module.scss'

interface SelectExistingInputsOrProvideNewProps {
  existingProvide: string
  onExistingProvideRadioChange: (e: FormEvent<HTMLInputElement>) => void
  hasInputSets: boolean
}

function SelectExistingInputsOrProvideNew({
  existingProvide,
  onExistingProvideRadioChange,
  hasInputSets
}: SelectExistingInputsOrProvideNewProps): React.ReactElement {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal margin={{ bottom: 'small' }}>
      <Text
        data-testid="input-set-description-tooltip"
        tooltipProps={{
          position: PopoverPosition.RIGHT_TOP,
          isDark: true
        }}
        tooltip={
          <Text padding="medium" width={400} color={Color.GREY_200}>
            {getString('pipeline.inputSets.aboutInputSets')}
            <a href="https://docs.harness.io/article/3fqwa8et3d-input-sets" target="_blank" rel="noopener noreferrer">
              {getString('learnMore')}
            </a>
          </Text>
        }
        rightIcon="question"
        rightIconProps={{
          color: Color.PRIMARY_7,
          className: css.helpIcon
        }}
        font={{ weight: 'semi-bold', variation: FontVariation.H6 }}
      >
        {getString('pipeline.pipelineInputPanel.useExisitingInputSets')}
      </Text>
      <Popover
        disabled={hasInputSets}
        position={PopoverPosition.RIGHT_TOP}
        interactionKind={PopoverInteractionKind.HOVER}
        className={css.disabledPopover}
        content={
          <Text color={Color.GREY_200} className={css.popoverDisabledTextStyle}>
            {getString('pipeline.inputSets.noInputSetsCreated')}
          </Text>
        }
        usePortal={false}
      >
        <Switch
          disabled={!hasInputSets}
          checked={existingProvide === 'existing'}
          onChange={onExistingProvideRadioChange}
          alignIndicator={'right'}
          className={css.toggleExisitingProvide}
          data-testid={'selectExistingOrProvide'}
        />
      </Popover>
    </Layout.Horizontal>
  )
}

export default SelectExistingInputsOrProvideNew
