/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useCallback, useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import moment from 'moment'
import type { FormikErrors } from 'formik'
import { pick, get, debounce } from 'lodash-es'
import { Classes, Menu } from '@blueprintjs/core'
import {
  Card,
  Text,
  Layout,
  Container,
  Button,
  FlexExpander,
  Heading,
  Utils,
  FormInput,
  SelectOption,
  MultiSelectOption,
  ExpandingSearchInput,
  PageError,
  shouldShowError,
  useToaster,
  Page
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useModalHook } from '@harness/use-modal'
import { PageSpinner } from '@common/components'
import type { UseGetMockData } from '@common/utils/testUtils'
import { StringUtils } from '@common/exports'
import { Filter, FilterRef } from '@common/components/Filter/Filter'
import type { CrudOperation } from '@common/components/Filter/FilterCRUD/FilterCRUD'
import type { FilterInterface, FilterDataInterface } from '@common/components/Filter/Constants'
import FilterSelector from '@common/components/Filter/FilterSelector/FilterSelector'
import routes from '@common/RouteDefinitions'
import type {
  DelegateConfigProps,
  ProjectPathProps,
  ModulePathParams,
  AccountPathProps
} from '@common/interfaces/RouteInterfaces'
import type { ScopingRuleDetails, GetDelegateGroupsNGV2WithFilterQueryParams } from 'services/portal'
import type { FilterDTO, DelegateProfileFilterProperties, ResponsePageFilterDTO } from 'services/cd-ng'
import {
  useListDelegateConfigsNgV2WithFilter,
  usePostFilter,
  useUpdateFilter,
  useDeleteFilter,
  useGetFilterList
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { TagsViewer } from '@common/components/TagsViewer/TagsViewer'
import {
  removeNullAndEmpty,
  isObjectEmpty,
  UNSAVED_FILTER,
  flattenObject
} from '@common/components/Filter/utils/FilterUtils'
/* RBAC */
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { usePermission } from '@rbac/hooks/usePermission'

import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import css from './DelegatesPage.module.scss'

const formatProfileList = (data: any) => {
  const profiles: Array<DelegateProfileDetails> = data?.resource?.response
  return profiles
}

export const prepareData = (
  data: FilterDataInterface<DelegateProfileFilterProperties, FilterInterface>,
  isUpdate: boolean,
  projectIdentifier?: string,
  orgIdentifier?: string
) => {
  const {
    metadata: { name: _name, filterVisibility, identifier },
    formValues: { identifier: delegateProfileIdentifier, name, description, selectors = {} }
  } = data
  return {
    name: _name,
    identifier: isUpdate ? identifier : StringUtils.getIdentifierFromName(_name),
    projectIdentifier,
    orgIdentifier,
    filterVisibility: filterVisibility,
    filterProperties: {
      filterType: 'DelegateProfile',
      identifier: delegateProfileIdentifier,
      name,
      description,
      selectors: Object.keys(selectors)
    } as DelegateProfileFilterProperties
  }
}

const fullSizeContentStyle: React.CSSProperties = {
  position: 'fixed',
  top: '135px',
  left: '270px',
  width: 'calc(100% - 270px)',
  height: 'calc(100% - 135px)'
}

interface DelegateProfileDetails {
  uuid?: string
  identifier?: string
  accountId?: string
  name?: string
  description?: string
  primary?: boolean
  approvalRequired?: boolean
  startupScript?: string
  scopingRules?: ScopingRuleDetails[]
  selectors?: string[]
  numberOfDelegates?: number
}

interface DelegatesListProps {
  filtersMockData?: UseGetMockData<ResponsePageFilterDTO>
}

export const DelegateConfigurations: React.FC<DelegatesListProps> = ({ filtersMockData }): JSX.Element => {
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const [appliedFilter, setAppliedFilter] = useState<FilterDTO | null>()
  const [filters, setFilters] = useState<FilterDTO[]>()
  const [searchParam, setSearchParam] = useState('')
  const [page, setPage] = useState(0)
  const [isRefreshingFilters, setIsRefreshingFilters] = useState<boolean>(false)
  const [delegateProfiles, setDelegateProfiles] = useState<Array<DelegateProfileDetails>>([])
  const history = useHistory()
  const filterRef = React.useRef<FilterRef<FilterDTO> | null>(null)
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<
    Partial<DelegateConfigProps & ProjectPathProps & ModulePathParams> & AccountPathProps
  >()

  const queryParams: GetDelegateGroupsNGV2WithFilterQueryParams = {
    accountId,
    orgId: orgIdentifier,
    projectId: projectIdentifier,
    module,
    pageIndex: page,
    pageSize: 10,
    searchTerm: ''
  } as GetDelegateGroupsNGV2WithFilterQueryParams

  const {
    mutate: getDelegateProfiles,
    loading: isFetchingDelegateProfiles,
    error: delegateFetchError
  } = useListDelegateConfigsNgV2WithFilter({
    accountId,
    queryParams: { orgId: orgIdentifier, projectId: projectIdentifier }
  })

  const getFilterByIdentifier = (identifier: string): FilterDTO | undefined =>
    /* istanbul ignore if */
    filters?.find((filter: FilterDTO) => filter.identifier?.toLowerCase() === identifier.toLowerCase())

  useEffect(() => {
    setPage(0)
    refetchDelegateProfiles(queryParams)
  }, [projectIdentifier, orgIdentifier])

  const {
    loading: isFetchingFilters,
    data: fetchedFilterResponse,
    refetch: refetchFilterList
  } = useGetFilterList({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      type: 'DelegateProfile'
    },
    mock: filtersMockData
  })

  useEffect(() => {
    setFilters(fetchedFilterResponse?.data?.content || [])
    setIsRefreshingFilters(isFetchingFilters)
  }, [fetchedFilterResponse])

  const { showError } = useToaster()

  const reset = (): void => {
    refetchDelegateProfiles(queryParams)
    setAppliedFilter(undefined)
  }

  const debouncedDelegateProfilesSearch = useCallback(
    debounce((query: string): void => {
      const filterProps = {
        identifier: '',
        name: '',
        description: '',
        selectors: []
      }
      if (query) {
        getDelegateProfiles(filterProps)
      } else {
        page === 0 ? getDelegateProfiles(filterProps) : setPage(0)
      }
    }, 500),
    [getDelegateProfiles, appliedFilter?.filterProperties]
  )

  const refetchDelegateProfiles = useCallback(
    async (params: GetDelegateGroupsNGV2WithFilterQueryParams, filter?): Promise<void> => {
      const { identifier, name, description, selectors = {} } = filter || {}

      const requestBodyPayload = Object.assign(
        filter
          ? {
              identifier,
              name,
              description,
              selectors: Object.keys(selectors)
            }
          : {},
        {
          filterType: 'DelegateProfile'
        }
      )
      const sanitizedFilterRequest = removeNullAndEmpty(requestBodyPayload)
      try {
        const delProfilesResponse = await getDelegateProfiles(sanitizedFilterRequest, { queryParams: params })
        const delProfiles = formatProfileList(delProfilesResponse)
        setDelegateProfiles(delProfiles)
      } catch (e) {
        if (shouldShowError(e)) {
          showError(getRBACErrorMessage(e))
        }
      }
    },
    [getDelegateProfiles]
  )

  const handleSaveOrUpdate = async (
    isUpdate: boolean,
    data: FilterDataInterface<DelegateProfileFilterProperties, FilterInterface>
  ): Promise<void> => {
    await setIsRefreshingFilters(true)
    const saveOrUpdateHandler = filterRef.current?.saveOrUpdateFilterHandler
    if (saveOrUpdateHandler && typeof saveOrUpdateHandler === 'function') {
      const updatedFilter = await saveOrUpdateHandler(
        isUpdate,
        prepareData(data, isUpdate, projectIdentifier, orgIdentifier)
      )
      setAppliedFilter(updatedFilter)
    }
    await refetchFilterList()
    setIsRefreshingFilters(false)
  }

  const handleDelete = async (identifier: string): Promise<void> => {
    setIsRefreshingFilters(true)
    const deleteHandler = filterRef.current?.deleteFilterHandler
    if (deleteHandler && typeof deleteFilter === 'function') {
      await deleteHandler(identifier)
    }
    if (identifier === appliedFilter?.identifier) {
      reset()
    }
    await refetchFilterList()
    setIsRefreshingFilters(false)
  }

  const unsavedFilter = {
    name: UNSAVED_FILTER,
    identifier: StringUtils.getIdentifierFromName(UNSAVED_FILTER)
  }

  const handleFilterClick = (identifier: string): void => {
    if (identifier !== unsavedFilter.identifier) {
      setAppliedFilter(getFilterByIdentifier(identifier))
    }
  }

  const DelegateForm = (): React.ReactElement => {
    return (
      <>
        <FormInput.Text name={'name'} label={getString('delegate.delegateConfiguration')} key={'name'} />
        <FormInput.Text name={'description'} label={getString('description')} key={'description'} />
        <FormInput.KVTagInput name={'selectors'} label={getString('delegates.selectors')} key={'selectors'} />
        <FormInput.Text name={'identifier'} label={getString('identifier')} key={'identifier'} />
      </>
    )
  }

  const { mutate: createFilter } = usePostFilter({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: updateFilter } = useUpdateFilter({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: deleteFilter } = useDeleteFilter({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      type: 'Delegate'
    }
  })

  const [openFilterDrawer, hideFilterDrawer] = useModalHook(() => {
    const onFilterApply = (formData: Record<string, any>) => {
      if (!isObjectEmpty(formData)) {
        const filterFromFormData = { ...formData }
        const updatedQueryParams = {
          ...queryParams,
          searchTerm: searchParam,
          pageIndex: 0
        }
        refetchDelegateProfiles(updatedQueryParams, filterFromFormData)
        setAppliedFilter({ ...unsavedFilter, filterProperties: filterFromFormData })
        setPage(0)
        hideFilterDrawer()
      } else {
        showError(getString('filters.invalidCriteria'))
      }
    }

    const { name, identifier, description, selectors } = (appliedFilter?.filterProperties as any) || {}
    const { name: filterName = '', filterVisibility } = appliedFilter || {}
    return isFetchingDelegateProfiles || isFetchingFilters ? (
      <PageSpinner />
    ) : (
      <Filter<DelegateProfileFilterProperties, FilterDTO>
        onApply={onFilterApply}
        onClose={() => {
          hideFilterDrawer()
          refetchFilterList()
        }}
        filters={filters}
        initialFilter={{
          formValues: {
            name,
            identifier,
            description,
            selectors
          },
          metadata: {
            name: filterName,
            filterVisibility: filterVisibility,
            identifier: appliedFilter?.identifier || '',
            filterProperties: {}
          }
        }}
        onSaveOrUpdate={handleSaveOrUpdate}
        onDelete={handleDelete}
        onFilterSelect={handleFilterClick}
        isRefreshingFilters={isRefreshingFilters}
        formFields={<DelegateForm />}
        onValidate={(
          values: Partial<DelegateProfileFilterProperties>
        ): FormikErrors<Partial<DelegateProfileFilterProperties>> => {
          const errors: FormikErrors<{ description?: MultiSelectOption[] }> = {}
          if (values.description === '') {
            errors.description = ''
          }
          return errors
        }}
        dataSvcConfig={
          new Map<CrudOperation, (...rest: any[]) => Promise<any>>([
            ['ADD', createFilter],
            ['UPDATE', updateFilter],
            ['DELETE', deleteFilter]
          ])
        }
        onSuccessfulCrudOperation={refetchFilterList}
        ref={filterRef}
        onClear={reset}
      />
    )
  }, [isRefreshingFilters, filters, appliedFilter, searchParam, queryParams])

  const DelegateConfigItem = ({ profile }: { profile: DelegateProfileDetails }) => {
    const gotoDetailPage = (): void => {
      history.push(
        routes.toDelegateConfigsDetails({
          accountId,
          delegateConfigIdentifier: profile.identifier as string,
          orgIdentifier,
          projectIdentifier,
          module
        })
      )
    }

    const lastUpdatedAt = get(profile, 'lastUpdatedAt', 0)
    let timeAgo = moment().diff(lastUpdatedAt, 'days')
    let unitAgo = 'days'
    if (timeAgo < 1) {
      timeAgo = moment().diff(lastUpdatedAt, 'hours')
      unitAgo = 'hours'
      if (timeAgo < 1) {
        timeAgo = moment().diff(lastUpdatedAt, 'minutes')
        unitAgo = 'minutes'
      }
    }

    const [canAccessDelegateConfig] = usePermission(
      {
        resourceScope: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier
        },
        resource: {
          resourceType: ResourceType.DELEGATECONFIGURATION
        },
        permissions: [PermissionIdentifier.VIEW_DELEGATE_CONFIGURATION]
      },
      []
    )

    return (
      <Card
        elevation={2}
        interactive={true}
        onClick={() => canAccessDelegateConfig && gotoDetailPage()}
        className={css.delegateProfileElements}
      >
        <div
          style={{
            width: 250,
            height: 200,
            borderRadius: '5px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Layout.Horizontal>
            <Heading
              level={2}
              style={{ fontSize: '16px', fontWeight: 500, color: '#22222A' }}
              padding={{ bottom: 'medium' }}
            >
              {profile.name}
            </Heading>
            <FlexExpander />
            <Container style={{ transform: 'translate(12px, -10px)' }} onClick={Utils.stopEvent}>
              <Button
                minimal
                icon="more"
                tooltip={
                  <Menu style={{ minWidth: 'unset' }}>
                    <RbacMenuItem
                      permission={{
                        resourceScope: {
                          accountIdentifier: accountId,
                          orgIdentifier,
                          projectIdentifier
                        },
                        resource: {
                          resourceType: ResourceType.DELEGATECONFIGURATION,
                          resourceIdentifier: profile.uuid
                        },
                        permission: PermissionIdentifier.UPDATE_DELEGATE_CONFIGURATION
                      }}
                      icon="edit"
                      text={getString('edit')}
                      onClick={() => {
                        history.push({
                          pathname: routes.toEditDelegateConfigsDetails({
                            accountId,
                            projectIdentifier,
                            orgIdentifier,
                            delegateConfigIdentifier: profile.identifier as string,
                            module
                          })
                        })
                      }}
                      className={Classes.POPOVER_DISMISS}
                    />
                  </Menu>
                }
                tooltipProps={{ isDark: true, interactionKind: 'click' }}
                style={{ color: 'var(--grey-400)', transform: 'rotate(90deg)' }}
              />
            </Container>
          </Layout.Horizontal>
          <Layout.Vertical spacing="small" style={{ flexGrow: 1 }}>
            {profile.description && <Text>{profile.description}</Text>}
            <TagsViewer tags={profile.selectors} style={{ background: '#CDF4FE' }} />
          </Layout.Vertical>
          <Container
            flex
            style={{
              borderTop: '1px solid #D9DAE6',
              padding: 'var(--spacing-small) var(--spacing-medium) var(--spacing-small)'
            }}
          >
            <FlexExpander />
          </Container>
          <Layout.Horizontal style={{ justifyContent: 'space-between' }}>
            <Text
              style={{ fontSize: '8px', color: '#6B6D85', letterSpacing: '0.285714px', fontWeight: 500 }}
              margin={{ bottom: 'small' }}
            >
              <div>{getString('delegates.usedBy')}</div>
              <div>
                {profile.numberOfDelegates} {getString('delegate.delegates')}
              </div>
            </Text>
            <Text
              style={{ fontSize: '8px', color: '#6B6D85', letterSpacing: '0.285714px', fontWeight: 500 }}
              margin={{ bottom: 'small' }}
            >
              <div>{getString('delegates.lastUpdated')}</div>
              <div>
                {timeAgo} {unitAgo} ago
              </div>
            </Text>
          </Layout.Horizontal>
        </div>
      </Card>
    )
  }

  const fieldToLabelMapping = new Map<string, string>()

  const handleFilterSelection = (
    option: SelectOption,
    event?: React.SyntheticEvent<HTMLElement, Event> | undefined
  ): void => {
    event?.stopPropagation()
    event?.preventDefault()
    /* istanbul ignore else */
    if (option.value) {
      const selectedFilter = getFilterByIdentifier(option.value?.toString())
      setAppliedFilter(selectedFilter)
      const updatedQueryParams = {
        ...queryParams,
        searchTerm: searchParam,
        pageIndex: 0
      }
      refetchDelegateProfiles(updatedQueryParams, selectedFilter?.filterProperties)
    } else {
      reset()
    }
  }

  return (
    <Container background={Color.GREY_100}>
      <Layout.Horizontal className={css.header} background={Color.WHITE}>
        <Text color={Color.ORANGE_600} font={{ size: 'normal' }} margin={{ top: 'auto', bottom: 'auto' }}>
          {getString('delegates.delegateProfilesDepricated')}
        </Text>
        <FlexExpander />
        <Layout.Horizontal spacing="xsmall">
          <ExpandingSearchInput
            alwaysExpanded
            width={250}
            placeholder={getString('search')}
            throttle={200}
            onChange={text => {
              debouncedDelegateProfilesSearch(text)
              setSearchParam(text.trim())
            }}
            className={css.search}
          />
          <FilterSelector<FilterDTO>
            appliedFilter={appliedFilter}
            filters={filters}
            onFilterBtnClick={openFilterDrawer}
            onFilterSelect={handleFilterSelection}
            fieldToLabelMapping={fieldToLabelMapping}
            filterWithValidFields={removeNullAndEmpty(
              pick(flattenObject(appliedFilter?.filterProperties || {}), ...fieldToLabelMapping.keys())
            )}
          />
        </Layout.Horizontal>
      </Layout.Horizontal>
      <Container
        style={{ width: 'calc(100vw - 270px)', overflow: 'hidden', minHeight: 'calc(100vh - 205px)' }}
        padding="xxlarge"
      >
        <Page.Body>
          {isFetchingDelegateProfiles ? (
            <Container style={fullSizeContentStyle}>
              <ContainerSpinner />
            </Container>
          ) : delegateFetchError && shouldShowError(delegateFetchError) ? (
            <div style={{ paddingTop: '200px' }}>
              <PageError
                message={(delegateFetchError?.data as Error)?.message || delegateFetchError?.message}
                onClick={(e: React.MouseEvent<Element, MouseEvent>) => {
                  e.preventDefault()
                  e.stopPropagation()
                  reset()
                }}
              />
            </div>
          ) : (
            <div className={css.delegateProfilesContainer}>
              {delegateProfiles.map(profile => (
                <DelegateConfigItem key={profile.uuid} profile={profile} />
              ))}
            </div>
          )}
        </Page.Body>
      </Container>
    </Container>
  )
}
export default DelegateConfigurations
