/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import {
  ExpandingSearchInput,
  Text,
  Icon,
  Layout,
  Button,
  IconName,
  Heading,
  Container,
  Card
} from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { cloneDeep, noop, uniqBy } from 'lodash-es'
import { Drawer, IDrawerProps, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core'
import cx from 'classnames'
import { FeatureWarningWithTooltip } from '@common/components/FeatureWarning/FeatureWarningWithTooltip'
import { useStrings } from 'framework/strings'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useFeature } from '@common/hooks/useFeatures'
import css from './AddDrawer.module.scss'

const getAllItemsCount = (originalData: CategoryInterface[]): number | undefined => {
  if (originalData?.some(data => data?.items?.length)) {
    let count = 0
    originalData.forEach(data => (count += data?.items?.length || 0))
    return count
  }
}

const defaultPageDrawerProps: IDrawerProps = {
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: true,
  isOpen: true,
  hasBackdrop: true,
  position: Position.RIGHT,
  usePortal: true,
  size: 700
}

const defaultStudioDrawerProps: IDrawerProps = {
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: true,
  isOpen: true,
  hasBackdrop: false,
  position: Position.RIGHT,
  size: 700
}

export enum DrawerContext {
  PAGE = 'PAGE',
  STUDIO = 'STUDIO'
}

const defaultDrawerValues = {
  STUDIO: {
    iconSize: 25,
    defaultDrawerProps: defaultStudioDrawerProps
  },
  PAGE: {
    iconSize: 25,
    defaultDrawerProps: defaultPageDrawerProps
  }
}

const primaryTypes = {
  SHOW_ALL: 'show_all',
  RECENTLY_USED: 'recently_used'
}

const filterContext = {
  NAV: 'NAV',
  SEARCH: 'SEARCH'
}
export interface ItemInterface {
  itemLabel: string
  iconName: IconName
  value: string
  visible?: boolean
  disabled?: boolean
  // may need for onSelect
  categoryValue?: string
}

export interface CategoryInterface {
  categoryLabel: string
  categoryValue?: string
  items?: ItemInterface[]
  categories?: CategoryInterface[]
  iconName?: IconName
  // enforcement framework: show restriction limit warning.
  warningTooltipRenderer?: (item: ItemInterface) => React.ReactNode
}

export interface AddDrawerMapInterface {
  drawerLabel: string
  drawerSubLabel?: string
  showAllLabel?: string
  categories: CategoryInterface[]
}

export interface AddDrawerProps {
  onSelect: (item: ItemInterface) => void
  onClose: () => void
  addDrawerMap: AddDrawerMapInterface
  drawerContext: DrawerContext.PAGE | DrawerContext.STUDIO
  drawerProps?: IDrawerProps
  showRecentlyUsed?: boolean
}
export default function AddDrawer(props: AddDrawerProps): JSX.Element {
  const { onSelect, onClose, addDrawerMap, drawerProps, drawerContext, showRecentlyUsed = false } = props
  const [categories, setCategories] = useState<CategoryInterface[]>([])
  const [originalData, setOriginalCategories] = useState<CategoryInterface[]>([])
  const [selectedCategory, setSelectedCategory] = useState(primaryTypes.SHOW_ALL)
  const { getString } = useStrings()

  useEffect(() => {
    if (addDrawerMap.categories) {
      const stepsCategories = addDrawerMap.categories
      setCategories(stepsCategories)
      setOriginalCategories(stepsCategories)
    }
  }, [addDrawerMap])
  const { enabled: featureEnabled } = useFeature({
    featureRequest: {
      featureName: FeatureIdentifier.SECRET_MANAGERS
    }
  })

  const filterSteps = (str: string, context: string = filterContext.NAV): void => {
    const filteredData: CategoryInterface[] = []
    const searchString = str.toLowerCase()
    const cloneOriginalData = cloneDeep(originalData)
    if (searchString !== primaryTypes.SHOW_ALL) {
      cloneOriginalData.forEach((category: CategoryInterface) => {
        if (category.categoryLabel?.toLowerCase().search(searchString) !== -1) {
          filteredData.push(category)
        } else if (category.categories && category.categories.length > 0) {
          const filterCategories: CategoryInterface[] = []
          category.categories.forEach((nestedCategory: CategoryInterface) => {
            if (nestedCategory.categoryLabel?.toLowerCase().search(searchString) !== -1) {
              filterCategories.push(nestedCategory)
            }
          })
          if (filterCategories?.length) {
            category.categories = filterCategories
            filteredData.push(category)
          }
        }
        if (context === filterContext.SEARCH && category.items) {
          const items: ItemInterface[] = []
          category.items.forEach((item: ItemInterface) => {
            if (item.itemLabel?.toLowerCase().search(searchString) !== -1) {
              items.push(item)
            }
          })
          if (items?.length) {
            category.items = items
            filteredData.push(category)
          }
        }
      })

      const uniqueData: CategoryInterface[] = uniqBy(filteredData, 'categoryLabel')
      setCategories(uniqueData)
      setSelectedCategory(str)
    } else {
      setCategories(originalData)
      setSelectedCategory(str)
    }
  }
  return (
    <Drawer onClose={onClose} {...defaultDrawerValues[drawerContext].defaultDrawerProps} {...drawerProps}>
      <Button
        minimal
        className={css.almostFullScreenCloseTriggerBtn}
        icon="cross"
        withoutBoxShadow
        onClick={() => {
          onClose()
        }}
      />
      <div className={css.stepPalette}>
        <div className={css.stepInside}>
          <section className={css.stepsRenderer}>
            <Layout.Vertical padding="large" spacing="large">
              <Layout.Horizontal className={css.paletteCardHeader} spacing="medium">
                <Layout.Vertical spacing="small">
                  <Heading
                    level={2}
                    color={Color.GREY_800}
                    font={{ weight: 'bold', size: 'medium' }}
                    className={css.title}
                  >
                    {addDrawerMap.drawerLabel}
                  </Heading>
                  {addDrawerMap.drawerSubLabel && (
                    <Text className={css.drawerSubLabel}>{addDrawerMap.drawerSubLabel}</Text>
                  )}
                </Layout.Vertical>

                <ExpandingSearchInput
                  flip
                  autoFocus
                  width={232}
                  placeholder={getString('search')}
                  throttle={200}
                  onChange={(text: string) => filterSteps(text, filterContext.SEARCH)}
                />
              </Layout.Horizontal>
              {categories?.length === 0 && (
                <section style={{ paddingTop: '50%', justifyContent: 'center', textAlign: 'center' }}>
                  {getString('noSearchResultsFoundPeriod')}
                </section>
              )}
              {categories?.map((category: CategoryInterface) => {
                const categorySteps: JSX.Element[] = []
                /* istanbul ignore else */ if (category?.items) {
                  category.items.forEach((item: ItemInterface) => {
                    const secretManagersType = category.categoryLabel === getString('secretManagers')
                    const featureEnabledTemp = secretManagersType ? featureEnabled : true
                    categorySteps.push(
                      <section
                        className={css.step}
                        key={item.itemLabel}
                        data-cy={`${category.categoryLabel}_${item.itemLabel}`}
                        onClick={
                          !item.disabled && featureEnabledTemp
                            ? () => onSelect({ ...Object.assign(item, { categoryValue: category.categoryValue }) })
                            : noop
                        }
                      >
                        <Card
                          interactive={false}
                          elevation={0}
                          selected={false}
                          disabled={item.disabled || !featureEnabledTemp}
                        >
                          <Icon size={defaultDrawerValues[drawerContext]?.iconSize} name={item.iconName} />
                        </Card>
                        <section className={cx(css.stepName, !featureEnabledTemp ? css.disabledHover : undefined)}>
                          {item.itemLabel}
                        </section>
                        {item.disabled && typeof category.warningTooltipRenderer === 'function' && (
                          <Popover
                            className={css.limitWarning}
                            position={Position.BOTTOM}
                            interactionKind={PopoverInteractionKind.HOVER}
                            content={<div>{category.warningTooltipRenderer(item)}</div>}
                          >
                            <Icon size={20} color={Color.ORANGE_700} name={'execution-warning'} />
                          </Popover>
                        )}
                      </section>
                    )
                  })
                }
                if (category?.categories && category.categories.length > 0) {
                  category.categories.forEach((nestedCategory: CategoryInterface) => {
                    nestedCategory?.items?.map((item: ItemInterface) => {
                      categorySteps.push(
                        <section
                          className={css.step}
                          key={item.itemLabel}
                          data-cy={`${category.categoryLabel}_${item.itemLabel}`}
                          onClick={() => {
                            /* istanbul ignore else */ if (item.value !== 'Placeholder') {
                              onSelect({
                                itemLabel: item.itemLabel || /* istanbul ignore next */ '',
                                value: item.value || /* istanbul ignore next */ '',
                                iconName: item.iconName
                              })
                            }
                          }}
                        >
                          <Card
                            interactive={false}
                            elevation={0}
                            selected={false}
                            disabled
                            onClick={e => e.stopPropagation()}
                          >
                            <Icon name={item.iconName} />
                          </Card>
                          <section className={css.stepName}>{item.itemLabel}</section>
                        </section>
                      )
                    })
                  })
                }

                return (
                  <section className={css.categorySteps} key={category.categoryLabel}>
                    <Layout.Horizontal
                      className={cx(css.categoryName)}
                      flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
                      spacing="small"
                    >
                      <div className={cx({ [css.comingSoonBanner]: category.categoryValue === 'ArtifactComingSoon' })}>
                        {category.categoryLabel}
                      </div>

                      {category.categoryLabel === getString('secretManagers') && !featureEnabled && (
                        <FeatureWarningWithTooltip featureName={FeatureIdentifier.SECRET_MANAGERS} />
                      )}
                    </Layout.Horizontal>
                    <section className={cx(css.steps)}>{[...categorySteps]}</section>
                  </section>
                )
              })}
            </Layout.Vertical>
          </section>
          <section className={css.categoriesRenderer}>
            <section className={css.headerContainer}>
              <Layout.Horizontal flex>
                <Container flex className={css.libraryHeader}>
                  <Icon size={14} name="library" className={`${css.paletteIcon} ${css.library}`} />
                  <Text color={Color.WHITE} style={{ fontSize: 14 }}>
                    {addDrawerMap.drawerLabel}
                  </Text>
                </Container>
              </Layout.Horizontal>
              <section className={css.primaryCategories}>
                <section
                  className={cx(
                    css.showAllBtn,
                    showRecentlyUsed && selectedCategory === primaryTypes.SHOW_ALL
                      ? css.active
                      : /* istanbul ignore next */ ''
                  )}
                  onClick={() => {
                    filterSteps(primaryTypes.SHOW_ALL)
                  }}
                  key={primaryTypes.SHOW_ALL}
                >
                  <Text color={Color.WHITE} style={{ fontSize: 11, fontWeight: 'bold' }}>
                    {addDrawerMap.showAllLabel || getString('showAll')} (
                  </Text>
                  {getAllItemsCount(originalData) || originalData?.length})
                </section>
                {showRecentlyUsed ? <section>{getString('recentlyUsed')} (0)</section> : null}
              </section>
            </section>
            <hr className={css.separator} />
            <section className={css.secCategories}>
              <Layout.Vertical>
                {originalData?.map((category: CategoryInterface) => {
                  const stepRenderer = []
                  if (category?.items && (!category.categories || category.categories.length === 0)) {
                    stepRenderer.push(
                      <section
                        className={cx(css.category, selectedCategory === category.categoryLabel && css.active)}
                        onClick={() => {
                          filterSteps(category.categoryLabel || /* istanbul ignore next */ '')
                        }}
                        key={category.categoryLabel}
                      >
                        {category.categoryLabel} ({category.items?.length})
                      </section>
                    )
                  }
                  if (category?.categories && category.categories.length > 0) {
                    stepRenderer.push(
                      <section
                        className={cx(css.category, selectedCategory === category.categoryLabel && css.active)}
                        onClick={() => {
                          filterSteps(category.categoryLabel || '')
                        }}
                        key={category.categoryLabel}
                      >
                        {category.iconName && <Icon size={25} name={category.iconName} />}
                        {category.categoryLabel}
                      </section>
                    )
                    category.categories.forEach((nestedCategory: CategoryInterface) =>
                      stepRenderer.push(
                        <section
                          className={cx(
                            css.category,
                            css.offset,
                            selectedCategory === nestedCategory.categoryLabel && css.active
                          )}
                          onClick={() => {
                            filterSteps(nestedCategory.categoryLabel || /* istanbul ignore next */ '')
                          }}
                          key={nestedCategory.categoryLabel}
                        >
                          {nestedCategory.categoryLabel} ({nestedCategory.items?.length})
                        </section>
                      )
                    )
                  }
                  return [...stepRenderer]
                })}
              </Layout.Vertical>
            </section>
          </section>
        </div>
      </div>
    </Drawer>
  )
}
