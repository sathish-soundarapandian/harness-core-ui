/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ResponseTriggerCatalogResponse } from 'services/pipeline-ng'

export const triggerCatalogSuccessResponse: ResponseTriggerCatalogResponse = {
  status: 'SUCCESS',
  data: {
    catalog: [
      {
        category: 'Webhook',
        triggerCatalogType: ['Github', 'Gitlab', 'Bitbucket', 'AwsCodeCommit', 'Custom']
      },
      {
        category: 'Artifact',
        triggerCatalogType: [
          'Gcr',
          'Ecr',
          'DockerRegistry',
          'ArtifactoryRegistry',
          'Acr',
          'AmazonS3',
          'GoogleArtifactRegistry',
          'CustomArtifact',
          'GithubPackageRegistry'
        ]
      },
      {
        category: 'Manifest',
        triggerCatalogType: ['HelmChart']
      },
      {
        category: 'Scheduled',
        triggerCatalogType: ['Cron']
      }
    ]
  }
}
