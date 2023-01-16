/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const artifacts = {
  sidecars: [
    {
      sidecar: {
        spec: {
          connectorRef: '<+input>',
          imagePath: '<+input>',
          tag: '<+input>'
        },
        identifier: 'Sidecar test',
        type: 'DockerRegistry'
      }
    },
    {
      sidecar: {
        spec: {
          connectorRef: '<+input>',
          imagePath: '<+input>',
          tag: '<+input>',
          registryHostname: 'gcr.io'
        },
        identifier: 'GCR sidecar',
        type: 'Gcr'
      }
    }
  ],
  primary: {
    spec: {
      connectorRef: 'Docker_Conn',
      imagePath: './',
      tag: '<+input>',
      digest: '<+input>'
    },
    type: 'DockerRegistry'
  }
}

export const template = {
  artifacts: {
    sidecars: [
      {
        sidecar: {
          identifier: 'sidecar2',
          type: 'DockerRegistry',
          spec: {
            tag: '<+input>'
          }
        }
      },
      {
        sidecar: {
          identifier: 'Sidecar test',
          type: 'DockerRegistry',
          spec: {
            connectorRef: '<+input>',
            imagePath: '<+input>',
            tag: '<+input>'
          }
        }
      }
    ],
    primary: {
      spec: {
        connectorRef: 'Docker_Conn',
        imagePath: './',
        tag: '<+input>',
        digest: '<+input>'
      },
      type: 'DockerRegistry'
    }
  }
}
