/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Container, Layout, ButtonSize, Text, Card, FlexExpander, Button } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Collapse } from '@blueprintjs/core'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import css from './Step.module.scss'

interface StepProps {
  stepProps: {
    color: Color
    background: Color
    total: number
    current: number
    defaultOpen: boolean
    isComingSoon?: boolean
  }
  title: string
  children: React.ReactElement
  actionButtonProps?: {
    showActionButton: boolean
    actionButtonText: string
    actionOnClick: () => void
  }
}

const Step: (props: StepProps) => React.ReactElement = ({ stepProps, title, children, actionButtonProps }) => {
  const [isOpen, setIsOpen] = useState<boolean>(stepProps.defaultOpen)
  const { getString } = useStrings()

  return (
    <Card className={css.container}>
      <Container className={cx({ [css.comingSoon]: stepProps.isComingSoon })}>
        <Layout.Horizontal className={css.headerContainer}>
          <Text
            className={css.pillRadius}
            color={stepProps.color}
            background={stepProps.background}
            padding={{
              top: 'xsmall',
              bottom: 'xsmall',
              left: 'small',
              right: 'small'
            }}
            font={{ variation: FontVariation.TINY }}
          >
            {getString('ce.businessMapping.stepText', {
              current: stepProps.current,
              total: stepProps.total
            })}
          </Text>
          {stepProps.isComingSoon ? <Text padding={{ left: 'medium' }}>{getString('common.comingSoon')}</Text> : null}
          <FlexExpander />
          <Button
            icon={isOpen ? 'chevron-up' : 'chevron-down'}
            disabled={stepProps.isComingSoon}
            iconProps={{
              size: 20
            }}
            minimal
            intent="primary"
            onClick={() => {
              !stepProps.isComingSoon && setIsOpen(val => !val)
            }}
          />
        </Layout.Horizontal>
        <Layout.Horizontal className={css.headerContainer}>
          <Text
            padding={{
              top: 'small'
            }}
            font={{ variation: FontVariation.CARD_TITLE }}
          >
            {title}
          </Text>
          <FlexExpander />
          {actionButtonProps?.showActionButton ? (
            <Button
              icon="plus"
              text={actionButtonProps?.actionButtonText}
              minimal
              size={ButtonSize.SMALL}
              onClick={actionButtonProps?.actionOnClick}
            />
          ) : null}
        </Layout.Horizontal>

        <Collapse isOpen={isOpen} keepChildrenMounted>
          {children}
        </Collapse>
      </Container>
    </Card>
  )
}

export default Step
