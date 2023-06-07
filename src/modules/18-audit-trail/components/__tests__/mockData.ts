/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const filters = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 8,
    pageItemCount: 8,
    pageSize: 100,
    content: [
      {
        name: 'create_action',
        identifier: 'create_action',
        orgIdentifier: null,
        projectIdentifier: null,
        filterProperties: {
          scopes: null,
          resources: null,
          modules: null,
          actions: ['CREATE'],
          environments: null,
          principals: null,
          startTime: null,
          endTime: null,
          tags: {},
          filterType: 'Audit'
        },
        filterVisibility: 'EveryOne'
      },
      {
        name: 'org_filter',
        identifier: '',
        orgIdentifier: null,
        projectIdentifier: null,
        filterProperties: {
          scopes: [
            { accountIdentifier: 'zEaak-FLS425IEO7OLzMUg', orgIdentifier: 'default' },
            { accountIdentifier: 'zEaak-FLS425IEO7OLzMUg', orgIdentifier: 'ce' }
          ],
          resources: null,
          modules: null,
          actions: null,
          environments: null,
          principals: null,
          startTime: null,
          endTime: null,
          tags: {},
          filterType: 'Audit'
        },
        filterVisibility: 'EveryOne'
      },
      {
        name: 'projects_2',
        identifier: 'projects_2',
        orgIdentifier: null,
        projectIdentifier: null,
        filterProperties: {
          scopes: [
            { accountIdentifier: 'zEaak-FLS425IEO7OLzMUg', orgIdentifier: 'default', projectIdentifier: 'tudors' },
            { accountIdentifier: 'zEaak-FLS425IEO7OLzMUg', orgIdentifier: 'default', projectIdentifier: 'Test_Yunus' }
          ],
          resources: null,
          modules: null,
          actions: null,
          environments: null,
          principals: null,
          startTime: null,
          endTime: null,
          tags: {},
          filterType: 'Audit'
        },
        filterVisibility: 'EveryOne'
      },
      {
        name: 'tesfilteravi',
        identifier: 'tesfilteravi',
        orgIdentifier: null,
        projectIdentifier: null,
        filterProperties: {
          scopes: null,
          resources: null,
          modules: ['CD', 'CE'],
          actions: ['CREATE', 'UPDATE', 'RESTORE'],
          environments: null,
          principals: null,
          startTime: null,
          endTime: null,
          tags: {},
          filterType: 'Audit'
        },
        filterVisibility: 'EveryOne'
      },
      {
        name: 'tesfilteravi1639466571986',
        identifier: 'tesfilteravi16394665719861639466571986',
        orgIdentifier: null,
        projectIdentifier: null,
        filterProperties: {
          scopes: null,
          resources: null,
          modules: ['CD', 'CE'],
          actions: ['CREATE', 'UPDATE', 'RESTORE'],
          environments: null,
          principals: null,
          startTime: null,
          endTime: null,
          tags: {},
          filterType: 'Audit'
        },
        filterVisibility: 'EveryOne'
      },
      {
        name: 'test_filter_avi',
        identifier: 'test_filter_avi',
        orgIdentifier: null,
        projectIdentifier: null,
        filterProperties: {
          scopes: null,
          resources: null,
          modules: null,
          actions: ['CREATE', 'UPDATE', 'DELETE', 'UPSERT'],
          environments: null,
          principals: null,
          startTime: null,
          endTime: null,
          tags: {},
          filterType: 'Audit'
        },
        filterVisibility: 'EveryOne'
      },
      {
        name: 'test_filter_saveing',
        identifier: 'test_filter_saveing',
        orgIdentifier: null,
        projectIdentifier: null,
        filterProperties: {
          scopes: null,
          resources: null,
          modules: null,
          actions: ['CREATE', 'DELETE', 'UPDATE', 'RESTORE'],
          environments: null,
          principals: null,
          startTime: null,
          endTime: null,
          tags: {},
          filterType: 'Audit'
        },
        filterVisibility: 'EveryOne'
      },
      {
        name: 'test_filter_saveing1639466511644',
        identifier: 'test_filter_saveing16394665116441639466511644',
        orgIdentifier: null,
        projectIdentifier: null,
        filterProperties: {
          scopes: null,
          resources: null,
          modules: null,
          actions: ['CREATE', 'DELETE', 'UPDATE', 'RESTORE'],
          environments: null,
          principals: null,
          startTime: null,
          endTime: null,
          tags: {},
          filterType: 'Audit'
        },
        filterVisibility: 'EveryOne'
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: 'c564944e-44c9-4469-a439-257c3a0a6b25'
}
