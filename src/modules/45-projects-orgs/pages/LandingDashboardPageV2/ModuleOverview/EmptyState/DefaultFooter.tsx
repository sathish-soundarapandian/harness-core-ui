/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Button, ButtonVariation, Icon, Layout, Text } from '@harness/uicore'
import React from 'react'
import { Color } from '@harness/design-system'
import { useHistory } from 'react-router-dom'
import { useStrings } from 'framework/strings'

interface DefaultFooterProps {
  learnMoreLink: string
  getStartedLink?: string
}

const DefaultFooter: React.FC<DefaultFooterProps> = props => {
  const { learnMoreLink } = props
  const { getString } = useStrings()
  const history = useHistory()

  return (
    <Layout.Horizontal flex={{ justifyContent: 'space-between' }} padding={{ bottom: 'small' }}>
      <Button
        variation={ButtonVariation.PRIMARY}
        onClick={e => {
          e.stopPropagation()
          e.preventDefault()
          if (props?.getStartedLink) {
            history.push(props?.getStartedLink)
          }
        }}
      >
        {getString('getStarted')}
      </Button>
      <Layout.Horizontal flex inline color={Color.PRIMARY_7} onClick={e => e.stopPropagation()}>
        <a rel="noreferrer" target="_blank" href={learnMoreLink}>
          <Text inline color={Color.PRIMARY_7} margin={{ right: 'xsmall' }}>
            {getString('common.learnMore')}
          </Text>
        </a>
        <Icon color={Color.PRIMARY_7} name="launch" size={12} />
      </Layout.Horizontal>
    </Layout.Horizontal>
  )
}

export default DefaultFooter
