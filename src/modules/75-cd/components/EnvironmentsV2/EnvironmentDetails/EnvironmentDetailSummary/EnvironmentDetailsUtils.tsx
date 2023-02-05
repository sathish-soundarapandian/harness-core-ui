/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonVariation, Container, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import emptyInstanceDetail from '@pipeline/icons/emptyInstanceDetail.svg'
import emptyServiceDetail from '@pipeline/icons/emptyServiceDetail.svg'
import noDataFound from '@pipeline/icons/noDataFound.svg'
import css from './EnvironmentDetailSummary.module.scss'

export function DialogEmptyState({
  isSearchApplied,
  resetSearch,
  message,
  isServicePage = false
}: {
  isSearchApplied: boolean
  resetSearch: () => void
  message: string
  isServicePage?: boolean
}): JSX.Element {
  const { getString } = useStrings()
  return (
    <Container className={cx(css.instanceEmptyState, { [css.serviceDetailDialogEmptyState]: isServicePage })}>
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
