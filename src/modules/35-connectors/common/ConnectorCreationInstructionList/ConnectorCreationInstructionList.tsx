/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonSize, ButtonVariation, Container, Text } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import css from './ConnectorCreationInstructionList.module.scss'

interface InstuctionListProps {
  instructionsList: InstructionProps[]
}

export interface InstructionProps {
  type: string
  text?: string
  icon?: string
  url?: string
  listClassName?: string
  renderer?: () => void
}

const ConnectorInstructionList: React.FC<InstuctionListProps> = props => {
  const { getString } = useStrings()

  const getElement = (instruction: Record<string, any>) => {
    if (instruction.type === 'button') {
      return (
        <Button
          text={getString(instruction.text)}
          rightIcon={instruction.icon}
          variation={ButtonVariation.SECONDARY}
          iconProps={{ size: 12, margin: { left: 'xsmall' } }}
          size={ButtonSize.SMALL}
          onClick={() => {
            window.open(instruction.url, '_blank')
          }}
        />
      )
    } else if (instruction.type === 'text') {
      return (
        <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_800}>
          {getString(instruction.text)}
        </Text>
      )
    } else {
      return instruction.renderer()
    }
  }

  return (
    <Container className={css.instructionPanel}>
      <ol className={css.instructionList}>
        {props.instructionsList.map((item, index) => {
          const classname = item.listClassName as string
          return (
            <li key={index} className={css[classname as keyof typeof css]}>
              {getElement(item)}
            </li>
          )
        })}
      </ol>
    </Container>
  )
}

export default ConnectorInstructionList
