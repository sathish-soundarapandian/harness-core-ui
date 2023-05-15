/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { findByText, getAllByText, getByText, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

export const awsRegions = {
  resource: [
    {
      name: 'GovCloud (US-West)',
      value: 'us-gov-west-1',
      valueType: null
    },
    {
      name: 'GovCloud (US-East)',
      value: 'us-gov-east-1',
      valueType: null
    },
    {
      name: 'US East (N. Virginia)',
      value: 'us-east-1',
      valueType: null
    },
    {
      name: 'US East (Ohio)',
      value: 'us-east-2',
      valueType: null
    }
  ]
}

export const getYaml = (): string => `
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
                          type: AwsLambda
                          spec:
                              variables: []
                              manifests: []
                              artifacts: {}
                  infrastructure:
                      infrastructureDefinition:
                          type: AwsLambda
                          spec: 
                              connectorRef: 'Aws_Connector_1'
              tags: {}`

export const invalidYaml = (): string => `
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

export const testConnectorRefChange = async (): Promise<void> => {
  const dialogs = document.getElementsByClassName('bp3-dialog')
  await waitFor(() => expect(dialogs).toHaveLength(1))
  const connectorSelectorDialog = dialogs[0] as HTMLElement
  const awsConnector1 = await findByText(connectorSelectorDialog, 'Aws Connector 1')
  await waitFor(() => expect(awsConnector1).toBeInTheDocument())
  const awsConnector2 = getAllByText(connectorSelectorDialog, 'Aws Connector 2')
  expect(awsConnector2).toHaveLength(2)
  await userEvent.click(awsConnector1)
  const applySelected = getByText(connectorSelectorDialog, 'entityReference.apply')
  await userEvent.click(applySelected)
  await waitFor(() => expect(document.getElementsByClassName('bp3-dialog')).toHaveLength(0))
}
