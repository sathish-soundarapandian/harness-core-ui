/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
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
  Checkbox,
  PageError
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { debounce, isEmpty, isEqual } from 'lodash-es'
import { Scope } from '@common/interfaces/SecretsInterface'
import { useStrings } from 'framework/strings'
import type { StringKeys } from 'framework/strings'
import type { EntityReferenceResponse } from '../EntityReference/EntityReference'
import { disableItems } from './utils'
import css from './MultiSelectEntityReference.module.scss'

export interface Identifier {
  identifier: string
}
export interface ScopedObjectDTO extends Identifier {
  accountIdentifier?: string
  orgIdentifier?: string
  projectIdentifier?: string
}
export interface ScopeUpdatedWithPreviousData {
  [Scope.ACCOUNT]: boolean
  [Scope.ORG]: boolean
  [Scope.PROJECT]: boolean
}

export function getScopeFromDTO<T extends ScopedObjectDTO>(obj: T): Scope {
  if (obj.projectIdentifier) {
    return Scope.PROJECT
  } else if (obj.orgIdentifier) {
    return Scope.ORG
  }
  return Scope.ACCOUNT
}

export type ScopeAndIdentifier = {
  scope: Scope
  identifier: string
}
type CheckedItemsData<T> = {
  items: T[]
  scopedItemsTotal: number
  updatedWithOldData: boolean
}

type CheckedItems<T> = {
  [Scope.PROJECT]: CheckedItemsData<T>
  [Scope.ORG]: CheckedItemsData<T>
  [Scope.ACCOUNT]: CheckedItemsData<T>
  total: number
}

type SelectDTO<T> = {
  selectedData: T[]
  previousSelectedItemsUuidAndScope: ScopeAndIdentifier[] | undefined
  scopesUpdatedWithPreviousData: ScopeUpdatedWithPreviousData
}

export interface MultiSelectEntityReferenceProps<T> {
  fetchRecords: (
    scope: Scope,
    searchTerm: string | undefined,
    done: (records: EntityReferenceResponse<T>[]) => void
  ) => void
  recordRender: (args: { item: EntityReferenceResponse<T>; selectedScope: Scope; selected?: boolean }) => JSX.Element
  recordClassName?: string
  className?: string
  projectIdentifier?: string
  noRecordsText?: string
  orgIdentifier?: string
  defaultScope?: Scope
  searchInlineComponent?: JSX.Element
  selectedItemsUuidAndScope?: ScopeAndIdentifier[]
  onMultiSelect: (payLoad: ScopeAndIdentifier[]) => void
  onlyCurrentScope?: boolean
  disablePreSelectedItems?: boolean
}

export function getDefaultScope(orgIdentifier?: string, projectIdentifier?: string): Scope {
  if (!isEmpty(projectIdentifier)) {
    return Scope.PROJECT
  } else if (!isEmpty(orgIdentifier)) {
    return Scope.ORG
  }
  return Scope.ACCOUNT
}
const intializeCheckedList = () => {
  return {
    [Scope.PROJECT]: { items: [], scopedItemsTotal: 0, updatedWithOldData: false },
    [Scope.ORG]: { items: [], scopedItemsTotal: 0, updatedWithOldData: false },
    [Scope.ACCOUNT]: { items: [], scopedItemsTotal: 0, updatedWithOldData: false },
    total: 0
  }
}
export function MultiSelectEntityReference<T extends Identifier>(
  props: MultiSelectEntityReferenceProps<T>
): JSX.Element {
  const { getString } = useStrings()
  const {
    defaultScope,
    projectIdentifier,
    orgIdentifier,
    fetchRecords,
    className = '',
    recordRender,
    recordClassName = '',
    noRecordsText = getString('entityReference.noRecordFound'),
    searchInlineComponent,
    selectedItemsUuidAndScope,
    disablePreSelectedItems = false,
    onMultiSelect,
    onlyCurrentScope
  } = props
  const [searchTerm, setSearchTerm] = useState<string | undefined>()
  const [selectedScope, setSelectedScope] = useState<Scope>(
    defaultScope || getDefaultScope(orgIdentifier, projectIdentifier)
  )
  const [data, setData] = useState<EntityReferenceResponse<T>[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>()
  const [selectedRecord, setSelectedRecord] = useState<T>()
  const [renderedList, setRenderedList] = useState<JSX.Element>()

  const [checkedItems, setCheckedItems] = useState<CheckedItems<T>>(intializeCheckedList())
  const getScopeAndUuidFromSelectDTO = (onSelectDTO: SelectDTO<T>): ScopeAndIdentifier[] => {
    const scopeAndUuidArray: ScopeAndIdentifier[] = []
    if (onSelectDTO?.scopesUpdatedWithPreviousData) {
      onSelectDTO.previousSelectedItemsUuidAndScope?.forEach((el: ScopeAndIdentifier) => {
        if (!onSelectDTO.scopesUpdatedWithPreviousData[el.scope]) {
          scopeAndUuidArray.push(el)
        }
      })
    }
    onSelectDTO?.selectedData.forEach(el => {
      scopeAndUuidArray.push({ scope: getScopeFromDTO(el), identifier: el.identifier })
    })
    return scopeAndUuidArray
  }
  useEffect(() => {
    if (selectedItemsUuidAndScope && data) {
      const tempCheckedItems: CheckedItems<T> = checkedItems
      let isItemListUpdated = false
      selectedItemsUuidAndScope.forEach(el => {
        if (el.scope === selectedScope) {
          const item = data.find(_el => _el.identifier === el.identifier)?.record
          if (
            item &&
            tempCheckedItems[el.scope].items.findIndex(_el => _el.identifier === item.identifier) === -1 &&
            !tempCheckedItems[el.scope].updatedWithOldData
          ) {
            tempCheckedItems[el.scope].items.push(item)
            isItemListUpdated = true
          }
        }
      })
      if (isItemListUpdated) {
        tempCheckedItems[selectedScope].updatedWithOldData = isItemListUpdated
      }
      setCheckedItems(tempCheckedItems)
    }
  }, [data])
  useEffect(() => {
    if (selectedItemsUuidAndScope) {
      const tempCheckedItems: CheckedItems<T> = checkedItems
      selectedItemsUuidAndScope.forEach(el => {
        tempCheckedItems[el.scope].scopedItemsTotal++
        tempCheckedItems.total++
      })
      setCheckedItems(tempCheckedItems)
    }
  }, [selectedItemsUuidAndScope])
  const delayedFetchRecords = useRef(
    debounce((scope: Scope, search: string | undefined, done: (records: EntityReferenceResponse<T>[]) => void) => {
      setLoading(true)
      setSelectedRecord(undefined)
      fetchRecords(scope, search, done)
    }, 300)
  ).current

  const fetchData = useCallback(() => {
    try {
      setError(null)
      if (!searchTerm) {
        setLoading(true)
        fetchRecords(selectedScope, searchTerm, records => {
          setData(records)
          setLoading(false)
        })
      } else {
        delayedFetchRecords(selectedScope, searchTerm, records => {
          setData(records)
          setLoading(false)
        })
      }
    } catch (msg) {
      setError(msg)
    }
  }, [selectedScope, delayedFetchRecords, searchTerm, searchInlineComponent])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const onScopeChange = (scope: Scope): void => {
    setSelectedRecord(undefined)
    setSelectedScope(scope)
  }

  const iconProps = {
    size: 16
  }

  const enum TAB_ID {
    PROJECT = 'project',
    ORGANIZATION = 'organization',
    ACCOUNT = 'account'
  }

  const defaultTab =
    selectedScope === Scope.ORG
      ? TAB_ID.ORGANIZATION
      : selectedScope === Scope.PROJECT
      ? TAB_ID.PROJECT
      : TAB_ID.ACCOUNT

  const onCheckboxChange = (checked: boolean, item: T) => {
    const tempCheckedItems: T[] = [...(checkedItems[selectedScope].items || [])]
    if (checked) {
      tempCheckedItems.push(item)
    } else {
      tempCheckedItems.splice(
        tempCheckedItems.findIndex(el => isEqual(el, item)),
        1
      )
    }

    setCheckedItems({
      ...checkedItems,
      [selectedScope]: { items: tempCheckedItems, scopedItemsTotal: tempCheckedItems.length, updatedWithOldData: true },
      total: checked ? checkedItems.total + 1 : checkedItems.total - 1
    })
  }

  useEffect(() => {
    let renderedListTemp
    if (loading) {
      renderedListTemp = (
        <Container flex={{ align: 'center-center' }} padding="small">
          <Icon name="spinner" size={24} color={Color.PRIMARY_7} />
        </Container>
      )
    }
    if (!loading && error) {
      renderedListTemp = (
        <Container>
          <PageError message={error} onClick={fetchData} />
        </Container>
      )
    }
    if (!loading && !error && data.length) {
      renderedListTemp = (
        <div className={cx(css.referenceList, { [css.referenceListOverflow]: data.length > 5 })}>
          {data.map((item: EntityReferenceResponse<T>) => {
            const checked = !!checkedItems[selectedScope]?.items.find(el => {
              return isEqual(el, item.record)
            })
            return (
              <Layout.Horizontal
                key={item.identifier}
                className={cx(css.listItem, recordClassName, {
                  [css.selectedItem]: checked
                })}
                flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
              >
                <Checkbox
                  onChange={e => onCheckboxChange((e.target as any).checked, item.record)}
                  data-testid={`Checkbox-${item.identifier}`}
                  disabled={disableItems(item.record['identifier'], disablePreSelectedItems, selectedItemsUuidAndScope)}
                  className={css.checkbox}
                  checked={checked}
                  large
                  labelElement={recordRender({ item, selectedScope, selected: checked })}
                />
              </Layout.Horizontal>
            )
          })}
        </div>
      )
    }
    if (!loading && !error && !data.length) {
      renderedListTemp = (
        <Container padding={{ top: 'xlarge' }} flex={{ align: 'center-center' }}>
          <Text>{noRecordsText}</Text>
        </Container>
      )
    }
    setRenderedList(renderedListTemp)
  }, [selectedScope, loading, error, data, checkedItems, checkedItems.total, selectedRecord])

  const canRenderTab = (scope: Scope): boolean => {
    if (onlyCurrentScope && !isEqual(scope, defaultScope)) {
      return false
    }
    return true
  }

  const renderTab = (
    show: boolean,
    id: string,
    scope: Scope,
    icon: IconName,
    title: StringKeys
  ): React.ReactElement | null => {
    let multiSelectCount = null
    if (checkedItems[scope]?.scopedItemsTotal) {
      multiSelectCount = (
        <Text
          inline
          height={19}
          margin={{ left: 'small' }}
          padding={{ left: 'xsmall', right: 'xsmall' }}
          flex={{ align: 'center-center' }}
          background={Color.PRIMARY_7}
          color={Color.WHITE}
          border={{ radius: 100 }}
        >
          {checkedItems[scope].scopedItemsTotal}
        </Text>
      )
    }
    return show && canRenderTab(scope) ? (
      <Tab
        id={id}
        title={
          <Layout.Horizontal onClick={() => onScopeChange(scope)} padding={'medium'} flex={{ alignItems: 'center' }}>
            <Text>
              <Icon name={icon} {...iconProps} className={css.iconMargin} />
              {getString(title)}
            </Text>
            {multiSelectCount}
          </Layout.Horizontal>
        }
        panel={renderedList}
      />
    ) : null
  }

  const onSelect = () => {
    const allCheckedItems: T[] = [
      ...checkedItems[Scope.PROJECT].items,
      ...checkedItems[Scope.ORG].items,
      ...checkedItems[Scope.ACCOUNT].items
    ]
    const scopesWhichUpdatedWithPreviousSelectedData = {
      [Scope.PROJECT]: checkedItems[Scope.PROJECT].updatedWithOldData,
      [Scope.ACCOUNT]: checkedItems[Scope.ACCOUNT].updatedWithOldData,
      [Scope.ORG]: checkedItems[Scope.ORG].updatedWithOldData
    }
    onMultiSelect?.(
      getScopeAndUuidFromSelectDTO({
        selectedData: allCheckedItems,
        previousSelectedItemsUuidAndScope: selectedItemsUuidAndScope,
        scopesUpdatedWithPreviousData: scopesWhichUpdatedWithPreviousSelectedData
      })
    )
  }

  return (
    <Container className={cx(css.container, className)}>
      <Layout.Vertical spacing="medium">
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
        </div>
      </Layout.Vertical>
      <div className={cx(css.tabsContainer, [css.tabWidth])}>
        <Tabs id={'selectScope'} vertical defaultSelectedTabId={defaultTab}>
          {renderTab(!!projectIdentifier, TAB_ID.PROJECT, Scope.PROJECT, 'cube', 'projectLabel')}
          {renderTab(!!orgIdentifier, TAB_ID.ORGANIZATION, Scope.ORG, 'diagram-tree', 'orgLabel')}
          {renderTab(true, TAB_ID.ACCOUNT, Scope.ACCOUNT, 'layers', 'account')}
        </Tabs>
      </div>
      <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
        <Layout.Horizontal spacing="medium">
          <Button
            intent="primary"
            text={getString('entityReference.apply')}
            onClick={onSelect}
            disabled={!checkedItems || checkedItems.total < 1}
          />
        </Layout.Horizontal>
        <Layout.Horizontal spacing={'small'}>
          <Text inline>{getString('common.totalSelected')}</Text>
          <Text
            inline
            padding={{ left: 'xsmall', right: 'xsmall' }}
            flex={{ align: 'center-center' }}
            background={Color.PRIMARY_7}
            color={Color.WHITE}
            border={{ radius: 100 }}
          >
            {checkedItems.total}
          </Text>
        </Layout.Horizontal>
      </Layout.Horizontal>
    </Container>
  )
}

export default MultiSelectEntityReferenceProps
