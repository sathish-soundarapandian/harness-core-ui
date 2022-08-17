import React, { useCallback, useState } from 'react'
import { Container, Icon, Tab, Tabs } from '@wings-software/uicore'
import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudio'
import { useStrings } from 'framework/strings'
import css from './DeploymentTemplateForm.module.scss'

export enum DeploymentTemplateFormTabs {
  Infrastructure = 'Infrastructure',
  Execution = 'Execution'
}

function DeploymentTemplateForm(_props: unknown, _formikRef: TemplateFormRef) {
  const { getString } = useStrings()
  const [selectedTab, setSelectedTab] = useState<DeploymentTemplateFormTabs>(DeploymentTemplateFormTabs.Infrastructure)

  const handleTabChange = useCallback((tab: DeploymentTemplateFormTabs) => {
    setSelectedTab(tab)
  }, [])

  return (
    <Container>
      <Container className={css.tabsInnerContainer}>
        <Tabs id="deployment-template-tabs" selectedTabId={selectedTab} onChange={handleTabChange}>
          <Tab
            id={DeploymentTemplateFormTabs.Infrastructure}
            title={
              <span>
                <Icon name={'infrastructure'} size={16} margin={{ right: 'small' }} />
                {getString('infrastructureText')}
              </span>
            }
            panel={<div>Infrastructure tab content</div>}
          />
          <Tab
            id={DeploymentTemplateFormTabs.Execution}
            title={
              <span>
                <Icon name={'execution'} size={16} margin={{ right: 'small' }} />
                {getString('executionText')}
              </span>
            }
            panel={<div>Execution tab content here</div>}
          />
        </Tabs>
      </Container>
    </Container>
  )
}

export const DeploymentTemplateFormWithRef = React.forwardRef(DeploymentTemplateForm)
