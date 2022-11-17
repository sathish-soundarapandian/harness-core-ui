/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Heading, Layout, Container } from '@harness/uicore'
import React from 'react'
import { Color } from '@harness/design-system'
import css from './ExtendedPageHeader.module.scss'

export interface ExtendedPageHeaderProps {
  title: React.ReactNode
  rowOneContent: React.ReactNode
  rowTwoContent: React.ReactNode
  rowThreeContent?: React.ReactNode | null
  toolbar?: React.ReactNode
}

/**
 * PageExtendedHeader implements a consistent header for a page header in which title is rendered on
 * the left followed by rowOneContent component/s,
 * then rowTwoContent bellow and toolbar on the right.
 * then rowThreeContent
 * It also has a consistent box-shadow styling.
 */
export const ExtendedPageHeader: React.FC<ExtendedPageHeaderProps> = ({
  title,
  rowOneContent,
  rowTwoContent,
  rowThreeContent = null,
  toolbar
}) => {
  return (
    <Layout.Vertical className={css.container} spacing="small" padding={{ top: 'medium' }}>
      <Layout.Horizontal className={css.row} spacing="medium">
        <Heading level={1} color={Color.GREY_800}>
          {title}
        </Heading>
        {rowOneContent}
      </Layout.Horizontal>

      <Layout.Horizontal className={css.row} spacing="xsmall">
        {rowTwoContent}
        {toolbar && <Container className={css.toolbar}>{toolbar}</Container>}
      </Layout.Horizontal>

      {rowThreeContent && (
        <Layout.Horizontal className={css.row} spacing="xsmall">
          {rowThreeContent}
        </Layout.Horizontal>
      )}
    </Layout.Vertical>
  )
}
