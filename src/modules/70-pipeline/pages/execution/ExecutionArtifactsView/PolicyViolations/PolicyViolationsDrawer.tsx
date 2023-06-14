/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Drawer, Position } from '@blueprintjs/core'
import {
  Button,
  ButtonVariation,
  ExpandingSearchInput,
  ExpandingSearchInputHandle,
  Heading,
  Page,
  Text
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import React, { ReactElement, useRef, useState } from 'react'
import { Width } from '@common/constants/Utils'
import { useStrings } from 'framework/strings'
import { useEnforcementGetEnforcementResultsById } from 'services/ssca'
import EmptySearchResults from '@common/images/EmptySearchResults.svg'
import { ENFORCEMENT_VIOLATIONS_PAGE_INDEX, ENFORCEMENT_VIOLATIONS_PAGE_SIZE } from './utils'
import { PolicyViolationsTable } from './PolicyViolationsTable'
import type { SortBy } from './PolicyViolationsTableCells'
import css from './PolicyViolations.module.scss'

interface PolicyViolationsDrawerProps {
  enforcementId: string
  showEnforcementViolations: (enforcementId?: string) => void
}

export function PolicyViolationsDrawer({
  enforcementId,
  showEnforcementViolations
}: PolicyViolationsDrawerProps): ReactElement {
  const { getString } = useStrings()
  const searchRef = useRef({} as ExpandingSearchInputHandle)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>({
    sort: 'name',
    order: 'ASC'
  })

  const resetFilter = (): void => {
    setSearchTerm('')
    searchRef.current.clear()
  }

  const { data, loading, error, refetch } = useEnforcementGetEnforcementResultsById({
    enforcementId,
    queryParams: {
      page: ENFORCEMENT_VIOLATIONS_PAGE_INDEX,
      pageSize: ENFORCEMENT_VIOLATIONS_PAGE_SIZE,
      searchTerm,
      sort: sortBy.sort,
      order: sortBy.order
    }
  })

  return (
    <Drawer
      onClose={() => showEnforcementViolations()}
      usePortal
      autoFocus
      canEscapeKeyClose
      canOutsideClickClose
      enforceFocus={false}
      hasBackdrop={true}
      size="calc(100vw - 272px)"
      isOpen
      position={Position.RIGHT}
    >
      <Button
        className={css.drawerCloseButton}
        minimal
        icon="cross"
        withoutBoxShadow
        onClick={() => showEnforcementViolations()}
      />

      <Heading level={2} color={Color.GREY_800} font={{ weight: 'bold' }} padding="large">
        {getString('pipeline.artifactViolationDetails')}
      </Heading>

      <Page.Body
        loading={loading}
        error={error?.message || error}
        retryOnError={() => refetch()}
        noData={{
          when: () => !error && !data?.results?.length,
          image: EmptySearchResults,
          messageTitle: getString('common.filters.noResultsFound'),
          message: getString('common.filters.noMatchingFilterData'),
          button: (
            <Button
              variation={ButtonVariation.LINK}
              onClick={resetFilter}
              text={getString('common.filters.clearFilters')}
            />
          )
        }}
      >
        <div className={css.subHeader}>
          <Text color={Color.GREY_900} font={{ weight: 'bold' }}>
            {`${getString('total')}: ${data?.results?.length}`}
          </Text>
          <ExpandingSearchInput
            defaultValue={searchTerm}
            alwaysExpanded
            onChange={setSearchTerm}
            width={Width.LARGE}
            autoFocus={false}
            ref={searchRef}
          />
        </div>

        <PolicyViolationsTable data={data} setSortBy={setSortBy} sortBy={sortBy} />
      </Page.Body>
    </Drawer>
  )
}
