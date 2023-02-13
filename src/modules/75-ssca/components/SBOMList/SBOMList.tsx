/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React, { FC, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Color } from '@harness/design-system'
import { ExpandingSearchInput, ExpandingSearchInputHandle, Layout, Page, Text } from '@harness/uicore'
import { useSearchFind } from 'services/ssca'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { useStrings } from 'framework/strings'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import type { PipelineType, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { SBOMTable } from './SBOMTable'
import css from './SBOMList.module.scss'

export const SBOMList: FC = () => {
  const { getString } = useStrings()

  const searchRef = useRef({} as ExpandingSearchInputHandle)
  const { orgIdentifier, projectIdentifier, accountId } = useParams<PipelineType<PipelinePathProps>>()
  const { updateQueryParams } = useUpdateQueryParams<Partial<{ searchTerm?: string }>>()
  const { searchTerm } = useQueryParams<{ searchTerm?: string }>()

  const { data, refetch, error, loading } = useSearchFind({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier
    },
    packagename: searchTerm || '',
    lazy: !searchTerm
  })

  return (
    <>
      <Page.Header title={<h2> Software Supply Chain Assurance</h2>} breadcrumbs={<NGBreadcrumbs links={[]} />} />
      <Page.SubHeader className={css.subHeader}>
        <Layout.Horizontal style={{ alignItems: 'center' }}>
          <ExpandingSearchInput
            alwaysExpanded
            width={200}
            placeholder={getString('search')}
            onChange={text => {
              updateQueryParams(text ? { searchTerm: text } : { searchTerm: undefined })
            }}
            defaultValue={searchTerm}
            ref={searchRef}
          />
        </Layout.Horizontal>
      </Page.SubHeader>
      <Page.Body className={css.pageBody} loading={loading} error={error?.message} retryOnError={() => refetch()}>
        {data?.packageReferences?.length && (
          <div>
            <div className={css.tableTitle}>
              <Text color={Color.GREY_800} font={{ weight: 'bold' }}>
                {`${getString('total')}: ${data?.packageReferences?.length}`}
              </Text>
            </div>
            {data?.packageReferences && <SBOMTable data={data.packageReferences} />}
          </div>
        )}
      </Page.Body>
    </>
  )
}
