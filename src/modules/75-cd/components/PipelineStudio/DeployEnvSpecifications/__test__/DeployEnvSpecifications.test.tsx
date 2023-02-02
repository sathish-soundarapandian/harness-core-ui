/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import {
  PipelineContextInterface,
  PipelineContext
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { StageType } from '@pipeline/utils/stageHelpers'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import * as useValidationErrors from '@pipeline/components/PipelineStudio/PiplineHooks/useValidationErrors'
import basePipelineContext from './__mocks__/basePipelineContext.json'
import DeployEnvSpecifications from '../DeployEnvSpecifications'

const getOverrideContextValue = (): PipelineContextInterface => {
  return {
    ...basePipelineContext,
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
    updateStage: jest.fn().mockImplementation(() => ({ then: jest.fn() })),
    updatePipeline: jest.fn()
  } as any
}

jest.mock('services/cd-ng', () => ({
  useGetEnvironmentList: jest.fn().mockImplementation(() => ({ loading: false, data: {}, refetch: jest.fn() }))
}))

jest.mock('lodash-es', () => ({
  ...(jest.requireActual('lodash-es') as Record<string, any>),
  debounce: jest.fn(fn => {
    fn.cancel = jest.fn()
    return fn
  })
}))

const intersectionObserverMock = (): any => ({
  observe: () => null,
  unobserve: () => null
})

window.IntersectionObserver = jest.fn().mockImplementation(intersectionObserverMock)

jest.mock('@pipeline/components/AbstractSteps/StepWidget', () => ({
  ...(jest.requireActual('@pipeline/components/AbstractSteps/StepWidget') as any),
  // eslint-disable-next-line react/display-name
  StepWidget: (props: any) => {
    return (
      <div className="step-widget-mock">
        <button
          name={'updateStepWidget'}
          onClick={() => {
            props.onUpdate(props.initialValues)
          }}
        >
          Step Widget button
        </button>
        <div data-testid="envOrGroupLoader">
          {JSON.stringify(props.initialValues.environment || props.initialValues.environmentGroup)}
        </div>
      </div>
    )
  }
}))

describe('Deploy env specifications test', () => {
  test('Should show runtime if scope is not project', async () => {
    const context = getOverrideContextValue()
    render(
      <TestWrapper>
        <PipelineContext.Provider value={context}>
          <DeployEnvSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    await waitFor(() =>
      expect(screen.getByTestId('envOrGroupLoader')).toHaveTextContent('{"environmentRef":"<+input>"}')
    )
  })

  test('Should call submitFormsForTab when errorMap is not empty', async () => {
    const errorContextProvider = {
      state: {} as any,
      checkErrorsForTab: jest.fn().mockResolvedValue(Promise.resolve()),
      subscribeForm: () => undefined,
      unSubscribeForm: () => undefined,
      submitFormsForTab: jest.fn()
    }

    jest.spyOn(useValidationErrors, 'useValidationErrors').mockReturnValue({ errorMap: new Map([['error', []]]) })

    render(
      <TestWrapper>
        <PipelineContext.Provider value={getOverrideContextValue()}>
          <StageErrorContext.Provider value={errorContextProvider}>
            <DeployEnvSpecifications />
          </StageErrorContext.Provider>
        </PipelineContext.Provider>
      </TestWrapper>
    )

    expect(errorContextProvider.submitFormsForTab).toHaveBeenCalledTimes(1)
  })
})
