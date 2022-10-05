/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Collapse } from '@blueprintjs/core'
import { Color, Container, FlexExpander, FontVariation, Icon, Layout, Text, Toggle, useToggle } from '@harness/uicore'
import css from './ComputeGroupsSetupBody.module.scss'

interface ToggleSectionProps {
  title: string
  subTitle?: string
  className?: string
  mainContent?: React.ReactNode
  secondaryContent?: React.ReactNode
  alwaysOpen?: boolean
  hideCollapseIcon?: boolean
  hideToggle?: boolean
}

const ToggleSection: React.FC<ToggleSectionProps> = ({
  children,
  title,
  subTitle,
  className,
  mainContent,
  secondaryContent,
  alwaysOpen,
  hideCollapseIcon,
  hideToggle = false
}) => {
  const [isOpen, toggleIsOpen] = useToggle(false)
  const [isEnabled, toggleIsEnabled] = useToggle(false)
  const openFlag = alwaysOpen !== undefined ? alwaysOpen : isOpen
  const handleClick = () => {
    if (!hideCollapseIcon) {
      toggleIsOpen()
    }
  }

  return (
    <Layout.Vertical className={cx(css.toggleSectionContainer, className)}>
      <Layout.Horizontal onClick={handleClick} className={css.toggleHeader}>
        {!hideToggle && (
          <Container>
            <Toggle
              checked={isEnabled}
              onChange={e => {
                e.stopPropagation()
                toggleIsEnabled()
              }}
            />
          </Container>
        )}
        <Layout.Vertical spacing={'small'}>
          <Text font={{ variation: FontVariation.H4 }} color={Color.GREY_800}>
            {title}
          </Text>
          {subTitle && (
            <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
              {subTitle}
            </Text>
          )}
          {mainContent}
        </Layout.Vertical>
        <FlexExpander />
        <Layout.Horizontal flex spacing={'large'}>
          {secondaryContent}
          {!hideCollapseIcon && <Icon name="main-chevron-down" color={Color.PRIMARY_7} />}
        </Layout.Horizontal>
      </Layout.Horizontal>
      <Collapse isOpen={openFlag} className={openFlag ? css.collapsibleBody : undefined}>
        {children}
      </Collapse>
    </Layout.Vertical>
  )
}

export default ToggleSection
