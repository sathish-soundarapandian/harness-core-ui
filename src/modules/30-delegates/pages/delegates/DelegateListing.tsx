/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { GetDataError } from 'restful-react'
import { get, set, pick, debounce } from 'lodash-es'
import type { FormikErrors } from 'formik'
import { useParams } from 'react-router-dom'
import {
  Container,
  Layout,
  FlexExpander,
  ExpandingSearchInput,
  SelectOption,
  FormInput,
  MultiSelectOption,
  PageError,
  shouldShowError,
  Button,
  Text,
  Formik,
  FormikForm,
  SupText
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'

import { Dialog } from '@blueprintjs/core'
import { PageSpinner } from '@common/components'
import type { UseGetMockData } from '@common/utils/testUtils'
import FilterSelector from '@common/components/Filter/FilterSelector/FilterSelector'
import { Filter, FilterRef } from '@common/components/Filter/Filter'
import type { CrudOperation } from '@common/components/Filter/FilterCRUD/FilterCRUD'
import type { FilterInterface, FilterDataInterface } from '@common/components/Filter/Constants'
import {
  removeNullAndEmpty,
  isObjectEmpty,
  UNSAVED_FILTER,
  flattenObject
} from '@common/components/Filter/utils/FilterUtils'

import { useStrings } from 'framework/strings'
import {
  GetDelegateGroupsNGV2WithFilterQueryParams,
  useGetDelegateGroupsNGV2WithFilter,
  DelegateGroupDetails,
  useGetWarnLog,
  DelegateHackLog,
  useDialogFlow
} from 'services/portal'
import { usePostFilter, useUpdateFilter, useDeleteFilter, useGetFilterList } from 'services/cd-ng'
import type { FilterDTO, ResponsePageFilterDTO, Failure, DelegateFilterProperties } from 'services/cd-ng'
import useCreateDelegateModal from '@delegates/modals/DelegateModal/useCreateDelegateModal'
import DelegateInstallationError from '@delegates/components/CreateDelegate/components/DelegateInstallationError/DelegateInstallationError'
import { useToaster, StringUtils } from '@common/exports'
import DelegatesEmptyState from '@delegates/images/DelegatesEmptyState.svg'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import useCreateDelegateViaCommandsModal from '@delegates/pages/delegates/delegateCommandLineCreation/components/useCreateDelegateViaCommandsModal'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, DelegateActions } from '@common/constants/TrackingConstants'
import { getDelegateStatusSelectOptions } from './utils/DelegateHelper'
import DelegateListingItem from './DelegateListingItem'

import css from './DelegatesPage.module.scss'
const POLLING_INTERVAL = 10000

type Sender = 'USER' | 'API'

type Message = {
  sender: Sender
  message: string
  key?: string
}

const ChatData: Record<string, string> = {
  'AWS Connector Error': `Looks like your aws credentials are expired, Please look into AWS Access key and Secret Keys are working.`,
  'Vault Secret Manager Renewal failure': `Looks like Vault Secret Manager unable to renew the token, It might be happened due to expired credentials or credentials does not have the enough permission`,
  'create custom delegate image': `Create a new delegate instance by navigating to the Delegates page in Harness and clicking the Add Delegate button.

  In the Delegate configuration settings, select Custom as the Delegate Type.

  In the Custom Delegate section, choose the Custom Docker Image option.

  Enter the name of the Docker image you want to use as the delegate image.

  Specify any additional settings, such as environment variables or command arguments, in the Delegate Configuration section.

  Save your changes and start the delegate instance.

  Your custom delegate image will now be used as the basis for your Harness delegate instances. You can use any Docker image that meets the requirements for Harness delegate images, which are documented in the Harness documentation.
  `,

  'create custom secret manager': `Navigate to the Secrets page in Harness and click the Add Secret Manager button.

  In the Add Secret Manager dialog, select Custom as the Secret Manager Type.

  In the Custom Secret Manager section, provide the following information:

  Name: A descriptive name for your custom secret manager.
  Description: An optional description of your custom secret manager.
  Type: Select Custom from the dropdown menu.
  Configure your custom secret manager by specifying any relevant settings, such as authentication credentials or connection details.

  Save your changes and verify that your custom secret manager is now available for use in your Harness workflows.
`
}

interface DelegatesListProps {
  filtersMockData?: UseGetMockData<ResponsePageFilterDTO>
}

export const DelegateListing: React.FC<DelegatesListProps> = ({ filtersMockData }) => {
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<Record<string, string>>()
  const [searchTerm, setSearchTerm] = useState('')
  const [showDelegateLoader, setShowDelegateLoader] = useState<boolean>(true)
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState<FilterDTO[]>()
  const [appliedFilter, setAppliedFilter] = useState<FilterDTO | null>()
  const { showError } = useToaster()
  const [delegateGroups, setDelegateGroups] = useState<Array<DelegateGroupDetails>>([])
  const [delegateFetchError, setDelegateFetchError] = useState<GetDataError<Failure | Error>>()
  const [isRefreshingFilters, setIsRefreshingFilters] = useState<boolean>(false)
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const filterRef = React.useRef<FilterRef<FilterDTO> | null>(null)
  const { trackEvent } = useTelemetry()
  const [troubleshoterOpen, setOpenTroubleshoter] = useState<
    { isConnected: boolean | undefined; delegateType: string | undefined } | undefined
  >(undefined)

  const queryParams: GetDelegateGroupsNGV2WithFilterQueryParams = useMemo(
    () =>
      ({
        accountId,
        orgId: orgIdentifier,
        projectId: projectIdentifier,
        module,
        pageIndex: page,
        pageSize: 10,
        searchTerm: ''
      } as GetDelegateGroupsNGV2WithFilterQueryParams),
    [accountId, module, orgIdentifier, projectIdentifier, page]
  )
  const { mutate: fetchDelegates, loading: isFetchingDelegates } = useGetDelegateGroupsNGV2WithFilter({ queryParams })
  const { openDelegateModal } = useCreateDelegateModal()
  const { openDelegateModalWithCommands } = useCreateDelegateViaCommandsModal({
    oldDelegateCreation: openDelegateModal
  })

  useEffect(() => {
    setShowDelegateLoader(true)
    refetchDelegates(queryParams)
  }, [queryParams])

  const {
    loading: isFetchingFilters,
    data: fetchedFilterResponse,
    refetch: refetchFilterList
  } = useGetFilterList({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      type: 'Delegate'
    },
    mock: filtersMockData
  })

  useEffect(() => {
    setFilters(fetchedFilterResponse?.data?.content || [])
    setIsRefreshingFilters(isFetchingFilters)
  }, [fetchedFilterResponse])

  const refetchDelegates = useCallback(
    async (params: GetDelegateGroupsNGV2WithFilterQueryParams, filter?): Promise<void> => {
      const { delegateGroupIdentifier, delegateName, delegateType, description, hostName, status, delegateTags } =
        filter || {}
      if (params.searchTerm === '') {
        delete params.searchTerm
      }
      const requestBodyPayload = Object.assign(
        filter
          ? {
              delegateGroupIdentifier,
              delegateName,
              delegateType,
              description,
              hostName,
              status,
              delegateTags
            }
          : {},
        {
          filterType: 'Delegate'
        }
      )
      const sanitizedFilterRequest = removeNullAndEmpty(requestBodyPayload)
      try {
        setDelegateFetchError(undefined)
        const delegateResponse = await fetchDelegates(sanitizedFilterRequest, { queryParams: params })
        const delGroups = delegateResponse?.resource?.delegateGroupDetails || []
        if (delGroups) {
          delGroups.forEach((delegateGroup: DelegateGroupDetails) => {
            const delName = `${get(delegateGroup, 'groupName', '')} ${getString('delegate.instancesCount', {
              count: delegateGroup?.delegateInstanceDetails?.length,
              total: ''
            })}`
            set(delegateGroup, 'delegateName', delName)
          })
          setDelegateGroups(delGroups)
        }
      } catch (e) {
        if (shouldShowError(e)) {
          showError(getRBACErrorMessage(e))
        }
        setDelegateFetchError(e)
      } finally {
        setShowDelegateLoader(false)
      }
    },
    [fetchDelegates]
  )

  // Add polling
  useEffect(() => {
    let timeoutId = 0

    if (!isFetchingDelegates && !delegateFetchError && !isFilterOpen) {
      timeoutId = window.setTimeout(() => {
        setShowDelegateLoader(false)
        refetchDelegates({ ...queryParams, searchTerm }, appliedFilter?.filterProperties)
      }, POLLING_INTERVAL)
    }

    return () => {
      clearTimeout(timeoutId)
    }
  }, [isFetchingDelegates, delegateFetchError, refetchDelegates, isFilterOpen])

  const formatPayload = (data: FilterDataInterface<DelegateFilterProperties, FilterInterface>, isUpdate: boolean) => {
    const {
      metadata: { name: _name, filterVisibility, identifier },
      formValues: { delegateGroupIdentifier, delegateName, delegateType, description, hostName, status, delegateTags }
    } = data
    return {
      name: _name,
      identifier: isUpdate ? identifier : StringUtils.getIdentifierFromName(_name),
      projectIdentifier,
      orgIdentifier,
      filterVisibility: filterVisibility,
      filterProperties: {
        filterType: 'Delegate',
        delegateGroupIdentifier,
        delegateName,
        delegateType,
        description,
        hostName,
        status,
        delegateTags
      } as DelegateFilterProperties
    }
  }

  const handleSaveOrUpdate = async (
    isUpdate: boolean,
    data: FilterDataInterface<DelegateFilterProperties, FilterInterface>
  ): Promise<void> => {
    await setIsRefreshingFilters(true)
    const requestBodyPayload = formatPayload(data, isUpdate)
    const saveOrUpdateHandler = filterRef.current?.saveOrUpdateFilterHandler
    if (saveOrUpdateHandler && typeof saveOrUpdateHandler === 'function') {
      const updatedFilter = await saveOrUpdateHandler(isUpdate, requestBodyPayload)
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
        <FormInput.Text name={'delegateName'} label={getString('delegate.delegateName')} key={'delegateName'} />
        <FormInput.Text name={'delegateType'} label={getString('delegate.delegateType')} key={'delegateType'} />
        <FormInput.Text name={'description'} label={getString('description')} key={'description'} />
        <FormInput.Text name={'hostName'} label={getString('delegate.hostName')} key={'hostName'} />
        <FormInput.Select
          items={getDelegateStatusSelectOptions(getString)}
          name={'status'}
          label={getString('status')}
          key={'status'}
        />
        <FormInput.Text
          name={'delegateGroupIdentifier'}
          label={getString('delegates.delegateIdentifier')}
          key={'delegateGroupIdentifier'}
        />
        <FormInput.KVTagInput
          isArray={true}
          name="delegateTags"
          label={getString('delegate.delegateTags')}
          key="delegateTags"
        />
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
          searchTerm,
          pageIndex: 0
        }
        setShowDelegateLoader(true)
        refetchDelegates(updatedQueryParams, filterFromFormData)
        setAppliedFilter({ ...unsavedFilter, filterProperties: filterFromFormData })
        setPage(0)
        hideFilterDrawer()
        setIsFilterOpen(false)
      } else {
        showError(getString('filters.invalidCriteria'))
      }
    }

    const { delegateName, delegateGroupIdentifier, delegateType, description, hostName, status, delegateTags } =
      (appliedFilter?.filterProperties as any) || {}
    const { name = '', filterVisibility } = appliedFilter || {}
    return isFetchingFilters ? (
      <PageSpinner />
    ) : (
      <Filter<DelegateFilterProperties, FilterDTO>
        onApply={onFilterApply}
        onClose={() => {
          hideFilterDrawer()
          setIsFilterOpen(false)
          refetchFilterList()
        }}
        filters={filters}
        initialFilter={{
          formValues: {
            delegateName,
            delegateGroupIdentifier,
            delegateType,
            description,
            hostName,
            status,
            delegateTags
          },
          metadata: {
            name,
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
        onValidate={(values: Partial<DelegateFilterProperties>): FormikErrors<Partial<DelegateFilterProperties>> => {
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
  }, [isRefreshingFilters, filters, appliedFilter, searchTerm, queryParams])

  const reset = (): void => {
    setShowDelegateLoader(true)
    refetchDelegates(queryParams)
    setAppliedFilter(undefined)
    setDelegateFetchError(undefined)
  }

  const debouncedDelegateSearch = useCallback(
    debounce((query: string): void => {
      /* For a non-empty query string, always start from first page(index 0) */
      const updatedQueryParams = {
        ...queryParams,
        searchTerm: query,
        pageIndex: 0
      }
      setShowDelegateLoader(true)
      refetchDelegates(updatedQueryParams, appliedFilter?.filterProperties)
    }, 500),
    [refetchDelegates, appliedFilter?.filterProperties]
  )

  const getFilterByIdentifier = (identifier: string): FilterDTO | undefined =>
    /* istanbul ignore if */
    filters?.find((filter: FilterDTO) => filter.identifier?.toLowerCase() === identifier.toLowerCase())

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
        searchTerm,
        pageIndex: 0
      }
      setShowDelegateLoader(true)
      refetchDelegates(updatedQueryParams, selectedFilter?.filterProperties)
    } else {
      reset()
    }
  }

  const fieldToLabelMapping = new Map<string, string>()
  fieldToLabelMapping.set('delegateGroupIdentifier', getString('delegates.delegateIdentifier'))
  fieldToLabelMapping.set('delegateName', getString('delegate.delegateName'))
  fieldToLabelMapping.set('delegateType', getString('delegate.delegateType'))
  fieldToLabelMapping.set('description', getString('description'))
  fieldToLabelMapping.set('hostName', getString('delegate.hostName'))
  fieldToLabelMapping.set('status', getString('status'))
  fieldToLabelMapping.set('delegateTags', getString('delegate.delegateTags'))

  const permissionRequestNewDelegate = {
    resourceScope: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    permission: PermissionIdentifier.UPDATE_DELEGATE,
    resource: {
      resourceType: ResourceType.DELEGATE
    }
  }

  const hideHeader = delegateGroups.length === 0 && !appliedFilter && !searchTerm

  const newDelegateBtn = (
    <RbacButton
      intent="primary"
      text={
        hideHeader ? getString('delegates.commandLineCreation.installDelegate') : getString('delegates.newDelegate')
      }
      icon={hideHeader ? undefined : 'plus'}
      permission={permissionRequestNewDelegate}
      onClick={() => {
        trackEvent(DelegateActions.DelegateCommandLineCreationOpened, {
          category: Category.DELEGATE
        })
        openDelegateModalWithCommands()
      }}
      id="newDelegateBtn"
      data-testid="newDelegateButton"
    />
  )

  const [messageList, setMessageList] = useState<Message[]>([])
  const [isChatOpen, setIsChatOpen] = useState(false)
  const messageListRef = useRef(null)

  useEffect(() => {
    if (messageListRef.current) {
      const messageListContainer = messageListRef.current as HTMLDivElement
      messageListContainer.scrollIntoView({ behavior: 'auto', block: 'end' })
    }
  }, [messageList.length])

  const {
    data: warnLogData,
    refetch: warnLogRefetch,
    // loading: warnLogLoading,
    error: warnLogError
  } = useGetWarnLog({
    queryParams: {
      accountId
    },
    lazy: true
  })

  const {
    data: dialogFlowData,
    refetch: dialogFlowRefetch,
    // loading: dialogFlowLoading,
    error: dialogFlowError
  } = useDialogFlow({
    lazy: true
  })

  const fetchDialogFlow = (text: string): void => {
    dialogFlowRefetch({ queryParams: { text } })
  }

  const [resource, setResource] = useState<DelegateHackLog[]>([])

  useEffect(() => {
    warnLogRefetch()
    const intervalId = setInterval(() => {
      warnLogRefetch()
    }, 60 * 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [warnLogRefetch])

  useEffect(() => {
    /* if (warnLogData?.resource) {
      setResource(warnLogData?.resource)
    } else if (warnLogError) { */
    setResource([
      {
        delegateName: 'helm-delegate-slack',
        delegateId: 'Uu7b7gwMSd687gbpuTI6WA',
        accountId: 'kmpySmUISimoRrJL6NL73w',
        exceptionType: 'AWS Connector Error'
      },
      {
        delegateName: 'helm-delegate-slack-two',
        delegateId: 'Uu7b7gwMSd687gbpuTI6WA',
        accountId: 'kmpySmUISimoRrJL6NL73w',
        exceptionType: 'Vault Secret Manager Renewal failure'
      }
    ])
    // }
  }, [warnLogData, warnLogError])

  const userLastChatMessageRef = useRef('')

  useEffect(() => {
    if (dialogFlowData?.resource) {
      setMessageList(oldMessageList =>
        oldMessageList.concat([{ sender: 'API', message: dialogFlowData.resource as string }])
      )
    } else if (dialogFlowError && userLastChatMessageRef.current) {
      const chatDataKey = Object.keys(ChatData).find(
        chatKey => chatKey.toLowerCase() === userLastChatMessageRef.current.toLowerCase()
      )

      const message = chatDataKey ? ChatData[chatDataKey] : 'We are in training mode. Please try different'

      setMessageList(oldMessageList => oldMessageList.concat([{ sender: 'API', message }]))
    }
  }, [dialogFlowData, dialogFlowError, setMessageList])

  return (
    <Container height="100%">
      <Dialog
        isOpen={!!troubleshoterOpen}
        enforceFocus={false}
        style={{ width: '680px', height: '100%' }}
        onClose={() => setOpenTroubleshoter(undefined)}
      >
        <DelegateInstallationError
          showDelegateInstalledMessage={false}
          delegateType={troubleshoterOpen?.delegateType}
        />
      </Dialog>
      {!hideHeader && (
        <Layout.Horizontal className={css.header}>
          {newDelegateBtn}
          <FlexExpander />
          <Layout.Horizontal spacing="xsmall">
            <ExpandingSearchInput
              alwaysExpanded
              width={250}
              placeholder={getString('search')}
              throttle={200}
              onChange={text => {
                debouncedDelegateSearch(text)
                setSearchTerm(text.trim())
              }}
              className={css.search}
            />
            <FilterSelector<FilterDTO>
              appliedFilter={appliedFilter}
              filters={filters}
              onFilterBtnClick={() => {
                openFilterDrawer()
                setIsFilterOpen(true)
              }}
              onFilterSelect={handleFilterSelection}
              fieldToLabelMapping={fieldToLabelMapping}
              filterWithValidFields={removeNullAndEmpty(
                pick(flattenObject(appliedFilter?.filterProperties || {}), ...fieldToLabelMapping.keys())
              )}
            />
          </Layout.Horizontal>
        </Layout.Horizontal>
      )}
      <Layout.Vertical className={css.listBody}>
        {showDelegateLoader ? (
          <PageSpinner />
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
          <Container className={css.delegateListContainer}>
            {delegateGroups.length ? (
              <Container width="100%">
                <DelegateListingItem data={delegateGroups} />
              </Container>
            ) : (
              <div className={css.emptyStateContainer}>
                <img src={DelegatesEmptyState} />
                <div className={css.emptyStateText}>
                  {projectIdentifier
                    ? getString('delegates.noDelegatesInProject')
                    : orgIdentifier
                    ? getString('delegates.noDelegatesInOrganization')
                    : getString('delegates.noDelegatesInAccount')}
                </div>
                {hideHeader && newDelegateBtn}
              </div>
            )}
          </Container>
        )}

        {isChatOpen ? (
          <div
            style={{
              border: 'solid 1px',
              position: 'fixed',
              background: '#fafcff',
              width: 300,
              height: 600,
              right: 24,
              bottom: 24,
              borderRadius: 4
            }}
          >
            <Button
              intent="primary"
              round
              onClick={() => {
                setIsChatOpen(false)
                setMessageList([])
              }}
              style={{
                position: 'absolute',
                right: -12,
                top: -12
              }}
              icon="cross"
              iconProps={{ size: 12 }}
            ></Button>
            <Text font={{ size: 'small' }} color="white" style={{ padding: '16px 8px 8px', background: '#106ba3' }}>
              You have used 80% of your service licenses. To upgrade, please contact{' '}
              <a href="mailto:sales@harness.io" style={{ color: 'white' }}>
                sales@harness.io
              </a>
            </Text>
            <div style={{ overflowY: 'auto', maxHeight: 'calc(100% - 88px)' }}>
              <Layout.Vertical ref={messageListRef}>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {resource.map(({ exceptionType, delegateName, delegateId }, index) => {
                    const message = `Error in ${delegateName ?? delegateId}: ${exceptionType}`
                    return (
                      <span
                        key={index}
                        onClick={() => {
                          if (exceptionType) {
                            setMessageList(oldMessageList => oldMessageList.concat([{ sender: 'USER', message }]))
                            userLastChatMessageRef.current = exceptionType
                            fetchDialogFlow(exceptionType)
                          }
                        }}
                        style={{
                          border: '1px solid',
                          background: 'white',
                          padding: '2px 4px',
                          fontSize: 10,
                          margin: 4,
                          borderRadius: 4,
                          cursor: 'pointer'
                        }}
                      >
                        Error in <b>{delegateName ?? delegateId}</b>: {exceptionType}
                      </span>
                    )
                  })}
                  {Boolean(resource.length) && (
                    <div style={{ width: '100%' }}>
                      <div
                        style={{
                          border: '1px solid',
                          background: '#106ba3',
                          padding: '2px 4px',
                          fontSize: 10,
                          margin: 4,
                          borderRadius: 4,
                          cursor: 'pointer',
                          textAlign: 'center',
                          color: 'white'
                        }}
                      >
                        Click on the issue to get help
                      </div>
                    </div>
                  )}
                </div>
                {messageList.map(({ sender, message }, pIndex) => (
                  <Text
                    key={pIndex}
                    style={{
                      alignSelf: sender === 'USER' ? 'flex-end' : 'flex-start',
                      background: sender === 'USER' ? '#3dc7f6' : '#effbff',
                      marginRight: sender === 'USER' ? 4 : 0,
                      marginLeft: sender === 'API' ? 4 : 0,
                      borderRadius: 4,
                      padding: 4,
                      marginBottom: 4,
                      maxWidth: '90%',
                      wordBreak: 'break-all',
                      fontSize: 10
                    }}
                  >
                    {message
                      .split('\n')
                      .filter(text => text.trim())
                      .map(text => text.trim())
                      .map((text, cIndex) => (
                        <>
                          <div key={`${pIndex}_${cIndex}`}>{text}</div>
                          {cIndex + 1 !== message.split('\n').filter(t => t.trim()).length && <br />}
                        </>
                      ))}
                  </Text>
                ))}
              </Layout.Vertical>
            </div>
            <Layout.Horizontal style={{ position: 'absolute', bottom: 0 }}>
              <Formik
                initialValues={{ message: '' }}
                formName="warnModalForm"
                onSubmit={({ message }, { resetForm }) => {
                  if (message) {
                    setMessageList(oldMessageList => oldMessageList.concat([{ sender: 'USER', message }]))
                    userLastChatMessageRef.current = message
                    fetchDialogFlow(message)
                    resetForm()
                  }
                }}
              >
                {() => (
                  <FormikForm>
                    <Layout.Horizontal style={{ alignItems: 'flex-end' }}>
                      <FormInput.Text
                        name="message"
                        placeholder="Search..."
                        style={{ margin: 0, width: 266 }}
                      ></FormInput.Text>
                      <Button type="submit" intent="primary" round icon="chevron-right"></Button>
                    </Layout.Horizontal>
                  </FormikForm>
                )}
              </Formik>
            </Layout.Horizontal>
          </div>
        ) : (
          <Button
            intent="primary"
            round
            icon="nav-help"
            style={{ position: 'fixed', right: 24, bottom: 24 }}
            onClick={() => {
              setIsChatOpen(true)
            }}
            iconProps={{ size: 24 }}
          >
            {Boolean(resource?.length) && <SupText color="white">{resource?.length}</SupText>}
          </Button>
        )}
      </Layout.Vertical>
    </Container>
  )
}
export default DelegateListing
