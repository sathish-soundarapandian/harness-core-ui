/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { noop } from 'lodash-es'
import { SimpleTagInput, Text, Icon } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useToaster } from '@common/exports'
import { useStrings } from 'framework/strings'
import { useGetDelegateSelectorsUpTheHierarchy } from 'services/portal'

import type { AccountPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
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

export interface DelegateSelectorsProps
  extends Partial<React.ComponentProps<typeof SimpleTagInput>>,
    Partial<ProjectPathProps> {
  placeholder?: string
  pollingInterval?: number
  wrapperClassName?: string
  onTagInputChange?: (tags: string[]) => void
}

export const DelegateSelectors = (props: DelegateSelectorsProps): React.ReactElement | null => {
  const { accountId } = useParams<AccountPathProps>()
  const {
    orgIdentifier,
    projectIdentifier,
    pollingInterval = null,
    onTagInputChange = noop,
    wrapperClassName,
    placeholder,
    ...rest
  } = props

  const { getString } = useStrings()
  const { showError } = useToaster()

  const queryParams = { accountId, orgId: orgIdentifier, projectId: projectIdentifier }
  const {
    data: apiData,
    loading,
    refetch
  } = useGetDelegateSelectorsUpTheHierarchy({
    queryParams
  })

  const [data, setData] = useState(apiData)

  useEffect(() => {
    if (apiData) {
      setData(apiData)
    }
  }, [apiData])

  // polling logic
  useEffect(() => {
    if (pollingInterval === null) {
      return
    }
    let id: number | null
    if (!loading) {
      id = window.setTimeout(() => refetch(), pollingInterval)
    }
    return () => {
      if (id) {
        window.clearTimeout(id)
      }
    }
  }, [data, loading, refetch, pollingInterval])

  return (
    <div className={cx(css.wrapper, wrapperClassName)} data-name="DelegateSelectors">
      {loading && !data ? (
        <div className={css.loader}>
          <Icon margin="medium" name="spinner" size={15} color={Color.PRIMARY_8} />
          <span>{getString('loading')}</span>
        </div>
      ) : (
        <SimpleTagInput
          fill
          popoverProps={{
            usePortal: false,
            minimal: true,
            position: 'bottom-left',
            className: css.delegatePopover
          }}
          items={data?.resource || []}
          onChange={onTagInputChange}
          {...rest}
          allowNewTag
          getTagProps={(value, _index, _selectedItems, createdItems, items) => {
            const _value = value as string
            const isItemNewlyCreated = createdItems.includes(_value) || !items.includes(_value)
            const isExpression = isItemNewlyCreated && _value.startsWith('${') && _value.endsWith('}')
            return isExpression
              ? { intent: 'none', minimal: true }
              : isItemNewlyCreated
              ? { intent: 'danger', minimal: true }
              : { intent: 'primary', minimal: true }
          }}
          validateNewTag={(tag: string) => {
            const pattern = new RegExp('^[a-z0-9-${}]+$', 'i')
            const validTag = new RegExp('^[a-z0-9-${}._<>+]+$', 'i').test(tag)
            const tagChars = tag.split('')
            const validExpression = isValidExpression(
              tag,
              showError,
              getString('delegate.DelegateSelectorErrorMessage')
            )
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
          }}
          placeholder={placeholder || getString('delegate.Delegate_Selector_placeholder')}
          className={css.delegateInput}
        />
      )}
    </div>
  )
}

export default DelegateSelectors
