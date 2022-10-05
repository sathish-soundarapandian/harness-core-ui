/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getUpdatedDeploymentConfig, getUpdatedTemplateDetailsByRef } from '../ExecutionPanelUtils'
import { stepTemplateMock } from './mocks'

describe('ExecutionPanel utils Test', () => {
  test('should return updated deployment config with added template ref', () => {
    const data = {
      templateRefObj: { templateRef: 'http_project_level', versionLabel: 'v1' },
      deploymentConfig: {
        infrastructure: {},
        execution: {
          stepTemplateRefs: [
            { templateRef: 'org.http_org_level', versionLabel: 'v1' },
            { templateRef: 'account.accountSetup', versionLabel: 'v1' }
          ]
        }
      }
    }
    expect(getUpdatedDeploymentConfig(data)).toEqual({
      infrastructure: {},
      execution: {
        stepTemplateRefs: [
          { templateRef: 'org.http_org_level', versionLabel: 'v1' },
          { templateRef: 'account.accountSetup', versionLabel: 'v1' },
          { templateRef: 'http_project_level', versionLabel: 'v1' }
        ]
      }
    })
  })

  test('should return updated TemplateDetailsByRef obj', () => {
    const data = {
      templateDetailsObj: stepTemplateMock,
      templateDetailsByRef: {},
      templateRef: 'http_project_level'
    }
    expect(getUpdatedTemplateDetailsByRef(data)).toEqual({
      http_project_level: stepTemplateMock
    })
  })
})
