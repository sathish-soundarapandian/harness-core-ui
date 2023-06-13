/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import type { MutateMethod, MutateRequestOptions } from 'restful-react/dist/Mutate'
import usePlanEnforcement from '@cf/hooks/usePlanEnforcement'
import RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useStrings } from 'framework/strings'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type {
  DeleteFeatureFlagQueryParams,
  Feature,
  FeatureResponseMetadata,
  GitSyncPatchOperation,
  PatchFeaturePathParams,
  PatchFeatureQueryParams
} from 'services/cf'
import type { UseGitSync } from '@cf/hooks/useGitSync'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import routes from '@common/RouteDefinitions'
import useDeleteFlagModal from '../FlagActivation/hooks/useDeleteFlagModal'
import useArchiveFlagDialog from '../FlagArchiving/useArchiveFlagDialog'
import useEditFlagDetailsModal from '../FlagActivation/hooks/useEditFlagDetailsModal'

export interface FlagDetailsOptionsMenuButtonProps {
  featureFlag: Feature
  gitSync: UseGitSync
  refetchFlag: () => void
  deleteFeatureFlag: (
    data: string,
    mutateRequestOptions?: MutateRequestOptions<DeleteFeatureFlagQueryParams, void> | undefined
  ) => void
  submitPatch: MutateMethod<
    FeatureResponseMetadata,
    GitSyncPatchOperation,
    PatchFeatureQueryParams,
    PatchFeaturePathParams
  >
  queryParams: DeleteFeatureFlagQueryParams
  setGovernanceMetadata: (governanceMetadata: any) => void
}

const FlagDetailsOptionsMenuButton: FC<FlagDetailsOptionsMenuButtonProps> = ({
  featureFlag,
  gitSync,
  queryParams,
  refetchFlag,
  submitPatch,
  deleteFeatureFlag,
  setGovernanceMetadata
}) => {
  const { getString } = useStrings()
  const history = useHistory()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<Record<string, string>>()
  const { withActiveEnvironment, activeEnvironment } = useActiveEnvironment()
  const { FFM_7921_ARCHIVING_FEATURE_FLAGS } = useFeatureFlags()

  const featureFlagListURL = withActiveEnvironment(
    routes.toCFFeatureFlags({
      projectIdentifier: projectIdentifier,
      orgIdentifier: orgIdentifier,
      accountId
    })
  )

  const { confirmDeleteFlag } = useDeleteFlagModal({
    featureFlag,
    gitSync,
    queryParams,
    deleteFeatureFlag,
    onSuccess: () => history.push(featureFlagListURL)
  })

  const { openDialog } = useArchiveFlagDialog({
    flagData: featureFlag,
    queryParams,
    deleteFeatureFlag,
    backToListingPage: () => history.push(featureFlagListURL)
  })

  const { openEditDetailsModal } = useEditFlagDetailsModal({
    featureFlag,
    gitSync,
    refetchFlag,
    submitPatch,
    setGovernanceMetadata
  })

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

  return (
    <RbacOptionsMenuButton
      items={[
        {
          icon: 'edit',
          text: getString('edit'),
          onClick: openEditDetailsModal,
          permission: {
            permission: PermissionIdentifier.EDIT_FF_FEATUREFLAG,
            resource: activeEnvironment
              ? { resourceType: ResourceType.ENVIRONMENT, resourceIdentifier: activeEnvironment }
              : { resourceType: ResourceType.FEATUREFLAG }
          },
          ...planEnforcementProps
        },
        {
          icon: FFM_7921_ARCHIVING_FEATURE_FLAGS ? 'archive' : 'trash',
          text: FFM_7921_ARCHIVING_FEATURE_FLAGS ? getString('archive') : getString('delete'),
          onClick: FFM_7921_ARCHIVING_FEATURE_FLAGS ? openDialog : confirmDeleteFlag,
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

export default FlagDetailsOptionsMenuButton
