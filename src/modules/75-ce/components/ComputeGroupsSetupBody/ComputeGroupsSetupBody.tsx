/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Tabs } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import ScaleAndLimitPoliciesTab from './ScaleAndLimitPoliciesTab/ScaleAndLimitPoliciesTab'
import SchedulingAutostoppingTab from './SchedulingAutostoppingTab'
import ClusterPermissionsTab from './ClusterPermissionsTab'
import css from './ComputeGroupsSetupBody.module.scss'

const ComputeGroupsSetupBody: React.FC = () => {
  const { getString } = useStrings()
  return (
    <Container className={css.cgSetupBodyContainer}>
      <Tabs
        id={'horizontalTabs'}
        defaultSelectedTabId={'tab1'}
        tabList={[
          {
            id: 'tab1',
            title: `1. ${getString('ce.cloudIntegration.clusterPermissions')}`,
            panel: <ClusterPermissionsTab />,
            iconProps: { name: 'gear' }
          },
          {
            id: 'tab2',
            title: getString('ce.computeGroups.setup.scalingLimitPoliciesTab.title'),
            panel: <ScaleAndLimitPoliciesTab />,
            iconProps: { name: 'gear' }
          },
          {
            id: 'tab3',
            title: getString('ce.computeGroups.setup.schedulingTab.title'),
            panel: <SchedulingAutostoppingTab />,
            iconProps: { name: 'gear' }
          }
        ]}
      ></Tabs>
    </Container>
  )
}

export default ComputeGroupsSetupBody
