/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Feature, GitDetails, PatchFeatureQueryParams, usePatchFeature } from 'services/cf'

export interface FlagPatchParams {
  accountIdentifier: string
  orgIdentifier: string
  projectIdentifier: string
  environmentIdentifier: string
}

const makeInstruction = (kind: string, variation: string, targetIdentifiers: string[], gitDetails?: GitDetails) => {
  const instructions = {
    instructions: [
      {
        kind,
        parameters: {
          variation,
          targets: targetIdentifiers
        }
      }
    ]
  }

  return gitDetails ? { ...instructions, gitDetails } : instructions
}

const makePatchHook =
  (patchKind: string) =>
  ({ accountIdentifier, orgIdentifier, projectIdentifier, environmentIdentifier }: FlagPatchParams) => {
    const { mutate } = usePatchFeature({
      identifier: '',
      queryParams: {
        accountIdentifier,
        orgIdentifier,
        projectIdentifier,
        environmentIdentifier
      } as PatchFeatureQueryParams
    })

    return (featureFlag: Feature, variation: any, targetIdentifiers: string[], gitDetails?: GitDetails) => {
      const body = makeInstruction(patchKind, variation, targetIdentifiers, gitDetails)

      return mutate(body, { pathParams: { identifier: featureFlag.identifier } })
    }
  }

export const useServeFeatureFlagVariationToTargets = makePatchHook('addTargetsToVariationTargetMap')
