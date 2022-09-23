/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ServiceSpec } from 'services/cd-ng'

export const bucketListData = {
  status: 'SUCCESS',
  data: [
    {
      bucketName: 'tdp-tdp2-1rc6irugmilkh'
    },
    {
      bucketName: 'cdng-terraform-state'
    },
    {
      bucketName: 'prod-bucket-339'
    },
    {
      bucketName: 'tf-test-bkt-jul17'
    },
    {
      bucketName: 'openshift4x-2wn97-bootstrap'
    }
  ],
  metaData: null,
  correlationId: '631fb63d-b587-42fd-983f-9cbeba3df618'
}

export const buildData = {
  status: 'SUCCESS',
  data: {
    buildDetailsList: [
      {
        version: 'v3.0'
      },
      {
        version: 'v1.0'
      },
      {
        version: 'latest'
      }
    ]
  },
  metaData: null,
  correlationId: '441c6388-e3df-44cd-86f8-ccc6f1a4558b'
}

export const primaryArtifact = {
  primary: {
    spec: {
      connectorRef: '<+input>',
      project: '<+input>',
      region: '<+input>',
      repositoryName: '<+input>',
      package: '<+input>',
      version: '<+input>'
    },
    type: 'ArtifactoryRegistry'
  }
}

export const templateGoogleArtifactRegistryWithRegionRuntime: ServiceSpec = {
  artifacts: {
    primary: {
      spec: {
        region: '<+input>'
      },
      type: 'GoogleArtifactRegistry'
    }
  }
}

export const templateGoogleArtifactRegistryWithVersionRuntime: ServiceSpec = {
  artifacts: {
    primary: {
      spec: {
        version: '<+input>'
      },
      type: 'GoogleArtifactRegistry'
    }
  }
}

export const templateGoogleArtifactRegistry: ServiceSpec = {
  artifacts: {
    primary: {
      spec: {
        connectorRef: '<+input>',
        project: '<+input>',
        region: '<+input>',
        repositoryName: '<+input>',
        package: '<+input>',
        version: '<+input>'
      },
      type: 'GoogleArtifactRegistry'
    }
  }
}

export const templateGoogleArtifactRegistryWithVersionRegex: ServiceSpec = {
  artifacts: {
    primary: {
      spec: {
        connectorRef: '<+input>',
        project: '<+input>',
        region: '<+input>',
        repositoryName: '<+input>',
        package: '<+input>',
        versionRegex: '<+input>'
      },
      type: 'GoogleArtifactRegistry'
    }
  }
}

export const commonFormikInitialValues = {
  pipeline: {
    name: 'Pipeline 1',
    identifier: 'Pipeline_1',
    projectIdentifier: 'testProject',
    orgIdentifier: 'default',
    tags: {},
    stages: [
      {
        stage: {
          identifier: 'vivek',
          type: 'Deployment',
          spec: {
            serviceConfig: {
              serviceDefinition: {
                type: 'Kubernetes',
                spec: {
                  artifacts: {
                    primary: {
                      type: 'GoogleArtifactRegistry',
                      spec: {
                        connectorRef: '',
                        project: '',
                        region: '',
                        repositoryName: '',
                        package: '',
                        version: ''
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    ]
  }
}
