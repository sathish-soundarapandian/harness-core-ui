/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { NoDataCard, Tabs } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { ConnectorResponse } from 'services/cd-ng'
import EntitySetupUsage from '@common/pages/entityUsage/EntityUsage'
import { EntityType } from '@common/pages/entityUsage/EntityConstants'
import ActivityHistory from '@connectors/components/activityHistory/ActivityHistory/ActivityHistory'
import ConnectorView from '../../ConnectorView'
import { ConnectorDetailsView } from '../../utils/ConnectorHelper'
import css from '../ConnectorsListView.module.scss'

interface RenderConnectorDetailsActiveTabProps {
  activeCategory: ConnectorDetailsView
  data: ConnectorResponse
  refetch: () => Promise<void>
  onTabChange: (tabId: ConnectorDetailsView) => void
}

const RenderConnectorDetailsActiveTab: React.FC<RenderConnectorDetailsActiveTabProps> = ({
  activeCategory,
  data,
  refetch,
  onTabChange
}) => {
  const { getString } = useStrings()
  const viewToLabelMap: Record<ConnectorDetailsView, string> = {
    [ConnectorDetailsView.overview]: getString('overview'),
    [ConnectorDetailsView.referencedBy]: getString('referencedBy'),
    [ConnectorDetailsView.activityHistory]: getString('activityHistoryLabel')
  }

  const [tab, setTab] = useState<ConnectorDetailsView>(activeCategory)
  useEffect(() => {
    setTab(activeCategory)
  }, [activeCategory])
  return (
    <div className={css.connectorTabs}>
      <Tabs
        id={'horizontalTabs'}
        selectedTabId={tab}
        onChange={newTabId => {
          setTab(newTabId as ConnectorDetailsView)
          onTabChange(newTabId as ConnectorDetailsView)
        }}
        tabList={[
          {
            id: ConnectorDetailsView.overview,
            title: viewToLabelMap[ConnectorDetailsView.overview],
            panel: data.connector?.type ? (
              <ConnectorView
                type={data.connector.type}
                response={data || ({} as ConnectorResponse)}
                refetchConnector={refetch}
              />
            ) : (
              <NoDataCard message={getString('connectors.connectorNotFound')} icon="question" />
            )
          },
          {
            id: ConnectorDetailsView.referencedBy,
            title: viewToLabelMap[ConnectorDetailsView.referencedBy],
            panel: data.connector?.identifier ? (
              <EntitySetupUsage
                entityType={EntityType.Connectors}
                entityIdentifier={data.connector.identifier}
                withSearchBarInPageHeader={false}
              />
            ) : (
              <></>
            )
          },
          {
            id: ConnectorDetailsView.activityHistory,
            title: viewToLabelMap[ConnectorDetailsView.activityHistory],
            panel: (
              <ActivityHistory referredEntityType="Connectors" entityIdentifier={data.connector?.identifier || ''} />
            )
          }
        ]}
      ></Tabs>
    </div>
  )
}

export default RenderConnectorDetailsActiveTab
