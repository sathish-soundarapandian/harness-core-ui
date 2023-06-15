/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext } from 'react'
import { Layout, Icon, Text, Button } from '@harness/uicore'
import { Popover, Position, PopoverInteractionKind, Classes } from '@blueprintjs/core'
import { DialogExtensionContext, ExtentionWindow } from './DialogExtention'
import css from './TextInputWithToolTip.module.scss'

const TextInputWithToolTip = ({ label, extentionName }: { label: string; extentionName: ExtentionWindow }) => {
  const { triggerExtension } = useContext(DialogExtensionContext)
  //   const renderLabel = () => {
  return (
    <Layout.Horizontal spacing={'xsmall'}>
      <Text inline>{label}</Text>
      <Popover
        popoverClassName={Classes.DARK}
        position={Position.RIGHT}
        interactionKind={PopoverInteractionKind.HOVER}
        content={
          <div className={css.popoverContent}>
            <Text color="grey50" font={'xsmall'}>
              Provided in the delivery options when the template is opened in the AWS console
            </Text>
            <div className={css.btnCtn}>
              <Button
                intent="primary"
                className={css.instructionBtn}
                font={'xsmall'}
                minimal
                text="Show instructions"
                onClick={() => triggerExtension(extentionName)}
              />
            </div>
          </div>
        }
      >
        <Icon
          name="info"
          size={12}
          color={'primary5'}
          onClick={async (event: React.MouseEvent<HTMLHeadingElement, globalThis.MouseEvent>) => {
            event.preventDefault()
            event.stopPropagation()
          }}
        />
      </Popover>
    </Layout.Horizontal>
  )
  //   }
  //return <FormInput.Text name={name} label={renderLabel()} className={css.dataFields} />
}

export default TextInputWithToolTip
