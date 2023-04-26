/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { compact } from 'lodash-es'
import { SimpleTagInput, Text, Icon, Layout, Container } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Menu } from '@blueprintjs/core'
import { MultiSelect } from '@blueprintjs/select'
import { useToaster } from '@common/exports'
import { useStrings } from 'framework/strings'
import type { DelegateSelector } from 'services/portal'

import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { listContainsTag, transformToTagList } from './DelegateSelectors.utils'
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
  readonly?: boolean
}

export const DelegateSelectorsV2 = (props: DelegateSelectorsV2Props): React.ReactElement | null => {
  const { onTagInputChange, placeholder, data: delegateSelectors, readonly } = props
  const selectedItems = props.selectedItems as string[] | undefined
  const { getString } = useStrings()
  const { showError } = useToaster()

  const selectedDelegateSelectors = useMemo(() => {
    if (!Array.isArray(selectedItems)) return []

    return compact(selectedItems).map(item => {
      const itemInDelegateSelectors = delegateSelectors.find(dS => dS.name === item)
      return itemInDelegateSelectors ?? { connected: false, name: item }
    })
  }, [selectedItems, delegateSelectors])

  const createdDelegateSelectors = useMemo(() => {
    return selectedDelegateSelectors.filter(sDS => !delegateSelectors.some(dS => dS.name === sDS.name))
  }, [delegateSelectors, selectedDelegateSelectors])

  const allItems = useMemo(
    () => [...delegateSelectors, ...createdDelegateSelectors],
    [createdDelegateSelectors, delegateSelectors]
  )

  const onRemove = (tagValue: string): void => {
    onTagInputChange?.(transformToTagList(selectedDelegateSelectors.filter(sDS => sDS.name !== tagValue)))
  }

  const onItemSelect = (item: DelegateSelector): void => {
    const isNewlyCreatedTag = !listContainsTag(allItems, item)
    if (isNewlyCreatedTag && !validateNewTag(item?.name || '')) {
      return
    }

    const existingSelector = selectedDelegateSelectors.find(sDS => sDS.name === item.name)
    const updatedSelectors = existingSelector
      ? selectedDelegateSelectors.filter(sDS => sDS !== existingSelector)
      : [...selectedDelegateSelectors, item]
    onTagInputChange?.(transformToTagList(updatedSelectors))
  }

  const renderCreateTagOption = (
    query: string,
    active: boolean,
    handleClick: React.MouseEventHandler<HTMLElement>
  ): JSX.Element => {
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

  const validateNewTag = (tag: string): boolean => {
    const pattern = new RegExp('^[a-z0-9-${}]+$', 'i')
    const validTag = new RegExp('^[a-z0-9-${}._<>+]+$', 'i').test(tag)
    const tagChars = tag.split('')
    const validExpression = isValidExpression(tag, showError, getString('delegate.DelegateSelectorErrorMessage'))
    const invalidChars = new Set()
    tagChars.map((item: string) => {
      if (!pattern.test(item)) {
        invalidChars.add(item)
      }
    })

    if (!validTag) {
      const errorMsg = (
        <Text color={Color.WHITE}>
          {getString('delegate.DelegateSelector')} <strong>{' ' + tag + ' '} </strong>
          {getString('delegate.DelegateSelectorErrMsgSplChars')}: {Array.from(invalidChars).join(',')}
        </Text>
      )
      showError(errorMsg, 5000)
    }
    return validTag && validExpression
  }

  const renderDelegateSelector = (
    item: DelegateSelector,
    handleClick: React.MouseEventHandler<HTMLElement>
  ): JSX.Element => {
    return (
      <Menu.Item
        key={item.name as string}
        onClick={handleClick}
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

  const renderIcon = (color: string): JSX.Element => {
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
      items={allItems}
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
      resetOnSelect
      onItemSelect={onItemSelect}
      tagRenderer={item => item.name}
      tagInputProps={{
        disabled: readonly,
        onRemove,
        className: css.delegateInput,
        tagProps: (value: any) => {
          const _value = value as string
          const isItemNewlyCreated = createdDelegateSelectors.findIndex(item => item.name === value) !== -1
          const isExpression = isItemNewlyCreated && _value.startsWith('${') && _value.endsWith('}')
          return isExpression || readonly
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
