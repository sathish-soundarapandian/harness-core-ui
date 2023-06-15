/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Layout, Text, IconName } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { TagsViewer } from '@common/components/TagsViewer/TagsViewer'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'

interface DetailPageTemplateBreadcrumbLink {
  label: string
  url: string
}

export interface DetailPageTemplateProps {
  breadcrumbs: DetailPageTemplateBreadcrumbLink[]
  title: string
  titleIcon?: IconName
  subTittle?: string
  tags?: string[] | null | undefined

  /** Optional extra components to be added into header (context menu, edit button, etc...)  */
  /** Note: Use absolute position to style it */
  headerExtras?: React.ReactNode
}

const HEADER_HEIGHT = 143

export const DetailPageTemplate: React.FC<DetailPageTemplateProps> = ({
  breadcrumbs,
  title,
  titleIcon,
  subTittle,
  tags,
  headerExtras,
  children
}) => {
  return (
    <>
      <Container
        height={HEADER_HEIGHT}
        padding={{ top: 'large', right: 'xlarge', bottom: 'large', left: 'xlarge' }}
        style={{ backgroundColor: 'rgba(219, 241, 255, .46)', position: 'relative' }}
      >
        <Layout.Vertical spacing="small">
          <Layout.Horizontal spacing="small">
            <NGBreadcrumbs links={breadcrumbs} />
          </Layout.Horizontal>
          <Text style={{ fontSize: '20px', color: 'var(--black)' }} icon={titleIcon} iconProps={{ size: 21 }}>
            {title}
          </Text>
          {subTittle && <Text color={Color.GREY_400}>{subTittle}</Text>}
          {tags && (
            <Container>
              <TagsViewer tags={tags} style={{ background: '#CDF4FE' }} />
            </Container>
          )}
        </Layout.Vertical>
        {headerExtras}
      </Container>
      <Container style={{ height: `calc(100vh - ${HEADER_HEIGHT}px)`, overflow: 'auto', background: '#e4ebf433' }}>
        {children}
      </Container>
    </>
  )
}
