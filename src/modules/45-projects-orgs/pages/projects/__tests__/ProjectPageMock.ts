/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type {
  Project,
  ResponsePageInvite,
  ResponsePageUserMetadataDTO,
  ResponseProjectAggregateDTO
} from 'services/cd-ng'
import type { ResponseExecutionResponseCountOverview } from 'services/dashboard-service'
import type { ResponsePageRoleResponse } from 'services/rbac'

export const projectPageMock = {
  data: {
    status: 'SUCCESS',
    data: {
      pageCount: 1,
      itemCount: 6,
      pageSize: 50,
      content: [
        {
          projectResponse: {
            project: {
              orgIdentifier: 'testOrg',
              identifier: 'test',
              name: 'test',
              color: '#e6b800',
              modules: ['CD'],
              description: 'test',
              tags: { tag1: '', tag2: 'tag3' }
            },
            createdAt: null,
            lastModifiedAt: 1606799067248
          }
        },

        {
          projectResponse: {
            project: {
              orgIdentifier: 'Cisco_Meraki',
              identifier: 'Online_Banking',
              name: 'Online Banking',
              color: '#1c1c28',
              modules: ['CD', 'CV'],
              description: 'UI for the Payment',
              tags: { tag1: '', tag2: 'tag3' }
            },
            createdAt: null,
            lastModifiedAt: 1606799067248
          }
        },
        {
          projectResponse: {
            project: {
              orgIdentifier: 'Cisco_Meraki',
              identifier: 'Portal',
              name: 'Portal',
              color: '#ff8800',
              modules: ['CV'],
              description: 'Online users',
              tags: { tag1: '', tag2: 'tag3' }
            },
            createdAt: null,
            lastModifiedAt: 1606799067248
          }
        },
        {
          projectResponse: {
            project: {
              orgIdentifier: 'Cisco_Prime',
              identifier: 'Project_1',
              name: 'Project 1',
              color: '#e6b800',
              modules: [],
              description: '',
              tags: {}
            },
            createdAt: null,
            lastModifiedAt: 1606799067248
          }
        },
        {
          projectResponse: {
            project: {
              orgIdentifier: 'Cisco_Prime',
              identifier: 'Project_Demo',
              name: 'Project Demo',
              color: '#004fc4',
              modules: [],
              description: 'Demo project',
              tags: { tag1: '', tag2: 'tag3' }
            },
            createdAt: null,
            lastModifiedAt: 1606799067248
          }
        },
        {
          projectResponse: {
            project: {
              orgIdentifier: 'Harness',
              identifier: 'Drone_Data_Supplier',
              name: 'Drone Data Supplier',
              color: '#e67a00',
              modules: ['CD', 'CV', 'CI', 'CE', 'CF'],
              description: 'Drone',
              tags: { tag1: '', tag2: 'tag3' }
            },
            createdAt: null,
            lastModifiedAt: 1606799067248
          }
        },
        {
          projectResponse: {
            project: {
              orgIdentifier: 'Harness',
              identifier: 'Swagger',
              name: 'Swagger',
              color: '#e6b800',
              modules: ['CI'],
              description: 'Swagger 2.0',
              tags: { tag1: '', tag2: 'tag3' }
            },
            createdAt: null,
            lastModifiedAt: 1606799067248
          }
        }
      ],
      pageIndex: 0,
      empty: false,
      totalItems: 6
    },
    metaData: undefined,
    correlationId: '370210dc-a345-42fa-b3cf-69bd64eb5073'
  },
  loading: false
}

export const projectMockData = {
  data: {
    status: 'SUCCESS',
    data: {
      project: {
        orgIdentifier: 'testOrg',
        identifier: 'test',
        name: 'test',
        color: '#e6b800',
        modules: [],
        description: 'test',
        tags: { tag1: '', tag2: 'tag3' }
      }
    },
    metaData: undefined,
    correlationId: '88124a30-e021-4890-8466-c2345e1d42d6'
  },
  loading: false
}

export const projectMockDataWithModules = {
  data: {
    status: 'SUCCESS',
    data: {
      project: {
        orgIdentifier: 'testOrg',
        identifier: 'test',
        name: 'test',
        color: '#e6b800',
        modules: ['CD', 'CV', 'CI', 'CE', 'CF'],
        description: 'test',
        tags: { tag1: '', tag2: 'tag3' }
      }
    },
    metaData: undefined,
    correlationId: '88124a30-e021-4890-8466-c2345e1d42d6'
  },
  loading: false
}

export const OrgMockData = {
  data: {
    status: 'SUCCESS',
    data: {
      organization: {
        identifier: 'testOrg',
        name: 'Org Name',
        description: 'Description',
        tags: { tag1: '', tag2: 'tag3' }
      }
    },
    metaData: undefined,
    correlationId: '9f77f74d-c4ab-44a2-bfea-b4545c6a4a39'
  }
}

export const createMockData = {
  mutate: async () => {
    return {
      status: 'SUCCESS',
      data: {
        project: {
          orgIdentifier: 'testOrg',
          identifier: 'dummy_name',
          name: 'dummy name',
          color: '#0063F7',
          modules: [],
          description: '',
          tags: {}
        }
      },
      metaData: undefined,
      correlationId: '375d39b4-3552-42a2-a4e3-e6b9b7e51d44'
    }
  },
  loading: false
}

export const projectWithModules: Project = {
  orgIdentifier: 'testOrg',
  identifier: 'test',
  name: 'test',
  color: '#e6b800',
  modules: ['CD', 'CV', 'CI', 'CE', 'CF'],
  description: 'test',
  tags: { tag1: '', tag2: 'tag3' }
}

export const responseProjectAggregateDTO: ResponseProjectAggregateDTO = {
  status: 'SUCCESS',
  data: {
    projectResponse: {
      project: {
        orgIdentifier: 'testOrg',
        identifier: 'dummy_name',
        name: 'dummy name',
        color: '#0063F7',
        modules: ['CD', 'CV', 'CI', 'CE', 'CF'],
        description: '',
        tags: { tag1: '', tag2: 'tag3', tag4: 'tag3', tag5: 'tag3', tag6: 'tag3' }
      }
    },
    organization: {
      identifier: 'testOrg',
      name: 'Org Name',
      description: 'Description',
      tags: { tag1: '', tag2: 'tag3', tag4: 'tag3', tag5: 'tag3', tag6: 'tag3' }
    },
    admins: [{ name: 'example1', email: 'example1@email.com', uuid: '19bYA-ooQZOTZQxf2N-VPA' }],
    collaborators: [
      { name: 'example2', email: 'example2@email.com', uuid: 'BnTbQTIJS4SkadzYv0BcbA' },
      { name: 'example3', email: 'example3@email.com', uuid: 'nhLgdGgxS_iqa0KP5edC-w' },
      { name: 'example4', email: 'example4@email.com', uuid: 'ZqXNvYmURnO46PX7HwgEtQ' },
      { name: 'example5', email: 'example5@email.com', uuid: '0osgWsTZRsSZ8RWfjLRkEg' },
      { name: 'example6', email: 'example6@email.com', uuid: 'lv0euRhKRCyiXWzS7pOg6g' }
    ]
  },
  metaData: undefined,
  correlationId: '375d39b4-3552-42a2-a4e3-e6b9b7e51d44'
}

export const responseProjectAggregateDTOWithNoModules: ResponseProjectAggregateDTO = {
  status: 'SUCCESS',
  data: {
    projectResponse: {
      project: {
        orgIdentifier: 'testOrg',
        identifier: 'dummy_name',
        name: 'dummy name',
        color: '#0063F7',
        modules: [],
        description: '',
        tags: {}
      }
    },
    organization: {
      identifier: 'testOrg',
      name: 'Org Name',
      description: 'Description',
      tags: { tag1: '', tag2: 'tag3', tag4: 'tag3', tag5: 'tag3', tag6: 'tag3' }
    },
    admins: [{ name: 'example1', email: 'example1@email.com', uuid: '19bYA-ooQZOTZQxf2N-VPA' }],
    collaborators: [
      { name: 'example2', email: 'example2@email.com', uuid: 'BnTbQTIJS4SkadzYv0BcbA' },
      { name: 'example3', email: 'example3@email.com', uuid: 'nhLgdGgxS_iqa0KP5edC-w' },
      { name: 'example4', email: 'example4@email.com', uuid: 'ZqXNvYmURnO46PX7HwgEtQ' },
      { name: 'example5', email: 'example5@email.com', uuid: '0osgWsTZRsSZ8RWfjLRkEg' },
      { name: 'example6', email: 'example6@email.com', uuid: 'lv0euRhKRCyiXWzS7pOg6g' }
    ]
  },
  metaData: undefined,
  correlationId: '375d39b4-3552-42a2-a4e3-e6b9b7e51d44'
}

export const response = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
  correlationId: ''
}

export const userMockData: ResponsePageUserMetadataDTO = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 6,
    pageItemCount: 6,
    pageSize: 50,
    content: [
      { name: 'example1', email: 'example1@email.com', uuid: '19bYA-ooQZOTZQxf2N-VPA' },
      { name: 'example2', email: 'example2@email.com', uuid: 'BnTbQTIJS4SkadzYv0BcbA' },
      { name: 'example3', email: 'example3@email.com', uuid: 'nhLgdGgxS_iqa0KP5edC-w' },
      { name: 'example4', email: 'example4@email.com', uuid: 'ZqXNvYmURnO46PX7HwgEtQ' },
      { name: 'example5', email: 'example5@email.com', uuid: '0osgWsTZRsSZ8RWfjLRkEg' },
      { name: 'example6', email: 'example6@email.com', uuid: 'lv0euRhKRCyiXWzS7pOg6g' }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: undefined,
  correlationId: '5c453afd-179b-44f6-8fc7-6f30a5698453'
}

export const invitesMockData: ResponsePageInvite = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 4,
    pageItemCount: 4,
    pageSize: 50,
    content: [
      {
        id: '5f773f61cc54a42436326268',
        name: 'example4',
        accountIdentifier: 'testAcc',
        email: 'example4@email.com',
        roleBindings: [
          {
            roleIdentifier: 'role1',
            roleName: 'role 1',
            resourceGroupIdentifier: 'rg1',
            resourceGroupName: 'rg 1',
            managedRole: true
          }
        ],
        inviteType: 'ADMIN_INITIATED_INVITE',
        approved: false
      },
      {
        id: '5f773f61cc54a42436326267',
        name: 'example3',
        accountIdentifier: 'testAcc',
        email: 'example3@email.com',
        roleBindings: [
          {
            roleIdentifier: 'role1',
            roleName: 'role 1',
            resourceGroupIdentifier: 'rg1',
            resourceGroupName: 'rg 1',
            managedRole: true
          }
        ],
        inviteType: 'ADMIN_INITIATED_INVITE',
        approved: false
      },
      {
        id: '5f773f61cc54a42436326266',
        name: 'example2',
        accountIdentifier: 'testAcc',
        email: 'example2@email.com',
        roleBindings: [
          {
            roleIdentifier: 'role1',
            roleName: 'role 1',
            resourceGroupIdentifier: 'rg1',
            resourceGroupName: 'rg 1',
            managedRole: true
          }
        ],
        inviteType: 'ADMIN_INITIATED_INVITE',
        approved: false
      }
    ],
    pageIndex: 0,
    empty: false
  }
}

export const roleMockData: ResponsePageRoleResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 3,
    pageItemCount: 3,
    pageSize: 50,
    content: [
      {
        role: {
          identifier: '_project_admin',
          name: 'Project Admin',
          permissions: [
            'core_secret_delete',
            'core_pipeline_delete',
            'core_secret_edit',
            'core_connector_create',
            'core_project_view',
            'core_connector_edit',
            'core_secret_view',
            'core_pipeline_view',
            'core_project_edit',
            'core_connector_view',
            'core_pipeline_edit',
            'core_secret_create',
            'core_pipeline_execute',
            'core_project_delete',
            'core_connector_delete'
          ],
          allowedScopeLevels: ['project'],
          description: 'Administrate an existing project.',
          tags: {}
        },
        scope: { accountIdentifier: 'testAcc' },
        harnessManaged: true,
        createdAt: 1615180329305,
        lastModifiedAt: 1616929638331
      },
      {
        role: {
          identifier: '_project_viewer',
          name: 'Project Viewer',
          permissions: ['core_project_view', 'core_secret_view', 'core_pipeline_view', 'core_connector_view'],
          allowedScopeLevels: ['project'],
          description: 'View a project',
          tags: {}
        },
        scope: { accountIdentifier: 'testAcc' },
        harnessManaged: true,
        createdAt: 1615180329319,
        lastModifiedAt: 1616929638230
      },
      {
        role: {
          identifier: '_pipeline_executor',
          name: 'Pipeline Executor',
          permissions: ['core_pipeline_execute', 'core_secret_view', 'core_pipeline_view', 'core_connector_view'],
          allowedScopeLevels: ['project'],
          description: 'Execute a pipeline',
          tags: {}
        },
        scope: { accountIdentifier: 'testAcc' },
        harnessManaged: true,
        createdAt: 1616668636360,
        lastModifiedAt: 1616929638320
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: undefined,
  correlationId: 'f78f3b2d-b4f0-483e-a064-2aca8984ec9f'
}

export const getCountMockData: ResponseExecutionResponseCountOverview = {
  status: 'SUCCESS',
  data: {
    executionMessage: 'dummy execution message',
    executionStatus: 'SUCCESS'
  },
  metaData: undefined,
  correlationId: 'f78f3b2d-b4f0-483e-a064-2aca8984ec9f'
}
