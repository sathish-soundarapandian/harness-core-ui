import React from 'react'
import { Tab, Tabs } from '@harness/uicore'
import css from '@freeze-windows/components/FreezeWindowStudioBody/FreezeWindowStudioBody.module.scss'

enum IntelligenceTabs {
  OPTIMIZATION = 'OPTIMIZATION',
  STANDARDIZATION = 'STANDARDIZATION',
  ASSISTANT = 'ASSISTANT'
}

export default function PipelineIntelligence() {
  const [selectedTab, setSelectedTabId] = React.useState(IntelligenceTabs.OPTIMIZATION)
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
        <Tab id={IntelligenceTabs.OPTIMIZATION} title={'Optimization'} panel={<div>OPTIMIZATION</div>} />
        <Tab id={IntelligenceTabs.STANDARDIZATION} title={'Standardization'} panel={<div>STANDARDIZATION</div>} />
        <Tab id={IntelligenceTabs.ASSISTANT} title={'Assistant'} panel={<div>ASSISTANT</div>} />
      </Tabs>
    </section>
  )
}
