/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { DeploymentStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import type { PipelineInfoConfig } from 'services/pipeline-ng'
import { getEnvironmentIdentifierFromStage, getServiceIdentifierFromStage } from '../MonitoredService.utils'
import { mockedPipeline, mockedSelectedDerivedStage, mockedSelectedStageNewDesign } from './MonitoredService.mock'

describe('Unit tests for MonitoredService', () => {
  test('Verify if getServiceIdentifierFromStage method gives correct serviceIdentifier when service is derived from a stage', async () => {
    expect(
      getServiceIdentifierFromStage(
        mockedSelectedDerivedStage as StageElementWrapper<DeploymentStageElementConfig>,
        mockedPipeline as PipelineInfoConfig
      )
    ).toEqual('Newserviceharshil')
  })

  test('Verify if getServiceIdentifierFromStage method gives correct serviceIdentifier when service is not derived from a stage', async () => {
    const mockedSelectedStage = { ...mockedSelectedDerivedStage }
    mockedSelectedStage.stage.spec.serviceConfig = {
      serviceRef: 'service400',
      serviceDefinition: {
        type: 'Kubernetes',
        spec: {
          variables: []
        }
      }
    } as any

    expect(
      getServiceIdentifierFromStage(
        mockedSelectedStage as StageElementWrapper<DeploymentStageElementConfig>,
        mockedPipeline as PipelineInfoConfig
      )
    ).toEqual('service400')
  })

  test('Verify if getServiceIdentifierFromStage method gives correct serviceIdentifier when service from a stage from the new service Path', async () => {
    const mockedSelectedStage = { ...mockedSelectedStageNewDesign }
    expect(
      getServiceIdentifierFromStage(
        mockedSelectedStage as StageElementWrapper<DeploymentStageElementConfig>,
        mockedPipeline as PipelineInfoConfig
      )
    ).toEqual('service1')
  })

  test('Verify if getEnvironmentIdentifierFromStage method gives correct envIdentifier when env from a stage from the new env Path', async () => {
    const mockedSelectedStage = { ...mockedSelectedStageNewDesign }

    expect(
      getEnvironmentIdentifierFromStage(mockedSelectedStage as StageElementWrapper<DeploymentStageElementConfig>)
    ).toEqual('env1')
  })
})
