/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  DropDown,
  FlexExpander,
  Layout,
  Text,
  Icon,
  Container,
  TextInput,
  ButtonVariation,
  MultiSelect,
  Button,
  MultiSelectOption,
  SelectOption,
  Radio,
  getErrorInfoFromErrorObject,
  Card
} from '@wings-software/uicore'
import { Position, Drawer, Popover, Classes, Menu, MenuItem, TagInput } from '@blueprintjs/core'
import { Color, FontVariation } from '@harness/design-system'
import { useModalHook } from '@harness/use-modal'
import { useParams } from 'react-router-dom'
import { isEqual, omit } from 'lodash-es'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/exports'
import { useBooleanStatus } from '@common/hooks'
import { filterKeyToKeyMapping, filterKeyToLabelMapping } from '@ce/utils/anomaliesUtils'
import {
  AnomalyFilterProperties,
  FilterDTO,
  FilterProperties,
  FilterStatsDTO,
  useDeleteFilter,
  useGetFilterList,
  usePostFilter,
  useUpdateFilter
} from 'services/ce'
import PerspectiveTimeRangePicker from '@ce/components/PerspectiveTimeRangePicker/PerspectiveTimeRangePicker'
import type { setTimeRangeFn } from '@ce/types'
import { getIdentifierFromName } from '@common/utils/StringUtils'

import css from './AnomaliesFilter.module.scss'

interface AnomalyFiltersProps {
  filters: AnomalyFilterProperties
  setFilters: any
  timeRange: {
    to: string
    from: string
  }
  setTimeRange: setTimeRangeFn
  fetchedFilterValues: FilterStatsDTO[] | null
  fetching: boolean
}

const AnomalyFilters: React.FC<AnomalyFiltersProps> = ({
  filters,
  setFilters,
  timeRange,
  setTimeRange,
  fetching,
  fetchedFilterValues
}) => {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { accountId } = useParams<{ accountId: string }>()
  const {
    data: filterListData,
    refetch: refetchSavedFilters,
    loading: savedFiltersLoading
  } = useGetFilterList({
    queryParams: {
      accountIdentifier: accountId,
      type: 'Anomaly'
    }
  })

  const savedFilters = filterListData?.data?.content || []

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
      type: 'Anomaly'
    }
  })

  const drawerProps = {
    autoFocus: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true,
    enforceFocus: true,
    isOpen: true,
    hasBackdrop: true,
    position: Position.RIGHT,
    usePortal: true,
    size: 632,
    isCloseButtonShown: true
  }

  const [updatedFilters, setUpdatedFilters] = useState<AnomalyFilterProperties>(filters)
  const [filterName, setFilterName] = useState('')
  const [filterVisibility, setFilterVisibility] = useState<'EveryOne' | 'OnlyCreator'>('EveryOne')
  const [selectedFilter, setSelectedFilter] = useState<FilterDTO>()
  const [filterFlow, setFilterFlow] = useState<'create' | 'edit' | null>()

  const getSelectedOptions = (key: string): MultiSelectOption[] => {
    const options =
      (updatedFilters[key as keyof AnomalyFilterProperties] as string[])?.map((item: string) => ({
        label: item,
        value: item
      })) || []

    return options
  }

  const renderFilterInputs = (filterValues: FilterStatsDTO[], type?: 'default' | 'cloudProvider') =>
    filterValues.map(filter => {
      const key = filter.key as keyof AnomalyFilterProperties
      const values = filter.values

      if (key && values) {
        const filteredValues = values.filter(value => value)
        const multiSelectValues = filteredValues?.map(val => ({ label: val, value: val }))

        const selectedKey = Object.keys(updatedFilters).find(item => item === filterKeyToKeyMapping[key])
        const selectedOptions = selectedKey ? getSelectedOptions(selectedKey) : []

        return (
          <>
            <Text
              className={cx(css.label, { [css.cpLabel]: type === 'cloudProvider' })}
              font={{ variation: type === 'cloudProvider' ? FontVariation.BODY : FontVariation.SMALL_SEMI }}
            >
              {filterKeyToLabelMapping[key]}
            </Text>
            <MultiSelect
              className={css.multiSelect}
              value={selectedOptions}
              items={multiSelectValues as MultiSelectOption[]}
              allowCreatingNewItems={false}
              onChange={options => {
                const optionValues = options.map(option => option.value)

                setUpdatedFilters(prevValues => ({
                  ...prevValues,
                  [filterKeyToKeyMapping[key]]: optionValues
                }))
              }}
            />
          </>
        )
      }
    })

  const commonFilterValues = fetchedFilterValues?.filter(
    key =>
      key.key?.startsWith('aws') &&
      key.key?.startsWith('gcp') &&
      key.key?.startsWith('azure') &&
      filterKeyToKeyMapping[key.key]?.startsWith('k8s')
  )

  const awsFilterValues = fetchedFilterValues?.filter(key => key.key?.startsWith('aws'))
  const { state: awsFiltersVisible, toggle: toggleAwsFilters } = useBooleanStatus()

  const k8sFilterValues = fetchedFilterValues?.filter(key => filterKeyToKeyMapping[key.key || '']?.startsWith('k8s'))
  const { state: k8sFiltersVisible, toggle: toggleK8sFilters } = useBooleanStatus()

  const gcpFilterValues = fetchedFilterValues?.filter(key => key.key?.startsWith('gcp'))
  const { state: gcpFiltersVisible, toggle: togglegGcpFilters } = useBooleanStatus()

  const [openFilterDrawer, hideFilterDrawer] = useModalHook(() => {
    return (
      <Drawer onClose={hideFilterDrawer} className={css.filterDrawer} {...drawerProps}>
        <Layout.Horizontal className={css.drawerContent}>
          <Icon name="cross" size={22} className={css.exitIcon} color={Color.WHITE} onClick={hideFilterDrawer} />
          <Layout.Vertical width={398} className={css.formContainer} padding={'xlarge'}>
            <Container className={css.formHeader}>
              <Text font={{ variation: FontVariation.H5 }} color={Color.GREY_300}>
                {selectedFilter ? selectedFilter.identifier : getString('filters.newFilter')}
              </Text>
            </Container>
            <Container height={'100%'} padding={{ top: 'xlarge' }}>
              <Text padding={{ bottom: 'small' }} color={Color.GREY_700} font={{ variation: FontVariation.SMALL_SEMI }}>
                {getString('tagsLabel')}
              </Text>
              <TagInput
                values={Object.keys(updatedFilters.tags || {}).map(key => key)}
                className={css.tagInput}
                onAdd={options => {
                  options.map(option =>
                    setUpdatedFilters(prevValues => ({
                      ...prevValues,
                      tags: {
                        ...prevValues.tags,
                        [option]: ''
                      }
                    }))
                  )
                }}
                onRemove={option => {
                  setUpdatedFilters(prevValues => ({
                    ...prevValues,
                    tags: omit(prevValues.tags, option)
                  }))
                }}
              />
              <Text padding={{ bottom: 'small' }} color={Color.GREY_700} font={{ variation: FontVariation.SMALL_SEMI }}>
                {getString('ce.anomalyDetection.filters.actualSpend')}
              </Text>
              <TextInput
                value={String(updatedFilters.minActualAmount || 0)}
                onChange={e =>
                  setUpdatedFilters(prevValues => ({
                    ...prevValues,
                    minActualAmount: Number((e.target as HTMLInputElement).value)
                  }))
                }
              />
              <Text padding={{ bottom: 'small' }} color={Color.GREY_700} font={{ variation: FontVariation.SMALL_SEMI }}>
                {getString('ce.anomalyDetection.filters.anomalousSpend')}
              </Text>
              <TextInput
                value={String(updatedFilters.minAnomalousSpend || 0)}
                onChange={e =>
                  setUpdatedFilters(prevValues => ({
                    ...prevValues,
                    minAnomalousSpend: Number((e.target as HTMLInputElement).value)
                  }))
                }
              />
              {renderFilterInputs(commonFilterValues || [])}
              {awsFilterValues?.length ? (
                <Card style={{ width: '100%' }} className={cx(css.filterCard, { [css.expanded]: awsFiltersVisible })}>
                  <Layout.Horizontal flex>
                    <Text color={Color.GREY_700}>{getString('ce.anomalyDetection.filters.awsFilters')}</Text>
                    <Icon
                      name={awsFiltersVisible ? 'chevron-up' : 'chevron-down'}
                      onClick={toggleAwsFilters}
                      className={css.pointer}
                      color={Color.PRIMARY_7}
                    />
                  </Layout.Horizontal>
                  {awsFiltersVisible && (
                    <Container className={css.cpFilters}>{renderFilterInputs(awsFilterValues)}</Container>
                  )}
                </Card>
              ) : null}
              {k8sFilterValues?.length ? (
                <Card style={{ width: '100%' }} className={cx(css.filterCard, { [css.expanded]: k8sFiltersVisible })}>
                  <Layout.Horizontal flex>
                    <Text color={Color.GREY_700}>{getString('ce.anomalyDetection.filters.clusterFilters')}</Text>
                    <Icon
                      name={k8sFiltersVisible ? 'chevron-up' : 'chevron-down'}
                      onClick={toggleK8sFilters}
                      className={css.pointer}
                      color={Color.PRIMARY_7}
                    />
                  </Layout.Horizontal>
                  {k8sFiltersVisible && (
                    <Container className={css.cpFilters}>{renderFilterInputs(k8sFilterValues)}</Container>
                  )}
                </Card>
              ) : null}
              {gcpFilterValues?.length ? (
                <Card style={{ width: '100%' }} className={cx(css.filterCard, { [css.expanded]: gcpFiltersVisible })}>
                  <Layout.Horizontal flex>
                    <Text color={Color.GREY_700}>{getString('ce.anomalyDetection.filters.gcpFilters')}</Text>
                    <Icon
                      name={gcpFiltersVisible ? 'chevron-up' : 'chevron-down'}
                      onClick={togglegGcpFilters}
                      className={css.pointer}
                      color={Color.PRIMARY_7}
                    />
                  </Layout.Horizontal>
                  {gcpFiltersVisible && (
                    <Container className={css.cpFilters}>{renderFilterInputs(gcpFilterValues)}</Container>
                  )}
                </Card>
              ) : null}
            </Container>
            <Container>
              <Button
                text={getString('common.apply')}
                variation={ButtonVariation.PRIMARY}
                disabled={isEqual(filters, updatedFilters)}
                onClick={() => {
                  setFilters(updatedFilters)
                }}
              />
              <Button
                text={getString('filters.clearAll')}
                variation={ButtonVariation.TERTIARY}
                margin={{ left: 'small' }}
                onClick={() => {
                  setFilters({})
                  setUpdatedFilters({})
                  setSelectedFilter(undefined)
                  setFilterFlow(null)
                }}
              />
            </Container>
          </Layout.Vertical>
          <Layout.Vertical width={234} background={Color.PRIMARY_9} className={css.saveFilterContainer}>
            <Container padding={'xlarge'}>
              <Icon name="ng-filter" size={22} color={Color.WHITE} />
              <Text inline font={{ variation: FontVariation.H5 }} color={Color.WHITE} margin={{ left: 'medium' }}>
                {getString('filters.filtersLabel')}
              </Text>
            </Container>
            {fetching || savedFiltersLoading ? (
              <Container height={'100%'} flex={{ alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="spinner" color={Color.WHITE} size={24} />
              </Container>
            ) : (
              <>
                <Container
                  className={cx(css.newFilterBtn, { [css.selected]: !selectedFilter })}
                  onClick={() => {
                    setFilterFlow('create')
                    setUpdatedFilters({})
                    setFilterName('')
                    setSelectedFilter(undefined)
                  }}
                >
                  <Icon name="plus" size={18} color={Color.WHITE} />
                  <Text
                    inline
                    font={{ variation: FontVariation.SMALL_SEMI }}
                    color={Color.WHITE}
                    margin={{ left: 'medium' }}
                  >
                    {getString('filters.newFilter')}
                  </Text>
                </Container>
                <Container height={'100%'}>
                  {savedFilters.map(item => {
                    const isSelected = item.identifier === selectedFilter?.identifier
                    return (
                      <Layout.Horizontal
                        key={item.name}
                        flex
                        className={cx(css.savedFilter, { [css.selected]: isSelected })}
                      >
                        <Layout.Horizontal>
                          {item.filterVisibility === 'OnlyCreator' ? <Icon inline name="lock" /> : null}
                          <Text
                            inline
                            padding={{ left: item.filterVisibility === 'OnlyCreator' ? 'small' : 'xlarge' }}
                            font={{ variation: FontVariation.SMALL_SEMI }}
                            color={Color.WHITE}
                            onClick={() => {
                              setSelectedFilter(item)
                              setUpdatedFilters(item.filterProperties || {})
                              setFilterFlow(null)
                            }}
                          >
                            {item.name}
                          </Text>
                        </Layout.Horizontal>
                        <Popover
                          position="left"
                          interactionKind={'hover'}
                          className={Classes.DARK}
                          usePortal={false}
                          content={
                            <Menu>
                              <MenuItem
                                text={getString('edit')}
                                icon="edit"
                                onClick={() => {
                                  setFilterFlow('edit')
                                  setFilterName(item.name)
                                  setFilterVisibility(item.filterVisibility || 'EveryOne')
                                  setSelectedFilter(item)
                                  setUpdatedFilters(item.filterProperties || {})
                                }}
                              />
                              <MenuItem
                                text={getString('delete')}
                                icon="trash"
                                onClick={async () => {
                                  await deleteFilter(item.identifier)
                                  setUpdatedFilters({})
                                  refetchSavedFilters()
                                }}
                              />
                            </Menu>
                          }
                        >
                          <Icon name="Options" />
                        </Popover>
                      </Layout.Horizontal>
                    )
                  })}
                </Container>
                {filterFlow ? (
                  <Container padding={'xlarge'}>
                    <Text
                      border={{ top: true, color: Color.WHITE }}
                      style={{ opacity: 0.1 }}
                      padding={{ bottom: 'medium' }}
                    />
                    <Text margin={{ bottom: 'medium' }} color={Color.WHITE}>
                      {getString('filters.name')}
                    </Text>
                    <TextInput
                      onChange={e => setFilterName((e.target as HTMLInputElement).value)}
                      value={filterName}
                      placeholder={getString('filters.typeFilterName')}
                      style={{ backgroundColor: 'transparent' }}
                      color={Color.WHITE}
                    />
                    <Layout.Vertical spacing={'small'} margin={{ top: 'small', bottom: 'large' }}>
                      <Text color={Color.WHITE} margin={{ top: 'medium', bottom: 'medium' }}>
                        {getString('filters.filterVisibility')}
                      </Text>
                      <Radio
                        large
                        checked={filterVisibility === 'EveryOne'}
                        label={getString('filters.visibleToEveryone')}
                        className={css.radioBtnLabel}
                        value="EveryOne"
                        onClick={() => setFilterVisibility('EveryOne')}
                      />
                      <Radio
                        large
                        checked={filterVisibility === 'OnlyCreator'}
                        label={getString('filters.visibileToOnlyMe')}
                        className={css.radioBtnLabel}
                        value="OnlyCreator"
                        onClick={() => setFilterVisibility('OnlyCreator')}
                      />
                    </Layout.Vertical>
                    <Button
                      text={getString(filterFlow === 'create' ? 'save' : 'update')}
                      variation={ButtonVariation.SECONDARY}
                      onClick={async () => {
                        try {
                          if (filterName) {
                            const payload = {
                              name: filterName,
                              filterVisibility,
                              filterProperties: {
                                filterType: 'Anomaly',
                                ...updatedFilters
                              } as FilterProperties
                            }

                            if (filterFlow === 'create') {
                              await createFilter({ ...payload, identifier: getIdentifierFromName(filterName) })
                            } else if (filterFlow === 'edit' && selectedFilter?.identifier) {
                              await updateFilter({ ...payload, identifier: selectedFilter?.identifier })
                            }
                          }

                          setFilterFlow(null)
                          refetchSavedFilters()
                        } catch (error) {
                          showError(getErrorInfoFromErrorObject(error as any))
                        }
                      }}
                    />
                    <Button
                      text={getString('cancel')}
                      margin={{ left: 'small' }}
                      variation={ButtonVariation.LINK}
                      className={css.radioBtnLabel}
                      onClick={() => {
                        setFilterFlow(null)
                        setUpdatedFilters({})
                      }}
                    />
                  </Container>
                ) : null}
              </>
            )}
          </Layout.Vertical>
        </Layout.Horizontal>
      </Drawer>
    )
  }, [
    fetching,
    fetchedFilterValues,
    JSON.stringify(updatedFilters),
    JSON.stringify(filters),
    savedFilters,
    filterName,
    filterVisibility,
    selectedFilter,
    filterFlow,
    savedFiltersLoading,
    awsFiltersVisible,
    k8sFiltersVisible,
    gcpFiltersVisible
  ])

  return (
    <Layout.Horizontal spacing="large" className={css.header}>
      <Layout.Horizontal spacing="large" style={{ alignItems: 'center' }}></Layout.Horizontal>
      <FlexExpander />
      <DropDown
        placeholder={getString(savedFilters.length > 0 ? 'filters.selectFilter' : 'common.filters.noFilterSaved')}
        filterable={false}
        disabled={savedFilters.length === 0}
        onChange={option => {
          const selectedSavedFilter = savedFilters.find(filter => filter.identifier === option.value)
          setSelectedFilter(selectedSavedFilter)
          setUpdatedFilters(selectedSavedFilter?.filterProperties || {})
          setFilters(selectedSavedFilter?.filterProperties || {})
          setFilterFlow(null)
        }}
        addClearBtn={true}
        value={selectedFilter?.identifier}
        items={
          savedFilters.map(filter => ({
            label: filter.name,
            value: filter.identifier
          })) as SelectOption[]
        }
      />
      <Icon
        name="ng-filter"
        size={24}
        onClick={openFilterDrawer}
        color={Color.PRIMARY_7}
        className={css.pointer}
        style={{ alignSelf: 'center' }}
      />
      <Text border={{ right: true, color: Color.GREY_300 }} />
      <PerspectiveTimeRangePicker timeRange={timeRange} setTimeRange={setTimeRange} />
    </Layout.Horizontal>
  )
}

export default AnomalyFilters
