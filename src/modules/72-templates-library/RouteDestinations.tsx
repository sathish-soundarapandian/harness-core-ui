import './components/PipelineSteps'
import './components/TemplateStage'
import React from 'react'
import { RouteWithLayout } from '@common/router'
import { AccountSideNavProps } from '@common/RouteDestinations'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps } from '@common/utils/routeUtils'
import TemplatesPage from '@templates-library/pages/TemplatesPage/TemplatesPage'
import { TemplateStudioWrapper } from '@templates-library/components/TemplateStudio/TemplateStudioWrapper'
import RbacFactory from '@rbac/factories/RbacFactory'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import { String } from 'framework/strings'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import AuditTrailFactory from '@audit-trails/factories/AuditTrailFactory'
import type { ResourceDTO, ResourceScopeDTO } from 'services/audit'
import TemplateResourceModal from './components/RbacResourceModals/TemplateResourceModal'
import TemplateResourceRenderer from './components/RbacResourceModals/TemplateResourceRenderer'

/**
 * Register RBAC resources
 */
RbacFactory.registerResourceTypeHandler(ResourceType.TEMPLATE, {
  icon: 'pipeline-deployment',
  label: 'common.templates',
  category: ResourceCategory.SHARED_RESOURCES,
  permissionLabels: {
    [PermissionIdentifier.VIEW_TEMPLATE]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_TEMPLATE]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_TEMPLATE]: <String stringID="rbac.permissionLabels.delete" />,
    [PermissionIdentifier.ACCESS_TEMPLATE]: <String stringID="rbac.permissionLabels.access" />
  },
  // eslint-disable-next-line react/display-name
  addResourceModalBody: props => <TemplateResourceModal {...props} />,
  // eslint-disable-next-line react/display-name
  staticResourceRenderer: props => <TemplateResourceRenderer {...props} />
})

AuditTrailFactory.registerResourceHandler('TEMPLATE', {
  moduleIcon: {
    name: 'cd-main',
    size: 30
  },
  resourceUrl: (_resource: ResourceDTO, _resourceScope: ResourceScopeDTO) => {
    // Implementation required
    return null
  }
})

export default (
  <>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routes.toTemplates({ ...accountPathProps })} exact>
      <TemplatesPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routes.toTemplateStudio({
        ...accountPathProps,
        ...{
          templateIdentifier: ':templateIdentifier',
          templateType: ':templateType'
        }
      })}
      exact
    >
      <TemplateStudioWrapper />
    </RouteWithLayout>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routes.toTemplates({ ...orgPathProps })} exact>
      <TemplatesPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routes.toTemplateStudio({
        ...orgPathProps,
        ...{
          templateIdentifier: ':templateIdentifier',
          templateType: ':templateType'
        }
      })}
      exact
    >
      <TemplateStudioWrapper />
    </RouteWithLayout>
  </>
)
