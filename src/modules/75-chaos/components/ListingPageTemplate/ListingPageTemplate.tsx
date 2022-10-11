/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactNode, useMemo } from 'react'
import { Breadcrumb, Page } from '@harness/uicore'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { getErrorMessage } from '@chaos/utils/MessageUtils'
import ListingPageHeading from './ListingPageHeading'

import css from './ListingPageTemplate.module.scss'

export interface ListingPageTemplateProps {
  breadcrumbs?: Breadcrumb[]
  title: string
  titleTooltipId?: string
  headerContent?: ReactNode
  toolbar?: ReactNode
  pagination?: ReactNode
  loading?: boolean
  error?: unknown
  retryOnError?: () => void
}

const ListingPageTemplate: React.FC<ListingPageTemplateProps> = ({
  breadcrumbs,
  title,
  titleTooltipId,
  headerContent,
  toolbar,
  pagination,
  error,
  retryOnError,
  loading,
  children
}) => {
  useDocumentTitle(title)

  enum STATUS {
    'loading',
    'error',
    'ok'
  }

  const state = useMemo<STATUS>(() => {
    if (error) {
      return STATUS.error
    } else if (loading) {
      return STATUS.loading
    }

    return STATUS.ok
  }, [error, loading, STATUS])

  const headerTitle = useMemo<ReactNode>(
    () =>
      titleTooltipId ? (
        <ListingPageHeading tooltipId={titleTooltipId}>{title}</ListingPageHeading>
      ) : (
        <ListingPageHeading>{title}</ListingPageHeading>
      ),
    [title, titleTooltipId]
  )

  return (
    <main className={css.layout}>
      <Page.Header
        title={headerTitle}
        breadcrumbs={
          <NGBreadcrumbs className={css.breadcrumbs} customPathParams={{ module: 'chaos' }} links={breadcrumbs} />
        }
        className={css.header}
        content={headerContent}
      />

      {toolbar && <Page.SubHeader className={css.toolbar}>{toolbar}</Page.SubHeader>}

      <div className={css.content}>
        {state === STATUS.error && <Page.Error message={getErrorMessage(error)} onClick={retryOnError} />}
        {state === STATUS.ok && children}
      </div>

      {state === STATUS.ok && pagination && <footer className={css.footer}>{pagination}</footer>}

      {state === STATUS.loading && !error && (
        <div className={css.loading}>
          <ContainerSpinner />
        </div>
      )}
    </main>
  )
}

export default ListingPageTemplate
