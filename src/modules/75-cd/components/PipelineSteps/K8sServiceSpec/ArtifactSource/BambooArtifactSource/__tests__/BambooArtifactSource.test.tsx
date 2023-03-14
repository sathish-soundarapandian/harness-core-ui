/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { Formik, MultiTypeInputType, MultiTypeInputValue } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import { ArtifactSourceBaseFactory } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBaseFactory'
import type { ArtifactListConfig, ServiceSpec } from 'services/cd-ng'
import * as artifactSourceUtils from '../../artifactSourceUtils'
import { KubernetesPrimaryArtifacts } from '../../../KubernetesArtifacts/KubernetesPrimaryArtifacts/KubernetesPrimaryArtifacts'
import { KubernetesSidecarArtifacts } from '../../../KubernetesArtifacts/KubernetesSidecarArtifacts/KubernetesSidecarArtifacts'

import {
  mockPlansResponse,
  mockArtifactPathsResponse,
  mockBuildsResponse,
  template,
  artifacts,
  templateTagRegex,
  artifactsTagRegex,
  artifactsWithValues,
  templateWithValues,
  path
} from '../mocks'

jest.mock('services/cd-ng', () => ({
  useGetPlansKey: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ...mockPlansResponse
      })
    }),
    refetch: jest.fn(),
    error: null
  })),
  useGetArtifactPathsForBamboo: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ...mockArtifactPathsResponse
      })
    }),
    refetch: jest.fn(),
    error: null
  })),

  useGetBuildsForBamboo: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ...mockBuildsResponse
      })
    }),
    refetch: jest.fn(),
    error: null
  }))
}))

jest.spyOn(artifactSourceUtils, 'fromPipelineInputTriggerTab')
jest.spyOn(artifactSourceUtils, 'isFieldfromTriggerTabDisabled')
jest.spyOn(artifactSourceUtils, 'resetTags').mockImplementation(() => jest.fn())

jest.mock('@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField', () => ({
  ...(jest.requireActual('@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField') as any),
  // eslint-disable-next-line react/display-name
  FormMultiTypeConnectorField: (props: any) => {
    return (
      <div>
        <button
          name={'changeFormMultiTypeConnectorField'}
          onClick={() => {
            props.onChange('value', MultiTypeInputValue.STRING, MultiTypeInputType.RUNTIME)
          }}
        >
          Form Multi Type Connector Field button
        </button>
      </div>
    )
  }
}))

describe('Bamboo Artifact Source tests', () => {
  test('Should match snapshot for Primary Bamboo artifact source', () => {
    const { container } = render(
      <TestWrapper>
        <KubernetesPrimaryArtifacts
          initialValues={{ artifacts: artifacts as ArtifactListConfig }}
          template={template as ServiceSpec}
          artifacts={artifacts as ArtifactListConfig}
          readonly={false}
          stageIdentifier="stage-0"
          artifactSourceBaseFactory={new ArtifactSourceBaseFactory()}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          stepViewType={StepViewType.DeploymentForm}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('Should match snapshot for Sidecar Bamboo artifact source from trigger', () => {
    const { container } = render(
      <TestWrapper>
        <KubernetesSidecarArtifacts
          initialValues={{ artifacts: artifacts as ArtifactListConfig }}
          template={template as ServiceSpec}
          artifacts={artifacts as ArtifactListConfig}
          readonly={false}
          stageIdentifier="stage-0"
          fromTrigger={true}
          artifactSourceBaseFactory={new ArtifactSourceBaseFactory()}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          stepViewType={StepViewType.DeploymentForm}
          path={path}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('Should match snapshot for Sidecar Bamboo artifact source with runtime tag regex', () => {
    const { container } = render(
      <TestWrapper>
        <KubernetesSidecarArtifacts
          initialValues={{ artifacts: artifactsTagRegex as ArtifactListConfig }}
          template={templateTagRegex as ServiceSpec}
          artifacts={artifactsTagRegex as ArtifactListConfig}
          readonly={false}
          stageIdentifier="stage-0"
          fromTrigger={true}
          artifactSourceBaseFactory={new ArtifactSourceBaseFactory()}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          stepViewType={StepViewType.DeploymentForm}
          path={path}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('Should match snapshot for Sidecar Bamboo artifact source with only tag as runtime input', async () => {
    const { container } = render(
      <TestWrapper>
        <Formik
          formName="test-form"
          initialValues={{ artifacts: artifactsWithValues as ArtifactListConfig }}
          onSubmit={jest.fn()}
        >
          {formik => (
            <KubernetesSidecarArtifacts
              initialValues={{ artifacts: artifactsWithValues as ArtifactListConfig }}
              template={templateWithValues as ServiceSpec}
              artifacts={artifactsWithValues as ArtifactListConfig}
              readonly={false}
              formik={formik}
              stageIdentifier="stage-0"
              artifactSourceBaseFactory={new ArtifactSourceBaseFactory()}
              allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
              stepViewType={StepViewType.DeploymentForm}
              path={path}
            />
          )}
        </Formik>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
