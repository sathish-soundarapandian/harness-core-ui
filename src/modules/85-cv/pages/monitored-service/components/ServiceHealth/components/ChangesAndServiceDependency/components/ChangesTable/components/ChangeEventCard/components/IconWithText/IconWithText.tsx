import React from 'react'
import { Container, Icon, IconName, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'

export const IconWithText = ({ icon, text = '' }: { icon?: IconName; text?: string }): JSX.Element => {
  return (
    <Container>
      <Layout.Horizontal spacing={'small'}>
        {icon && <Icon name={icon} size={15} />}
        {text && (
          <Text font={{ size: 'small' }} color={Color.GREY_800}>
            {text}
          </Text>
        )}
      </Layout.Horizontal>
    </Container>
  )
}
