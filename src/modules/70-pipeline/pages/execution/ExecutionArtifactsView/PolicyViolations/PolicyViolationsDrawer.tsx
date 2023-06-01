/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Drawer, Position } from '@blueprintjs/core'
import { Button, ExpandingSearchInput, Heading, PageError, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import React, { ReactElement } from 'react'
import { PageSpinner } from '@common/components'
import { Width } from '@common/constants/Utils'
import { useUpdateQueryParams } from '@common/hooks'
import { useExecutionListQueryParams } from '@pipeline/pages/execution-list/utils/executionListUtil'
import { useStrings } from 'framework/strings'
import { useEnforcementGetEnforcementResultsById } from 'services/ssca'
import {
  ENFORCEMENT_VIOLATIONS_PAGE_INDEX,
  ENFORCEMENT_VIOLATIONS_PAGE_SIZE,
  EnforcementViolationsParamsWithDefaults
} from './utils'
import { PolicyViolationsTable } from './PolicyViolationsTable'
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
  const queryParams = useExecutionListQueryParams()
  const { updateQueryParams } = useUpdateQueryParams<Partial<EnforcementViolationsParamsWithDefaults>>()

  const { data, loading, error, refetch } = useEnforcementGetEnforcementResultsById({
    enforcementId,
    queryParams: {
      page: ENFORCEMENT_VIOLATIONS_PAGE_INDEX,
      pageSize: ENFORCEMENT_VIOLATIONS_PAGE_SIZE
    }
  })

  return (
    <Drawer
      onClose={() => showEnforcementViolations()}
      usePortal={true}
      autoFocus={true}
      canEscapeKeyClose={true}
      canOutsideClickClose={true}
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
      {loading ? (
        <PageSpinner />
      ) : data ? (
        <>
          <Heading level={2} color={Color.GREY_800} font={{ weight: 'bold' }} padding="large">
            {getString('pipeline.artifactViolationDetails')}
          </Heading>
          <div className={css.subHeader}>
            <Text color={Color.GREY_900} font={{ weight: 'bold' }}>
              {`${getString('total')}: ${data?.results?.length}`}
            </Text>
            <ExpandingSearchInput
              defaultValue={queryParams.searchTerm}
              alwaysExpanded
              onChange={value => updateQueryParams({ searchTerm: value, page: ENFORCEMENT_VIOLATIONS_PAGE_INDEX })}
              width={Width.LARGE}
              autoFocus={false}
            />
          </div>

          <PolicyViolationsTable data={data} />
        </>
      ) : (
        <PageError
          message={error}
          onClick={() => {
            refetch()
          }}
        />
      )}
    </Drawer>
  )
}
