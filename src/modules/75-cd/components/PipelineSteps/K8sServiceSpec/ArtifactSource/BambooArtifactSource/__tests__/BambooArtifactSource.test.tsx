/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Formik, FormikForm } from '@harness/uicore'

import * as cdng from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'
import type { ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'
import { ArtifactSourceBaseFactory } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBaseFactory'
import type { K8SDirectServiceStep } from '@cd/components/PipelineSteps/K8sServiceSpec/K8sServiceSpecInterface'
import {
  mockArtifactPathsResponse,
  mockBuildsResponse,
  mockPlansResponse
} from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/BambooArtifact/__test__/mock'

import { BambooArtifactSource } from '../BambooArtifactSource'
import { templateBambooArtifact, templateBambooArtifactWithoutJobName, commonFormikInitialValues } from '../mocks'

// Mock API and Functions
// const fetchConnectors = (): Promise<unknown> => Promise.resolve(mockConnectorsResponse.data)
const refetchPlans = jest.fn().mockReturnValue(mockPlansResponse.data)
const refetchArtifactPath = jest.fn().mockReturnValue(mockArtifactPathsResponse.data)
const refetchBambooBuild = jest.fn().mockReturnValue(mockBuildsResponse.data)

jest.mock('services/cd-ng', () => ({
  useGetPlansKey: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ...mockPlansResponse
      })
    }),
    refetch: refetchPlans,
    error: null
  })),
  useGetArtifactPathsForBamboo: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ...mockArtifactPathsResponse
      })
    }),
    refetch: refetchArtifactPath,
    error: null
  })),

  useGetBuildsForBamboo: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ...mockBuildsResponse
      })
    }),
    refetch: refetchBambooBuild,
    error: null
  }))
}))

const submitForm = jest.fn()

// Mock props and other data
const commonInitialValues: K8SDirectServiceStep = {
  customStepProps: {},
  deploymentType: 'ServerlessAwsLambda'
}

const artifactCommonPath = 'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.spec'
export const props: Omit<ArtifactSourceRenderProps, 'formik'> = {
  isPrimaryArtifactsRuntime: true,
  isSidecarRuntime: false,
  template: templateBambooArtifact,
  path: artifactCommonPath,
  initialValues: commonInitialValues,
  accountId: 'testAccoountId',
  projectIdentifier: 'testProject',
  orgIdentifier: 'testOrg',
  readonly: false,
  stageIdentifier: 'Stage_1',
  allowableTypes: [],
  fromTrigger: false,
  artifact: {
    identifier: '',
    type: 'Bamboo',
    spec: {
      planKey: '',
      artifactPaths: [],
      build: ''
    }
  },
  isSidecar: false,
  artifactPath: 'primary',
  isArtifactsRuntime: true,
  pipelineIdentifier: 'testPipeline',
  artifactSourceBaseFactory: new ArtifactSourceBaseFactory()
}

const renderComponent = (passedProps?: Omit<ArtifactSourceRenderProps, 'formik'>) => {
  return render(
    <TestWrapper>
      <Formik initialValues={commonFormikInitialValues} formName="bambooArtifact" onSubmit={submitForm}>
        {formikProps => (
          <FormikForm>
            {new BambooArtifactSource().renderContent({ formik: formikProps, ...(passedProps ?? props) })}
          </FormikForm>
        )}
      </Formik>
    </TestWrapper>
  )
}

describe('JenkinsArtifactSource tests', () => {
  beforeEach(() => {
    jest.spyOn(cdng, 'useGetArtifactPathsForBamboo').mockImplementation((): any => {
      return {
        loading: false,
        mutate: jest.fn().mockImplementation(() => {
          return Promise.resolve({
            ...mockArtifactPathsResponse
          })
        }),
        refetch: refetchArtifactPath
      }
    })
    refetchArtifactPath.mockReset()
  })

  test(`renders fine for all Runtime values`, () => {
    const { container } = renderComponent()

    expect(container.querySelector(`input[name='${artifactCommonPath}.artifacts.primary.spec.planKey']`)).not.toBeNull()
    expect(
      container.querySelector(`input[name='${artifactCommonPath}.artifacts.primary.spec.artifactPaths']`)
    ).not.toBeNull()
    expect(container.querySelector(`input[name='${artifactCommonPath}.artifacts.primary.spec.build']`)).not.toBeNull()
    expect(container).toMatchSnapshot()
  })

  test(`after selecting planKey, artifactPath should be fetched and loading will be shown till response comes`, async () => {
    const { container, queryByText } = renderComponent({
      ...props,
      artifact: {
        identifier: '',
        type: 'Bamboo',
        spec: {
          connectorRef: 'artifactBambooConnector',
          planKey: 'sampleJob',
          artifactPaths: '',
          build: ''
        }
      },
      template: templateBambooArtifactWithoutJobName
    })
    const loadingArtifactsOption = queryByText('loading')
    expect(loadingArtifactsOption).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})
