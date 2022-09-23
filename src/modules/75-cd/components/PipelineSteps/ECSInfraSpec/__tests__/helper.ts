/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { findByText, getAllByText, getByText, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

export const getYaml = (): string => `
pipeline:
    name: ECS Pipeline
    identifier: ECS_Pipeline
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
                          type: ECS
                          spec:
                              variables: []
                              manifests: []
                              artifacts: {}
                  infrastructure:
                      infrastructureDefinition:
                          type: ECS
                          spec: 
                              connectorRef: 'Aws_Connector_1'
              tags: {}`

export const invalidYaml = (): string => `
pipeline: 
    name: ECS Pipeline
    identifier: ECS_Pipeline
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

export const testConnectorRefChange = async (): Promise<void> => {
  const dialogs = document.getElementsByClassName('bp3-dialog')
  await waitFor(() => expect(dialogs).toHaveLength(1))
  const connectorSelectorDialog = dialogs[0] as HTMLElement
  const awsConnector1 = await findByText(connectorSelectorDialog, 'Aws Connector 1')
  await waitFor(() => expect(awsConnector1).toBeInTheDocument())
  const awsConnector2 = getAllByText(connectorSelectorDialog, 'Aws Connector 2')
  expect(awsConnector2).toHaveLength(2)
  userEvent.click(awsConnector1)
  const applySelected = getByText(connectorSelectorDialog, 'entityReference.apply')
  userEvent.click(applySelected)
  await waitFor(() => expect(document.getElementsByClassName('bp3-dialog')).toHaveLength(0))
}
