/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useHostedBuilds } from '@common/hooks/useHostedBuild'
import type { GovernancePathProps, Module, PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import { useAnyEnterpriseLicense } from '@common/hooks/useModuleLicenses'
import { useSideNavContext } from 'framework/SideNavStore/SideNavContext'
import { SidebarLink } from '../SideNav/SideNav'
import NavExpandable from '../NavExpandable/NavExpandable'

interface ProjectSetupMenuProps {
  module?: Module
}

const ProjectSetupMenu: React.FC<ProjectSetupMenuProps> = ({ module }) => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<PipelineType<ProjectPathProps>>()

  const {
    OPA_PIPELINE_GOVERNANCE,
    CVNG_TEMPLATE_MONITORED_SERVICE,
    NG_FILE_STORE,
    NG_SETTINGS,
    USE_OLD_GIT_SYNC,
    CD_ONBOARDING_ENABLED,
    NG_DEPLOYMENT_FREEZE
  } = useFeatureFlags()
  const { showGetStartedTabInMainMenu } = useSideNavContext()
  const { enabledHostedBuildsForFreeUsers } = useHostedBuilds()
  const { isGitSimplificationEnabled, isGitSyncEnabled, gitSyncEnabledOnlyForFF } = useAppStore()
  const params = { accountId, orgIdentifier, projectIdentifier, module }
  const isCIorCDorSTO = module === 'ci' || module === 'cd' || module === 'sto'
  const isCIorCD = module === 'ci' || module === 'cd'
  const isCV = module === 'cv'
  const canUsePolicyEngine = useAnyEnterpriseLicense()
  //Supporting GIT_SIMPLIFICATION by default, old GitSync will be selected only for selected accounts
  // isGitSimplificationEnabled will true if any customers using old GitSync enabled Git SImplification using API
  const isGitSyncSupported =
    (isGitSyncEnabled && !gitSyncEnabledOnlyForFF) ||
    (USE_OLD_GIT_SYNC && (isCIorCDorSTO || !module) && !isGitSimplificationEnabled)

  return (
    <NavExpandable title={getString('common.projectSetup')} route={routes.toSetup(params)}>
      <Layout.Vertical spacing="small">
        <SidebarLink label={getString('connectorsLabel')} to={routes.toConnectors(params)} />
        <SidebarLink label={getString('common.secrets')} to={routes.toSecrets(params)} />
        <SidebarLink label={getString('common.variables')} to={routes.toVariables(params)} />
        <SidebarLink to={routes.toAccessControl(params)} label={getString('accessControl')} />
        <SidebarLink label={getString('delegate.delegates')} to={routes.toDelegates(params)} />

        {NG_SETTINGS && (
          <SidebarLink label={getString('common.defaultSettings')} to={routes.toDefaultSettings(params)} />
        )}
        {isGitSyncSupported ? (
          <SidebarLink
            label={getString('gitManagement')}
            to={routes.toGitSyncAdmin({ accountId, orgIdentifier, projectIdentifier, module })}
          />
        ) : null}
        {isCIorCDorSTO && <SidebarLink label={getString('common.templates')} to={routes.toTemplates(params)} />}
        {CVNG_TEMPLATE_MONITORED_SERVICE && isCV && (
          <SidebarLink
            label={getString('common.templates')}
            to={routes.toTemplates({ ...params, templateType: 'MonitoredService' })}
          />
        )}
        {((OPA_PIPELINE_GOVERNANCE && isCIorCDorSTO && canUsePolicyEngine) || isCV) && (
          <SidebarLink label={getString('common.governance')} to={routes.toGovernance(params as GovernancePathProps)} />
        )}
        {NG_DEPLOYMENT_FREEZE ? (
          <SidebarLink
            label={getString('common.freezeWindows')}
            to={routes.toFreezeWindows({ ...params, module: params.module || 'cd' })}
          />
        ) : null}
        {isCIorCD && NG_FILE_STORE && (
          <SidebarLink label={getString('resourcePage.fileStore')} to={routes.toFileStore(params)} />
        )}
        {enabledHostedBuildsForFreeUsers && !showGetStartedTabInMainMenu && module === 'ci' && (
          <SidebarLink label={getString('getStarted')} to={routes.toGetStartedWithCI({ ...params, module })} />
        )}

        {CD_ONBOARDING_ENABLED && module === 'cd' && !showGetStartedTabInMainMenu && (
          <SidebarLink label={getString('getStarted')} to={routes.toGetStartedWithCD({ ...params, module })} />
        )}
      </Layout.Vertical>
    </NavExpandable>
  )
}

export default ProjectSetupMenu
