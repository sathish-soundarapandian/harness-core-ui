import React from 'react'
import { Tab, Tabs } from '@harness/uicore'
import Optimization from './Optimization'
import Standardization from './Standardization'
import Assistant from './Assistant'
import css from '@freeze-windows/components/FreezeWindowStudioBody/FreezeWindowStudioBody.module.scss'

enum IntelligenceTabs {
  OPTIMIZATION = 'OPTIMIZATION',
  STANDARDIZATION = 'STANDARDIZATION',
  ASSISTANT = 'ASSISTANT'
}

export default function PipelineIntelligence() {
  const [selectedTab, setSelectedTabId] = React.useState(IntelligenceTabs.ASSISTANT)
  return (
    <section className={css.stepTabs}>
      <Tabs
        id={'PipelineIntelligence'}
        selectedTabId={selectedTab}
        onChange={(tabId: IntelligenceTabs) => {
          setSelectedTabId(tabId)
        }}
        data-tabId={selectedTab}
      >
        <Tab id={IntelligenceTabs.OPTIMIZATION} title={'Optimization'} panel={<Optimization />} />
        <Tab id={IntelligenceTabs.STANDARDIZATION} title={'Standardization'} panel={<Standardization />} />
        <Tab id={IntelligenceTabs.ASSISTANT} title={'Assistant'} panel={<Assistant />} />
      </Tabs>
    </section>
  )
}
