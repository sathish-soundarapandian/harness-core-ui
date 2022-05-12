/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Container,
  Text,
  Layout,
  Icon,
  ButtonVariation,
  Button,
  MultiSelect,
  MultiSelectOption,
  TextInput,
  Radio
} from '@wings-software/uicore'
import { Color, FontVariation } from '@wings-software/design-system'
import { useModalHook } from '@harness/use-modal'
import { isEqual } from 'lodash-es'
import { Drawer, Popover, Position } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { getIdentifierFromName } from '@common/utils/StringUtils'
import {
  CCMRecommendationFilterProperties,
  FilterDTO,
  FilterProperties,
  K8sRecommendationFilterPropertiesDTO,
  ResponseListFilterStatsDTO,
  useDeleteFilter,
  useGetFilterList,
  usePostFilter,
  useUpdateFilter
} from 'services/ce'
import { getLabelMappingForFilters } from './constants'

import css from './RecommendationFilters.module.scss'

interface RecommendationFiltersProps {
  fetching: boolean
  setFilters: (newValue: K8sRecommendationFilterPropertiesDTO) => void
  filters: K8sRecommendationFilterPropertiesDTO
  filterList: ResponseListFilterStatsDTO
  costFilters: { minCost: number; minSaving: number }
  setCostFilters: (newValue: { minCost: number; minSaving: number }) => void
}

type ExtendedFilterProperties = FilterProperties & CCMRecommendationFilterProperties

const RecommendationFilters: React.FC<RecommendationFiltersProps> = ({
  fetching,
  filters,
  filterList,
  setFilters,
  costFilters,
  setCostFilters
}) => {
  const { getString } = useStrings()
  const { accountId } = useParams<{ accountId: string }>()

  const {
    data: savedFilters,
    refetch: refetchSavedFilters,
    loading: savedFiltersLoading
  } = useGetFilterList({
    queryParams: {
      accountIdentifier: accountId,
      type: 'CCMRecommendation'
    }
  })

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

  const keyToLabelMapping = getLabelMappingForFilters(getString)

  const [updatedFilters, setUpdatedFilters] = useState<K8sRecommendationFilterPropertiesDTO>(filters)
  const [updatedCostFilters, setUpdatedCostFilters] = useState<{ minCost: number; minSaving: number }>(costFilters)
  const [filterName, setFilterName] = useState('')
  const [filterVisibility, setFilterVisibility] = useState<'EveryOne' | 'OnlyCreator'>('EveryOne')
  const [selectedFilter, setSelectedFilter] = useState<FilterDTO>()
  const [filterFlow, setFilterFlow] = useState<'create' | 'edit' | null>()

  const [openFilterDrawer, hideFilterDrawer] = useModalHook(() => {
    return (
      <Drawer onClose={hideFilterDrawer} className={css.filterDrawer} {...drawerProps}>
        {!fetching ? (
          <Layout.Horizontal className={css.drawerContent}>
            <Icon name="cross" size={22} className={css.exitIcon} color={Color.WHITE} onClick={hideFilterDrawer} />
            <Layout.Vertical width={398} className={css.formContainer} padding={'xlarge'}>
              <Container className={css.formHeader}>
                <Text font={{ variation: FontVariation.H5 }} color={Color.GREY_300}>
                  {selectedFilter ? selectedFilter.identifier : getString('filters.newFilter')}
                </Text>
              </Container>
              <Container height={'100%'} padding={{ top: 'xlarge' }}>
                {filterList?.data?.map(filter => {
                  const key = filter.key as keyof K8sRecommendationFilterPropertiesDTO
                  const values = filter.values

                  if (key && values) {
                    const filteredValues = values.filter(value => value)
                    const multiSelectValues = filteredValues?.map(val => ({ label: val, value: val }))

                    const selectedKey = Object.keys(updatedFilters).find(item => item === `${key}s`)
                    const selectedOptions = updatedFilters[
                      selectedKey as keyof K8sRecommendationFilterPropertiesDTO
                    ]?.map((item: string) => ({ label: item, value: item }))

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
                          value={selectedOptions as MultiSelectOption[]}
                          items={multiSelectValues as MultiSelectOption[]}
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
                <Text
                  padding={{ bottom: 'small' }}
                  color={Color.GREY_700}
                  font={{ variation: FontVariation.SMALL_SEMI }}
                >
                  {getString('ce.recommendation.listPage.filters.minCost')}
                </Text>
                <TextInput
                  value={String(updatedCostFilters.minCost)}
                  onChange={e =>
                    setUpdatedCostFilters(prevValues => ({
                      ...prevValues,
                      minCost: Number((e.target as HTMLInputElement).value)
                    }))
                  }
                />
                <Text
                  padding={{ bottom: 'small' }}
                  color={Color.GREY_700}
                  font={{ variation: FontVariation.SMALL_SEMI }}
                >
                  {getString('ce.recommendation.listPage.filters.minSaving')}
                </Text>
                <TextInput
                  value={String(updatedCostFilters.minSaving)}
                  onChange={e =>
                    setUpdatedCostFilters(prevValues => ({
                      ...prevValues,
                      minSaving: Number((e.target as HTMLInputElement).value)
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
                  onClick={() => {
                    setFilters({})
                    setUpdatedFilters({})
                    const costFltrs = { minCost: 0, minSaving: 0 }
                    setCostFilters(costFltrs)
                    setUpdatedCostFilters(costFltrs)
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
                    {savedFilters?.data?.content?.map(item => {
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
                                setUpdatedFilters(
                                  (item.filterProperties as ExtendedFilterProperties)
                                    .k8sRecommendationFilterPropertiesDTO || {}
                                )

                                setUpdatedCostFilters({
                                  minCost: (item.filterProperties as ExtendedFilterProperties).minCost || 0,
                                  minSaving: (item.filterProperties as ExtendedFilterProperties).minSaving || 0
                                })
                                setFilterFlow(null)
                              }}
                            >
                              {item.name}
                            </Text>
                          </Layout.Horizontal>
                          <Popover
                            position="left"
                            interactionKind={'hover'}
                            content={
                              <Container>
                                <Text
                                  className={css.popoverOption}
                                  icon="edit"
                                  onClick={() => {
                                    setFilterFlow('edit')
                                    setFilterName(item.name)
                                    setFilterVisibility(item.filterVisibility || 'EveryOne')
                                    setSelectedFilter(item)
                                    setUpdatedFilters(
                                      (item.filterProperties as ExtendedFilterProperties)
                                        .k8sRecommendationFilterPropertiesDTO || {}
                                    )
                                    setUpdatedCostFilters({
                                      minCost: (item.filterProperties as ExtendedFilterProperties).minCost || 0,
                                      minSaving: (item.filterProperties as ExtendedFilterProperties).minSaving || 0
                                    })
                                  }}
                                >
                                  {getString('edit')}
                                </Text>
                                <Text
                                  className={css.popoverOption}
                                  icon="trash"
                                  onClick={async () => {
                                    await deleteFilter(item.identifier)
                                    setUpdatedFilters({})
                                    refetchSavedFilters()
                                  }}
                                >
                                  {getString('delete')}
                                </Text>
                              </Container>
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
                        onClick={async () => {
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
        ) : (
          <Icon name="spinner" color={Color.PRIMARY_7} />
        )}
      </Drawer>
    )
  }, [
    filterList,
    updatedFilters,
    filters,
    updatedCostFilters,
    costFilters,
    savedFilters,
    filterName,
    filterVisibility,
    selectedFilter,
    filterFlow,
    costFilters,
    savedFiltersLoading
  ])

  return fetching ? (
    <Icon name="spinner" size={24} color="blue500" style={{ alignSelf: 'center' }} />
  ) : (
    <>
      <Icon name="ng-filter" size={24} color={Color.PRIMARY_7} onClick={openFilterDrawer} />
    </>
  )
}

export default RecommendationFilters
