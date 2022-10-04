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
import css from './ComputeGroupsSetupBody.module.scss'

const ComputeGroupsSetupBody: React.FC = () => {
  const { getString } = useStrings()
  return (
    <Container className={css.cgSetupBodyContainer}>
      <Tabs
        id={'horizontalTabs'}
        defaultSelectedTabId={'tab2'}
        tabList={[
          {
            id: 'tab1',
            title: getString('ce.computeGroups.setup.spotInstancesTab.title'),
            panel: <div>Tab 1 content</div>,
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
            title: 'Tab 3 title',
            panel: <div>Tab 3 content</div>,
            iconProps: { name: 'gear' },
            disabled: true
          }
        ]}
      ></Tabs>
    </Container>
  )
}

export default ComputeGroupsSetupBody
