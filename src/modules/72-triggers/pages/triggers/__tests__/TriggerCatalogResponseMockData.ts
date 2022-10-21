import type { ResponseTriggerCatalogResponse } from 'services/pipeline-ng'

export const triggerCatalogSuccessResponse: ResponseTriggerCatalogResponse = {
  status: 'SUCCESS',
  data: {
    catalog: [
      {
        category: 'WEBHOOK',
        triggerCatalogType: ['Codecommit', 'Github', 'Bitbucket', 'Gitlab']
      },
      {
        category: 'ARTIFACT',
        triggerCatalogType: ['AmazonS3', 'ECR', 'Artifactory', 'DockerRegistry', 'ACR', 'GCR']
      },
      {
        category: 'MANIFEST',
        triggerCatalogType: ['HelmChart']
      },
      {
        category: 'SCHEDULED',
        triggerCatalogType: ['Scheduled']
      }
    ]
  }
}

export const triggerCatalogErrorResponse: ResponseTriggerCatalogResponse = {
  status: 'ERROR'
}

export const triggerCatalogFailureResponse: ResponseTriggerCatalogResponse = {
  status: 'FAILURE'
}
