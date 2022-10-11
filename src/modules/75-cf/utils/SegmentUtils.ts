/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { PatchSegmentQueryParams, usePatchSegment } from 'services/cf'

export interface TargetSegmentParams {
  accountIdentifier: string
  orgIdentifier: string
  environmentIdentifier: string
  projectIdentifier: string
}

const makeInstructions = (kind: string, targetIdentifiers: string[]) => ({
  instructions: [
    {
      kind,
      parameters: {
        targets: targetIdentifiers
      }
    }
  ]
})

const makeTargetsToSegmentHook =
  (patchKind: string) =>
  ({ accountIdentifier, orgIdentifier, environmentIdentifier, projectIdentifier }: TargetSegmentParams) => {
    const { mutate } = usePatchSegment({
      identifier: '',
      queryParams: {
        accountIdentifier,
        orgIdentifier,
        projectIdentifier,
        environmentIdentifier
      } as PatchSegmentQueryParams
    })

    return (segmentIdentifier: string, targetIdentifiers: string[]) => {
      const body = makeInstructions(patchKind, targetIdentifiers)
      return mutate(body, { pathParams: { identifier: segmentIdentifier } })
    }
  }

/** Remove targets to an include segment list */
export const useRemoveTargetsFromIncludeList = makeTargetsToSegmentHook('removeFromIncludeList')

/** Add targets to an exclude segment list */
export const useAddTargetsToExcludeList = makeTargetsToSegmentHook('addToExcludeList')

/** Remove targets to an exclude segment list */
export const useRemoveTargetsFromExcludeList = makeTargetsToSegmentHook('removeFromExcludeList')
