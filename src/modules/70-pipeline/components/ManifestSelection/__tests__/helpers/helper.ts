/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ManifestDataType } from '../../Manifesthelper'

export const updateManifestListFirstArgEcsTaskDefinition = {
  manifest: {
    identifier: 'testidentifier',
    type: ManifestDataType.EcsTaskDefinition,
    spec: {
      store: {
        spec: {
          branch: 'testBranch',
          connectorRef: 'account.Git_CTR',
          gitFetchType: 'Branch',
          paths: ['test-path']
        },
        type: 'Git'
      }
    }
  }
}

export const updateManifestListFirstArgEcsServiceDefinition = {
  manifest: {
    identifier: 'testidentifier',
    type: ManifestDataType.EcsServiceDefinition,
    spec: {
      store: {
        spec: {
          branch: 'testBranch',
          connectorRef: 'account.Git_CTR',
          gitFetchType: 'Branch',
          paths: ['test-path']
        },
        type: 'Git'
      }
    }
  }
}

export const updateManifestListFirstArgEcsScallingPolicy = {
  manifest: {
    identifier: 'testidentifier',
    type: ManifestDataType.EcsScalingPolicyDefinition,
    spec: {
      store: {
        spec: {
          branch: 'testBranch',
          connectorRef: 'account.Git_CTR',
          gitFetchType: 'Branch',
          paths: ['test-path']
        },
        type: 'Git'
      }
    }
  }
}

export const updateManifestListFirstArgEcsScalableTarget = {
  manifest: {
    identifier: 'testidentifier',
    type: ManifestDataType.EcsScalableTargetDefinition,
    spec: {
      store: {
        spec: {
          branch: 'testBranch',
          connectorRef: 'account.Git_CTR',
          gitFetchType: 'Branch',
          paths: ['test-path']
        },
        type: 'Git'
      }
    }
  }
}
