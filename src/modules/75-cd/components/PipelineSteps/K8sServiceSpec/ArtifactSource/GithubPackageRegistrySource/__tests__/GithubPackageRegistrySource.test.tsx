/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { queryByAttribute, render, RenderResult } from '@testing-library/react'
import { Formik, FormikForm, MultiTypeInputType } from '@harness/uicore'

import { TestWrapper } from '@common/utils/testUtils'
import { connectorsData } from '@connectors/pages/connectors/__tests__/mockData'
import type { ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'
import { ArtifactSourceBaseFactory } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBaseFactory'
import type { K8SDirectServiceStep } from '@cd/components/PipelineSteps/K8sServiceSpec/K8sServiceSpecInterface'
import { GithubPackageRegistrySource } from '../GithubPackageRegistrySource'
import {
  commonFormikInitialValues,
  templateGithubPackageRegistry,
  templateGithubPackageRegistryWithVersionRegex
} from './mock'

// Mock API and Functions
const fetchConnectors = (): Promise<unknown> => Promise.resolve(connectorsData)
jest.mock('services/cd-ng', () => ({
  getConnectorListPromise: jest.fn().mockImplementation(() => Promise.resolve(connectorsData)),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: connectorsData.data.content[0], refetch: fetchConnectors, loading: false }
  })
}))

const submitForm = jest.fn()

// Mock props and other data
const commonInitialValues: K8SDirectServiceStep = {
  customStepProps: {},
  deploymentType: 'ServerlessAwsLambda'
}

const artifactCommonPath = 'pipeline.stages[0].stage.spec.seviceConfig.serviceDefinition.spec'
export const props: Omit<ArtifactSourceRenderProps, 'formik'> = {
  isPrimaryArtifactsRuntime: true,
  isSidecarRuntime: false,
  template: templateGithubPackageRegistry,
  path: artifactCommonPath,
  initialValues: commonInitialValues,
  accountId: 'testAccoountId',
  projectIdentifier: 'testProject',
  orgIdentifier: 'testOrg',
  readonly: false,
  stageIdentifier: 'Stage_1',
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
  fromTrigger: false,
  artifacts: {
    primary: {
      type: 'GithubPackageRegistry',
      spec: {
        connectorRef: '',
        org: '',
        packageName: '',
        version: ''
      }
    }
  },
  artifact: {
    identifier: '',
    type: 'GithubPackageRegistry',
    spec: {
      connectorRef: '<+input>',
      org: '<+input>',
      packageName: '<+input>',
      version: '<+input>'
    }
  },
  isSidecar: false,
  artifactPath: 'primary',
  isArtifactsRuntime: true,
  pipelineIdentifier: 'testPipeline',
  artifactSourceBaseFactory: new ArtifactSourceBaseFactory()
}

const renderComponent = (passedProps?: Omit<ArtifactSourceRenderProps, 'formik'>): RenderResult => {
  return render(
    <TestWrapper>
      <Formik initialValues={commonFormikInitialValues} formName="GithubPackageRegistry" onSubmit={submitForm}>
        {formikProps => (
          <FormikForm>
            {new GithubPackageRegistrySource().renderContent({ formik: formikProps, ...(passedProps ?? props) })}
          </FormikForm>
        )}
      </Formik>
    </TestWrapper>
  )
}

describe('GithubPackageRegistrySource tests', () => {
  beforeEach(() => {
    submitForm.mockReset()
  })

  test(`when isArtifactsRuntime is false`, () => {
    const { container } = renderComponent({ ...props, isArtifactsRuntime: false })

    expect(container.querySelector(`input[name='${artifactCommonPath}.artifacts.primary.spec.org']`)).toBeNull()
    expect(container.querySelector(`input[name='${artifactCommonPath}.artifacts.primary.spec.packageName']`)).toBeNull()
    expect(container.querySelector(`input[name='${artifactCommonPath}.artifacts.primary.spec.version']`)).toBeNull()
    expect(container).toMatchSnapshot()
  })

  test(`renders fine for all Runtime values when version is present`, () => {
    const { container } = renderComponent()

    expect(container.querySelector(`input[name='${artifactCommonPath}.artifacts.primary.spec.version']`)).not.toBeNull()
    expect(
      container.querySelector(`input[name='${artifactCommonPath}.artifacts.primary.spec.versionRegex']`)
    ).toBeNull()
    expect(container).toMatchSnapshot()
  })

  test(`renders fine for all Runtime values when versionRegex is present`, () => {
    const { container } = renderComponent({ ...props, template: templateGithubPackageRegistryWithVersionRegex })

    expect(
      container.querySelector(`input[name='${artifactCommonPath}.artifacts.primary.spec.versionRegex']`)
    ).not.toBeNull()
    expect(container.querySelector(`input[name='${artifactCommonPath}.artifacts.primary.spec.version']`)).toBeNull()
    expect(container).toMatchSnapshot()
  })

  test(`when readonly is true, all fields should be disabled`, () => {
    const { container } = renderComponent({ ...props, readonly: true })

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    const connnectorRefInput = queryByAttribute('data-testid', container, /connectorRef/)
    const orgInput = queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.org`)
    const packageNameInput = queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.packageName`)
    const versionInput = queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.version`)
    expect(connnectorRefInput).toBeDisabled()
    expect(orgInput).toBeDisabled()
    expect(packageNameInput).toBeDisabled()
    expect(versionInput).toBeDisabled()
  })
})
