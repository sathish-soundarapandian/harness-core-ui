import React from 'react'
import cx from 'classnames'
import { DropDown, Layout, SelectOption, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'

import css from './ListHeader.module.scss'

interface ListHeaderProps {
  totalCount?: number
  sortOptions: SelectOption[]
  onSortMethodChange(option: SelectOption): void
  selectedSortMethod: string
  className?: string
}

export default function ListHeader(props: ListHeaderProps): JSX.Element {
  const { getString } = useStrings()

  return (
    <Layout.Horizontal
      flex={{ distribution: 'space-between' }}
      margin={{ bottom: 'small' }}
      className={cx(css.listHeader, props.className)}
    >
      <Text font={{ variation: FontVariation.H5 }}>
        {getString('total')}: {props.totalCount}
      </Text>
      <DropDown
        icon={'main-sort'}
        items={props.sortOptions}
        onChange={props.onSortMethodChange}
        value={props.selectedSortMethod}
        filterable={false}
      />
    </Layout.Horizontal>
  )
}
