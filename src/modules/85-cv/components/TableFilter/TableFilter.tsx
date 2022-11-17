/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { debounce } from 'lodash-es'
import { TextInput, Container } from '@harness/uicore'
import cx from 'classnames'
import css from './TableFilter.module.scss'

export interface TableFilterProps {
  appliedFilter?: string
  onFilter: (filterValue: string) => void
  className?: string
  placeholder?: string
  throttle?: number
}

export function TableFilter(props: TableFilterProps): JSX.Element {
  const { appliedFilter, onFilter, className, placeholder, throttle } = props
  const [filter, setFilter] = useState<string | undefined>(appliedFilter)
  const [, setDebouncedFunc] = useState()
  return (
    <Container className={cx(css.main, className)}>
      <TextInput
        leftIcon="search"
        placeholder={placeholder}
        value={filter || ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          e.persist()
          setFilter(e.target.value)
          setDebouncedFunc((prevDebounce?: any) => {
            prevDebounce?.cancel()
            const updatedDebouncedFunc = debounce(onFilter, throttle || 750)
            updatedDebouncedFunc(e.target.value)
            return updatedDebouncedFunc as any
          })
        }}
      />
    </Container>
  )
}
