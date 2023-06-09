import React from 'react'
import { useParams } from 'react-router-dom'

import { useStrings } from 'framework/strings'

import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

import { useServiceOverridesContext } from '../context/ServiceOverrideContext'

export default function NewServiceOverrideButton(): React.ReactElement {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { handleNewOverride } = useServiceOverridesContext()

  return (
    <RbacButton
      intent="primary"
      icon="plus"
      text={getString('common.serviceOverrides.newOverride')}
      data-testid="add-service-override"
      permission={{
        permission: PermissionIdentifier.EDIT_ENVIRONMENT,
        resource: {
          resourceType: ResourceType.ENVIRONMENT
        },
        resourceScope: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
      }}
      onClick={handleNewOverride}
    />
  )
}
