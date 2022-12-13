/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { ManifestDataType, ManifestStoreMap } from '@pipeline/components/ManifestSelection/Manifesthelper'

export const initialValuesServerlessLambdaManifestS3Store = {
  manifests: [
    {
      manifest: {
        identifier: 'Serverless_Manifest_S3',
        type: ManifestDataType.ServerlessAwsLambda,
        spec: {
          store: {
            type: ManifestStoreMap.S3,
            spec: {
              region: '',
              bucketName: '',
              paths: ''
            }
          },
          configOverridePath: ''
        }
      }
    }
  ]
}

export const serverlessLambdaManifestTemplateS3Store = {
  manifests: [
    {
      manifest: {
        identifier: 'Serverless_Manifest_S3',
        type: ManifestDataType.ServerlessAwsLambda,
        spec: {
          store: {
            type: ManifestStoreMap.S3,
            spec: {
              region: RUNTIME_INPUT_VALUE,
              bucketName: RUNTIME_INPUT_VALUE,
              paths: RUNTIME_INPUT_VALUE
            }
          },
          configOverridePath: RUNTIME_INPUT_VALUE
        }
      }
    }
  ]
}
