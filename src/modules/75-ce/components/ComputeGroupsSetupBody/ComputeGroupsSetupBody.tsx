/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Button, ButtonVariation, Container, Layout, Tabs } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import ScaleAndLimitPoliciesTab from './ScaleAndLimitPoliciesTab/ScaleAndLimitPoliciesTab'
import SchedulingAutostoppingTab from './SchedulingAutostoppingTab'
import ClusterPermissionsTab from './ClusterPermissionsTab'
import SpotInstancesTab from './SpotInstancesTab'
// import ReviewTab from './ReviewTab'
import css from './ComputeGroupsSetupBody.module.scss'

const ComputeGroupsSetupBody: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  const history = useHistory()
  const { getString } = useStrings()
  const [selectedTabId, setSelectedTabId] = useState(1)

  const handleBack = () => {
    setSelectedTabId(prevId => prevId - 1)
  }

  const handleNext = () => {
    if (selectedTabId === 4) {
      history.push(routes.toComputeGroups({ accountId }))
      return
    }
    setSelectedTabId(prevId => prevId + 1)
  }

  return (
    <Container className={css.cgSetupBodyContainer}>
      <Tabs
        id={'horizontalTabs'}
        selectedTabId={selectedTabId}
        tabList={[
          {
            id: 1,
            title: `1. ${getString('ce.cloudIntegration.clusterPermissions')}`,
            panel: (
              <Container className={css.page}>
                <ClusterPermissionsTab />
              </Container>
            )
          },
          {
            id: 2,
            title: `2. ${getString('ce.computeGroups.setup.spotInstancesTab.title')}`,
            panel: (
              <Container className={css.page}>
                <SpotInstancesTab />
              </Container>
            )
          },
          {
            id: 3,
            title: getString('ce.perspectives.createPerspective.tabHeaders.preferences'),
            panel: (
              <Container className={css.page}>
                <ScaleAndLimitPoliciesTab />
              </Container>
            )
          },
          {
            id: 4,
            title: `4. ${getString('ce.computeGroups.setup.schedulingTab.title')}`,
            panel: (
              <Container className={css.page}>
                <SchedulingAutostoppingTab />
              </Container>
            )
          }
          // {
          //   id: 5,
          //   title: `5. ${getString('review')}`,
          //   panel: (
          //     <Container className={css.page}>
          //       <ReviewTab />
          //     </Container>
          //   )
          // }
        ]}
        onChange={tabId => setSelectedTabId(tabId as number)}
      ></Tabs>
      <Layout.Horizontal spacing={'large'} padding="large" className={css.ctaContainer}>
        <Button
          text={getString('back')}
          icon="chevron-left"
          iconProps={{ size: 12 }}
          variation={ButtonVariation.SECONDARY}
          disabled={selectedTabId === 1}
          onClick={handleBack}
        />
        <Button
          text={selectedTabId === 4 ? getString('save') : getString('next')}
          rightIcon="chevron-right"
          iconProps={{ size: 12 }}
          variation={ButtonVariation.PRIMARY}
          onClick={handleNext}
        />
      </Layout.Horizontal>
    </Container>
  )
}

export default ComputeGroupsSetupBody
