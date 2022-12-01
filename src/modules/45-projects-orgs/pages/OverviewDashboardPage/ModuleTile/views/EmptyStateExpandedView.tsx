import React from 'react'
import { Container, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import css from './EmptyState.module.scss'

interface EmptyStateExpandedViewProps {
  title: string
  description?: string | string[]
  footer?: React.ReactElement
}

const EmptyStateExpandedView: React.FC<EmptyStateExpandedViewProps> = ({ title, description, footer }) => {
  return (
    <Layout.Vertical
      height="100%"
      flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
      margin={{ top: 'small' }}
    >
      <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
        {title}
        {Array.isArray(description) ? (
          <ul className={css.listStyle}>
            {description.map((desc, index) => (
              <li key={index}>{desc}</li>
            ))}
          </ul>
        ) : (
          <Text margin={{ top: 'medium' }}>{description}</Text>
        )}
      </Text>
      <Container width="100%" padding={{ top: 'medium', bottom: 'medium' }}>
        {footer}
      </Container>
    </Layout.Vertical>
  )
}

export default EmptyStateExpandedView
