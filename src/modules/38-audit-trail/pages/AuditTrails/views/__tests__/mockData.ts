/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const data = {
  status: 'SUCCESS',
  data: {
    totalPages: 48,
    totalItems: 476,
    pageItemCount: 10,
    pageSize: 10,
    content: [
      {
        auditId: '61d80bcbdda3193d1dd55c6c',
        resourceScope: {
          accountIdentifier: 'px7xd_BFRCi-pfWPYXVjvw',
          orgIdentifier: 'default',
          projectIdentifier: 'Test_Kapil_Modal'
        },
        httpRequestInfo: { requestMethod: 'POST' },
        requestMetadata: { clientIP: '192.195.83.11' },
        timestamp: 1641548745537,
        authenticationInfo: {
          principal: { type: 'USER', identifier: 'samarth.sharma@harness.io' },
          labels: { userId: '0E8JGUiiSxK7x2OhbnnTHA', username: 'Samarth Sharma' }
        },
        module: 'PMS',
        resource: { type: 'INPUT_SET', identifier: 'set_name', labels: { pipelineIdentifier: 'create_a_pipe' } },
        action: 'CREATE'
      },
      {
        auditId: '61d80981dda3193d1dd55bf4',
        resourceScope: {
          accountIdentifier: 'px7xd_BFRCi-pfWPYXVjvw',
          orgIdentifier: 'deafult',
          projectIdentifier: 'testprojectone'
        },
        httpRequestInfo: { requestMethod: 'PUT' },
        requestMetadata: { clientIP: '125.19.67.142' },
        timestamp: 1641548158577,
        authenticationInfo: {
          principal: { type: 'USER', identifier: 'sunnykesh.shandilya@harness.io' }
        },
        module: 'CORE',
        resource: { type: 'PIPELINE', identifier: 'dummyPpeline' },
        action: 'UPDATE'
      },
      {
        auditId: '61d8097ddda3193d1dd55bf2',
        resourceScope: {
          accountIdentifier: 'px7xd_BFRCi-pfWPYXVjvw',
          orgIdentifier: 'default',
          projectIdentifier: 'Test_Kapil_Modal'
        },
        httpRequestInfo: { requestMethod: 'POST' },
        requestMetadata: { clientIP: '192.195.83.11' },
        timestamp: 1641548157415,
        authenticationInfo: {
          principal: { type: 'USER' },
          labels: { userId: '0E8JGUiiSxK7x2OhbnnTHA', username: 'Samarth Sharma' }
        },
        module: 'CORE',
        resource: { type: 'PIPELINE', identifier: 'create_a_pipe' },
        action: 'CREATE'
      },
      {
        auditId: '61d80961dda3193d1dd55bee',
        resourceScope: {
          accountIdentifier: 'px7xd_BFRCi-pfWPYXVjvw'
        },
        httpRequestInfo: { requestMethod: 'POST' },
        requestMetadata: { clientIP: '125.19.67.142' },
        timestamp: 1641548128846,
        authenticationInfo: {
          principal: { type: 'USER', identifier: 'sunnykesh.shandilya@harness.io' },
          labels: { userId: 'qy-58B7HQH2aNi_UrakVLg', username: 'sunnykesh.shandilya@harness.io' }
        },
        module: 'CORE',
        resource: { type: 'CONNECTOR', identifier: 'dummyk8', labels: { resourceName: 'dummyk8' } },
        action: 'CREATE'
      },
      {
        auditId: '61d80401dda3193d1dd559e7',
        resourceScope: {
          accountIdentifier: 'px7xd_BFRCi-pfWPYXVjvw',
          orgIdentifier: 'default',
          projectIdentifier: 'samarth_ci_project'
        },
        httpRequestInfo: { requestMethod: 'POST' },
        requestMetadata: { clientIP: '192.195.83.11' },
        timestamp: 1641546752488,
        authenticationInfo: {
          principal: { type: 'USER', identifier: 'samarth.sharma@harness.io' },
          labels: { userId: '0E8JGUiiSxK7x2OhbnnTHA', username: 'Samarth Sharma' }
        },
        module: 'TEMPLATESERVICE',
        resource: { type: 'TEMPLATE', identifier: 'new_stage_name', labels: { versionLabel: 'Version1' } },
        action: 'CREATE',
        auditEventData: { type: 'TemplateAuditEventData', comments: '', templateUpdateEventType: null }
      },
      {
        auditId: '61d7eedddda3193d1dd55402',
        resourceScope: {
          accountIdentifier: 'px7xd_BFRCi-pfWPYXVjvw',
          orgIdentifier: 'deafult',
          projectIdentifier: 'testprojectone'
        },
        httpRequestInfo: { requestMethod: 'PUT' },
        requestMetadata: { clientIP: '125.19.67.142' },
        timestamp: 1641541340158,
        authenticationInfo: {
          principal: { type: 'USER', identifier: 'sunnykesh.shandilya@harness.io' },
          labels: { userId: 'qy-58B7HQH2aNi_UrakVLg', username: 'sunnykesh.shandilya@harness.io' }
        },
        module: 'CORE',
        resource: { type: 'PIPELINE', identifier: 'dummyPpeline' },
        action: 'UPDATE'
      },
      {
        auditId: '61d7e9a8dda3193d1dd553a5',
        resourceScope: {
          accountIdentifier: 'px7xd_BFRCi-pfWPYXVjvw',
          orgIdentifier: 'deafult',
          projectIdentifier: 'testddd'
        },
        httpRequestInfo: { requestMethod: 'POST' },
        requestMetadata: { clientIP: '192.195.83.11' },
        timestamp: 1641540007613,
        authenticationInfo: {
          principal: { type: 'USER', identifier: 'sihuay.goh@harness.io' },
          labels: { userId: '4_dJA2FPTRmM_NdTzWVbYg', username: 'Robyn Goh' }
        },
        module: 'CORE',
        resource: { type: 'ENVIRONMENT', identifier: 'test' },
        action: 'CREATE'
      },
      {
        auditId: '61d7e343dda3193d1dd54dbf',
        resourceScope: {
          accountIdentifier: 'px7xd_BFRCi-pfWPYXVjvw',
          orgIdentifier: 'deafult',
          projectIdentifier: 'testprojectone'
        },
        httpRequestInfo: { requestMethod: 'PUT' },
        requestMetadata: { clientIP: '192.195.83.11' },
        timestamp: 1641538367940,
        authenticationInfo: {
          principal: { type: 'USER', identifier: 'sunnykesh.shandilya@harness.io' },
          labels: { userId: 'qy-58B7HQH2aNi_UrakVLg', username: 'sunnykesh.shandilya@harness.io' }
        },
        module: 'CORE',
        resource: { type: 'PIPELINE', identifier: 'dummyPpeline' },
        action: 'UPDATE'
      },
      {
        auditId: '61d7e33edda3193d1dd54dbd',
        resourceScope: {
          accountIdentifier: 'px7xd_BFRCi-pfWPYXVjvw',
          orgIdentifier: 'deafult',
          projectIdentifier: 'testprojectone'
        },
        httpRequestInfo: { requestMethod: 'PUT' },
        requestMetadata: { clientIP: '192.195.83.11' },
        timestamp: 1641538362875,
        authenticationInfo: {
          principal: { type: 'USER', identifier: 'sunnykesh.shandilya@harness.io' },
          labels: { userId: 'qy-58B7HQH2aNi_UrakVLg', username: 'sunnykesh.shandilya@harness.io' }
        },
        module: 'CORE',
        resource: { type: 'PIPELINE', identifier: 'dummyPpeline' },
        action: 'UPDATE'
      },
      {
        auditId: '61d7e2b2dda3193d1dd54db9',
        resourceScope: {
          accountIdentifier: 'px7xd_BFRCi-pfWPYXVjvw',
          orgIdentifier: 'deafult',
          projectIdentifier: 'testprojectone'
        },
        httpRequestInfo: { requestMethod: 'POST' },
        requestMetadata: { clientIP: '192.195.83.11' },
        timestamp: 1641538226568,
        authenticationInfo: {
          principal: { type: 'USER', identifier: 'sunnykesh.shandilya@harness.io' },
          labels: { userId: 'qy-58B7HQH2aNi_UrakVLg', username: 'sunnykesh.shandilya@harness.io' }
        },
        module: 'CORE',
        resource: { type: 'PIPELINE', identifier: 'dummyPpeline' },
        action: 'CREATE'
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: 'dba8b445-4956-4360-93eb-6a08af3bded6'
}
