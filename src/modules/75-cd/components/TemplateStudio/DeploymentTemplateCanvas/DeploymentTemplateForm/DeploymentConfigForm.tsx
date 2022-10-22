/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { Button, ButtonVariation, Container, Icon, Layout, Tab, Tabs } from '@wings-software/uicore'
import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudioInternal'
import { useStrings } from 'framework/strings'
import { ExecutionPanel } from './components/ExecutionPanel/ExecutionPanel'
import { DeploymentInfraWrapperWithRef } from './DeploymentInfraWrapper/DeploymentInfraWrapper'
import css from './DeploymentConfigForm.module.scss'

export enum DeploymentConfigFormTabs {
  Infrastructure = 'Infrastructure',
  Execution = 'Execution'
}

function DeploymentConfigForm(_props: unknown, formikRef: TemplateFormRef): JSX.Element {
  const { getString } = useStrings()
  const [selectedTab, setSelectedTab] = useState<DeploymentConfigFormTabs>(DeploymentConfigFormTabs.Infrastructure)

  const handleTabChange = useCallback(
    (tab: DeploymentConfigFormTabs) => {
      setSelectedTab(tab)
    },
    [setSelectedTab]
  )

  const navBtns = (
    <Layout.Horizontal className={css.navigationBtns}>
      <Button
        {...(selectedTab === DeploymentConfigFormTabs.Infrastructure
          ? {
              text: getString('continue'),
              onClick: () => handleTabChange(DeploymentConfigFormTabs.Execution),
              rightIcon: 'chevron-right'
            }
          : {
              text: getString('previous'),
              onClick: () => handleTabChange(DeploymentConfigFormTabs.Infrastructure),
              icon: 'chevron-left'
            })}
        variation={ButtonVariation.SECONDARY}
      />
    </Layout.Horizontal>
  )

  return (
    <Container className={css.tabsContainer}>
      <Container className={css.tabsInnerContainer}>
        <Tabs id="deployment-config-tabs" selectedTabId={selectedTab} onChange={handleTabChange}>
          <Tab
            id={DeploymentConfigFormTabs.Infrastructure}
            title={
              <span>
                <Icon name={'infrastructure'} size={16} margin={{ right: 'small' }} />
                {getString('infrastructureText')}
              </span>
            }
            panel={<DeploymentInfraWrapperWithRef ref={formikRef as any}>{navBtns}</DeploymentInfraWrapperWithRef>}
          />
          <Tab
            id={DeploymentConfigFormTabs.Execution}
            title={
              <span>
                <Icon name={'execution'} size={16} margin={{ right: 'small' }} />
                {getString('executionText')}
              </span>
            }
            panel={<ExecutionPanel>{navBtns}</ExecutionPanel>}
          />
        </Tabs>
      </Container>
    </Container>
  )
}

export const DeploymentConfigFormWithRef = React.forwardRef(DeploymentConfigForm)
