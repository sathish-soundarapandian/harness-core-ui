/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Container } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { Color } from '@harness/design-system'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import COProviderSelector from '@ce/components/COProviderSelector/COProviderSelector'
import { useQueryParams } from '@common/hooks'
import COGatewayDetails from '@ce/components/COGatewayDetails/COGatewayDetails'
import { Utils } from '@ce/common/Utils'
// import type { Provider } from '@ce/components/COCreateGateway/models'
import { useFeature } from '@common/hooks/useFeatures'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useStrings } from 'framework/strings'
import { GatewayKindType } from '@ce/constants'
import FeatureWarningBanner from '@common/components/FeatureWarning/FeatureWarningBanner'
import type { GatewayDetails } from './models'

function getStringVal(val: string | undefined): string {
  const stringVal = val?.toString()
  if (stringVal != undefined) {
    return stringVal
  }
  return ''
}

const COCreateGatewayContainer: React.FC = () => {
  const { getString } = useStrings()
  const { enabled, featureDetail } = useFeature({
    featureRequest: {
      featureName: FeatureIdentifier.RESTRICTED_AUTOSTOPPING_RULE_CREATION
    }
  })

  return (
    <Container background={Color.WHITE}>
      {!enabled ? (
        <>
          <FeatureWarningBanner
            featureName={FeatureIdentifier.RESTRICTED_AUTOSTOPPING_RULE_CREATION}
            warningMessage={getString('ce.co.autoStoppingRule.limitWarningMessage', {
              limit: featureDetail?.limit,
              count: featureDetail?.count
            })}
          />
        </>
      ) : (
        <COCreateGateway />
      )}
    </Container>
  )
}

const COCreateGateway: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { provider } = useQueryParams<{ provider: string }>()
  const gatewayCreationTabs = ['providerSelector', 'gatewayConfig']
  const [currentTab, setCurrentTab] = useState<string | 'providerSelector'>('providerSelector')

  const initialGatewayDetails: GatewayDetails = {
    name: '',
    cloudAccount: {
      id: '',
      name: ''
    },
    idleTimeMins: 15,
    fullfilment: '',
    filter: '',
    kind: GatewayKindType.INSTANCE,
    orgID: getStringVal(orgIdentifier),
    projectID: getStringVal(projectIdentifier),
    accountID: accountId,
    hostName: '',
    customDomains: [],
    matchAllSubdomains: false,
    disabled: false,
    routing: {
      instance: {
        filterText: ''
      },
      lb: '',
      ports: []
    },
    healthCheck: Utils.getDefaultRuleHealthCheck(),
    opts: {
      preservePrivateIP: false,
      deleteCloudResources: false,
      alwaysUsePrivateIP: false,
      hide_progress_page: false
    },
    provider: {
      icon: '',
      name: '',
      value: ''
    },
    selectedInstances: [],
    accessPointID: '',
    metadata: {},
    deps: []
  }
  const [gatewayDetails, setGatewayDetails] = useState<GatewayDetails>(initialGatewayDetails)
  const nextTab = (): void => {
    const tabIndex = gatewayCreationTabs.findIndex(t => t == currentTab)
    if (tabIndex < gatewayCreationTabs.length - 1) {
      setCurrentTab(gatewayCreationTabs[tabIndex + 1])
    }
  }
  const previousTab = (): void => {
    const tabIndex = gatewayCreationTabs.findIndex(t => t == currentTab)
    if (tabIndex > 0) {
      setCurrentTab(gatewayCreationTabs[tabIndex - 1])
    }
  }

  return (
    <Container background={Color.WHITE}>
      {currentTab === 'providerSelector' && (
        <COProviderSelector
          nextTab={nextTab}
          setGatewayDetails={setGatewayDetails}
          gatewayDetails={gatewayDetails}
          provider={provider}
        />
      )}

      {currentTab == 'gatewayConfig' && (
        <COGatewayDetails
          previousTab={previousTab}
          gatewayDetails={gatewayDetails}
          setGatewayDetails={setGatewayDetails}
          isEditFlow={false}
        />
      )}
    </Container>
  )
}

export default COCreateGatewayContainer
