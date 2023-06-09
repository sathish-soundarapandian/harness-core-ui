/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useRef } from 'react'
import cx from 'classnames'
import {
  Container,
  TextInput,
  Button,
  Layout,
  Text,
  Tabs,
  Tab,
  Icon,
  IconName,
  ButtonVariation,
  PageError,
  NoDataCard,
  NoDataCardProps,
  PaginationProps,
  SortDropdownProps,
  SortDropdown,
  Checkbox,
  CheckboxVariant
} from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { Classes } from '@blueprintjs/core'
import { debounce } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Scope, PrincipalScope } from '@common/interfaces/SecretsInterface'
import { useStrings, UseStringsReturn } from 'framework/strings'
import type { StringKeys } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { AccountPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, StageActions } from '@common/constants/TrackingConstants'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { CollapsableList } from '../CollapsableList/CollapsableList'
import type { ScopeAndIdentifier } from '../MultiSelectEntityReference/MultiSelectEntityReference'
import { EntityReferenceResponse, getScopeFromDTO, ScopedObjectDTO, TAB_ID } from './EntityReference.types'
import { getCountOfSelectedRecordsInGivenScope } from './Utils'
import css from './EntityReference.module.scss'

export * from './EntityReference.types'

export function getPrincipalScopeFromDTO<T extends ScopedObjectDTO>(obj: T): PrincipalScope {
  if (obj.projectIdentifier) {
    return PrincipalScope.PROJECT
  } else if (obj.orgIdentifier) {
    return PrincipalScope.ORG
  }
  return PrincipalScope.ACCOUNT
}

export const getScopeBasedProjectPathParams = (
  { accountId, projectIdentifier, orgIdentifier }: ProjectPathProps,
  scope: Scope
) => {
  return {
    accountIdentifier: accountId,
    projectIdentifier: scope === Scope.PROJECT ? projectIdentifier : undefined,
    orgIdentifier: scope === Scope.PROJECT || scope === Scope.ORG ? orgIdentifier : undefined
  }
}

export function getScopeFromValue(value: string): Scope {
  if (typeof value === 'string' && value.startsWith(`${Scope.ACCOUNT}.`)) {
    return Scope.ACCOUNT
  } else if (typeof value === 'string' && value.startsWith(`${Scope.ORG}.`)) {
    return Scope.ORG
  }
  return Scope.PROJECT
}

export function getPrincipalScopeFromValue(value: string): PrincipalScope {
  if (typeof value === 'string' && value.startsWith(`${Scope.ACCOUNT}.`)) {
    return PrincipalScope.ACCOUNT
  } else if (typeof value === 'string' && value.startsWith(`${Scope.ORG}.`)) {
    return PrincipalScope.ORG
  }
  return PrincipalScope.PROJECT
}

export function getScopeLabelfromScope(scope: Scope, getString: UseStringsReturn['getString']): string {
  let label = ''
  switch (scope) {
    case Scope.ACCOUNT:
      label += getString('account')
      break
    case Scope.PROJECT:
      label += getString('projectLabel')
      break
    case Scope.ORG:
      label += getString('orgLabel')
      break
    default:
  }
  return label
}

export function getIdentifierFromValue(value: string): string {
  const scope = getScopeFromValue(value)
  if ((typeof value === 'string' && scope === Scope.ACCOUNT) || scope === Scope.ORG) {
    return value.replace(`${scope}.`, '')
  }
  return value
}

export interface EntityReferenceProps<T extends ScopedObjectDTO> {
  onSelect: (reference: T, scope: Scope) => void
  fetchRecords: (
    done: (records: EntityReferenceResponse<T>[]) => void,
    searchTerm: string,
    page: number,
    scope?: Scope,
    signal?: AbortSignal,
    allTabSelected?: boolean,
    sortMethod?: string,
    isFavorite?: boolean
  ) => void
  recordRender: (args: { item: EntityReferenceResponse<T>; selectedScope: Scope; selected?: boolean }) => JSX.Element
  collapsedRecordRender?: (args: {
    item: EntityReferenceResponse<T>
    selectedScope: Scope
    selected?: boolean
  }) => JSX.Element
  recordClassName?: string
  className?: string
  projectIdentifier?: string
  noRecordsText?: string
  noDataCard?: NoDataCardProps
  orgIdentifier?: string
  defaultScope?: Scope
  searchInlineComponent?: JSX.Element
  onCancel?: () => void
  renderTabSubHeading?: boolean
  pagination: PaginationProps
  disableCollapse?: boolean
  input?: any
  isMultiSelect?: boolean
  selectedRecords?: ScopeAndIdentifier[]
  onMultiSelect?: (selected: ScopeAndIdentifier[]) => void
  showAllTab?: boolean
  selectedRecord?: ScopeAndIdentifier
  isRecordDisabled?: (item: any) => boolean
  renderRecordDisabledWarning?: JSX.Element
  sortProps?: SortDropdownProps
}

export const tabIdToScopeMap: Record<TAB_ID, Scope | undefined> = {
  [TAB_ID.ACCOUNT]: Scope.ACCOUNT,
  [TAB_ID.ORGANIZATION]: Scope.ORG,
  [TAB_ID.PROJECT]: Scope.PROJECT,
  [TAB_ID.ALL]: undefined
}

const scopeToTabMap: Record<Scope, TAB_ID> = {
  [Scope.ACCOUNT]: TAB_ID.ACCOUNT,
  [Scope.ORG]: TAB_ID.ORGANIZATION,
  [Scope.PROJECT]: TAB_ID.PROJECT
}

function getDefaultSelectedTab(
  defaultScope?: Scope,
  projectIdentifier?: string,
  orgIdentifier?: string,
  preSelectedRecord?: ScopeAndIdentifier,
  showAllTab = false
): TAB_ID {
  if (preSelectedRecord && preSelectedRecord?.scope) {
    return scopeToTabMap[preSelectedRecord?.scope]
  }
  if (defaultScope) {
    return scopeToTabMap[defaultScope]
  }
  if ((projectIdentifier || orgIdentifier) && showAllTab) {
    return TAB_ID.ALL
  }
  if (projectIdentifier) {
    return TAB_ID.PROJECT
  }
  if (orgIdentifier) {
    return TAB_ID.ORGANIZATION
  }

  return TAB_ID.ACCOUNT
}

export function EntityReference<T extends ScopedObjectDTO>(props: EntityReferenceProps<T>): JSX.Element {
  const { getString } = useStrings()
  const {
    defaultScope,
    projectIdentifier,
    orgIdentifier,
    fetchRecords,
    className = '',
    recordRender,
    collapsedRecordRender,
    searchInlineComponent,
    noDataCard,
    renderTabSubHeading = false,
    disableCollapse,
    input,
    isMultiSelect,
    selectedRecords: selectedRecordsFromProps,
    showAllTab = false,
    selectedRecord: selectedRecordFromProps,
    isRecordDisabled,
    renderRecordDisabledWarning,
    sortProps
  } = props
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedTab, setSelectedTab] = useState<TAB_ID>(
    getDefaultSelectedTab(defaultScope, projectIdentifier, orgIdentifier, selectedRecordFromProps, showAllTab)
  )
  const { PL_FAVORITES } = useFeatureFlags()
  const { accountId } = useParams<AccountPathProps>()
  const {
    selectedProject,
    selectedOrg,
    currentUserInfo: { accounts = [] }
  } = useAppStore()
  const selectedAccount = accounts.find(account => account.uuid === accountId)
  const [data, setData] = useState<EntityReferenceResponse<T>[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>()
  const [selectedRecord, setSelectedRecord] = useState<T>()
  // used for multiselect
  const [selectedRecords, setSelectedRecords] = useState<ScopeAndIdentifier[]>(selectedRecordsFromProps ?? [])
  const { preference: favoriteSelected = false, setPreference: setIsFavoriteSelected } = usePreferenceStore<boolean>(
    PreferenceScope.USER,
    `entity-reference-favorite-dropdown`
  )

  const delayedFetchRecords = useRef(debounce((fn: () => void) => fn(), 300)).current

  const inputRef = useRef()
  const firstUpdate = useRef(true)
  const controllerRef = useRef<AbortController>()

  const fetchData = (resetPageIndex: boolean, inputChange = false): void => {
    try {
      if (controllerRef.current) controllerRef.current.abort()
      controllerRef.current = new AbortController()

      setError(null)

      if (resetPageIndex && props.pagination.pageIndex !== 0) {
        props.pagination.gotoPage?.(0)
      }
      const pageNo = resetPageIndex ? 0 : props.pagination.pageIndex

      if (!searchTerm && !inputChange) {
        // cancel pending debounced requests to prevent rendering stale data
        delayedFetchRecords.cancel()

        setLoading(true)
        fetchRecords(
          records => {
            setData(records)
            setLoading(false)
          },
          searchTerm,
          pageNo as number,
          tabIdToScopeMap[selectedTab],
          controllerRef.current?.signal,
          selectedTab === TAB_ID.ALL,
          sortProps?.selectedSortMethod,
          favoriteSelected
        )
      } else {
        delayedFetchRecords(() => {
          setLoading(true)
          setSelectedRecord(undefined)
          fetchRecords(
            records => {
              setData(records)
              setLoading(false)
            },
            searchTerm,
            pageNo as number,
            tabIdToScopeMap[selectedTab],
            controllerRef.current?.signal,
            selectedTab === TAB_ID.ALL,
            sortProps?.selectedSortMethod,
            favoriteSelected
          )
        })
      }
    } catch (msg) {
      setError(msg)
    }
  }

  useEffect(() => {
    if (inputRef.current === input || firstUpdate.current) {
      fetchData(true)
    } else {
      fetchData(true, true)
      inputRef.current = input
    }
  }, [selectedTab, delayedFetchRecords, searchTerm, input, sortProps?.selectedSortMethod, favoriteSelected])

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false
    } else {
      fetchData(false)
    }
  }, [props.pagination.pageIndex])

  const iconProps = {
    size: 14
  }

  const RenderList = () => {
    return (
      <Layout.Vertical spacing="large">
        <div className={css.searchBox}>
          <TextInput
            wrapperClassName={css.search}
            placeholder={getString('search')}
            leftIcon="search"
            value={searchTerm}
            autoFocus
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
          {searchInlineComponent}
          {PL_FAVORITES && (
            <Checkbox
              checked={favoriteSelected}
              variant={CheckboxVariant.BOXED}
              margin={{ left: 'small' }}
              labelElement={<Icon name="star" color={Color.YELLOW_900} size={14} />}
              onChange={e => {
                setIsFavoriteSelected(e.currentTarget.checked)
              }}
            />
          )}
          {sortProps && (
            <Container margin={{ left: 'small' }} width={185}>
              <SortDropdown {...sortProps} />
            </Container>
          )}
        </div>
        {loading ? (
          <Container flex={{ align: 'center-center' }} padding="small">
            <Icon name="spinner" size={24} color={Color.PRIMARY_7} />
          </Container>
        ) : error ? (
          <Container>
            <PageError message={error} onClick={() => fetchData(true)} />
          </Container>
        ) : data.length ? (
          <CollapsableList<T>
            selectedRecord={selectedRecord}
            setSelectedRecord={setSelectedRecord}
            selectedRecords={selectedRecords}
            setSelectedRecords={setSelectedRecords}
            data={data}
            recordRender={recordRender}
            collapsedRecordRender={collapsedRecordRender}
            pagination={{ ...props.pagination, hidePageNumbers: true }}
            disableCollapse={disableCollapse}
            isMultiSelect={isMultiSelect}
            preSelectedRecord={selectedRecordFromProps}
          />
        ) : (
          <Container padding={{ top: 'xlarge' }} flex={{ align: 'center-center' }} className={css.noDataContainer}>
            <NoDataCard {...noDataCard} containerClassName={css.noDataCardImg} />
          </Container>
        )}
      </Layout.Vertical>
    )
  }

  const renderTab = (
    show: boolean,
    id: TAB_ID,
    title: StringKeys,
    icon?: IconName,
    tabDesc = ''
  ): React.ReactElement | null => {
    const selectedInGivenScope = getCountOfSelectedRecordsInGivenScope(tabIdToScopeMap[id], selectedRecords)
    return show ? (
      <Tab
        id={id}
        title={
          <Layout.Horizontal
            flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
            padding={{ left: 'xsmall', right: 'xsmall' }}
            spacing="xsmall"
          >
            {icon && <Icon name={icon} {...iconProps} className={css.tabIcon} />}

            <Text lineClamp={1} font={{ variation: FontVariation.H6, weight: 'light' }}>
              {getString(title)}
            </Text>
            {renderTabSubHeading && tabDesc && (
              <Text
                lineClamp={1}
                font={{ variation: FontVariation.FORM_LABEL, weight: 'light' }}
                className={css.tabValue}
              >
                {`[${tabDesc}]`}
              </Text>
            )}
            {selectedInGivenScope > 0 && (
              <Text
                itemType="span"
                icon={'main-tick'}
                iconProps={{
                  color: Color.WHITE,
                  size: 10
                }}
                className={css.selectedCount}
                background={Color.PRIMARY_7}
                color={Color.WHITE}
                padding={{ right: 'small', left: 'small' }}
              >
                {selectedInGivenScope}
              </Text>
            )}
          </Layout.Horizontal>
        }
        panel={RenderList()}
      />
    ) : null
  }

  const multiSelectRecordsData = selectedRecords?.map(selectedVal => {
    return data.find(record => record?.identifier === selectedVal?.identifier)
  })

  const isMultiSelectRecordDisabled = multiSelectRecordsData?.some(val => {
    return isRecordDisabled?.(val?.record)
  })

  const disableApplyButton = (): boolean | undefined => {
    if (isMultiSelect) return !selectedRecords.length || isMultiSelectRecordDisabled
    return !selectedRecord || isRecordDisabled?.(selectedRecord)
  }

  const { trackEvent } = useTelemetry()
  useEffect(() => {
    trackEvent(StageActions.LoadCreateOrSelectConnectorView, {
      category: Category.STAGE
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Container className={cx(css.container, className)}>
      <div className={css.tabsContainer}>
        <Tabs
          id="selectScope"
          selectedTabId={selectedTab}
          onChange={newTabId => {
            setSelectedRecord(undefined)
            setSelectedTab(newTabId as TAB_ID)
          }}
        >
          {renderTab(showAllTab && !!(projectIdentifier || orgIdentifier), TAB_ID.ALL, 'common.all')}
          {renderTab(!!projectIdentifier, TAB_ID.PROJECT, 'projectLabel', 'projects-wizard', selectedProject?.name)}
          {renderTab(!!orgIdentifier, TAB_ID.ORGANIZATION, 'orgLabel', 'diagram-tree', selectedOrg?.name)}
          {renderTab(true, TAB_ID.ACCOUNT, 'account', 'layers', selectedAccount?.accountName)}
        </Tabs>
      </div>

      {((isMultiSelect && isMultiSelectRecordDisabled) || isRecordDisabled?.(selectedRecord)) &&
        renderRecordDisabledWarning}

      <Layout.Horizontal spacing="medium" padding={{ top: 'medium' }}>
        <Button
          variation={ButtonVariation.PRIMARY}
          text={getString('entityReference.apply')}
          onClick={() => {
            if (isMultiSelect) {
              props.onMultiSelect?.(selectedRecords)
            } else {
              props.onSelect(selectedRecord as T, getScopeFromDTO(selectedRecord as ScopedObjectDTO))
              trackEvent(StageActions.ApplySelectedConnector, {
                category: Category.STAGE,
                selectedRecord,
                selectedScope: selectedTab
              })
            }
          }}
          disabled={disableApplyButton()}
          className={cx(Classes.POPOVER_DISMISS)}
        />
        {props.onCancel && (
          <Button
            variation={ButtonVariation.TERTIARY}
            text={getString('cancel')}
            onClick={() => {
              props.onCancel?.()
              if (!isMultiSelect) {
                trackEvent(StageActions.CancelSelectConnector, {
                  category: Category.STAGE,
                  selectedRecord,
                  selectedScope: selectedTab
                })
              }
            }}
          />
        )}
      </Layout.Horizontal>
    </Container>
  )
}

export default EntityReference
