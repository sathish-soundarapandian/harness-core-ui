/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Button,
  ButtonVariation,
  Card,
  Container,
  getErrorInfoFromErrorObject,
  Icon,
  Layout,
  MultiSelect,
  MultiSelectOption,
  Radio,
  SelectOption,
  Text,
  TextInput
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { FontVariation, Color } from '@harness/design-system'
import { Classes, Drawer, Menu, MenuItem, Popover, Position, TagInput } from '@blueprintjs/core'
import { defaultTo, isEqual, omit } from 'lodash-es'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/exports'
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
import { filterKeyToKeyMapping, filterKeyToLabelMapping } from '@ce/utils/anomaliesUtils'
import { useBooleanStatus } from '@common/hooks'
import { getIdentifierFromName } from '@common/utils/StringUtils'

import css from './AnomaliesFilter.module.scss'

interface AnomaliesFilterPanelProps {
  fetchedFilterValues: FilterStatsDTO[]
  filters: AnomalyFilterProperties
  setFilters: (newValue: AnomalyFilterProperties) => void
}

type FilterFormFlow = 'create' | 'edit' | null
type FilterVisibilty = 'EveryOne' | 'OnlyCreator'

const useAnomaliesFilterPanel = ({ fetchedFilterValues, filters, setFilters }: AnomaliesFilterPanelProps) => {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { accountId } = useParams<{ accountId: string }>()
  const {
    data: fetchedSavedFilters,
    refetch: refetchSavedFilters,
    loading: savedFiltersLoading
  } = useGetFilterList({
    queryParams: {
      accountIdentifier: accountId,
      type: 'Anomaly'
    }
  })

  const savedFilters = defaultTo(fetchedSavedFilters?.data?.content, [])

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
  const [filterVisibility, setFilterVisibility] = useState<FilterVisibilty>('EveryOne')
  const [selectedFilter, setSelectedFilter] = useState<FilterDTO>()
  const [filterFormFlow, setFilterFormFlow] = useState<FilterFormFlow>(null)

  const getSelectedOptions = (key: string): MultiSelectOption[] => {
    const options =
      (updatedFilters[key as keyof AnomalyFilterProperties] as string[])?.map((item: string) => ({
        label: item,
        value: item
      })) || []

    return options
  }

  const renderFilterInputs = (filterValues: FilterStatsDTO[]) =>
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
            <Text className={css.label} font={{ variation: FontVariation.SMALL_SEMI }}>
              {filterKeyToLabelMapping[key]}
            </Text>
            <MultiSelect
              className={css.multiSelect}
              value={selectedOptions}
              items={multiSelectValues as MultiSelectOption[]}
              allowCreatingNewItems={false}
              onChange={
                /* istanbul ignore next */
                options => {
                  const optionValues = options.map(option => option.value)
                  setUpdatedFilters(prevValues => ({
                    ...prevValues,
                    [filterKeyToKeyMapping[key]]: optionValues
                  }))
                }
              }
            />
          </>
        )
      }
    })

  const setSavedFilter = (option: SelectOption) => {
    const selectedSavedFilter = savedFilters.find(filter => filter.identifier === option.value)
    const filterProperties = defaultTo(selectedSavedFilter?.filterProperties, {})

    setSelectedFilter(selectedSavedFilter)
    setUpdatedFilters(filterProperties)
    setFilters(filterProperties)
    setFilterFormFlow(null)
  }

  const handleEditFilter = (filter: FilterDTO): void => {
    setFilterFormFlow('edit')
    setSelectedFilter(filter)
    setFilterName(filter.name)
    setFilterVisibility(defaultTo(filter.filterVisibility, 'EveryOne'))
    setUpdatedFilters(defaultTo(filter.filterProperties, {}))
  }

  const createOrUpdateFilter = async () => {
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

        if (filterFormFlow === 'create') {
          await createFilter({ ...payload, identifier: getIdentifierFromName(filterName) })
        } else if (filterFormFlow === 'edit' && selectedFilter?.identifier) {
          await updateFilter({ ...payload, identifier: selectedFilter?.identifier })
        }
      }

      setFilterFormFlow(null)
      refetchSavedFilters()
    } catch (error) {
      /* istanbul ignore next */
      showError(getErrorInfoFromErrorObject(error as any))
    }
  }

  const commonFilterValues = fetchedFilterValues?.filter(
    key => key.key?.startsWith('aws') && key.key?.startsWith('gcp') && filterKeyToKeyMapping[key.key].startsWith('k8s')
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
                onAdd={
                  /* istanbul ignore next */
                  options => {
                    options.map(option =>
                      setUpdatedFilters(prevValues => ({
                        ...prevValues,
                        tags: {
                          ...prevValues.tags,
                          [option]: ''
                        }
                      }))
                    )
                  }
                }
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
              {renderFilterInputs(commonFilterValues)}
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
                onClick={() => setFilters(updatedFilters)}
              />
              <Button
                text={getString('filters.clearAll')}
                variation={ButtonVariation.TERTIARY}
                margin={{ left: 'small' }}
                onClick={() => {
                  setFilters({})
                  setUpdatedFilters({})
                  setSelectedFilter(undefined)
                  setFilterFormFlow(null)
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
            {savedFiltersLoading ? (
              <Container height={'100%'} flex={{ alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="spinner" color={Color.WHITE} size={24} />
              </Container>
            ) : (
              <>
                <Container
                  className={cx(css.newFilterBtn, { [css.selected]: !selectedFilter })}
                  onClick={() => {
                    setFilterFormFlow('create')
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
                              setUpdatedFilters(defaultTo(item.filterProperties, {}))
                              setFilterFormFlow(null)
                            }}
                          >
                            {item.name}
                          </Text>
                        </Layout.Horizontal>
                        <Popover
                          position="left"
                          className={Classes.DARK}
                          usePortal={false}
                          content={
                            <Menu>
                              <MenuItem text={getString('edit')} icon="edit" onClick={() => handleEditFilter(item)} />
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
                <NewFilterForm
                  filterFormFlow={filterFormFlow}
                  setFilterFormFlow={setFilterFormFlow}
                  filterName={filterName}
                  setFilterName={setFilterName}
                  filterVisibility={filterVisibility}
                  setFilterVisibility={setFilterVisibility}
                  createOrUpdateFilter={createOrUpdateFilter}
                />
              </>
            )}
          </Layout.Vertical>
        </Layout.Horizontal>
      </Drawer>
    )
  }, [
    fetchedFilterValues,
    JSON.stringify(updatedFilters),
    JSON.stringify(filters),
    savedFilters,
    filterName,
    filterVisibility,
    selectedFilter,
    filterFormFlow,
    savedFiltersLoading,
    awsFiltersVisible,
    k8sFiltersVisible,
    gcpFiltersVisible
  ])

  return { openFilterDrawer, savedFilters, setSavedFilter, selectedFilter }
}

export default useAnomaliesFilterPanel

interface NewFilterFormProps {
  filterFormFlow: FilterFormFlow
  setFilterFormFlow: React.Dispatch<React.SetStateAction<FilterFormFlow>>
  filterName: string
  setFilterName: React.Dispatch<React.SetStateAction<string>>
  filterVisibility: FilterVisibilty
  setFilterVisibility: React.Dispatch<React.SetStateAction<FilterVisibilty>>
  createOrUpdateFilter: () => void
}

const NewFilterForm: React.FC<NewFilterFormProps> = ({
  filterFormFlow,
  setFilterFormFlow,
  filterName,
  setFilterName,
  filterVisibility,
  setFilterVisibility,
  createOrUpdateFilter
}) => {
  const { getString } = useStrings()

  if (!filterFormFlow) {
    return null
  }

  return (
    <Container padding={'xlarge'}>
      <Text border={{ top: true, color: Color.WHITE }} style={{ opacity: 0.1 }} padding={{ bottom: 'medium' }} />
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
        text={getString(filterFormFlow === 'create' ? 'save' : 'update')}
        variation={ButtonVariation.SECONDARY}
        onClick={createOrUpdateFilter}
      />
      <Button
        text={getString('cancel')}
        margin={{ left: 'small' }}
        variation={ButtonVariation.LINK}
        className={css.radioBtnLabel}
        onClick={() => setFilterFormFlow(null)}
      />
    </Container>
  )
}
