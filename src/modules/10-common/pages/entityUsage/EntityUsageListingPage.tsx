import React from 'react'
import cx from 'classnames'
import { defaultTo } from 'lodash-es'

import { Container, ExpandingSearchInput, Layout, PageBody, PageHeader } from '@harness/uicore'

import type { Error, ResponsePageEntitySetupUsageDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

import EntityUsageList from './views/EntityUsageListView/EntityUsageList'

import css from './EntityUsage.module.scss'

export interface EntityUsageListingPageProps {
  withSearchBarInPageHeader: boolean
  pageHeaderClassName?: string
  pageBodyClassName?: string
  searchTerm?: string
  setSearchTerm(searchValue: string): void
  setPage(page: number): void
  apiReturnProps: {
    data: ResponsePageEntitySetupUsageDTO | null
    loading: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    refetch: any
  }
}

export default function EntityUsageListingPage({
  withSearchBarInPageHeader,
  pageHeaderClassName,
  pageBodyClassName,
  searchTerm,
  setSearchTerm,
  setPage,
  apiReturnProps: { data, loading, error, refetch }
}: EntityUsageListingPageProps): React.ReactElement {
  const { getString } = useStrings()

  return (
    <>
      {withSearchBarInPageHeader && (
        <PageHeader
          className={cx(css.secondHeader, defaultTo(pageHeaderClassName, ''))}
          size="standard"
          title={undefined}
          toolbar={
            <Container>
              <Layout.Horizontal>
                <ExpandingSearchInput
                  alwaysExpanded
                  onChange={text => {
                    setPage(0)
                    setSearchTerm(text.trim())
                  }}
                  className={css.search}
                  width={350}
                />
              </Layout.Horizontal>
            </Container>
          }
        />
      )}
      <PageBody
        loading={loading}
        retryOnError={() => refetch()}
        className={pageBodyClassName}
        error={(error?.data as Error)?.message || error?.message}
        noData={
          !searchTerm
            ? {
                when: () => !data?.data?.content?.length,
                icon: 'nav-project',
                message: getString('common.noRefData')
              }
            : {
                when: () => !data?.data?.content?.length,
                icon: 'nav-project',
                message: getString('entityReference.noRecordFound')
              }
        }
      >
        {withSearchBarInPageHeader ? (
          <EntityUsageList entityData={data} gotoPage={pageNumber => setPage(pageNumber)} />
        ) : (
          <Layout.Vertical>
            <ExpandingSearchInput
              alwaysExpanded
              onChange={text => {
                setPage(0)
                setSearchTerm(text.trim())
              }}
              className={css.searchNotinHeader}
              width={350}
            />
            <EntityUsageList
              entityData={data}
              gotoPage={pageNumber => setPage(pageNumber)}
              withNoSpaceAroundTable={!withSearchBarInPageHeader}
            />
          </Layout.Vertical>
        )}
      </PageBody>
    </>
  )
}
