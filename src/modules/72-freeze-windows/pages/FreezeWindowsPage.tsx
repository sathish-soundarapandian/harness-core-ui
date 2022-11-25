/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  Button,
  ButtonVariation,
  ExpandingSearchInputHandle,
  Layout,
  Page,
  PageSpinner,
  Text,
  useToaster
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import React, { ReactElement, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { useUpdateQueryParams, useQueryParams, useMutateAsGet } from '@common/hooks'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import {
  GetFreezeListQueryParams,
  useGetFreezeList,
  useUpdateFreezeStatus,
  UseUpdateFreezeStatusProps,
  useDeleteManyFreezes
} from 'services/cd-ng'
import { FreezeWindowListSubHeader } from '@freeze-windows/components/FreezeWindowListSubHeader/FreezeWindowListSubHeader'
import { BulkActions } from '@freeze-windows/components/BulkActions/BulkActions'
import type { FreezeListUrlQueryParams } from '@freeze-windows/types'
import { FreezeWindowListHeader } from '@freeze-windows/components/FreezeWindowListHeader/FreezeWindowListHeader'
import { FreezeWindowList } from '@freeze-windows/components/FreezeWindowList/FreezeWindowList'
import { FreezeWindowListProvider, useFreezeWindowListContext } from '@freeze-windows/context/FreezeWindowListContext'
import { getQueryParamOptions } from '@freeze-windows/utils/queryUtils'
import type { FreezeWindowListColumnActions } from '@freeze-windows/components/FreezeWindowList/FreezeWindowListCells'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { useConfirmFreezeDelete } from '@freeze-windows/hooks/useConfirmFreezeDelete'
import { DEFAULT_PAGE_INDEX } from '@pipeline/utils/constants'
import { NewFreezeWindowButton } from '@freeze-windows/components/NewFreezeWindowButton/NewFreezeWindowButton'
import { useComputedFreezeStatusMap } from '@freeze-windows/hooks/useComputedFreezeStatusMap'
import freezeWindowsIllustration from '@freeze-windows/images/freeze-windows-illustration.svg'
import { GlobalFreezeBanner } from '@common/components/GlobalFreezeBanner/GlobalFreezeBanner'
import { useGlobalFreezeBanner } from '@common/components/GlobalFreezeBanner/useGlobalFreezeBanner'
import EmptySearchResults from '@common/images/EmptySearchResults.svg'
import css from '@freeze-windows/components/FreezeWindowListSubHeader/FreezeWindowListSubHeader.module.scss'

function _FreezeWindowsPage(): React.ReactElement {
  const { getString } = useStrings()
  const { showSuccess, showWarning } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const scope = getScopeFromDTO({ projectIdentifier, orgIdentifier, accountId })
  const { replaceQueryParams, updateQueryParams } = useUpdateQueryParams<Partial<GetFreezeListQueryParams>>()
  const queryParams = useQueryParams<FreezeListUrlQueryParams>(getQueryParamOptions())
  const { searchTerm, page, size, sort, freezeStatus, startTime, endTime } = queryParams
  const { selectedItems, toggleAllSelect } = useFreezeWindowListContext()
  const searchRef = useRef({} as ExpandingSearchInputHandle)

  const resetFilter = (): void => {
    searchRef.current.clear()
    replaceQueryParams({})
  }

  useDocumentTitle([getString('common.freezeWindows')])

  const {
    data,
    error,
    loading: freezeListLoading,
    refetch
  } = useMutateAsGet(useGetFreezeList, {
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      page,
      size
    },
    body: {
      freezeStatus,
      searchTerm,
      sort: [sort.join(',')],
      startTime,
      endTime
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  })

  const { mutate: updateFreezeStatus, loading: updateFreezeStatusLoading } = useUpdateFreezeStatus({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  } as UseUpdateFreezeStatusProps)

  const { mutate: deleteFreeze, loading: deleteFreezeLoading } = useDeleteManyFreezes({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })

  const handleDelete = async (freezeWindowId?: string) => {
    try {
      if (freezeWindowId) {
        await deleteFreeze([freezeWindowId])
      } else {
        await deleteFreeze(selectedItems)
      }
      showSuccess(getString('freezeWindows.freezeWindowsPage.deleteSuccess'))
    } catch (err: any) {
      showWarning(defaultTo(getRBACErrorMessage(err), getString('freezeWindows.freezeWindowsPage.deleteFailure')))
    }
    toggleAllSelect(false)
    updateQueryParams({ page: DEFAULT_PAGE_INDEX }) // scenario where the page number is invalid with elements in the page being deleted
    refetch()
  }

  const handleFreezeToggle: FreezeWindowListColumnActions['onToggleFreezeRow'] = async ({ freezeWindowId, status }) => {
    try {
      if (freezeWindowId) {
        await updateFreezeStatus([freezeWindowId], { queryParams: { status } } as UseUpdateFreezeStatusProps)
      } else {
        await updateFreezeStatus(selectedItems, { queryParams: { status } } as UseUpdateFreezeStatusProps)
      }
      showSuccess(getString('freezeWindows.freezeWindowsPage.updateStatusSuccess', { value: status }))
    } catch (err: any) {
      showWarning(defaultTo(getRBACErrorMessage(err), getString('freezeWindows.freezeWindowsPage.updateStatusFailure')))
    }
    toggleAllSelect(false)
    refetch()
  }

  const confirmFreezeDelete = useConfirmFreezeDelete(handleDelete)
  const hasFilter = !!(searchTerm || freezeStatus || startTime || endTime)
  const pageFreezeSummaryResponse = data?.data

  const freezeStatusMap = useComputedFreezeStatusMap(data?.data?.content)
  const { globalFreezes, refetch: refreshGlobalFreezeBanner } = useGlobalFreezeBanner()

  return (
    <div className={css.main}>
      <FreezeWindowListHeader
        freezeListLoading={freezeListLoading}
        refreshGlobalFreezeBanner={refreshGlobalFreezeBanner}
      />
      <FreezeWindowListSubHeader ref={searchRef} />
      <GlobalFreezeBanner globalFreezes={globalFreezes} />

      <Page.Body
        loading={freezeListLoading}
        error={error?.message}
        retryOnError={refetch}
        noData={{
          when: () => !pageFreezeSummaryResponse?.content?.length,
          image: hasFilter ? EmptySearchResults : freezeWindowsIllustration,
          messageTitle: hasFilter
            ? getString('common.filters.noResultsFound')
            : getString('freezeWindows.freezeWindowsPage.noFreezeWindows', { scope }),
          message: hasFilter
            ? getString('common.filters.noMatchingFilterData')
            : getString('freezeWindows.freezeWindowsPage.aboutFeezeWindows'),
          button: hasFilter ? (
            <Button
              variation={ButtonVariation.LINK}
              onClick={resetFilter}
              text={getString('common.filters.clearFilters')}
            />
          ) : (
            <NewFreezeWindowButton text={getString('freezeWindows.freezeWindowsPage.createFreezeWindow')} />
          )
        }}
      >
        {(deleteFreezeLoading || updateFreezeStatusLoading) && <PageSpinner />}
        <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'start' }}>
          <Text color={Color.GREY_800} font={{ weight: 'bold' }} padding="large">
            {`${getString('total')}: ${data?.data?.totalItems}`}
          </Text>
          <BulkActions onDelete={confirmFreezeDelete} onToggleFreeze={handleFreezeToggle} />
        </Layout.Horizontal>
        {pageFreezeSummaryResponse && (
          <FreezeWindowList
            data={pageFreezeSummaryResponse}
            onDeleteRow={confirmFreezeDelete}
            onToggleFreezeRow={handleFreezeToggle}
            freezeStatusMap={freezeStatusMap}
          />
        )}
      </Page.Body>
    </div>
  )
}

export default function FreezeWindowsPage(): ReactElement {
  return (
    <FreezeWindowListProvider>
      <_FreezeWindowsPage />
    </FreezeWindowListProvider>
  )
}
