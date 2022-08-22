/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { defaultTo, noop, some } from 'lodash-es'
import { SimpleTagInput, Text, Icon, Layout, Container } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { Menu } from '@blueprintjs/core'
import { MultiSelect } from '@blueprintjs/select'
import { useToaster } from '@common/exports'
import { useStrings } from 'framework/strings'
import type { DelegateSelector } from 'services/portal'

import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { addTagIfNeeded, listContainsTag, removeTagIfNeeded } from './DelegateSelectors.utils'
import css from './DelegateSelectors.module.scss'

const isValidExpression = (
  tag: string,
  showError: (message: React.ReactNode, timeout?: number, key?: string) => void,
  errorMsg: string
): boolean => {
  let validExpression = true
  if (tag.includes('${')) {
    validExpression = tag.includes('${') && tag.includes('}')
    if (!validExpression) {
      showError(errorMsg, 5000)
    }
  }
  return validExpression
}

export interface DelegateSelectorsV2Props
  extends Partial<React.ComponentProps<typeof SimpleTagInput>>,
    Partial<ProjectPathProps> {
  placeholder?: string
  pollingInterval?: number
  wrapperClassName?: string
  onTagInputChange?: (tags: string[]) => void
  data: DelegateSelector[]
}

const mapSelectedData = (delegateSelectors: DelegateSelector[], selectedItems: string[]) => {
  return delegateSelectors.filter((item: DelegateSelector) => {
    return selectedItems?.includes(defaultTo(item?.name, ''))
  })
}

export const DelegateSelectorsV2 = (props: DelegateSelectorsV2Props): React.ReactElement | null => {
  const { onTagInputChange = noop, placeholder, selectedItems, data } = props

  const { getString } = useStrings()
  const { showError } = useToaster()

  const [delegateSelectors, setDelegateSelectors] = useState<DelegateSelector[]>([])
  const [selectedDelegateSelectors, setSelectedDelegateSelectors] = useState<DelegateSelector[]>([])
  const [createdTags, setCreatedTags] = useState<DelegateSelector[]>([])

  // Updating internal state when delegate selectors list is empty
  if (data.length !== delegateSelectors.length) {
    setDelegateSelectors(data)
    const selectedList = mapSelectedData(data, selectedItems as string[])
    // Note: Need to check why tags created from UI are not coming in the delegate selectors API response hence updating here
    const newItems = selectedItems?.filter(value => !some(data, ({ name }) => name === value)) || []
    const updateNewTags =
      newItems.length > 0 ? (newItems.map(name => ({ connected: false, name })) as DelegateSelector[]) : []
    setCreatedTags(updateNewTags)
    setSelectedDelegateSelectors([...selectedList, ...updateNewTags])
  }

  const removeSelectedTag = (tagValue: string) => {
    const tag = [...delegateSelectors, ...createdTags].find(
      (item: DelegateSelector) => item.name === tagValue
    ) as DelegateSelector
    const { updatedCreatedTags } = removeTagIfNeeded(createdTags, tag)
    setCreatedTags(updatedCreatedTags)
    selectDeselectDelegateSelectors(tag)
  }

  const selectDeselectDelegateSelectors = (delegateSelector: DelegateSelector) => {
    const selectedTagList = selectedDelegateSelectors
    const index = selectedTagList.findIndex((item: DelegateSelector) => item.name === delegateSelector.name)
    if (index === -1) {
      selectedTagList.push(delegateSelector)
    } else {
      const { updatedCreatedTags } = removeTagIfNeeded(createdTags, delegateSelector)
      setCreatedTags(updatedCreatedTags)
      selectedTagList.splice(index, 1)
    }
    setSelectedDelegateSelectors(selectedTagList)
  }

  const transformToTagList = () => {
    return selectedDelegateSelectors.map((item: any) => item.name)
  }

  const renderCreateTagOption = (query: string, active: boolean, handleClick: any) => {
    return (
      <Menu.Item
        icon="add"
        text={`Create "${query}"`}
        active={active}
        onClick={handleClick}
        shouldDismissPopover={false}
        role="listOption"
      />
    )
  }

  const validateNewTag = (tag: string) => {
    const pattern = new RegExp('^[a-z0-9-${}]+$', 'i')
    const validTag = new RegExp('^[a-z0-9-${}._<>+]+$', 'i').test(tag)
    const tagChars = tag.split('')
    const validExpression = isValidExpression(tag, showError, getString('delegate.DelegateSelectorErrorMessage'))
    const invalidChars = new Set()

    if (!validTag) {
      const errorMsg = (
        <Text>
          {getString('delegate.DelegateSelector')}
          <>
            {tagChars.map((item: string) => {
              if (!pattern.test(item)) {
                invalidChars.add(item)
                return <strong style={{ color: 'red' }}>{item}</strong>
              } else {
                return item
              }
            })}
          </>
          {getString('delegate.DelegateSelectorErrMsgSplChars')}: {Array.from(invalidChars).join(',')}
        </Text>
      )
      showError(errorMsg, 5000)
    }
    return validTag && validExpression
  }

  const renderDelegateSelector = (item: DelegateSelector, handleClick: any) => {
    return (
      <Menu.Item
        key={item.name as string}
        onClick={() => handleClick(item)}
        title={item.name}
        text={
          <Layout.Horizontal flex={{ distribution: 'space-between' }}>
            <Layout.Horizontal spacing="small" flex={{ justifyContent: 'start' }}>
              <Container width={10}>
                {selectedDelegateSelectors.findIndex((itm: DelegateSelector) => item.name === itm.name) !== -1 && (
                  <Icon name="small-tick" />
                )}
              </Container>
              <Text>{item.name}</Text>
            </Layout.Horizontal>
            <Layout.Horizontal>
              {item.connected ? renderIcon(Color.GREEN_450) : renderIcon(Color.RED_450)}
            </Layout.Horizontal>
          </Layout.Horizontal>
        }
      />
    )
  }

  const renderIcon = (color: string) => {
    return <Icon color={color} name="full-circle" size={10} width={30} />
  }

  return (
    <MultiSelect
      fill
      popoverProps={{
        usePortal: false,
        minimal: true,
        position: 'bottom-left',
        className: css.delegatePopover
      }}
      resetOnQuery={false}
      items={[...delegateSelectors, ...createdTags]}
      selectedItems={selectedDelegateSelectors}
      placeholder={placeholder || getString('delegate.Delegate_Selector_placeholder')}
      itemRenderer={(item: DelegateSelector, { handleClick }) => renderDelegateSelector(item, handleClick)}
      itemListPredicate={(query: string, items: DelegateSelector[]) => {
        return items.filter((el: DelegateSelector) => el?.name?.toLowerCase().includes(query.toLowerCase()))
      }}
      createNewItemRenderer={renderCreateTagOption}
      createNewItemFromQuery={(query: string) => {
        return {
          name: query,
          connected: false
        }
      }}
      onItemSelect={(item: DelegateSelector) => {
        const isNewlyCreatedTag = !listContainsTag(delegateSelectors, item)
        if (isNewlyCreatedTag && !validateNewTag(item?.name || '')) {
          return
        }
        const { updatedCreatedTags } = addTagIfNeeded(delegateSelectors, createdTags, item)
        setCreatedTags(updatedCreatedTags)
        selectDeselectDelegateSelectors(item)
        onTagInputChange(transformToTagList())
      }}
      tagRenderer={item => item.name}
      tagInputProps={{
        onRemove: (item: string) => {
          removeSelectedTag(item)
          onTagInputChange(transformToTagList())
        },
        className: css.delegateInput,
        tagProps: (value: any) => {
          const _value = value as string
          const isItemNewlyCreated = createdTags.findIndex(item => item.name === value) !== -1
          const isExpression: any = isItemNewlyCreated && _value.startsWith('${') && _value.endsWith('}')
          return isExpression
            ? { intent: 'none', minimal: true }
            : isItemNewlyCreated
            ? { intent: 'danger', minimal: true }
            : { intent: 'primary', minimal: true }
        }
      }}
    />
  )
}

export default DelegateSelectorsV2
