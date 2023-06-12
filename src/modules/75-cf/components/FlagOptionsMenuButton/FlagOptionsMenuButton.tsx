/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useMemo } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import type { MutateRequestOptions } from 'restful-react/dist/Mutate'
import type { IconName } from '@blueprintjs/core'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import usePlanEnforcement from '@cf/hooks/usePlanEnforcement'
import RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useStrings } from 'framework/strings'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import routes from '@common/RouteDefinitions'
import type { DeleteFeatureFlagQueryParams, Feature } from 'services/cf'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { UseGitSync } from '@cf/hooks/useGitSync'
import useDeleteFlagModal from '../FlagActivation/hooks/useDeleteFlagModal'
import useArchiveFlagDialog from '../FlagArchiving/useArchiveFlagDialog'

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
  noEdit?: boolean
}

const FlagOptionsMenuButton: FC<FlagOptionsMenuButtonProps> = ({
  environment,
  flagData,
  gitSync,
  deleteFlag,
  queryParams,
  refetchFlags,
  noEdit = false
}) => {
  const history = useHistory()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<Record<string, string>>()
  const { withActiveEnvironment } = useActiveEnvironment()
  const { getString } = useStrings()
  const { isPlanEnforcementEnabled } = usePlanEnforcement()
  const { FFM_7921_ARCHIVING_FEATURE_FLAGS } = useFeatureFlags()

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

  const { openDialog } = useArchiveFlagDialog({
    flagData,
    queryParams,
    refetchFlags,
    deleteFeatureFlag: deleteFlag
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

  const menuItems = useMemo(() => {
    const opts = [
      {
        icon: 'edit' as IconName,
        text: getString('edit'),
        onClick: gotoDetailPage,
        permission: {
          resource: { resourceType: ResourceType.ENVIRONMENT, resourceIdentifier: environment },
          permission: PermissionIdentifier.EDIT_FF_FEATUREFLAG
        },
        ...planEnforcementProps
      },
      {
        icon: (FFM_7921_ARCHIVING_FEATURE_FLAGS ? 'archive' : 'trash') as IconName,
        text: FFM_7921_ARCHIVING_FEATURE_FLAGS ? getString('archive') : getString('delete'),
        onClick: FFM_7921_ARCHIVING_FEATURE_FLAGS ? openDialog : confirmDeleteFlag,
        permission: {
          resource: { resourceType: ResourceType.FEATUREFLAG },
          permission: PermissionIdentifier.DELETE_FF_FEATUREFLAG
        },
        ...planEnforcementProps
      }
    ]

    if (noEdit) {
      opts.shift()
    }

    return opts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noEdit])

  return <RbacOptionsMenuButton items={menuItems} />
}

export default FlagOptionsMenuButton
