/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type {
  ProjectResponse,
  ResponseBoolean,
  ResponsePageUserGroupAggregateDTO,
  ResponseUserAggregate
} from 'services/cd-ng'

export const userInfo: ResponseUserAggregate = {
  status: 'SUCCESS',
  data: {
    user: { name: 'dummy', email: 'dummy@harness.io', uuid: 'dummy' },
    roleAssignmentMetadata: [
      {
        identifier: 'role_assignment_JZcId0QnciEQsfOtUYlo',
        roleIdentifier: 'New_Role',
        roleName: 'New Role',
        resourceGroupIdentifier: '_all_account_level_resources',
        resourceGroupName: 'All Resources',
        managedRole: false,
        managedRoleAssignment: false
      },
      {
        identifier: 'role_assignment_wHQ0QnLTID3MSVGzKchN',
        roleIdentifier: 'TestRole',
        roleName: 'TestRole',
        resourceGroupIdentifier: '_all_account_level_resources',
        resourceGroupName: 'All Resources',
        managedRole: false,
        managedRoleAssignment: false
      },
      {
        identifier: 'role_assignment_VSS2NofHI92c9TibXh03',
        roleIdentifier: '_account_dummy',
        roleName: 'Account dummy',
        resourceGroupIdentifier: '_all_account_level_resources',
        resourceGroupName: 'All Resources',
        managedRole: true,
        managedRoleAssignment: false
      },
      {
        identifier: 'role_assignment_gfLKLhqViVlNahxOfks7',
        roleIdentifier: '_account_viewer',
        roleName: 'Account Viewer',
        resourceGroupIdentifier: '_all_account_level_resources',
        resourceGroupName: 'All Resources',
        managedRole: true,
        managedRoleAssignment: false
      },
      {
        identifier: 'role_assignment_RkYa8Hrtp2CZJIJbUE7C',
        roleIdentifier: 'ufbvfbvbfv',
        roleName: 'ufbvfbvbfv',
        resourceGroupIdentifier: '_all_account_level_resources',
        resourceGroupName: 'All Resources',
        managedRole: false,
        managedRoleAssignment: false
      }
    ]
  },
  metaData: {},
  correlationId: ''
}
export const mockResponse: ResponseBoolean = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
  correlationId: ''
}

export const userGroupInfo = {
  status: 'SUCCESS',
  data: [
    {
      accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
      identifier: 'test',
      name: 'testGroup',
      users: ['u1'],
      notificationConfigs: [],
      description: '',
      tags: {}
    }
  ],
  metaData: '',
  correlationId: ''
}
export const orgMockData = {
  data: {
    status: 'SUCCESS',
    data: {
      pageCount: 1,
      itemCount: 3,
      pageSize: 50,
      content: [
        {
          organization: {
            accountIdentifier: 'testAcc',
            identifier: 'testOrg',
            name: 'Org Name',
            description: 'Description',
            tags: { tag1: '', tag2: 'tag3' }
          }
        },
        {
          organization: {
            accountIdentifier: 'testAcc',
            identifier: 'default',
            name: 'default',
            description: 'default',
            tags: { tag1: '', tag2: 'tag3' }
          },
          harnessManaged: true
        }
      ],
      pageIndex: 0,
      empty: false
    },
    metaData: undefined,
    correlationId: '370210dc-a345-42fa-b3cf-69bd64eb5073'
  },
  loading: false
}
export const projectMockData: ProjectResponse[] = [
  {
    project: {
      orgIdentifier: 'default',
      identifier: 'TestCiproject',
      name: 'TestCiproject',
      color: '#0063F7',
      modules: ['CI', 'CD'],
      description: 'Test description',
      tags: { tag1: 'value' }
    }
  },
  {
    project: {
      orgIdentifier: 'default',
      identifier: 'test11',
      name: 'test11',
      color: '#0063F7',
      modules: ['CD'],
      description: '',
      tags: {}
    }
  },
  {
    project: {
      orgIdentifier: 'default',
      identifier: 'Project_1',
      name: 'Project 1',
      color: '#0063F7',
      modules: [],
      description: '',
      tags: {}
    }
  },
  {
    project: {
      orgIdentifier: 'testOrg',
      identifier: 'fdfder32432',
      name: 'fdfder32432',
      color: '#0063F7',
      modules: ['CD', 'CF', 'CE', 'CI', 'CV'],
      description: '',
      tags: {}
    }
  }
]

export const userGroupsAggregate: ResponsePageUserGroupAggregateDTO = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 1,
    pageSize: 10,
    content: [
      {
        userGroupDTO: {
          accountIdentifier: 'accountId',
          identifier: 'abc',
          name: 'abc_name',
          users: ['xyz1', 'xyz2'],
          notificationConfigs: [],
          description: '',
          tags: {},
          ssoLinked: false
        },
        users: [
          {
            name: 'xyz1',
            email: 'xyz1@test.io',
            uuid: 'xyz1',
            locked: false
          },
          {
            name: 'xyz2',
            email: 'xyz2@test.io',
            uuid: 'xyz2',
            locked: false
          }
        ],
        roleAssignmentsMetadataDTO: [],
        lastModifiedAt: 1627886721254
      },
      {
        userGroupDTO: {
          accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
          identifier: 'test',
          name: 'testGroup',
          users: ['u1'],
          notificationConfigs: [],
          description: '',
          tags: {}
        },
        users: [
          {
            name: 'dummy',
            email: 'dummy@harness.io',
            uuid: 'dummy',
            locked: false
          }
        ],
        roleAssignmentsMetadataDTO: [],
        lastModifiedAt: 1627886721254
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: undefined,
  correlationId: '0f832df3-d742-4689-950b-f30573d1db5a'
}

export const roleBindingsList = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 7,
    pageItemCount: 7,
    pageSize: 10,
    content: [
      {
        roleAssignmentDTO: {
          roleAssignment: {
            identifier: 'role_assignment_vMoqt0hqUp2IHoHdDRIX',
            resourceGroupIdentifier: '_all_account_level_resources',
            roleIdentifier: '_account_viewer',
            principal: { scopeLevel: null, identifier: 'lv0euRhKRCyiXWzS7pOg6g', type: 'USER' },
            disabled: false,
            managed: false
          },
          scope: { accountIdentifier: 'kmpySmUISimoRrJL6NL73w', orgIdentifier: null, projectIdentifier: null },
          createdAt: 1658914130229,
          lastModifiedAt: 1658914130229,
          harnessManaged: true
        },
        role: {
          role: {
            identifier: '_account_viewer',
            name: 'Account Viewer',
            permissions: [
              'core_serviceaccount_view',
              'core_template_view',
              'core_governancePolicy_view',
              'gitops_application_view',
              'sto_exemption_view',
              'core_resourcegroup_view',
              'ff_environment_view',
              'core_pipeline_view',
              'chi_slo_view',
              'core_user_view',
              'sto_issue_view',
              'core_role_view',
              'core_audit_view',
              'core_delegateconfiguration_view',
              'core_authsetting_view',
              'gitops_cluster_view',
              'core_organization_view',
              'chaos_chaoshub_view',
              'core_secret_view',
              'sto_scan_view',
              'ccm_budget_view',
              'core_service_view',
              'ff_targetgroup_view',
              'chi_monitoredservice_view',
              'chaos_chaosgameday_view',
              'core_account_view',
              'sto_testtarget_view',
              'core_environment_view',
              'ccm_overview_view',
              'core_usergroup_view',
              'core_environmentgroup_view',
              'core_connector_view',
              'core_governancePolicySets_view',
              'ccm_autoStoppingRule_view',
              'ff_target_view',
              'ccm_folder_view',
              'gitops_agent_view',
              'ff_featureflag_view',
              'gitops_repository_view',
              'core_file_view',
              'core_smtp_view',
              'core_delegate_view',
              'core_license_view',
              'chaos_chaosagent_view',
              'ff_environment_apiKeyView',
              'core_dashboards_view',
              'gitops_cert_view',
              'core_project_view',
              'chaos_chaosworkflow_view',
              'gitops_gpgkey_view',
              'core_variable_view',
              'ccm_costCategory_view',
              'ccm_loadBalancer_view',
              'ccm_perspective_view'
            ],
            allowedScopeLevels: ['account'],
            description: 'View an account',
            tags: null
          },
          scope: null,
          harnessManaged: true,
          createdAt: 1657610013160,
          lastModifiedAt: 1659944715628
        },
        resourceGroup: { identifier: '_all_account_level_resources', name: 'All Account Level Resources' },
        scope: { accountName: 'Harness', orgName: null, projectName: null },
        userGroupName: null
      },
      {
        roleAssignmentDTO: {
          roleAssignment: {
            identifier: 'role_assignment_qTgUcjZgtzrxRVTAfrsE',
            resourceGroupIdentifier: '_all_resources_including_child_scopes',
            roleIdentifier: '_account_admin',
            principal: { scopeLevel: null, identifier: 'lv0euRhKRCyiXWzS7pOg6g', type: 'USER' },
            disabled: false,
            managed: false
          },
          scope: { accountIdentifier: 'kmpySmUISimoRrJL6NL73w', orgIdentifier: null, projectIdentifier: null },
          createdAt: 1658914131012,
          lastModifiedAt: 1658914131012,
          harnessManaged: false
        },
        role: {
          role: {
            identifier: '_account_admin',
            name: 'Account Admin',
            permissions: [
              'core_governancePolicy_view',
              'ccm_autoStoppingRule_delete',
              'core_governancePolicy_delete',
              'chaos_chaosworkflow_edit',
              'core_user_manage',
              'ff_environment_view',
              'core_resourcegroup_delete',
              'gitops_agent_delete',
              'core_secret_edit',
              'core_governancePolicySets_delete',
              'chi_slo_view',
              'gitops_cluster_delete',
              'core_delegateconfiguration_edit',
              'sto_issue_view',
              'core_smtp_edit',
              'core_role_view',
              'core_project_delete',
              'chaos_chaoshub_edit',
              'ccm_costCategory_edit',
              'core_audit_view',
              'core_organization_delete',
              'ccm_perspective_edit',
              'gitops_cluster_view',
              'core_organization_view',
              'chi_monitoredservice_delete',
              'gitops_application_delete',
              'ff_featureflag_toggle',
              'gitops_cert_delete',
              'core_authsetting_delete',
              'core_template_edit',
              'ccm_budget_view',
              'gitops_application_edit',
              'core_license_edit',
              'ff_environment_apiKeyDelete',
              'core_authsetting_edit',
              'chaos_chaosagent_edit',
              'gitops_agent_edit',
              'chi_monitoredservice_view',
              'gitops_repository_edit',
              'chaos_chaosgameday_view',
              'core_governancePolicySets_edit',
              'ccm_perspective_delete',
              'core_environment_view',
              'core_environmentgroup_access',
              'gitops_cluster_edit',
              'ccm_overview_view',
              'core_usergroup_view',
              'chaos_chaosgameday_edit',
              'ccm_folder_view',
              'core_organization_edit',
              'chi_monitoredservice_edit',
              'core_environment_delete',
              'ff_targetgroup_delete',
              'gitops_repository_view',
              'core_smtp_delete',
              'chi_slo_delete',
              'ff_targetgroup_edit',
              'core_file_view',
              'chaos_chaoshub_delete',
              'ccm_loadBalancer_edit',
              'core_organization_create',
              'core_license_view',
              'chaos_chaosagent_view',
              'core_variable_delete',
              'core_dashboards_view',
              'ccm_budget_edit',
              'ccm_costCategory_delete',
              'core_connector_edit',
              'core_project_view',
              'core_service_access',
              'core_template_delete',
              'core_connector_access',
              'core_delegate_edit',
              'core_variable_view',
              'sto_testtarget_edit',
              'ccm_loadBalancer_delete',
              'core_serviceaccount_view',
              'core_template_view',
              'gitops_application_view',
              'sto_exemption_view',
              'core_resourcegroup_view',
              'gitops_cert_edit',
              'gitops_gpgkey_edit',
              'core_pipeline_view',
              'ff_environment_apiKeyCreate',
              'core_user_view',
              'ff_environment_targetGroupEdit',
              'gitops_gpgkey_delete',
              'chi_slo_edit',
              'core_file_delete',
              'gitops_application_sync',
              'sto_exemption_approve',
              'core_file_access',
              'core_secret_delete',
              'core_governancePolicySets_evaluate',
              'core_delegateconfiguration_view',
              'core_authsetting_view',
              'ff_environment_edit',
              'chaos_chaosagent_delete',
              'chaos_chaoshub_view',
              'core_delegate_delete',
              'core_project_create',
              'core_secret_view',
              'sto_scan_view',
              'core_secret_access',
              'core_project_edit',
              'core_account_edit',
              'chi_monitoredservice_toggle',
              'core_service_view',
              'core_environmentgroup_edit',
              'ff_featureflag_edit',
              'core_setting_edit',
              'ff_targetgroup_view',
              'core_governancePolicy_edit',
              'ccm_folder_delete',
              'sto_exemption_create',
              'core_role_edit',
              'core_service_edit',
              'ccm_autoStoppingRule_edit',
              'core_dashboards_edit',
              'core_account_view',
              'core_user_invite',
              'ff_featureflag_delete',
              'sto_testtarget_view',
              'core_delegateconfiguration_delete',
              'core_serviceaccount_delete',
              'gitops_repository_delete',
              'core_service_delete',
              'core_environmentgroup_view',
              'core_connector_view',
              'core_governancePolicySets_view',
              'core_environmentgroup_delete',
              'ccm_autoStoppingRule_view',
              'ff_target_view',
              'gitops_agent_view',
              'core_environment_access',
              'ff_featureflag_view',
              'core_variable_edit',
              'core_usergroup_manage',
              'core_serviceaccount_manageapikey',
              'core_role_delete',
              'ccm_budget_delete',
              'ccm_folder_edit',
              'core_smtp_view',
              'core_delegate_view',
              'core_template_access',
              'ff_environment_apiKeyView',
              'core_pipeline_delete',
              'gitops_cert_view',
              'chaos_chaosworkflow_delete',
              'core_pipeline_edit',
              'chaos_chaosworkflow_view',
              'core_pipeline_execute',
              'gitops_gpgkey_view',
              'core_serviceaccount_edit',
              'core_resourcegroup_edit',
              'core_environment_edit',
              'ccm_costCategory_view',
              'ccm_loadBalancer_view',
              'core_connector_delete',
              'core_file_edit',
              'ccm_perspective_view'
            ],
            allowedScopeLevels: ['account'],
            description: 'Administer an account',
            tags: null
          },
          scope: null,
          harnessManaged: true,
          createdAt: 1657610013204,
          lastModifiedAt: 1659944716007
        },
        resourceGroup: {
          identifier: '_all_resources_including_child_scopes',
          name: 'All Resources Including Child Scopes'
        },
        scope: { accountName: 'Harness', orgName: null, projectName: null },
        userGroupName: null
      },
      {
        roleAssignmentDTO: {
          roleAssignment: {
            identifier: 'role_assignment_D8bMSTjHJYN67EYiCZgf',
            resourceGroupIdentifier: '_all_organization_level_resources',
            roleIdentifier: '_organization_viewer',
            principal: { scopeLevel: null, identifier: 'lv0euRhKRCyiXWzS7pOg6g', type: 'USER' },
            disabled: false,
            managed: false
          },
          scope: { accountIdentifier: 'kmpySmUISimoRrJL6NL73w', orgIdentifier: 'default', projectIdentifier: null },
          createdAt: 1658914131459,
          lastModifiedAt: 1658914131459,
          harnessManaged: true
        },
        role: {
          role: {
            identifier: '_organization_viewer',
            name: 'Organization Viewer',
            permissions: [
              'chaos_chaosgameday_view',
              'core_serviceaccount_view',
              'core_template_view',
              'core_governancePolicy_view',
              'gitops_application_view',
              'sto_exemption_view',
              'core_resourcegroup_view',
              'sto_testtarget_view',
              'core_environment_view',
              'ff_environment_view',
              'core_usergroup_view',
              'core_pipeline_view',
              'chi_slo_view',
              'core_environmentgroup_view',
              'core_connector_view',
              'core_user_view',
              'core_governancePolicySets_view',
              'sto_issue_view',
              'ff_target_view',
              'gitops_agent_view',
              'core_role_view',
              'ff_featureflag_view',
              'core_audit_view',
              'gitops_repository_view',
              'core_file_view',
              'core_delegateconfiguration_view',
              'gitops_cluster_view',
              'core_organization_view',
              'core_delegate_view',
              'chaos_chaoshub_view',
              'chaos_chaosagent_view',
              'ff_environment_apiKeyView',
              'core_dashboards_view',
              'gitops_cert_view',
              'core_project_view',
              'core_secret_view',
              'sto_scan_view',
              'chaos_chaosworkflow_view',
              'core_service_view',
              'gitops_gpgkey_view',
              'core_variable_view',
              'ff_targetgroup_view',
              'chi_monitoredservice_view'
            ],
            allowedScopeLevels: ['organization'],
            description: 'View an organization',
            tags: null
          },
          scope: null,
          harnessManaged: true,
          createdAt: 1657610013246,
          lastModifiedAt: 1659944716062
        },
        resourceGroup: { identifier: '_all_organization_level_resources', name: 'All Organization Level Resources' },
        scope: { accountName: 'Harness', orgName: 'default', projectName: null },
        userGroupName: null
      },
      {
        roleAssignmentDTO: {
          roleAssignment: {
            identifier: 'role_assignment_j1kSNawxaErElKBZSYA6',
            resourceGroupIdentifier: '_all_resources_including_child_scopes',
            roleIdentifier: '_organization_admin',
            principal: { scopeLevel: null, identifier: 'lv0euRhKRCyiXWzS7pOg6g', type: 'USER' },
            disabled: false,
            managed: false
          },
          scope: { accountIdentifier: 'kmpySmUISimoRrJL6NL73w', orgIdentifier: 'default', projectIdentifier: null },
          createdAt: 1658914131667,
          lastModifiedAt: 1658914131667,
          harnessManaged: false
        },
        role: {
          role: {
            identifier: '_organization_admin',
            name: 'Organization Admin',
            permissions: [
              'core_governancePolicy_view',
              'core_governancePolicy_delete',
              'chaos_chaosworkflow_edit',
              'core_user_manage',
              'ff_environment_view',
              'core_resourcegroup_delete',
              'gitops_agent_delete',
              'core_secret_edit',
              'core_governancePolicySets_delete',
              'chi_slo_view',
              'gitops_cluster_delete',
              'core_delegateconfiguration_edit',
              'sto_issue_view',
              'core_project_delete',
              'core_role_view',
              'chaos_chaoshub_edit',
              'core_audit_view',
              'core_organization_delete',
              'gitops_cluster_view',
              'core_organization_view',
              'chi_monitoredservice_delete',
              'gitops_application_delete',
              'ff_featureflag_toggle',
              'gitops_cert_delete',
              'core_template_edit',
              'gitops_application_edit',
              'ff_environment_apiKeyDelete',
              'chaos_chaosagent_edit',
              'gitops_agent_edit',
              'chi_monitoredservice_view',
              'gitops_repository_edit',
              'chaos_chaosgameday_view',
              'core_governancePolicySets_edit',
              'core_environment_view',
              'core_environmentgroup_access',
              'gitops_cluster_edit',
              'core_usergroup_view',
              'chaos_chaosgameday_edit',
              'core_organization_edit',
              'chi_monitoredservice_edit',
              'core_environment_delete',
              'ff_targetgroup_delete',
              'gitops_repository_view',
              'chi_slo_delete',
              'ff_targetgroup_edit',
              'core_file_view',
              'chaos_chaoshub_delete',
              'chaos_chaosagent_view',
              'core_variable_delete',
              'core_dashboards_view',
              'core_project_view',
              'core_connector_edit',
              'core_service_access',
              'core_template_delete',
              'core_connector_access',
              'core_delegate_edit',
              'core_variable_view',
              'sto_testtarget_edit',
              'core_serviceaccount_view',
              'core_template_view',
              'gitops_application_view',
              'sto_exemption_view',
              'core_resourcegroup_view',
              'gitops_cert_edit',
              'gitops_gpgkey_edit',
              'core_pipeline_view',
              'ff_environment_apiKeyCreate',
              'core_user_view',
              'ff_environment_targetGroupEdit',
              'gitops_gpgkey_delete',
              'chi_slo_edit',
              'core_file_delete',
              'gitops_application_sync',
              'sto_exemption_approve',
              'core_file_access',
              'core_secret_delete',
              'core_governancePolicySets_evaluate',
              'core_delegateconfiguration_view',
              'ff_environment_edit',
              'chaos_chaosagent_delete',
              'chaos_chaoshub_view',
              'core_delegate_delete',
              'core_project_create',
              'core_secret_view',
              'sto_scan_view',
              'core_project_edit',
              'core_secret_access',
              'chi_monitoredservice_toggle',
              'core_service_view',
              'core_environmentgroup_edit',
              'ff_featureflag_edit',
              'core_setting_edit',
              'ff_targetgroup_view',
              'core_governancePolicy_edit',
              'sto_exemption_create',
              'core_role_edit',
              'core_service_edit',
              'core_dashboards_edit',
              'core_user_invite',
              'ff_featureflag_delete',
              'sto_testtarget_view',
              'core_delegateconfiguration_delete',
              'core_serviceaccount_delete',
              'gitops_repository_delete',
              'core_service_delete',
              'core_environmentgroup_view',
              'core_connector_view',
              'core_governancePolicySets_view',
              'core_environmentgroup_delete',
              'ff_target_view',
              'gitops_agent_view',
              'core_environment_access',
              'ff_featureflag_view',
              'core_variable_edit',
              'core_usergroup_manage',
              'core_serviceaccount_manageapikey',
              'core_role_delete',
              'core_delegate_view',
              'core_template_access',
              'ff_environment_apiKeyView',
              'core_pipeline_delete',
              'gitops_cert_view',
              'chaos_chaosworkflow_delete',
              'core_pipeline_edit',
              'chaos_chaosworkflow_view',
              'core_pipeline_execute',
              'gitops_gpgkey_view',
              'core_serviceaccount_edit',
              'core_resourcegroup_edit',
              'core_environment_edit',
              'core_connector_delete',
              'core_file_edit'
            ],
            allowedScopeLevels: ['organization'],
            description: 'Administer an existing organizationn',
            tags: null
          },
          scope: null,
          harnessManaged: true,
          createdAt: 1657610013233,
          lastModifiedAt: 1659944715787
        },
        resourceGroup: {
          identifier: '_all_resources_including_child_scopes',
          name: 'All Resources Including Child Scopes'
        },
        scope: { accountName: 'Harness', orgName: 'default', projectName: null },
        userGroupName: null
      },
      {
        roleAssignmentDTO: {
          roleAssignment: {
            identifier: 'role_assignment_IRloQliDQRXFD6tA2PcV',
            resourceGroupIdentifier: '_all_project_level_resources',
            roleIdentifier: '_project_viewer',
            principal: { scopeLevel: null, identifier: 'lv0euRhKRCyiXWzS7pOg6g', type: 'USER' },
            disabled: false,
            managed: false
          },
          scope: {
            accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
            orgIdentifier: 'default',
            projectIdentifier: 'new_projecr'
          },
          createdAt: 1659418553851,
          lastModifiedAt: 1659418553851,
          harnessManaged: true
        },
        role: {
          role: {
            identifier: '_project_viewer',
            name: 'Project Viewer',
            permissions: [
              'chaos_chaosgameday_view',
              'core_serviceaccount_view',
              'core_template_view',
              'core_governancePolicy_view',
              'gitops_application_view',
              'sto_exemption_view',
              'core_resourcegroup_view',
              'sto_testtarget_view',
              'core_environment_view',
              'ff_environment_view',
              'core_usergroup_view',
              'core_pipeline_view',
              'chi_slo_view',
              'core_environmentgroup_view',
              'core_connector_view',
              'core_user_view',
              'core_governancePolicySets_view',
              'sto_issue_view',
              'ff_target_view',
              'gitops_agent_view',
              'core_role_view',
              'ff_featureflag_view',
              'core_audit_view',
              'gitops_repository_view',
              'core_file_view',
              'core_delegateconfiguration_view',
              'gitops_cluster_view',
              'core_delegate_view',
              'chaos_chaoshub_view',
              'chaos_chaosagent_view',
              'ff_environment_apiKeyView',
              'gitops_cert_view',
              'core_project_view',
              'core_secret_view',
              'sto_scan_view',
              'chaos_chaosworkflow_view',
              'core_service_view',
              'gitops_gpgkey_view',
              'core_variable_view',
              'ff_targetgroup_view',
              'chi_monitoredservice_view'
            ],
            allowedScopeLevels: ['project'],
            description: 'View a project',
            tags: null
          },
          scope: null,
          harnessManaged: true,
          createdAt: 1657610013109,
          lastModifiedAt: 1659944715679
        },
        resourceGroup: { identifier: '_all_project_level_resources', name: 'All Project Level Resources' },
        scope: { accountName: 'Harness', orgName: 'default', projectName: 'new projecr' },
        userGroupName: null
      },
      {
        roleAssignmentDTO: {
          roleAssignment: {
            identifier: 'role_assignment_4kZuEl6ASBe1v6xkTgLd',
            resourceGroupIdentifier: '_all_project_level_resources',
            roleIdentifier: '_project_admin',
            principal: { scopeLevel: null, identifier: 'lv0euRhKRCyiXWzS7pOg6g', type: 'USER' },
            disabled: false,
            managed: false
          },
          scope: {
            accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
            orgIdentifier: 'default',
            projectIdentifier: 'new_projecr'
          },
          createdAt: 1659418554246,
          lastModifiedAt: 1659418554246,
          harnessManaged: false
        },
        role: {
          role: {
            identifier: '_project_admin',
            name: 'Project Admin',
            permissions: [
              'core_governancePolicy_view',
              'core_governancePolicy_delete',
              'chaos_chaosworkflow_edit',
              'core_user_manage',
              'ff_environment_view',
              'core_resourcegroup_delete',
              'gitops_agent_delete',
              'core_secret_edit',
              'core_governancePolicySets_delete',
              'chi_slo_view',
              'gitops_cluster_delete',
              'core_delegateconfiguration_edit',
              'sto_issue_view',
              'core_project_delete',
              'core_role_view',
              'chaos_chaoshub_edit',
              'core_audit_view',
              'gitops_cluster_view',
              'chi_monitoredservice_delete',
              'gitops_application_delete',
              'ff_featureflag_toggle',
              'gitops_cert_delete',
              'core_template_edit',
              'gitops_application_edit',
              'ff_environment_apiKeyDelete',
              'chaos_chaosagent_edit',
              'gitops_agent_edit',
              'chi_monitoredservice_view',
              'gitops_repository_edit',
              'chaos_chaosgameday_view',
              'core_governancePolicySets_edit',
              'core_environment_view',
              'core_environmentgroup_access',
              'gitops_cluster_edit',
              'core_usergroup_view',
              'chaos_chaosgameday_edit',
              'chi_monitoredservice_edit',
              'core_environment_delete',
              'ff_targetgroup_delete',
              'gitops_repository_view',
              'ff_targetgroup_edit',
              'chi_slo_delete',
              'core_file_view',
              'chaos_chaoshub_delete',
              'chaos_chaosagent_view',
              'core_variable_delete',
              'core_project_view',
              'core_connector_edit',
              'core_service_access',
              'core_template_delete',
              'core_connector_access',
              'core_delegate_edit',
              'core_variable_view',
              'sto_testtarget_edit',
              'core_serviceaccount_view',
              'core_template_view',
              'gitops_application_view',
              'sto_exemption_view',
              'core_resourcegroup_view',
              'gitops_cert_edit',
              'gitops_gpgkey_edit',
              'core_pipeline_view',
              'ff_environment_apiKeyCreate',
              'core_user_view',
              'ff_environment_targetGroupEdit',
              'gitops_gpgkey_delete',
              'chi_slo_edit',
              'core_file_delete',
              'gitops_application_sync',
              'sto_exemption_approve',
              'core_file_access',
              'core_secret_delete',
              'core_governancePolicySets_evaluate',
              'core_delegateconfiguration_view',
              'ff_environment_edit',
              'chaos_chaosagent_delete',
              'chaos_chaoshub_view',
              'core_delegate_delete',
              'core_secret_view',
              'sto_scan_view',
              'core_project_edit',
              'core_secret_access',
              'chi_monitoredservice_toggle',
              'core_service_view',
              'core_environmentgroup_edit',
              'ff_featureflag_edit',
              'core_setting_edit',
              'ff_targetgroup_view',
              'core_governancePolicy_edit',
              'sto_exemption_create',
              'core_role_edit',
              'core_service_edit',
              'core_user_invite',
              'ff_featureflag_delete',
              'sto_testtarget_view',
              'core_delegateconfiguration_delete',
              'core_serviceaccount_delete',
              'gitops_repository_delete',
              'core_service_delete',
              'core_environmentgroup_view',
              'core_connector_view',
              'core_governancePolicySets_view',
              'core_environmentgroup_delete',
              'ff_target_view',
              'gitops_agent_view',
              'core_environment_access',
              'ff_featureflag_view',
              'core_variable_edit',
              'core_usergroup_manage',
              'core_serviceaccount_manageapikey',
              'core_role_delete',
              'core_delegate_view',
              'ff_environment_apiKeyView',
              'core_template_access',
              'core_pipeline_delete',
              'gitops_cert_view',
              'chaos_chaosworkflow_delete',
              'core_pipeline_edit',
              'chaos_chaosworkflow_view',
              'core_pipeline_execute',
              'gitops_gpgkey_view',
              'core_serviceaccount_edit',
              'core_resourcegroup_edit',
              'core_environment_edit',
              'core_connector_delete',
              'core_file_edit'
            ],
            allowedScopeLevels: ['project'],
            description: 'Administrate an existing project.',
            tags: null
          },
          scope: null,
          harnessManaged: true,
          createdAt: 1657610013132,
          lastModifiedAt: 1659944715743
        },
        resourceGroup: { identifier: '_all_project_level_resources', name: 'All Project Level Resources' },
        scope: { accountName: 'Harness', orgName: 'default', projectName: 'new projecr' },
        userGroupName: null
      },
      {
        roleAssignmentDTO: {
          roleAssignment: {
            identifier: 'role_assignment_Zz757nXSNQzB9UAoktMn',
            resourceGroupIdentifier: '_all_resources_including_child_scopes',
            roleIdentifier: '_organization_viewer',
            principal: { scopeLevel: 'organization', identifier: 'org_default_ug', type: 'USER_GROUP' },
            disabled: false,
            managed: false
          },
          scope: { accountIdentifier: 'kmpySmUISimoRrJL6NL73w', orgIdentifier: 'default', projectIdentifier: null },
          createdAt: 1659415905284,
          lastModifiedAt: 1659415905284,
          harnessManaged: false
        },
        role: {
          role: {
            identifier: '_organization_viewer',
            name: 'Organization Viewer',
            permissions: [
              'chaos_chaosgameday_view',
              'core_serviceaccount_view',
              'core_template_view',
              'core_governancePolicy_view',
              'gitops_application_view',
              'sto_exemption_view',
              'core_resourcegroup_view',
              'sto_testtarget_view',
              'core_environment_view',
              'ff_environment_view',
              'core_usergroup_view',
              'core_pipeline_view',
              'chi_slo_view',
              'core_environmentgroup_view',
              'core_connector_view',
              'core_user_view',
              'core_governancePolicySets_view',
              'sto_issue_view',
              'ff_target_view',
              'gitops_agent_view',
              'core_role_view',
              'ff_featureflag_view',
              'core_audit_view',
              'gitops_repository_view',
              'core_file_view',
              'core_delegateconfiguration_view',
              'gitops_cluster_view',
              'core_organization_view',
              'core_delegate_view',
              'chaos_chaoshub_view',
              'chaos_chaosagent_view',
              'ff_environment_apiKeyView',
              'core_dashboards_view',
              'gitops_cert_view',
              'core_project_view',
              'core_secret_view',
              'sto_scan_view',
              'chaos_chaosworkflow_view',
              'core_service_view',
              'gitops_gpgkey_view',
              'core_variable_view',
              'ff_targetgroup_view',
              'chi_monitoredservice_view'
            ],
            allowedScopeLevels: ['organization'],
            description: 'View an organization',
            tags: null
          },
          scope: null,
          harnessManaged: true,
          createdAt: 1657610013246,
          lastModifiedAt: 1659944716062
        },
        resourceGroup: {
          identifier: '_all_resources_including_child_scopes',
          name: 'All Resources Including Child Scopes'
        },
        scope: { accountName: 'Harness', orgName: 'default', projectName: null },
        userGroupName: 'org default ug'
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: '2b385f34-40e2-41d4-bd01-a4d79f338f50'
}

export const userGroupsAggregateInfo = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 4,
    pageItemCount: 4,
    pageSize: 10,
    content: [
      {
        userGroupDTO: {
          accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
          orgIdentifier: 'default',
          projectIdentifier: 'new_projecr',
          identifier: 'new_ug',
          name: 'new ug',
          users: ['lv0euRhKRCyiXWzS7pOg6g'],
          notificationConfigs: [],
          externallyManaged: false,
          description: '',
          tags: {},
          ssoLinked: false
        },
        users: [
          {
            name: 'Admin',
            email: 'admin@harness.io',
            uuid: 'lv0euRhKRCyiXWzS7pOg6g',
            locked: false,
            disabled: false,
            externallyManaged: false
          }
        ],
        roleAssignmentsMetadataDTO: null,
        lastModifiedAt: 1660199598631
      },
      {
        userGroupDTO: {
          accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
          orgIdentifier: 'default',
          identifier: 'org_default_ug',
          name: 'org default ug',
          users: ['lv0euRhKRCyiXWzS7pOg6g'],
          notificationConfigs: [],
          externallyManaged: false,
          description: '',
          tags: {},
          ssoLinked: false
        },
        users: [
          {
            name: 'Admin',
            email: 'admin@harness.io',
            uuid: 'lv0euRhKRCyiXWzS7pOg6g',
            locked: false,
            disabled: false,
            externallyManaged: false
          }
        ],
        roleAssignmentsMetadataDTO: null,
        lastModifiedAt: 1660199598618
      },
      {
        userGroupDTO: {
          accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
          identifier: 'access_control',
          name: 'access control',
          users: ['0osgWsTZRsSZ8RWfjLRkEg', '19bYA-ooQZOTZQxf2N-VPA', 'lv0euRhKRCyiXWzS7pOg6g'],
          notificationConfigs: [],
          externallyManaged: false,
          description: '',
          tags: {},
          ssoLinked: false
        },
        users: [
          {
            name: 'Admin',
            email: 'admin@harness.io',
            uuid: 'lv0euRhKRCyiXWzS7pOg6g',
            locked: false,
            disabled: false,
            externallyManaged: false
          },
          {
            name: 'rbac2',
            email: 'rbac2@harness.io',
            uuid: '19bYA-ooQZOTZQxf2N-VPA',
            locked: false,
            disabled: false,
            externallyManaged: false
          },
          {
            name: 'default',
            email: 'default@harness.io',
            uuid: '0osgWsTZRsSZ8RWfjLRkEg',
            locked: false,
            disabled: false,
            externallyManaged: false
          }
        ],
        roleAssignmentsMetadataDTO: null,
        lastModifiedAt: 1660199598606
      },
      {
        userGroupDTO: {
          accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
          identifier: 'user_group',
          name: 'user group',
          users: [
            'nhLgdGgxS_iqa0KP5edC-w',
            '0osgWsTZRsSZ8RWfjLRkEg',
            'ZqXNvYmURnO46PX7HwgEtQ',
            '19bYA-ooQZOTZQxf2N-VPA',
            'BnTbQTIJS4SkadzYv0BcbA',
            'lv0euRhKRCyiXWzS7pOg6g'
          ],
          notificationConfigs: [],
          externallyManaged: false,
          description: '',
          tags: {},
          ssoLinked: false
        },
        users: [
          {
            name: 'Admin',
            email: 'admin@harness.io',
            uuid: 'lv0euRhKRCyiXWzS7pOg6g',
            locked: false,
            disabled: false,
            externallyManaged: false
          },
          {
            name: 'rbac1',
            email: 'rbac1@harness.io',
            uuid: 'BnTbQTIJS4SkadzYv0BcbA',
            locked: false,
            disabled: false,
            externallyManaged: false
          },
          {
            name: 'rbac2',
            email: 'rbac2@harness.io',
            uuid: '19bYA-ooQZOTZQxf2N-VPA',
            locked: false,
            disabled: false,
            externallyManaged: false
          },
          {
            name: 'default2fa',
            email: 'default2fa@harness.io',
            uuid: 'ZqXNvYmURnO46PX7HwgEtQ',
            locked: false,
            disabled: false,
            externallyManaged: false
          },
          {
            name: 'default',
            email: 'default@harness.io',
            uuid: '0osgWsTZRsSZ8RWfjLRkEg',
            locked: false,
            disabled: false,
            externallyManaged: false
          },
          {
            name: 'readonlyuser',
            email: 'readonlyuser@harness.io',
            uuid: 'nhLgdGgxS_iqa0KP5edC-w',
            locked: false,
            disabled: false,
            externallyManaged: false
          }
        ],
        roleAssignmentsMetadataDTO: null,
        lastModifiedAt: 1660199598566
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: '243dc76b-7e78-4585-8c2c-582443fa8f68'
}
