import React from 'react'
import { Container, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { StringKeys, useStrings } from 'framework/strings'
import css from './EmptyState.module.scss'

interface EmptyStateExpandedViewProps {
  title: StringKeys
  description?: StringKeys | StringKeys[]
  footer?: React.ReactElement
}

const EmptyStateExpandedView: React.FC<EmptyStateExpandedViewProps> = ({ title, description, footer }) => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical
      height="100%"
      flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
      margin={{ top: 'small' }}
    >
      <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
        {getString(title)}
        {Array.isArray(description) ? (
          <ul className={css.listStyle}>
            {description.map((desc, index) => (
              <li key={index}>{getString(desc)}</li>
            ))}
          </ul>
        ) : description ? (
          <Text margin={{ top: 'medium' }}>{getString(description)}</Text>
        ) : undefined}
      </Text>
      <Container width="100%" padding={{ top: 'medium', bottom: 'medium' }}>
        {footer}
      </Container>
    </Layout.Vertical>
  )
}

export default EmptyStateExpandedView
