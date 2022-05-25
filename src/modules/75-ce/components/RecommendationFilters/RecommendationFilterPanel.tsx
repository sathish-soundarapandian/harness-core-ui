/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Button,
  ButtonVariation,
  Container,
  getErrorInfoFromErrorObject,
  Icon,
  Layout,
  MultiSelect,
  MultiSelectOption,
  Radio,
  Text,
  TextInput
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Color, FontVariation } from '@harness/design-system'
import { Classes, Drawer, Menu, MenuItem, Popover, Position } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { defaultTo, isEqual } from 'lodash-es'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/exports'
import {
  CCMRecommendationFilterProperties,
  FilterDTO,
  FilterProperties,
  FilterStatsDTO,
  K8sRecommendationFilterPropertiesDTO,
  useDeleteFilter,
  useGetFilterList,
  usePostFilter,
  useUpdateFilter
} from 'services/ce'
import { getIdentifierFromName } from '@common/utils/StringUtils'
import { getLabelMappingForFilters } from './constants'

import css from './RecommendationFilters.module.scss'

interface RecommendationFilterPanelProps {
  fetchedFilterValues: FilterStatsDTO[]
  filters: K8sRecommendationFilterPropertiesDTO
  setFilters: (newState: K8sRecommendationFilterPropertiesDTO) => void
  costFilters: { minCost?: number; minSaving?: number }
  setCostFilters: (newValue: { minCost?: number; minSaving?: number }) => void
}

type ExtendedFilterProperties = FilterProperties & CCMRecommendationFilterProperties

const useRecommendationFilterPanel = ({
  fetchedFilterValues,
  filters,
  setFilters,
  costFilters,
  setCostFilters
}: RecommendationFilterPanelProps) => {
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
      type: 'CCMRecommendation'
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
      type: 'CCMRecommendation'
    }
  })

  const keyToLabelMapping = getLabelMappingForFilters(getString)

  const [updatedFilters, setUpdatedFilters] = useState<K8sRecommendationFilterPropertiesDTO>(filters)
  const [updatedCostFilters, setUpdatedCostFilters] = useState<{ minCost?: number; minSaving?: number }>(costFilters)
  const [filterName, setFilterName] = useState('')
  const [filterVisibility, setFilterVisibility] = useState<'EveryOne' | 'OnlyCreator'>('EveryOne')
  const [selectedFilter, setSelectedFilter] = useState<FilterDTO>()
  const [filterFlow, setFilterFlow] = useState<'create' | 'edit' | null>()

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

  const setSavedFilter = (option: MultiSelectOption) => {
    const selectedSavedFilter = savedFilters.find(filter => filter.identifier === option.value)
    const filterProperties = selectedSavedFilter?.filterProperties as ExtendedFilterProperties
    const k8sRecommendationFilterPropertiesDTO = defaultTo(filterProperties?.k8sRecommendationFilterPropertiesDTO, {})
    const selectedCostFilters = {
      minCost: filterProperties?.minCost,
      minSaving: filterProperties?.minSaving
    }

    setSelectedFilter(selectedSavedFilter)
    setUpdatedFilters(k8sRecommendationFilterPropertiesDTO)
    setFilters(k8sRecommendationFilterPropertiesDTO)
    setCostFilters(selectedCostFilters)
    setUpdatedCostFilters(selectedCostFilters)
    setFilterFlow(null)
  }

  const getSelectedOptions = (key: string): MultiSelectOption[] => {
    const options =
      updatedFilters[key as keyof K8sRecommendationFilterPropertiesDTO]?.map((item: string) => ({
        label: item,
        value: item
      })) || []

    return options
  }

  const handleDeleteFilter = async (item: FilterDTO) => {
    await deleteFilter(item.identifier)
    setUpdatedFilters({})
    refetchSavedFilters()
    setFilterName('')
  }

  const handleEditFilter = (item: FilterDTO) => {
    const filterProperties = item.filterProperties as ExtendedFilterProperties

    setFilterFlow('edit')
    setFilterName(item.name)
    setFilterVisibility(defaultTo(item.filterVisibility, 'EveryOne'))
    setSelectedFilter(item)
    setUpdatedFilters(defaultTo(filterProperties.k8sRecommendationFilterPropertiesDTO, {}))
    setUpdatedCostFilters({
      minCost: filterProperties.minCost,
      minSaving: filterProperties.minSaving
    })
  }

  const handleClearAllFilters = () => {
    setFilters({})
    setUpdatedFilters({})
    setCostFilters({})
    setUpdatedCostFilters({})
    setSelectedFilter(undefined)
    setFilterFlow(null)
  }

  const createOrUpdateFilter = async () => {
    try {
      if (filterName) {
        const payload = {
          name: filterName,
          filterVisibility,
          filterProperties: {
            filterType: 'CCMRecommendation',
            k8sRecommendationFilterPropertiesDTO: updatedFilters,
            ...updatedCostFilters
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
      /* istanbul ignore next */
      showError(getErrorInfoFromErrorObject(error as any))
    }
  }

  const handleSelectedFilter = (item: FilterDTO) => {
    const filterProperties = item.filterProperties as ExtendedFilterProperties

    setSelectedFilter(item)
    setUpdatedFilters(filterProperties.k8sRecommendationFilterPropertiesDTO || {})
    setUpdatedCostFilters({
      minCost: filterProperties.minCost,
      minSaving: filterProperties.minSaving
    })
    setFilterFlow(null)
  }

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
              {fetchedFilterValues?.map(filter => {
                const key = filter.key as keyof K8sRecommendationFilterPropertiesDTO
                const values = filter.values

                if (key && values) {
                  const filteredValues = values.filter(value => value)
                  const multiSelectValues = filteredValues?.map(val => ({
                    label: val,
                    value: val
                  })) as MultiSelectOption[]

                  const selectedKey = Object.keys(updatedFilters).find(item => item === `${key}s`)
                  const selectedOptions = selectedKey ? getSelectedOptions(selectedKey) : []

                  return (
                    <>
                      <Text
                        padding={{ bottom: 'small' }}
                        color={Color.GREY_700}
                        font={{ variation: FontVariation.SMALL_SEMI }}
                      >
                        {keyToLabelMapping[key]}
                      </Text>
                      <MultiSelect
                        className={css.multiSelect}
                        value={selectedOptions}
                        items={multiSelectValues}
                        allowCreatingNewItems={false}
                        onChange={options => {
                          const optionValues = options.map(option => option.value)

                          setUpdatedFilters(prevValues => ({
                            ...prevValues,
                            [`${key}s`]: optionValues
                          }))
                        }}
                      />
                    </>
                  )
                }
              })}
              <Text padding={{ bottom: 'small' }} color={Color.GREY_700} font={{ variation: FontVariation.SMALL_SEMI }}>
                {getString('ce.recommendation.listPage.filters.savings')}
              </Text>
              <TextInput
                value={String(updatedCostFilters?.minSaving || '')}
                placeholder={getString('ce.recommendation.listPage.filters.savingsPlaceholder')}
                onChange={e =>
                  setUpdatedCostFilters(prevValues => ({
                    ...prevValues,
                    minSaving: +(e.target as HTMLInputElement).value
                  }))
                }
              />
              <Text padding={{ bottom: 'small' }} color={Color.GREY_700} font={{ variation: FontVariation.SMALL_SEMI }}>
                {getString('ce.recommendation.listPage.filters.potentialSpend')}
              </Text>
              <TextInput
                value={String(updatedCostFilters?.minCost || '')}
                placeholder={getString('ce.recommendation.listPage.filters.spendPlaceholder')}
                onChange={e =>
                  setUpdatedCostFilters(prevValues => ({
                    ...prevValues,
                    minCost: +(e.target as HTMLInputElement).value
                  }))
                }
              />
            </Container>
            <Container>
              <Button
                text={getString('common.apply')}
                variation={ButtonVariation.PRIMARY}
                disabled={isEqual(filters, updatedFilters) && isEqual(costFilters, updatedCostFilters)}
                onClick={() => {
                  setFilters(updatedFilters)
                  setCostFilters(updatedCostFilters)
                }}
              />
              <Button
                text={getString('filters.clearAll')}
                variation={ButtonVariation.TERTIARY}
                margin={{ left: 'small' }}
                onClick={handleClearAllFilters}
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
                    setFilterFlow('create')
                    setUpdatedFilters({})
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
                            onClick={() => handleSelectedFilter(item)}
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
                                onClick={() => handleDeleteFilter(item)}
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
                      onClick={createOrUpdateFilter}
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
    fetchedFilterValues,
    JSON.stringify(updatedFilters),
    JSON.stringify(filters),
    JSON.stringify(updatedCostFilters),
    JSON.stringify(costFilters),
    savedFilters,
    filterName,
    filterVisibility,
    selectedFilter,
    filterFlow,
    savedFiltersLoading
  ])

  return { openFilterDrawer, savedFilters, setSavedFilter, selectedFilter }
}

export default useRecommendationFilterPanel
