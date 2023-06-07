import { Color, FontVariation, StyledProps } from '@harness/design-system'
import { Layout, Text } from '@harness/uicore'
import React from 'react'

interface ListItemProps extends StyledProps {
  title: string
  content: JSX.Element
}

const ListItems: React.FC<ListItemProps> = props => {
  const { title, content, ...rest } = props
  return (
    <Layout.Horizontal {...rest}>
      <Text color={Color.GREY_700} font={{ variation: FontVariation.BODY }} style={{ width: '40%' }}>
        {title}
      </Text>
      {content}
    </Layout.Horizontal>
  )
}

export default ListItems
