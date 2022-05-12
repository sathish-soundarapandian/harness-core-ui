/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactNode, useMemo, FC } from 'react'
import { Breadcrumb, Page, FontVariation, Heading, HarnessDocTooltip } from '@harness/uicore'
import { get } from 'lodash-es'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import css from './EnvironmentsList.module.scss'

interface EnvironmentPageHeadingProps {
  tooltipId?: string
}

export interface EnvironmentPageTemplateProps {
  breadcrumbs?: Breadcrumb[]
  title: string
  titleTooltipId?: string
  headerContent?: ReactNode
  toolbar?: ReactNode
  headerToolbar?: ReactNode
  pagination?: ReactNode
  loading?: boolean
  error?: unknown
  retryOnError?: () => void
}

const getErrorMessage = (error: any): string => get(error, 'data.error', get(error, 'data.message', error?.message))

const EnvironmentPageHeading: FC<EnvironmentPageHeadingProps> = ({ tooltipId, children }) => {
  return (
    <Heading level={3} font={{ variation: FontVariation.H4 }} data-tooltip-id={tooltipId}>
      {children}
      <HarnessDocTooltip tooltipId={tooltipId} useStandAlone />
    </Heading>
  )
}

const EnvironmentListingPageTemplate: React.FC<EnvironmentPageTemplateProps> = ({
  breadcrumbs,
  title,
  titleTooltipId,
  headerContent,
  toolbar,
  headerToolbar,
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
      titleTooltipId ? <EnvironmentPageHeading tooltipId={titleTooltipId}>{title}</EnvironmentPageHeading> : title,
    [title, titleTooltipId]
  )

  return (
    <main className={css.layout}>
      <Page.Header
        title={headerTitle}
        breadcrumbs={<NGBreadcrumbs customPathParams={{ module: 'cd' }} links={breadcrumbs} />}
        className={css.header}
        content={headerContent}
        toolbar={headerToolbar}
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

export default EnvironmentListingPageTemplate
