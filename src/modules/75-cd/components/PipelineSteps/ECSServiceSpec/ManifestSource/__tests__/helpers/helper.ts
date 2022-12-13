/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { ManifestDataType, ManifestStoreMap } from '@pipeline/components/ManifestSelection/Manifesthelper'

export const S3ManifestStoreRuntimeViewExistingInitialValues = {
  manifests: [
    {
      manifest: {
        identifier: 'S3 Manifest',
        type: ManifestDataType.EcsTaskDefinition,
        spec: {
          store: {
            type: ManifestStoreMap.S3,
            spec: {
              connectorRef: 'AWSX',
              region: 'us-east-1',
              bucketName: 'cdng-terraform-state',
              paths: ['path1.yaml']
            }
          }
        }
      }
    }
  ]
}

export const s3ManifestStoreRuntimeViewTemplate = {
  manifests: [
    {
      manifest: {
        identifier: 'S3 Manifest',
        type: ManifestDataType.EcsTaskDefinition,
        spec: {
          store: {
            type: ManifestStoreMap.S3,
            spec: {
              connectorRef: RUNTIME_INPUT_VALUE,
              region: RUNTIME_INPUT_VALUE,
              bucketName: RUNTIME_INPUT_VALUE,
              paths: RUNTIME_INPUT_VALUE
            }
          }
        }
      }
    }
  ]
}
