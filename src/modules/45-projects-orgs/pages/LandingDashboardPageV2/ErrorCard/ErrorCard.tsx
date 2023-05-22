import React from 'react'
import { Button, ButtonSize, ButtonVariation, Icon, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import css from './ErrorCard.module.scss'

export enum ErrorCardSize {
  'SMALL' = 'SMALL',
  'MEDIUM' = 'MEDIUM'
}

interface ErrorCardProps {
  size?: ErrorCardSize
  onRetry?: () => void
}

const ErrorCard: React.FC<ErrorCardProps> = props => {
  const { getString } = useStrings()

  switch (props.size) {
    case ErrorCardSize.MEDIUM:
      return (
        <Layout.Horizontal className={css.callout} flex padding="medium">
          <Layout.Horizontal flex>
            <Icon name="warning-sign" color={Color.ORANGE_700} margin={{ right: 'small' }} />
            <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.ORANGE_700}>
              {getString('projectsOrgs.apiError')}
            </Text>
          </Layout.Horizontal>
          <Button size={ButtonSize.SMALL} variation={ButtonVariation.LINK} onClick={props.onRetry}>
            {getString('retry')}
          </Button>
        </Layout.Horizontal>
      )
    case ErrorCardSize.SMALL:
    default:
      return (
        <Layout.Vertical
          className={css.callout}
          margin={{ top: 'medium', bottom: 'small' }}
          flex={{ justifyContent: 'center' }}
        >
          <Icon name="warning-sign" color={Color.ORANGE_700} />
          <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.ORANGE_700} margin={{ top: 'medium' }}>
            {getString('projectsOrgs.apiError')}
          </Text>
          <Button
            size={ButtonSize.SMALL}
            variation={ButtonVariation.LINK}
            onClick={e => {
              e.stopPropagation()
              props.onRetry?.()
            }}
          >
            {getString('retry')}
          </Button>
        </Layout.Vertical>
      )
  }
}

export default ErrorCard
