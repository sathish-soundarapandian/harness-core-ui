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
  subTitle: string
  className?: string
}

const ToggleSection: React.FC<ToggleSectionProps> = ({ children, title, subTitle, className }) => {
  const [isOpen, toggleIsOpen] = useToggle(false)
  const [isEnabled, toggleIsEnabled] = useToggle(false)
  return (
    <Layout.Vertical className={cx(css.toggleSectionContainer, className)}>
      <Layout.Horizontal onClick={toggleIsOpen} className={css.toggleHeader}>
        <Container>
          <Toggle
            checked={isEnabled}
            onChange={e => {
              e.stopPropagation()
              toggleIsEnabled()
            }}
          />
        </Container>
        <Layout.Vertical spacing={'small'}>
          <Text font={{ variation: FontVariation.H4 }} color={Color.GREY_800}>
            {title}
          </Text>
          <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
            {subTitle}
          </Text>
        </Layout.Vertical>
        <FlexExpander />
        <Layout.Horizontal flex>
          <Icon name="main-chevron-down" color={Color.PRIMARY_7} />
        </Layout.Horizontal>
      </Layout.Horizontal>
      <Collapse isOpen={isOpen} className={isOpen ? css.collapsibleBody : undefined}>
        {children}
      </Collapse>
    </Layout.Vertical>
  )
}

export default ToggleSection
