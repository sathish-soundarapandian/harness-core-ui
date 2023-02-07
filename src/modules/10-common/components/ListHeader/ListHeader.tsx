import { DropDown, Layout, SelectOption, Text } from '@harness/uicore'
import React from 'react'

interface ListHeaderProps {
  totalCount?: number
  sortOptions: SelectOption[]
  onChange(option: SelectOption): void
  value: string
  className?: string
}

export default function ListHeader(props: ListHeaderProps): JSX.Element {
  return (
    <Layout.Horizontal
      flex={{ distribution: 'space-between' }}
      margin={{ bottom: 'small' }}
      className={props.className || ''}
    >
      <Text font={{ weight: 'bold', size: 'medium' }}>Total: {props.totalCount}</Text>
      <DropDown items={props.sortOptions} onChange={props.onChange} value={props.value} filterable={false} />
    </Layout.Horizontal>
  )
}
