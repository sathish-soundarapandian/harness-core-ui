/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Drawer, Position } from '@blueprintjs/core'
import { parse } from 'yaml'
import { defaultTo } from 'lodash-es'
import { Button, Container, Tab, Tabs } from '@harness/uicore'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { useStrings } from 'framework/strings'
import { EntityType } from '@common/pages/entityUsage/EntityConstants'
import { InfraDefinitionDetailsDrawerTitle } from '@cd/components/EnvironmentsV2/EnvironmentDetails/InfrastructureDefinition/InfraDefinitionDetailsDrawer/InfraDefinitionDetailsDrawerTitle'
import type {
  GetTemplateProps,
  GetTemplateResponse
} from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'
import EntitySetupUsage from '@common/pages/entityUsage/EntityUsage'
import type { Scope } from '@common/interfaces/SecretsInterface'
import type { InfrastructureConfig, InfrastructureDefinitionConfig } from 'services/cd-ng'
import {
  BootstrapDeployInfraDefinitionWrapperWithRef,
  InfraDefinitionWrapperRef
} from '@cd/components/EnvironmentsV2/EnvironmentDetails/InfrastructureDefinition/BootstrapDeployInfraDefinitionWrapper'
import css from '../InfrastructureDefinition.module.scss'

interface Props {
  isDrawerOpened: boolean
  onCloseDrawer: () => void
  selectedInfrastructure: string
  scope: Scope
  environmentIdentifier: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refetch: any
  getTemplate?: (data: GetTemplateProps) => Promise<GetTemplateResponse>
  setInfraSaveInProgress?: (data: boolean) => void
  infraSaveInProgress?: boolean
}

enum InfraDefinitionTabs {
  Configuration = 'Configuration',
  ReferenceBy = 'ReferenceBy'
}

export function InfraDefinitionDetailsDrawer(props: Props) {
  const {
    isDrawerOpened,
    onCloseDrawer,
    scope,
    environmentIdentifier,
    refetch,
    getTemplate,
    selectedInfrastructure,
    setInfraSaveInProgress,
    infraSaveInProgress
  } = props
  const [selectedTab, setSelectedTab] = React.useState<InfraDefinitionTabs>(InfraDefinitionTabs.Configuration)
  const { getString } = useStrings()
  const { identifier: infraIdentifier, environmentRef: envIdentifier } = useMemo(() => {
    return defaultTo(
      (parse(defaultTo(selectedInfrastructure, '{}')) as InfrastructureConfig)?.infrastructureDefinition,
      {}
    )
  }, [selectedInfrastructure]) as InfrastructureDefinitionConfig
  const infraDefinitionFormRef = React.useRef<InfraDefinitionWrapperRef>(null)

  /* istanbul ignore next */
  const handleApplyChanges = () => {
    infraDefinitionFormRef.current?.saveInfrastructure()
  }

  return (
    <Drawer
      usePortal={true}
      autoFocus={true}
      canEscapeKeyClose={true}
      canOutsideClickClose={true}
      enforceFocus={false}
      hasBackdrop={true}
      size={1000}
      isOpen={isDrawerOpened}
      position={Position.RIGHT}
      title={
        <InfraDefinitionDetailsDrawerTitle
          discardChanges={onCloseDrawer}
          applyChanges={handleApplyChanges}
          scope={scope}
          environmentIdentifier={environmentIdentifier}
          infraSaveInProgress={infraSaveInProgress}
        />
      }
      data-type={DrawerTypes.StepConfig}
      className={css.infraDefinitionDetailsDrawer}
      isCloseButtonShown={false}
      portalClassName={'infra-definition-details--drawer'}
    >
      <Button minimal className={css.closeButton} icon="cross" withoutBoxShadow onClick={onCloseDrawer} />

      <Container>
        <Tabs
          id="infra-definition-details"
          selectedTabId={selectedTab}
          onChange={/* istanbul ignore next */ (newTab: InfraDefinitionTabs) => setSelectedTab(newTab)}
          renderAllTabPanels={true}
        >
          <Tab
            id={InfraDefinitionTabs.Configuration}
            title={getString('configuration')}
            className={css.infraDetailsConfigurationTab}
            panel={
              <BootstrapDeployInfraDefinitionWrapperWithRef
                closeInfraDefinitionDetails={onCloseDrawer}
                refetch={refetch}
                scope={scope}
                environmentIdentifier={environmentIdentifier}
                selectedInfrastructure={selectedInfrastructure}
                getTemplate={getTemplate}
                isDrawerView={true}
                ref={infraDefinitionFormRef}
                setInfraSaveInProgress={setInfraSaveInProgress}
              />
            }
          />
          <Tab
            id={InfraDefinitionTabs.ReferenceBy}
            title={getString('referencedBy')}
            className={css.infraDetailsReferencedByTab}
            panel={
              <EntitySetupUsage
                entityType={EntityType.Infrastructure}
                entityIdentifier={`${envIdentifier}/${infraIdentifier}`}
                pageBodyClassName={css.referenceByPageBody}
              />
            }
          />
        </Tabs>
      </Container>
    </Drawer>
  )
}
