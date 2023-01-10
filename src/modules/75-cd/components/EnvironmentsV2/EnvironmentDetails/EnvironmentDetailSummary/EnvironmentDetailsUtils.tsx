/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonVariation, Container, Layout, Text } from '@harness/uicore'
import cx from 'classnames'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useExecutionListFilterContext } from '@pipeline/pages/execution-list/ExecutionListFilterContext/ExecutionListFilterContext'
import type { ExecutionListProps } from '@pipeline/pages/execution-list/ExecutionList'
import emptyExecutionList from '@pipeline/pages/execution-list/images/cd-execution-illustration.svg'
import emptyInstanceDetail from '@pipeline/icons/emptyInstanceDetail.svg'
import emptyServiceDetail from '@pipeline/icons/emptyServiceDetail.svg'
import noDataFound from '@pipeline/icons/noDataFound.svg'

import css from './EnvironmentDetailSummary.module.scss'

export function DialogEmptyState({
  isSearchApplied,
  resetSearch,
  message
}: {
  isSearchApplied: boolean
  resetSearch: () => void
  message: string
}): JSX.Element {
  const { getString } = useStrings()
  return (
    <Container className={css.instanceEmptyState}>
      {isSearchApplied ? (
        <>
          <img src={noDataFound} alt={getString('common.filters.noResultsFound')} />
          <Text font={{ weight: 'bold', size: 'medium' }} color={Color.GREY_800}>
            {getString('common.filters.noResultsFound')}
          </Text>
          <Button
            text={getString('common.filters.clearFilters')}
            variation={ButtonVariation.LINK}
            onClick={resetSearch}
          />
        </>
      ) : (
        <>
          <img src={emptyInstanceDetail} alt={getString('cd.environmentDetailPage.selectArtifactMsg')} />
          <Text>{message}</Text>
        </>
      )}
    </Container>
  )
}

export function ServiceDetailEmptyState(): JSX.Element {
  const { getString } = useStrings()
  return (
    <Container className={css.serviceDetailEmptyState}>
      <img src={emptyServiceDetail} alt={getString('cd.environmentDetailPage.emptyServiceDetailMsg')} />
      <Text>{getString('cd.environmentDetailPage.emptyServiceDetailMsg')}</Text>
    </Container>
  )
}

export function ExecutionListEmptyState({
  resetFilter
}: Pick<ExecutionListProps, 'isPipelineInvalid'> & { resetFilter: () => void }): JSX.Element {
  const { getString } = useStrings()
  const { isAnyFilterApplied } = useExecutionListFilterContext()

  return (
    <Container className={cx(css.serviceDetailEmptyState, css.executionListEmpty)}>
      {isAnyFilterApplied ? (
        <Layout.Vertical flex={{ alignItems: 'center' }}>
          <img src={noDataFound} alt={getString('common.filters.noResultsFound')} />
          <Text
            margin={{ top: 'large', bottom: 'small' }}
            font={{ weight: 'bold', size: 'medium' }}
            color={Color.GREY_800}
          >
            {getString('common.filters.noResultsFound')}
          </Text>
          <Button
            text={getString('common.filters.clearFilters')}
            variation={ButtonVariation.LINK}
            onClick={resetFilter}
          />
        </Layout.Vertical>
      ) : (
        <Layout.Vertical>
          <img src={emptyExecutionList} alt={getString('cd.environmentDetailPage.emptyExecutionListMsg')} />
          <Text>{getString('cd.environmentDetailPage.emptyExecutionListMsg')}</Text>
        </Layout.Vertical>
      )}
    </Container>
  )
}
