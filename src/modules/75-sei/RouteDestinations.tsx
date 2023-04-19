/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Redirect, useParams } from 'react-router-dom'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import routes from '@common/RouteDefinitions'
import { RouteWithLayout } from '@common/router'
import {
  projectPathProps
} from '@common/utils/routeUtils'
import { String as LocaleString } from 'framework/strings'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import RbacFactory from '@rbac/factories/RbacFactory'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import PipelineStudioFactory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import AuditTrailFactory, { ResourceScope } from 'framework/AuditTrail/AuditTrailFactory'
import type { ResourceDTO } from 'services/audit'
import { LicenseRedirectProps, LICENSE_STATE_NAMES } from 'framework/LicenseStore/LicenseStoreContext'
import { ModuleName } from 'framework/types/ModuleName'
import { RedirectToSubscriptionsFactory } from '@common/Redirects'
import type { SEIMicroFrontendProps } from './interfaces/SEI.types'
import SEISideNav from './components/SEISideNav/SEISideNav'

// eslint-disable-next-line import/no-unresolved
const SEIMicroFrontend = React.lazy(() => import('sei/MicroFrontendApp'))

const SEISideNavProps: SidebarContext = {
  navComponent: SEISideNav,
  subtitle: 'SEI',
  title: 'Engineering',
  icon: 'sei-main'
}

const module = 'sei'

// AuditTrail registrations
// AuditTrailFactory.registerResourceHandler(ResourceType.SEI_HUB, {
//   moduleIcon: {
//     name: 'sei-main'
//   },
//   moduleLabel: 'sei.chaosHub',
//   resourceLabel: 'sei.seiHub',
//   resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScope) => {
//     const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope

//     return routes.toChaosHub({
//       accountId: accountIdentifier,
//       orgIdentifier,
//       projectIdentifier,
//       identifier: resource.identifier
//     })
//   }
// })

// AuditTrailFactory.registerResourceHandler(ResourceType.CHAOS_EXPERIMENT, {
//   moduleIcon: {
//     name: 'chaos-main'
//   },
//   moduleLabel: 'chaos.chaosExperiment',
//   resourceLabel: 'chaos.chaosExperiment',
//   resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScope) => {
//     const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope

//     return routes.toChaosExperiment({
//       accountId: accountIdentifier,
//       orgIdentifier,
//       projectIdentifier,
//       identifier: resource.identifier
//     })
//   }
// })

// AuditTrailFactory.registerResourceHandler(ResourceType.CHAOS_INFRASTRUCTURE, {
//   moduleIcon: {
//     name: 'chaos-main'
//   },
//   moduleLabel: 'chaos.chaosInfrastructure',
//   resourceLabel: 'chaos.chaosInfrastructure',
//   resourceUrl: (_: ResourceDTO, resourceScope: ResourceScope) => {
//     const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope

//     return routes.toChaosEnvironments({
//       accountId: accountIdentifier,
//       orgIdentifier,
//       projectIdentifier
//     })
//   }
// })

// AuditTrailFactory.registerResourceHandler(ResourceType.CHAOS_GAMEDAY, {
//   moduleIcon: {
//     name: 'chaos-main'
//   },
//   moduleLabel: 'chaos.chaosGameday',
//   resourceLabel: 'chaos.chaosGameday'
// })

// RedirectToAccessControlHome: redirects to users page in access control
// const RedirectToAccessControlHome = (): React.ReactElement => {
//   const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

//   return <Redirect to={routes.toUsers({ accountId, projectIdentifier, orgIdentifier, module })} />
// }

// RedirectToChaosProject: if project is selected redirects to project dashboard, else to module homepage
// const RedirectToChaosProject = (): React.ReactElement => {
//   const { accountId } = useParams<ProjectPathProps>()
//   const { selectedProject } = useAppStore()
//   if (selectedProject) {
//     return (
//       <Redirect
//         to={routes.toProjectOverview({
//           accountId,
//           orgIdentifier: selectedProject.orgIdentifier || '',
//           projectIdentifier: selectedProject.identifier,
//           module
//         })}
//       />
//     )
//   } else {
//     return <Redirect to={routes.toModuleHome({ accountId, module })} />
//   }
// }

export default function ChaosRoutes(): React.ReactElement {
  const isChaosEnabled = useFeatureFlag(FeatureFlag.CHAOS_ENABLED)

  // Register Chaos into RBAC, PipelineStudio and AuditTrail Factory only when Feature Flag is enabled
  if (isChaosEnabled) {
    // Pipeline registrations
    // PipelineStudioFactory.registerStep(new ChaosExperimentStep())

    // RBAC registrations
    RbacFactory.registerResourceCategory(ResourceCategory.SEI, {
      icon: 'sei-main',
      label: 'common.purpose.sei.sei'
    })

    RbacFactory.registerResourceTypeHandler(ResourceType.SEI_HUB, {
      icon: 'sei-main',
      label: 'sei.seiHub',
      category: ResourceCategory.SEI,
      permissionLabels: {
        [PermissionIdentifier.VIEW_SEI_HUB]: <LocaleString stringID="rbac.permissionLabels.view" />,
        [PermissionIdentifier.EDIT_SEI_HUB]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
        [PermissionIdentifier.DELETE_SEI_HUB]: <LocaleString stringID="rbac.permissionLabels.delete" />
      }
    })

    // RbacFactory.registerResourceTypeHandler(ResourceType.CHAOS_EXPERIMENT, {
    //   icon: 'chaos-main',
    //   label: 'chaos.chaosExperiment',
    //   category: ResourceCategory.CHAOS,
    //   permissionLabels: {
    //     [PermissionIdentifier.VIEW_CHAOS_EXPERIMENT]: <LocaleString stringID="rbac.permissionLabels.view" />,
    //     [PermissionIdentifier.EDIT_CHAOS_EXPERIMENT]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    //     [PermissionIdentifier.DELETE_CHAOS_EXPERIMENT]: <LocaleString stringID="rbac.permissionLabels.delete" />,
    //     [PermissionIdentifier.EXECUTE_CHAOS_EXPERIMENT]: <LocaleString stringID="rbac.permissionLabels.execute" />
    //   }
    // })

    // RbacFactory.registerResourceTypeHandler(ResourceType.CHAOS_INFRASTRUCTURE, {
    //   icon: 'chaos-main',
    //   label: 'chaos.chaosInfrastructure',
    //   category: ResourceCategory.CHAOS,
    //   permissionLabels: {
    //     [PermissionIdentifier.VIEW_CHAOS_INFRASTRUCTURE]: <LocaleString stringID="rbac.permissionLabels.view" />,
    //     [PermissionIdentifier.EDIT_CHAOS_INFRASTRUCTURE]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    //     [PermissionIdentifier.DELETE_CHAOS_INFRASTRUCTURE]: <LocaleString stringID="rbac.permissionLabels.delete" />
    //   }
    // })

    // RbacFactory.registerResourceTypeHandler(ResourceType.CHAOS_GAMEDAY, {
    //   icon: 'chaos-main',
    //   label: 'chaos.chaosGameday',
    //   category: ResourceCategory.CHAOS,
    //   permissionLabels: {
    //     [PermissionIdentifier.VIEW_CHAOS_GAMEDAY]: <LocaleString stringID="rbac.permissionLabels.view" />,
    //     [PermissionIdentifier.EDIT_CHAOS_GAMEDAY]: <LocaleString stringID="rbac.permissionLabels.createEdit" />
    //   }
    // })
  }

  // const RedirectToModuleTrialHome = (): React.ReactElement => {
  //   const { accountId } = useParams<{
  //     accountId: string
  //   }>()

  //   return (
  //     <Redirect
  //       to={routes.toModuleTrialHome({
  //         accountId,
  //         module: 'sei'
  //       })}
  //     />
  //   )
  // }

  // const licenseRedirectData: LicenseRedirectProps = {
  //   licenseStateName: LICENSE_STATE_NAMES.SEI_LICENSE_STATE,
  //   startTrialRedirect: RedirectToModuleTrialHome,
  //   expiredTrialRedirect: RedirectToSubscriptionsFactory(ModuleName.SEI)
  // }

  return (
    <>
      {/* Loads the SEI MicroFrontend */}
      <RouteWithLayout
        // licenseRedirectData={licenseRedirectData}
        sidebarProps={SEISideNavProps}
        path={routes.toSEIMicroFrontend({ ...projectPathProps })}
      >
        <ChildAppMounter<SEIMicroFrontendProps>
          ChildApp={SEIMicroFrontend}
        />
      </RouteWithLayout>
    </>
  )
}
