/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, PageBody, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import cx from 'classnames'

import { String, useStrings } from 'framework/strings'

import { CloudProviderList } from '../CreateConnector/CreateConnector'

import EmptyStateImage from './images/EmptyState.svg'
import EmptySearchImage from './images/EmptySearch.svg'
import css from './CloudIntegrationTabs.module.scss'

interface NoConnectorsProps {
  handleConnectorCreation: (selectedProvider: string) => void
}

const NoConnectors: React.FC<NoConnectorsProps> = ({ handleConnectorCreation }) => {
  const { getString } = useStrings()

  return (
    <PageBody className={css.emptyStateCtn}>
      <Layout.Vertical spacing={'xxlarge'} style={{ margin: 'auto', alignItems: 'center' }}>
        <img src={EmptyStateImage} width={250} />
        <Text font={{ variation: FontVariation.BODY, align: 'center' }}>
          <String stringID="ce.cloudIntegration.emptyStateDesc" useRichText />
        </Text>
        <Text font={{ variation: FontVariation.H4, align: 'center' }} margin={{ top: 'large' }}>
          {getString('ce.cloudIntegration.createConnector')}
        </Text>
        <div className={css.cloudProviderList}>
          <CloudProviderList onChange={handleConnectorCreation} iconSize={30} />
        </div>
      </Layout.Vertical>
    </PageBody>
  )
}

export default NoConnectors

export const EmptySearchState: React.FC = () => {
  const { getString } = useStrings()
  return (
    <PageBody className={cx(css.emptyStateCtn, css.emptySearch)}>
      <Layout.Vertical style={{ margin: 'auto', alignItems: 'center' }}>
        <img src={EmptySearchImage} width={250} />
        <Text font={{ variation: FontVariation.BODY, align: 'center' }}>
          {getString('ce.cloudIntegration.noSearchResults')}
        </Text>
      </Layout.Vertical>
    </PageBody>
  )
}
