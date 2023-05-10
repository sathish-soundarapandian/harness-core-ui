/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo } from 'react'
import { Drawer, Intent, Position } from '@blueprintjs/core'
import { parse } from 'yaml'
import { defaultTo } from 'lodash-es'
import { Button, ButtonSize, ButtonVariation, Container, Tab, Tabs, useConfirmationDialog } from '@harness/uicore'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { useStrings } from 'framework/strings'
import { EntityType } from '@common/pages/entityUsage/EntityConstants'
import type { EnvironmentQueryParams } from '@common/interfaces/RouteInterfaces'
import { InfraDefinitionDetailsDrawerTitle } from '@cd/components/EnvironmentsV2/EnvironmentDetails/InfrastructureDefinition/InfraDefinitionDetailsDrawer/InfraDefinitionDetailsDrawerTitle'
import type {
  GetTemplateProps,
  GetTemplateResponse
} from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'
import EntitySetupUsage from '@common/pages/entityUsage/EntityUsage'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
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
  isInfraUpdated?: boolean
  openUnsavedChangesDiffModal: () => void
  handleInfrastructureUpdate?: (updatedInfrastructure: InfrastructureConfig) => void
  updatedInfra?: InfrastructureConfig
}

export enum InfraDefinitionTabs {
  CONFIGURATION = 'CONFIGURATION',
  REFERENCEDBY = 'REFERENCEDBY'
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
    infraSaveInProgress,
    isInfraUpdated,
    openUnsavedChangesDiffModal,
    handleInfrastructureUpdate,
    updatedInfra
  } = props

  const { infraDetailsTab } = useQueryParams<EnvironmentQueryParams>()
  const { updateQueryParams } = useUpdateQueryParams<EnvironmentQueryParams>()
  const [selectedTab, setSelectedTab] = React.useState<InfraDefinitionTabs>(
    defaultTo(infraDetailsTab, InfraDefinitionTabs.CONFIGURATION) as InfraDefinitionTabs
  )
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

  const resetQueryParams = () => {
    updateQueryParams({ infraDetailsTab: undefined, infrastructureId: undefined })
  }

  const handleDrawerClose = () => {
    resetQueryParams()
    onCloseDrawer()
  }

  const { openDialog: openActionConfirmationDialog, closeDialog: closeActionConfirmationDialog } =
    useConfirmationDialog({
      contentText: getString('cd.closeInfrastructureDetailsContent'),
      titleText: getString('cd.closeInfrastructureDetails'),
      confirmButtonText: getString('applyChanges'),
      customButtons: (
        <Container flex={{ justifyContent: 'space-between' }} width={'70%'}>
          <Button
            text={getString('common.discard')}
            variation={ButtonVariation.SECONDARY}
            size={ButtonSize.MEDIUM}
            onClick={() => {
              handleDrawerClose()
            }}
          />
          <Button
            text={getString('cancel')}
            variation={ButtonVariation.TERTIARY}
            size={ButtonSize.MEDIUM}
            onClick={() => closeActionConfirmationDialog()}
          />
        </Container>
      ),
      intent: Intent.WARNING,
      showCloseButton: false,
      onCloseDialog: isConfirmed => {
        if (isConfirmed) {
          handleApplyChanges()
        }
      },
      className: css.actionConfirmationDialogWrapper
    })

  const handleManualClose = () => {
    if (isInfraUpdated) {
      openActionConfirmationDialog()
    } else {
      handleDrawerClose()
    }
  }

  useEffect(() => {
    updateQueryParams({ infraDetailsTab: selectedTab, infrastructureId: infraIdentifier })

    return () => {
      resetQueryParams()
    }
  }, [])

  /* istanbul ignore next */
  const handleTabChange = React.useCallback((newTab: InfraDefinitionTabs) => {
    setSelectedTab(newTab)
    updateQueryParams({ infraDetailsTab: newTab })
  }, [])

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
          discardChanges={handleDrawerClose}
          applyChanges={handleApplyChanges}
          scope={scope}
          environmentIdentifier={environmentIdentifier}
          infraSaveInProgress={infraSaveInProgress}
          shouldShowActionButtons={selectedTab === InfraDefinitionTabs.CONFIGURATION}
          isInfraUpdated={isInfraUpdated}
          openUnsavedChangesDiffModal={openUnsavedChangesDiffModal}
        />
      }
      data-type={DrawerTypes.StepConfig}
      className={css.infraDefinitionDetailsDrawer}
      isCloseButtonShown={false}
      portalClassName={'infra-definition-details--drawer'}
    >
      <Button minimal className={css.closeButton} icon="cross" withoutBoxShadow onClick={() => handleManualClose()} />

      <Container>
        <Tabs
          id="infra-definition-details"
          selectedTabId={selectedTab}
          onChange={handleTabChange}
          renderAllTabPanels={true}
        >
          <Tab
            id={InfraDefinitionTabs.CONFIGURATION}
            title={getString('configuration')}
            className={css.infraDetailsConfigurationTab}
            panel={
              <BootstrapDeployInfraDefinitionWrapperWithRef
                closeInfraDefinitionDetails={handleDrawerClose}
                refetch={refetch}
                scope={scope}
                environmentIdentifier={environmentIdentifier}
                selectedInfrastructure={selectedInfrastructure}
                getTemplate={getTemplate}
                isDrawerView={true}
                ref={infraDefinitionFormRef}
                setInfraSaveInProgress={setInfraSaveInProgress}
                handleInfrastructureUpdate={handleInfrastructureUpdate}
                updatedInfra={updatedInfra}
              />
            }
          />
          <Tab
            id={InfraDefinitionTabs.REFERENCEDBY}
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
