import { Button, ButtonVariation, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import React from 'react'
import type { ModuleTileDetailsBaseProps } from '../../types'
import css from './CDZeroState.module.scss'

const CDZeroState: React.FC<ModuleTileDetailsBaseProps> = ({ isExpanded }) => {
  if (!isExpanded) {
    return (
      <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL }}>
        Pipelines, GitOps... we have you covered
      </Text>
    )
  }
  return (
    <Layout.Vertical height="100%">
      <Text
        margin={{ top: 'small' }}
        className={css.descText}
        font={{ variation: FontVariation.SMALL }}
        color={Color.GREY_600}
      >
        Start your Deployments journey in 4 steps.
        <ol type="1">
          <li>Select Deployment type</li>
          <li>Connect to Environment</li>
          <li>Configure Service</li>
          <li>Run Pipeline</li>
        </ol>
      </Text>
      <Layout.Horizontal flex={{ justifyContent: 'space-between' }} padding={{ bottom: 'small' }}>
        <Button variation={ButtonVariation.PRIMARY}>Get Started</Button>
        <Button variation={ButtonVariation.LINK} rightIcon="launch">
          Learn more
        </Button>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default CDZeroState
