import type { FreezeReference } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'

export const getFreezeRouteLink = (
  freezeReference: FreezeReference,
  { accountId, orgIdentifier, projectIdentifier, module }: ProjectPathProps & Partial<ModulePathParams>
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

  // TODO: remove second check once backend provides type for all
  if (freezeReference.type === 'GLOBAL' || freezeReference.identifier === '_GLOBAL_') {
    return routes.toFreezeWindows({ ...freezeNavigationParams })
  }

  return routes.toFreezeWindowStudio({ ...freezeNavigationParams, windowIdentifier: freezeReference.identifier })
}
