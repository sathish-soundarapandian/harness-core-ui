/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Collapse } from '@blueprintjs/core'
import { Color, Container, FlexExpander, FontVariation, Icon, Layout, Text, Toggle, useToggle } from '@harness/uicore'

interface ToggleSectionProps {
  title: string
  subTitle: string
}

const ToggleSection: React.FC<ToggleSectionProps> = ({ children, title, subTitle }) => {
  const [isOpen, toggleIsOpen] = useToggle(false)
  const [isEnabled, toggleIsEnabled] = useToggle(false)
  return (
    <Layout.Vertical>
      <Layout.Horizontal onClick={toggleIsOpen}>
        <Container>
          <Toggle checked={isEnabled} onChange={toggleIsEnabled} />
        </Container>
        <Layout.Vertical>
          <Text font={{ variation: FontVariation.H3 }}>{title}</Text>
          <Text>{subTitle}</Text>
        </Layout.Vertical>
        <FlexExpander />
        <Layout.Horizontal flex>
          <Icon name="caret-down" color={Color.PRIMARY_7} />
        </Layout.Horizontal>
      </Layout.Horizontal>
      <Collapse isOpen={isOpen}>{children}</Collapse>
    </Layout.Vertical>
  )
}

export default ToggleSection
