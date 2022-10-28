import type { FreezeReference } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'

export const getFreezeRouteLink = (
  freezeReference: FreezeReference,
  { accountId, orgIdentifier, projectIdentifier, module }: ProjectPathProps & ModulePathParams
): string => {
  const freezeNavigationParams = {
    accountId: accountId,
    orgIdentifier: freezeReference.freezeScope === 'account' ? undefined : orgIdentifier,
    projectIdentifier:
      freezeReference.freezeScope === 'account' || freezeReference.freezeScope === 'org'
        ? undefined
        : projectIdentifier,
    module
  }

  if (freezeReference.type === 'GLOBAL') {
    return routes.toFreezeWindows({ ...freezeNavigationParams })
  }

  return routes.toFreezeWindowStudio({ ...freezeNavigationParams, windowIdentifier: freezeReference.identifier })
}
