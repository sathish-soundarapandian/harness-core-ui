/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const connectorListResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 4,
    pageItemCount: 4,
    pageSize: 10,
    content: [
      {
        connector: {
          name: 'DoNotDelete_JiraConnectorForAutomationDoNotDelete',
          identifier: 'DoNotDelete_JiraConnectorForAutomationDoNotDelete',
          description: '',
          orgIdentifier: null,
          projectIdentifier: null,
          tags: {},
          type: 'Jira',
          spec: {
            jiraUrl: 'https://harness.atlassian.net/',
            username: 'autouser1@harness.io',
            usernameRef: null,
            passwordRef: 'account.DoNotDelete_FUZoa9gv0F',
            delegateSelectors: []
          }
        },
        createdAt: 1662124994001,
        lastModifiedAt: 1664799354329,
        status: {
          status: 'SUCCESS',
          errorSummary: null,
          errors: null,
          testedAt: 1665407827823,
          lastTestedAt: 0,
          lastConnectedAt: 1665407827823
        },
        activityDetails: {
          lastActivityTime: 1664799355356
        },
        harnessManaged: false,
        gitDetails: {
          objectId: null,
          branch: null,
          repoIdentifier: null,
          rootFolder: null,
          filePath: null,
          repoName: null,
          commitId: null,
          fileUrl: null,
          repoUrl: null
        },
        entityValidityDetails: {
          valid: true,
          invalidYaml: null
        },
        governanceMetadata: null
      },
      {
        connector: {
          name: 'jira_test',
          identifier: 'jira_test',
          description: '',
          orgIdentifier: null,
          projectIdentifier: null,
          tags: {},
          type: 'Jira',
          spec: {
            jiraUrl: 'https://harness.atlassian.net/',
            username: 'autouser1@harness.io',
            usernameRef: null,
            passwordRef: 'account.jira_test',
            delegateSelectors: []
          }
        },
        createdAt: 1655270613101,
        lastModifiedAt: 1655270613097,
        status: {
          status: 'FAILURE',
          errorSummary: 'Error Encountered (After 3 tries, delegate(s) is not able to establish connection to Vault.)',
          errors: [
            {
              reason: 'Unexpected Error',
              message: 'After 3 tries, delegate(s) is not able to establish connection to Vault.',
              code: 450
            }
          ],
          testedAt: 1657600206570,
          lastTestedAt: 0,
          lastConnectedAt: 1657596506696
        },
        activityDetails: {
          lastActivityTime: 1655270613123
        },
        harnessManaged: false,
        gitDetails: {
          objectId: null,
          branch: null,
          repoIdentifier: null,
          rootFolder: null,
          filePath: null,
          repoName: null,
          commitId: null,
          fileUrl: null,
          repoUrl: null
        },
        entityValidityDetails: {
          valid: true,
          invalidYaml: null
        },
        governanceMetadata: null
      },
      {
        connector: {
          name: 'prabu-jira',
          identifier: 'prabujira',
          description: '',
          orgIdentifier: null,
          projectIdentifier: null,
          tags: {},
          type: 'Jira',
          spec: {
            jiraUrl: 'https://harness.atlassian.net/',
            username: 'prabu.rajendran@harness.io',
            usernameRef: null,
            passwordRef: 'account.prabujiratoken',
            delegateSelectors: []
          }
        },
        createdAt: 1627884038864,
        lastModifiedAt: 1627884038858,
        status: {
          status: 'SUCCESS',
          errorSummary: null,
          errors: null,
          testedAt: 1627884041726,
          lastTestedAt: 0,
          lastConnectedAt: 1627884041726
        },
        activityDetails: {
          lastActivityTime: 1627884038870
        },
        harnessManaged: false,
        gitDetails: {
          objectId: null,
          branch: null,
          repoIdentifier: null,
          rootFolder: null,
          filePath: null,
          repoName: null,
          commitId: null,
          fileUrl: null,
          repoUrl: null
        },
        entityValidityDetails: {
          valid: true,
          invalidYaml: null
        },
        governanceMetadata: null
      },
      {
        connector: {
          name: 'CP - jira account',
          identifier: 'CP_jira_account',
          description: '',
          orgIdentifier: null,
          projectIdentifier: null,
          tags: {},
          type: 'Jira',
          spec: {
            jiraUrl: 'https://harness.atlassian.net/',
            username: 'chirag.parihar@harness.io',
            usernameRef: null,
            passwordRef: 'account.secretdevx5sw3',
            delegateSelectors: []
          }
        },
        createdAt: 1626936650009,
        lastModifiedAt: 1626936649927,
        status: {
          status: 'FAILURE',
          errorSummary:
            'Failed to fetch projects during credential validation. Error fetching projects at url [https://harness.atlassian.net/]. Unsuccessful HTTP call: status code = 401, message = ',
          errors: null,
          testedAt: 1627674716632,
          lastTestedAt: 0,
          lastConnectedAt: 0
        },
        activityDetails: {
          lastActivityTime: 1626936650026
        },
        harnessManaged: false,
        gitDetails: {
          objectId: null,
          branch: null,
          repoIdentifier: null,
          rootFolder: null,
          filePath: null,
          repoName: null,
          commitId: null,
          fileUrl: null,
          repoUrl: null
        },
        entityValidityDetails: {
          valid: true,
          invalidYaml: null
        },
        governanceMetadata: null
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: '41f04f20-87c4-4a9e-9255-c7beacf1b530'
}
