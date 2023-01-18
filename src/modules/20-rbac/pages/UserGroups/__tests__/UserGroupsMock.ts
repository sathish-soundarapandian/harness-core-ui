/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ResponseBoolean, ResponsePageUserGroupAggregateDTO, ResponsePageUserMetadataDTO } from 'services/cd-ng'

export const userGroupsAggregate: ResponsePageUserGroupAggregateDTO = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 2,
    pageItemCount: 2,
    pageSize: 10,
    content: [
      {
        userGroupDTO: {
          accountIdentifier: 'testAcc',
          identifier: 'Testing_User_Group',
          name: 'Testing User Group',
          users: ['admin', 'testing1', 'testing2', 'testing3'],
          notificationConfigs: [],
          description: '',
          tags: {}
        },
        users: [
          { name: 'Admin', email: 'admin@harness.io', uuid: 'admin' },
          {
            name: 'testing1',
            email: 'testing1@harness.io',
            uuid: 'testing1'
          },
          { name: 'testing2', email: 'testing2@dropjar.com', uuid: 'testing2' },
          { name: 'testing3', email: 'testing3@getairmail.com', uuid: 'testing3' }
        ],
        roleAssignmentsMetadataDTO: [
          {
            identifier: 'RG1',
            roleIdentifier: 'Custom_Role',
            roleName: 'Custom Role',
            resourceGroupIdentifier: '_all_account_level_resources',
            resourceGroupName: 'All Resources',
            managedRole: false,
            managedRoleAssignment: false
          }
        ],
        lastModifiedAt: 1617941811398
      },
      {
        userGroupDTO: {
          accountIdentifier: 'testAcc',
          identifier: 'dummyid',
          name: 'dummy',
          users: [],
          notificationConfigs: [],
          description: '',
          tags: {}
        },
        users: [],
        roleAssignmentsMetadataDTO: []
      },
      {
        userGroupDTO: {
          accountIdentifier: 'testAcc',
          identifier: 'Testing_User_Group_with_sso',
          name: 'Testing User Group With SSO',
          users: ['admin', 'testing1', 'testing2', 'testing3'],
          notificationConfigs: [],
          description: '',
          tags: {},
          ssoGroupName: 'TEST SSO GROUP NAME',
          ssoLinked: true,
          linkedSsoDisplayName: 'TEST_LINKED_SSO'
        },
        users: [
          { name: 'Admin', email: 'admin@harness.io', uuid: 'admin' },
          {
            name: 'testing1',
            email: 'testing1@harness.io',
            uuid: 'testing1'
          },
          { name: 'testing2', email: 'testing2@dropjar.com', uuid: 'testing2' },
          { name: 'testing3', email: 'testing3@getairmail.com', uuid: 'testing3' }
        ],
        roleAssignmentsMetadataDTO: [
          {
            identifier: 'RG1',
            roleIdentifier: 'Custom_Role',
            roleName: 'Custom Role',
            resourceGroupIdentifier: '_all_account_level_resources',
            resourceGroupName: 'All Resources',
            managedRole: false,
            managedRoleAssignment: false
          }
        ],
        lastModifiedAt: 1617941811398
      },
      {
        userGroupDTO: {
          accountIdentifier: 'testAcc',
          identifier: 'Testing_User_Group_with_sso_no_users',
          name: 'Testing User Group With linked LDAP SSO no Users',
          users: [],
          notificationConfigs: [],
          description: '',
          tags: {},
          ssoGroupName: 'TEST SSO GROUP NAME',
          ssoLinked: true,
          linkedSsoDisplayName: 'TEST_LINKED_SSO',
          linkedSsoType: 'LDAP'
        },
        users: [],
        roleAssignmentsMetadataDTO: [],
        lastModifiedAt: 1617941811398
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: undefined,
  correlationId: '0f832df3-d742-4689-950b-f30573d1db5a'
}

export const mockResponse: ResponseBoolean = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
  correlationId: ''
}

export const usersMockData: ResponsePageUserMetadataDTO = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 6,
    pageItemCount: 6,
    pageSize: 50,
    content: [
      { name: 'Admin', email: 'admin@harness.io', uuid: 'lv0euRhKRCyiXWzS7pOg6g' },
      { name: 'rbac2', email: 'rbac2@harness.io', uuid: '19bYA-ooQZOTZQxf2N-VPA' },
      { name: 'rbac1', email: 'rbac1@harness.io', uuid: 'BnTbQTIJS4SkadzYv0BcbA' },
      { name: 'readonlyuser', email: 'readonlyuser@harness.io', uuid: 'nhLgdGgxS_iqa0KP5edC-w' },
      { name: 'default2fa', email: 'default2fa@harness.io', uuid: 'ZqXNvYmURnO46PX7HwgEtQ' },
      { name: 'default', email: 'default@harness.io', uuid: '0osgWsTZRsSZ8RWfjLRkEg' }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: undefined,
  correlationId: '5641de2d-19ba-4829-9457-26608661a5e5'
}

export const roleMockData = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 3,
    pageItemCount: 3,
    pageSize: 50,
    content: [
      {
        role: {
          identifier: '_account_viewer',
          name: 'Account Viewer',
          permissions: [
            'core_service_view',
            'core_organization_view',
            'core_environment_view',
            'core_secret_view',
            'core_connector_view'
          ],
          allowedScopeLevels: ['account'],
          description: 'View an account',
          tags: null
        },
        scope: null,
        harnessManaged: true,
        createdAt: 1615054539384,
        lastModifiedAt: 1617625090481
      },
      {
        role: {
          identifier: '_account_admin',
          name: 'Account Admin',
          permissions: [
            'core_organization_create',
            'core_service_edit',
            'core_secret_delete',
            'core_organization_view',
            'core_environment_view',
            'core_service_delete',
            'core_secret_edit',
            'core_connector_create',
            'core_connector_edit',
            'core_secret_view',
            'core_secret_access',
            'core_connector_view',
            'core_connector_access',
            'core_environment_access',
            'core_service_view',
            'core_service_access',
            'core_environment_edit',
            'core_connector_delete',
            'core_environment_delete'
          ],
          allowedScopeLevels: ['account'],
          description: 'Administer an account',
          tags: null
        },
        scope: null,
        harnessManaged: true,
        createdAt: 1615054539397,
        lastModifiedAt: 1617711363209
      },
      {
        role: {
          identifier: 'Custom_Role',
          name: 'Custom Role',
          permissions: [
            'core_organization_create',
            'core_secret_delete',
            'core_organization_view',
            'core_secret_edit',
            'core_secret_view'
          ],
          allowedScopeLevels: ['account'],
          description: '',
          tags: {}
        },
        scope: { accountIdentifier: 'testAcc', orgIdentifier: null, projectIdentifier: null },
        harnessManaged: false,
        createdAt: 1617901019095,
        lastModifiedAt: 1617941758361
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: undefined,
  correlationId: 'dd49f20d-3685-4b65-8ee9-69f22bafbad9'
}

export const resourceGroupsMockData = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 4,
    pageItemCount: 4,
    pageSize: 50,
    content: [
      {
        resourceGroup: {
          accountIdentifier: 'testAcc',
          identifier: 'My_Resources',
          name: 'My Resources',
          resourceSelectors: [],
          fullScopeSelected: false,
          tags: {},
          description: '',
          color: '#0063f7'
        },
        harnessManaged: false
      },
      {
        resourceGroup: {
          accountIdentifier: 'testAcc',
          identifier: 'Custom_RG',
          name: 'Custom RG',
          resourceSelectors: [{ type: 'DynamicResourceSelector', resourceType: 'SECRET' }],
          fullScopeSelected: false,
          tags: {},
          description: '',
          color: '#e6b800'
        },
        createdAt: 1617943146592,
        lastModifiedAt: 1617943226983,
        harnessManaged: false
      },
      {
        resourceGroup: {
          accountIdentifier: 'testAcc',
          orgIdentifier: null,
          projectIdentifier: null,
          identifier: '_all_account_level_resources',
          name: 'All Resources',
          resourceSelectors: [],
          fullScopeSelected: true,
          tags: { predefined: 'true' },
          description: 'Resource Group containing all resources',
          color: '#0061fc'
        },
        createdAt: 1617721392670,
        lastModifiedAt: 1617721392670,
        harnessManaged: false
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: undefined,
  correlationId: '188e8617-962e-40a8-932a-fcc8dd6d1091'
}
