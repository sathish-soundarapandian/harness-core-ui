/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { findByText, getByText, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

export const testConnectorRefChangeForGcp = async (): Promise<void> => {
  const dialogs = document.getElementsByClassName('bp3-dialog')
  await waitFor(() => expect(dialogs).toHaveLength(1))
  const connectorSelectorDialog = dialogs[0] as HTMLElement
  const gcpConnector = await findByText(connectorSelectorDialog, 'gcpConnector')
  await waitFor(() => expect(gcpConnector).toBeInTheDocument())
  userEvent.click(gcpConnector)
  const applySelected = getByText(connectorSelectorDialog, 'entityReference.apply')
  userEvent.click(applySelected)
  await waitFor(() => expect(document.getElementsByClassName('bp3-dialog')).toHaveLength(0))
}

export const getGcfYaml = (): string => `
pipeline:
    name: Aws Lambda Pipeline
    identifier: Aws_Lambda_Pipeline
    allowStageExecutions: false
    projectIdentifier: testProject
    orgIdentifier: default
    tags: {}
    stages:
        - stage:
              name: Stage 1
              identifier: Stage_1
              description: ""
              type: Deployment
              spec:
                  serviceConfig:
                      serviceRef: dascxzcsad
                      serviceDefinition:
                          type: GoogleCloudFunctions
                          spec:
                              variables: []
                              manifests: []
                              artifacts: {}
                  infrastructure:
                      infrastructureDefinition:
                          type: GoogleCloudFunctions
                          spec: 
                              connectorRef: 'gcpConnector'
              tags: {}`

export const invalidGcfYaml = (): string => `
pipeline: 
    name: AWS Lambda Pipeline
    identifier: AWS_Lambda_Pipeline
    projectIdentifier: testProject
    orgIdentifier: default
    stages
        - stage:
              name: Stage 1
              identifier: Stage_1
              type: Deployment
              spec:
              serviceConfig:

`
