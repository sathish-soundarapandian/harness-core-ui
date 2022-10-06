/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export default {
  type: 'AzureCreateARMResource',
  name: 'arm',
  identifier: 'arm',
  spec: {
    provisionerIdentifier: 'arm',
    configuration: {
      connectorRef: 'account.TestAzure',
      template: {
        store: {
          type: 'Git',
          spec: {
            connectorRef: 'account.git9march',
            gitFetchType: 'Branch',
            branch: 'main',
            paths: ['test/path']
          }
        }
      },
      scope: {
        type: 'ResourceGroup',
        spec: {
          subscription: '<+input>',
          resourceGroup: '<+input>',
          mode: 'Complete'
        }
      },
      parameters: {
        store: {
          type: 'Github',
          spec: {
            connectorRef: 'account.vikyathGithub',
            gitFetchType: 'Branch',
            branch: 'main',
            paths: ['param/path']
          }
        }
      }
    }
  },
  timeout: '10m'
}
