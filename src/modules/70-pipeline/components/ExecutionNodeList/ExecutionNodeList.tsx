/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Tab, Tabs, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import ExecutionLayoutToggle from '../ExecutionLayout/ExecutionLayoutToggle'
import { InstanceListPanel } from './InstanceListPanel'
import { ExecutionStatusIcon } from '../ExecutionStatusIcon/ExecutionStatusIcon'
import css from './ExecutionNodeList.module.scss'

enum NodeListTab {
  InstanceList = 'InstanceList'
}

export function ExecutionNodeList(): JSX.Element | null {
  const { getString } = useStrings()
  const [activeTab, setActiveTab] = useState<NodeListTab>(NodeListTab.InstanceList)
  const { allNodeMap, selectedCollapsedNodeId } = useExecutionContext()
  const node = allNodeMap[selectedCollapsedNodeId]

  if (!node) {
    return null
  }

  return (
    <div className={css.main}>
      <div className={css.header}>
        {node.status && <ExecutionStatusIcon status={node.status as ExecutionStatus} size={20} />}
        <Text data-testid="collapsed-step-name" lineClamp={1} font={{ variation: FontVariation.FORM_SUB_SECTION }}>
          {getString('common.stepName', { name: node.name })}
        </Text>
        <div className={css.actions}>
          <ExecutionLayoutToggle />
        </div>
      </div>

      <Tabs
        id="list-details"
        selectedTabId={activeTab}
        onChange={newTab => {
          setActiveTab(newTab as NodeListTab)
        }}
        renderAllTabPanels={false}
      >
        <Tab
          className={css.tab}
          id={NodeListTab.InstanceList}
          title={getString('pipeline.execution.instanceList')}
          panel={<InstanceListPanel />}
        />
      </Tabs>
    </div>
  )
}
