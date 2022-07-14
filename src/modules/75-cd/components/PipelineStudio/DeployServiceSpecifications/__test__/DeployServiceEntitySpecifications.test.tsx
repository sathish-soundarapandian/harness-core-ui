/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Formik } from '@harness/uicore'
import { noop } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { DeployServiceStep } from '@cd/components/PipelineSteps/DeployServiceStep/DeployServiceStep'
import { KubernetesServiceSpec } from '@cd/components/PipelineSteps/K8sServiceSpec/K8sServiceSpec'
import { ServerlessAwsLambdaServiceSpec } from '@cd/components/PipelineSteps/ServerlessAwsLambdaServiceSpec/ServerlessAwsLambdaServiceSpec'
import {
  PipelineContext,
  PipelineContextInterface
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { StageType } from '@pipeline/utils/stageHelpers'
import DeployServiceEntitySpecifications from '../DeployServiceEntitySpecifications'
import { servicesV2Mock } from './servicesMock'
import newServiceEntityPipeline from './overrideSetPipeline.json'

const mockchildren = <div />
const getOverrideContextValue = (): PipelineContextInterface => {
  return {
    ...newServiceEntityPipeline,
    getStageFromPipeline: jest.fn().mockReturnValue({
      stage: {
        stage: {
          name: 'Stage 3',
          identifier: 's3',
          type: StageType.DEPLOY,
          description: '',
          spec: {}
        }
      }
    }),
    updateStage: jest.fn(),
    updatePipeline: jest.fn()
  } as any
}

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@wings-software/monaco-yaml/lib/esm/languageservice/yamlLanguageService', () => ({
  getLanguageService: jest.fn()
}))

jest.mock('services/cd-ng', () => ({
  useGetServiceList: jest.fn().mockImplementation(() => ({ loading: false, data: servicesV2Mock, refetch: jest.fn() })),
  useGetServiceV2: jest.fn().mockImplementation(() => ({ loading: false, data: {}, refetch: jest.fn() })),
  useGetRuntimeInputsServiceEntity: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: {}, refetch: jest.fn() }))
}))

// jest.mock('lodash-es', () => ({
//   ...(jest.requireActual('lodash-es') as Record<string, any>),
//   debounce: jest.fn(fn => {
//     fn.cancel = jest.fn()
//     return fn
//   }),
//   noop: jest.fn()
// }))

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const intersectionObserverMock = () => ({
  observe: () => null,
  unobserve: () => null
})

window.IntersectionObserver = jest.fn().mockImplementation(intersectionObserverMock)

describe('DeployServiceEntitySpecifications', () => {
  beforeAll(() => {
    factory.registerStep(new DeployServiceStep())
    factory.registerStep(new KubernetesServiceSpec())
    factory.registerStep(new ServerlessAwsLambdaServiceSpec())
  })
  test('deployServiceEntitySpecifications renders correctly', () => {
    const { container } = render(
      <TestWrapper>
        <Formik initialValues={{}} onSubmit={noop} formName="deployServiceSpecificationsTest">
          <PipelineContext.Provider value={getOverrideContextValue()}>
            <DeployServiceEntitySpecifications>{mockchildren}</DeployServiceEntitySpecifications>
          </PipelineContext.Provider>
        </Formik>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
