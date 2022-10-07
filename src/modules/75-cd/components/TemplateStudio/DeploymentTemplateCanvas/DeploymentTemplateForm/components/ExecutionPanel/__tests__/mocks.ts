/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { JsonNode } from 'services/pipeline-ng'

export interface DeploymentTemplateWrapperProps {
  deploymentConfigInitialValues?: JsonNode
}
export const initialValues = {
  infrastructure: {
    variables: [],
    fetchInstancesScript: {},
    instanceAttributes: [
      {
        name: 'hostname',
        jsonPath: '',
        description: ''
      }
    ],
    instancesListPath: ''
  },
  execution: {
    stepTemplateRefs: ['http_project_level']
  }
}

export const stepTemplateMock = {
  name: 'Test Http Template',
  identifier: 'Test_Http_Template',
  versionLabel: 'v1',
  type: 'Step',
  projectIdentifier: 'Yogesh_Test',
  orgIdentifier: 'default',
  tags: {},
  spec: {
    type: 'Http',
    timeout: '1m 40s',
    spec: { url: '<+input>', method: 'GET', headers: [], outputVariables: [], requestBody: '<+input>' }
  }
}
