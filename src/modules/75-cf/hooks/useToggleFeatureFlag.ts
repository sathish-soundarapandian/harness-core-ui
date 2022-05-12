/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { FeatureFlagActivationStatus } from '@cf/utils/CFUtils'
import { FeatureResponseMetadata, PatchFeatureQueryParams, usePatchFeature } from 'services/cf'
import type { GitDetails } from './useGitSync'

export interface UseToggleFeatureFlagProps {
  accountIdentifier: string
  orgIdentifier: string
  environmentIdentifier: string
  projectIdentifier: string
}

const makeInstruction = (isOn: boolean, gitDetails?: GitDetails) => {
  const instruction = {
    instructions: [
      {
        kind: 'setFeatureFlagState',
        parameters: {
          state: isOn ? FeatureFlagActivationStatus.ON : FeatureFlagActivationStatus.OFF
        }
      }
    ]
  }

  return gitDetails ? { ...instruction, gitDetails } : instruction
}

export interface UseToggleFeatureFlag {
  on: (flagIdentifier: string, gitDetails?: GitDetails) => Promise<FeatureResponseMetadata>
  off: (flagIdentifier: string, gitDetails?: GitDetails) => Promise<FeatureResponseMetadata>
  loading: boolean
  error: string | undefined
}

export const useToggleFeatureFlag = ({
  accountIdentifier,
  orgIdentifier,
  environmentIdentifier,
  projectIdentifier
}: UseToggleFeatureFlagProps): UseToggleFeatureFlag => {
  const { mutate, loading, error } = usePatchFeature({
    identifier: '',
    queryParams: {
      projectIdentifier,
      environmentIdentifier,
      accountIdentifier,
      orgIdentifier
    } as PatchFeatureQueryParams
  })

  return {
    on: (flagIdentifier: string, gitDetails?: GitDetails): Promise<FeatureResponseMetadata> =>
      mutate(makeInstruction(true, gitDetails), {
        pathParams: { identifier: flagIdentifier }
      }),
    off: (flagIdentifier: string, gitDetails?: GitDetails): Promise<FeatureResponseMetadata> =>
      mutate(makeInstruction(false, gitDetails), {
        pathParams: { identifier: flagIdentifier }
      }),
    loading,
    error: error?.message
  }
}
