/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Container, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import css from '../CreateCeAzureConnector_new.module.scss'

interface Props {
  title: string
  reason: string
  suggestion?: React.ReactNode
}

const ShowConnectorError = (props: Props) => {
  const { getString } = useStrings()
  const { title, reason, suggestion } = props

  return (
    <div className={css.connectorErrorBox}>
      <Layout.Vertical spacing="medium">
        <Text
          inline
          icon="circle-cross"
          iconProps={{ size: 18, color: 'red700', padding: { right: 'small' } }}
          color="red700"
        >
          {title}
        </Text>
        <Container>
          <Text inline font={'small'} icon="info" iconProps={{ size: 16, padding: { right: 'small' } }} color="grey700">
            {reason}
          </Text>
        </Container>
        {suggestion && (
          <Container>
            <Text
              inline
              font={{ size: 'small', weight: 'semi-bold' }}
              icon="lightbulb"
              iconProps={{ size: 16, padding: { right: 'small' } }}
              color="grey700"
            >
              {getString('connectors.ceAzure.overview.trySuggestion')}
            </Text>
            <Text padding={{ left: 'xlarge' }} color="grey700" font={'small'}>
              {suggestion}
            </Text>
          </Container>
        )}
      </Layout.Vertical>
    </div>
  )
}

export default ShowConnectorError
