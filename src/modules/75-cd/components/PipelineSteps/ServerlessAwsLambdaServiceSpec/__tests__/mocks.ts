/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const mockManifestConnector = {
  status: 'SUCCESS',
  data: {
    content: [
      {
        connector: {
          name: 'git9march',
          identifier: 'git9march',
          description: '',
          orgIdentifier: null,
          projectIdentifier: null,
          tags: {},
          type: 'Git',
          spec: {
            url: 'https://github.com/wings-software/CG-gitSync',
            validationRepo: null,
            branchName: null,
            delegateSelectors: ['nofartest'],
            executeOnDelegate: true,
            type: 'Http',
            connectionType: 'Repo',
            spec: {
              username: 'harness',
              usernameRef: null,
              passwordRef: 'account.GitToken'
            }
          }
        }
      }
    ]
  }
}

export const mockBuildList = {
  status: 'SUCCESS',
  data: {
    buildDetailsList: [
      {
        artifactPath: 'hello-world.zip'
      },
      {
        artifactPath: 'todolist.zip'
      }
    ]
  }
}
