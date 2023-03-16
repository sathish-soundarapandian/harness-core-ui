/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ErrorHandlerProps } from '../../utils'

export const pipelineRbacError: ErrorHandlerProps = {
  data: {
    status: 'ERROR',
    code: 'NG_ACCESS_DENIED',
    message: 'Missing permission core_pipeline_edit',
    failedPermissionChecks: [
      {
        resourceScope: { accountIdentifier: 'testAcc', orgIdentifier: 'testOrg', projectIdentifier: 'test' },
        resourceType: 'PIPELINE',
        permission: 'core_pipeline_edit'
      }
    ]
  }
}

export const orgRbacError: ErrorHandlerProps = {
  data: {
    status: 'ERROR',
    code: 'NG_ACCESS_DENIED',
    message: 'Missing permission core_org_edit',
    failedPermissionChecks: [
      {
        resourceScope: { accountIdentifier: 'testAcc' },
        resourceType: 'ORGANIZATION',
        permission: 'core_organization_edit'
      }
    ]
  }
}

export const projectRbacError: ErrorHandlerProps = {
  data: {
    status: 'ERROR',
    code: 'NG_ACCESS_DENIED',
    message: 'Missing permission core_project_edit',
    failedPermissionChecks: [
      {
        resourceScope: { accountIdentifier: 'testAcc', orgIdentifier: 'testOrg' },
        resourceType: 'PROJECT',
        permission: 'core_project_edit'
      }
    ]
  }
}

export const mulitpleErrors: ErrorHandlerProps = {
  data: {
    status: 'ERROR',
    code: 'NG_ACCESS_DENIED',
    message: 'Missing permission core_project_edit',
    failedPermissionChecks: [
      {
        resourceScope: { accountIdentifier: 'testAcc', orgIdentifier: 'testOrg' },
        resourceType: 'CONNECTOR',
        permission: 'core_connector_view'
      },
      {
        resourceScope: { accountIdentifier: 'testAcc', orgIdentifier: 'testOrg2', projectIdentifier: 'proj123' },
        resourceType: 'CONNECTOR',
        permission: 'core_connector_edit'
      },
      {
        resourceScope: { accountIdentifier: 'testAcc', orgIdentifier: 'testOrg3' },
        resourceType: 'CONNECTOR',
        permission: 'core_connector_delete'
      }
    ]
  }
}

export const defaultError: ErrorHandlerProps = {
  data: {
    status: 'ERROR',
    code: 'INVALID_REQUEST',
    message: 'Invalid Request'
  }
}
