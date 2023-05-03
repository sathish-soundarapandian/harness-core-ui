/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import type { MutateRequestOptions } from 'restful-react/dist/Mutate'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import usePlanEnforcement from '@cf/hooks/usePlanEnforcement'
import RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { DeleteFeatureFlagQueryParams, Feature } from 'services/cf'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { UseGitSync } from '@cf/hooks/useGitSync'
import useDeleteFlagModal from '../FlagActivation/hooks/useDeleteFlagModal'

export interface FlagOptionsMenuButtonProps {
  environment?: string
  flagData: Feature
  gitSync: UseGitSync
  deleteFlag: (
    data: string,
    mutateRequestOptions?: MutateRequestOptions<DeleteFeatureFlagQueryParams, void> | undefined
  ) => void
  queryParams: DeleteFeatureFlagQueryParams
  refetchFlags: () => void
}

const FlagOptionsMenuButton = (props: FlagOptionsMenuButtonProps): ReactElement => {
  const { environment, flagData, gitSync, deleteFlag, queryParams, refetchFlags } = props
  const history = useHistory()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<Record<string, string>>()
  const { withActiveEnvironment } = useActiveEnvironment()
  const { getString } = useStrings()
  const { isPlanEnforcementEnabled } = usePlanEnforcement()

  const planEnforcementProps = isPlanEnforcementEnabled
    ? {
        featuresProps: {
          featuresRequest: {
            featureNames: [FeatureIdentifier.MAUS]
          }
        }
      }
    : undefined

  const { confirmDeleteFlag } = useDeleteFlagModal({
    featureFlag: flagData,
    gitSync,
    queryParams,
    deleteFeatureFlag: deleteFlag,
    onSuccess: () => refetchFlags?.()
  })

  const gotoDetailPage = (): void => {
    history.push(
      withActiveEnvironment(
        routes.toCFFeatureFlagsDetail({
          orgIdentifier: orgIdentifier as string,
          projectIdentifier: projectIdentifier as string,
          featureFlagIdentifier: flagData.identifier,
          accountId
        }),
        environment
      )
    )
  }

  return (
    <RbacOptionsMenuButton
      items={[
        {
          icon: 'edit',
          text: getString('edit'),
          onClick: gotoDetailPage,
          permission: {
            resource: { resourceType: ResourceType.ENVIRONMENT, resourceIdentifier: environment },
            permission: PermissionIdentifier.EDIT_FF_FEATUREFLAG
          },
          ...planEnforcementProps
        },
        {
          icon: 'trash',
          text: getString('delete'),
          onClick: confirmDeleteFlag,
          permission: {
            resource: { resourceType: ResourceType.FEATUREFLAG },
            permission: PermissionIdentifier.DELETE_FF_FEATUREFLAG
          },
          ...planEnforcementProps
        }
      ]}
    />
  )
}

export default FlagOptionsMenuButton
