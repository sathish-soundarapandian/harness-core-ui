/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'

import {
  Layout,
  Text,
  Button,
  Container,
  Dialog,
  ExpandingSearchInput,
  Pagination,
  SelectOption,
  useToaster
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import type { Breadcrumb } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Select } from '@blueprintjs/select'

import { Menu } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { useQueryParamsState } from '@common/hooks/useQueryParamsState'

import { Page } from '@common/exports'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import type { PermissionRequest } from '@rbac/hooks/usePermission'
import ModuleTagsFilter from '@dashboards/components/ModuleTagsFilter/ModuleTagsFilter'

import { ErrorResponse, useDeleteDashboard, useGetFolderDetail, useSearch } from 'services/custom-dashboards'
import routes from '@common/RouteDefinitions'

import { DashboardLayoutViews, DashboardTags, MappedDashboardTagOptions } from '@dashboards/types/DashboardTypes.types'
import { SHARED_FOLDER_ID } from '@dashboards/constants'
import { useStrings } from 'framework/strings'
import Dashboards from './Dashboards'
import { useDashboardsContext } from '../DashboardsContext'
import FilterTagsSideBar from './FilterTagsSideBar'
import CreateDashboardForm from './CreateDashboardForm'
import css from './HomePage.module.scss'
import moduleTagCss from '@dashboards/common/ModuleTags.module.scss'

export const PAGE_SIZE = 20

const CustomSelect = Select.ofType<SelectOption>()

const getBreadcrumbLinks = (
  folderDetail: { resource?: string },
  accountId: string,
  folderId: string,
  folderString: string
): Breadcrumb[] => {
  if (folderDetail?.resource) {
    return [
      {
        url: routes.toCustomFolderHome({ accountId }),
        label: folderString
      },
      {
        url: routes.toViewCustomFolder({ folderId, accountId }),
        label: folderDetail.resource
      }
    ]
  }
  return []
}

const HomePage: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, folderId } = useParams<{ accountId: string; folderId: string }>()
  const { showSuccess, showError } = useToaster()
  const isNotShared = folderId !== SHARED_FOLDER_ID

  const defaultSortBy: SelectOption = {
    label: 'Select Option',
    value: ''
  }

  const sortingOptions: SelectOption[] = [
    {
      label: getString('name'),
      value: 'title'
    },
    {
      label: getString('dashboards.dashboardSortingOptions.recentlyViewed'),
      value: 'last_accessed_at desc'
    },
    {
      label: getString('dashboards.dashboardSortingOptions.recentlyCreated'),
      value: 'created_at desc'
    },
    {
      label: getString('dashboards.dashboardSortingOptions.mostViewed'),
      value: 'view_count desc'
    }
  ]

  const DEFAULT_FILTER: MappedDashboardTagOptions = {
    HARNESS: false,
    CE: false,
    CD: false,
    CI: false,
    CF: false,
    CHAOS: false,
    STO: false,
    SRM: false
  }

  const [customTags, setCustomTags] = useQueryParamsState<string[]>('customTags', [])
  const [page, setPage] = useQueryParamsState('page', 0)
  const [searchTerm, setSearchTerm] = useQueryParamsState<string | undefined>('search', undefined)
  const [sortBy, setSortingFilter] = useQueryParamsState<SelectOption>('sortBy', defaultSortBy)
  const [selectedTags, setCheckboxFilter] = useQueryParamsState('tags', DEFAULT_FILTER)
  const [layoutView, setLayoutView] = useQueryParamsState('view', DashboardLayoutViews.GRID)

  const { editableFolders, includeBreadcrumbs } = useDashboardsContext()

  const hasEditableFolders = !!editableFolders.length

  const serialize = (obj: { [key: string]: boolean }): string => {
    return new URLSearchParams(Object.entries(obj).map(([k, v]) => [k, v.toString()])).toString()
  }

  const folderIdOrBlank = (): string => {
    return isNotShared ? folderId : ''
  }

  React.useEffect(() => {
    const script = document.createElement('script')

    script.src = 'https://fast.wistia.com/assets/external/E-v1.js'
    script.async = true

    document.body.appendChild(script)
  }, [])

  const {
    data,
    loading,
    refetch: refetchDashboards,
    error
  } = useSearch({
    debounce: true,
    queryParams: {
      accountId: accountId,
      folderId: folderIdOrBlank(),
      searchTerm,
      page: page + 1,
      pageSize: PAGE_SIZE,
      tags: serialize(selectedTags),
      sortBy: sortBy.value.toString(),
      customTag: customTags.join('%')
    }
  })

  const onCustomTagSelected = (tag: string): void => {
    if (!customTags.includes(tag)) {
      setCustomTags([...customTags, tag])
      setPage(0)
    }
  }

  const dashboardList = React.useMemo(() => data?.resource || [], [data])

  const { data: folderDetail, refetch: fetchFolderDetail } = useGetFolderDetail({
    lazy: true,
    queryParams: { accountId, folderId }
  })

  const { mutate: deleteDashboard, loading: deleting } = useDeleteDashboard({ queryParams: { accountId, folderId } })

  React.useEffect(() => {
    if (isNotShared) {
      fetchFolderDetail()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, folderId])

  const setPredefinedFilter = (filterType: DashboardTags, isChecked: boolean): void => {
    const updatedValue: MappedDashboardTagOptions = { ...selectedTags }
    updatedValue[filterType] = isChecked
    setCheckboxFilter(updatedValue)
    setPage(0)
  }

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog isOpen={true} enforceFocus={false} onClose={hideModal} className={cx(css.dashboardDialog, css.create)}>
        <CreateDashboardForm editableFolders={editableFolders} hideModal={hideModal} />
      </Dialog>
    ),
    [editableFolders]
  )

  const permissionObj: PermissionRequest = {
    permission: PermissionIdentifier.EDIT_DASHBOARD,
    resource: {
      resourceType: ResourceType.DASHBOARDS
    }
  }

  if (isNotShared) {
    permissionObj['resource']['resourceIdentifier'] = folderId
  }

  React.useEffect(() => {
    includeBreadcrumbs(
      getBreadcrumbLinks(folderDetail || {}, accountId, folderId, getString('dashboards.homePage.folders'))
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderDetail, accountId, folderId])

  const onDeleteDashboard = async (dashboardId: string): Promise<void> => {
    try {
      await deleteDashboard({ dashboardId })
      showSuccess(getString('dashboards.deleteDashboard.success'))
      refetchDashboards()
    } catch (e) {
      showError(e?.data?.responseMessages || getString('dashboards.deleteDashboard.failed'))
    }
  }

  return (
    <Page.Body
      loading={loading || deleting}
      error={(error?.data as ErrorResponse)?.responseMessages}
      retryOnError={() => refetchDashboards()}
    >
      <Layout.Horizontal>
        <Layout.Horizontal
          padding="large"
          background={Color.GREY_0}
          spacing="medium"
          flex={{ justifyContent: 'space-between', alignItems: 'start' }}
          border={{ bottom: true, color: 'grey100' }}
          width="100%"
        >
          <RbacButton
            intent="primary"
            text={getString('dashboardLabel')}
            onClick={showModal}
            icon="plus"
            className={css.createButton}
            disabled={!hasEditableFolders}
          />
          <Container className={cx(moduleTagCss.predefinedTags, css.mainNavTag)}>
            <ModuleTagsFilter selectedFilter={selectedTags} setPredefinedFilter={setPredefinedFilter} />
          </Container>
          <Layout.Horizontal>
            <CustomSelect
              items={sortingOptions}
              filterable={false}
              itemRenderer={(item, { handleClick, index }) => (
                <Menu.Item
                  key={`sort-menu-${item.label.toLowerCase()}-${index}`}
                  text={item.label}
                  onClick={handleClick}
                />
              )}
              onItemSelect={item => {
                setSortingFilter(item)
              }}
              popoverProps={{ minimal: true, popoverClassName: '' }}
            >
              <Button
                inline
                round
                rightIcon="chevron-down"
                className={css.customSelect}
                text={
                  <Text color={Color.BLACK}>
                    {getString('dashboards.sortBy')} {sortBy.label}
                  </Text>
                }
              />
            </CustomSelect>
            <Layout.Horizontal>
              <Button
                minimal
                aria-label={getString('dashboards.switchToGridView')}
                icon="grid-view"
                intent={layoutView === DashboardLayoutViews.GRID ? 'primary' : 'none'}
                onClick={() => {
                  setLayoutView(DashboardLayoutViews.GRID)
                }}
              />
              <Button
                minimal
                aria-label={getString('dashboards.switchToListView')}
                icon="list"
                intent={layoutView === DashboardLayoutViews.LIST ? 'primary' : 'none'}
                onClick={() => {
                  setLayoutView(DashboardLayoutViews.LIST)
                }}
              />
            </Layout.Horizontal>
          </Layout.Horizontal>
        </Layout.Horizontal>
      </Layout.Horizontal>

      <FilterTagsSideBar onTagClicked={onCustomTagSelected} />

      <Layout.Vertical className={css.homeContent}>
        <Layout.Horizontal padding={{ top: 'large', right: 'xxxlarge', bottom: 'large', left: 'xxxlarge' }}>
          <ExpandingSearchInput
            placeholder={getString('common.searchByNamePlaceholder')}
            defaultValue={searchTerm}
            onChange={(text: string) => {
              setSearchTerm(text)
              setPage(0)
            }}
            className={css.search}
          />
        </Layout.Horizontal>
        <Layout.Horizontal
          margin={{ left: 'xxxlarge' }}
          flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}
        >
          <Container>
            {customTags.map((tag: string, index: number) => {
              return (
                <Container className={cx(moduleTagCss.customTag, css.filteredTags)} key={tag + index}>
                  {tag}
                  <Button
                    minimal
                    aria-label={getString('dashboards.homePage.removeTagFromFilter')}
                    icon="cross"
                    className={css.clearTagButton}
                    onClick={() => {
                      const filterTags = customTags.filter(v => v !== tag)
                      setCustomTags(filterTags)
                      setPage(0)
                    }}
                  />
                </Container>
              )
            })}
          </Container>
          {customTags?.length > 0 && (
            <Button
              minimal
              intent="primary"
              onClick={() => {
                setCustomTags([])
                setPage(0)
              }}
            >
              {getString('filters.clearAll')}
            </Button>
          )}
        </Layout.Horizontal>
        <Dashboards
          dashboards={dashboardList}
          loading={loading}
          deleteDashboard={onDeleteDashboard}
          triggerRefresh={refetchDashboards}
          view={layoutView}
        />
      </Layout.Vertical>

      {!loading && !!data?.items && (
        <Layout.Vertical padding={{ left: 'medium', right: 'medium' }}>
          <Pagination
            itemCount={data.items}
            pageSize={PAGE_SIZE}
            pageCount={data?.pages || 1}
            pageIndex={page}
            gotoPage={(pageNumber: number) => setPage(pageNumber)}
          />
        </Layout.Vertical>
      )}
    </Page.Body>
  )
}

export default HomePage
