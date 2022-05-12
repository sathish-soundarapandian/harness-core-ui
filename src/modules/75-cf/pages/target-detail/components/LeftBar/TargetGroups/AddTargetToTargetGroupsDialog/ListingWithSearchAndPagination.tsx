/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import get from 'lodash/get'
import { Container, ExpandingSearchInput, Pagination, TableV2 } from '@harness/uicore'
import type { Segment, Segments } from 'services/cf'
import { useStrings } from 'framework/strings'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { NoData } from '@cf/components/NoData/NoData'
import imageUrl from '@cf/images/segment.svg'
import {
  AddTargetToTargetGroupsDialogFormValues,
  AddTargetToTargetGroupsDialogStatus as STATUS
} from '@cf/pages/target-detail/TargetDetailPage.types'
import CheckboxCell from './CheckboxCell'
import TargetGroupInfoCell from './TargetGroupInfoCell'

import css from './ListingWithSearchAndPagination.module.scss'

export interface ListingWithSearchAndPaginationProps {
  state: STATUS
  onSearch: (searchTerm: string) => void
  targetGroups: Segments
  setPageNumber: (pageNumber: number) => void
  setFieldValue: (name: string, value: boolean) => void
  values: AddTargetToTargetGroupsDialogFormValues
}

const ListingWithSearchAndPagination: FC<ListingWithSearchAndPaginationProps> = ({
  state,
  onSearch,
  targetGroups,
  setPageNumber,
  setFieldValue,
  values
}) => {
  const { getString } = useStrings()

  return (
    <div className={css.layout}>
      <ExpandingSearchInput width="60%" alwaysExpanded onChange={onSearch} />

      <div className={css.body}>
        {state === STATUS.loading && <ContainerSpinner flex={{ align: 'center-center' }} />}

        {state === STATUS.noSearchResults && (
          <Container height="100%" flex={{ align: 'center-center' }}>
            <NoData imageURL={imageUrl} message={getString('cf.noResultMatch')} />
          </Container>
        )}

        {(state === STATUS.ok || state === STATUS.submitting) && (
          <TableV2<Segment>
            data={targetGroups.segments as Segment[]}
            onRowClick={({ identifier }) =>
              setFieldValue(`targetGroups.${identifier}`, !get(values, `targetGroups.${identifier}`, false))
            }
            columns={[
              {
                Header: '',
                id: 'checkbox',
                width: '32px',
                Cell: CheckboxCell
              },
              {
                Header: getString('cf.shared.segment'),
                id: 'targetgroup-info',
                width: 'calc(100% - 32px)',
                Cell: TargetGroupInfoCell
              }
            ]}
          />
        )}
      </div>

      {state !== STATUS.noSearchResults && (
        <Pagination
          pageSize={targetGroups.pageSize}
          pageCount={targetGroups.pageCount}
          itemCount={targetGroups.itemCount}
          pageIndex={targetGroups.pageIndex}
          gotoPage={setPageNumber}
          hidePageNumbers={targetGroups.pageCount > 4}
        />
      )}
    </div>
  )
}

export default ListingWithSearchAndPagination
