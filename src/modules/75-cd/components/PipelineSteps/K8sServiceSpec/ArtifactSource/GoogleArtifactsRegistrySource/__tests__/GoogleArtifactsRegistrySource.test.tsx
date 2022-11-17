/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, queryByAttribute, render, waitFor, RenderResult, act } from '@testing-library/react'
import { Formik, FormikForm, MultiTypeInputType } from '@harness/uicore'

import { findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import { connectorsData } from '@connectors/pages/connectors/__tests__/mockData'

import type { ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'
import { ArtifactSourceBaseFactory } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBaseFactory'
import type { K8SDirectServiceStep } from '@cd/components/PipelineSteps/K8sServiceSpec/K8sServiceSpecInterface'
import { GoogleArtifactRegistrySource } from '../GoogleArtifactRegistrySource'
import {
  commonFormikInitialValues,
  templateGoogleArtifactRegistry,
  templateGoogleArtifactRegistryWithVersionRegex,
  templateGoogleArtifactRegistryWithRegionRuntime,
  templateGoogleArtifactRegistryWithVersionRuntime,
  buildData
} from './mock'

// Mock API and Functions
const regionData = {
  status: 'SUCCESS',
  data: [
    {
      name: 'us-east',
      value: 'us-east'
    },
    {
      name: 'us-east1',
      value: 'us-east1'
    }
  ],
  metaData: null,
  correlationId: '441c6388-e3df-44cd-86f8-ccc6f1a4558b'
}

const fetchConnectors = (): Promise<unknown> => Promise.resolve(connectorsData)
const fetchBuilds = jest.fn().mockReturnValue(buildData)
jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: connectorsData.data.content[0], refetch: fetchConnectors, loading: false }
  }),
  useGetBuildDetailsForGoogleArtifactRegistryV2: jest.fn().mockImplementation(() => {
    return { data: buildData, refetch: fetchBuilds, error: null, loading: false }
  }),
  useGetRegionsForGoogleArtifactRegistry: jest.fn().mockImplementation(() => {
    return { data: regionData }
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
  template: templateGoogleArtifactRegistry,
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
      type: 'GoogleArtifactRegistry',
      spec: {
        connectorRef: '',
        project: '',
        region: '',
        repositoryName: '',
        package: '',
        version: ''
      }
    }
  },
  artifact: {
    identifier: '',
    type: 'GoogleArtifactRegistry',
    spec: {
      connectorRef: '<+input>',
      project: '<+input>',
      region: '<+input>',
      repositoryName: '<+input>',
      package: '<+input>',
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
      <Formik initialValues={commonFormikInitialValues} formName="GoogleArtifactRegistry" onSubmit={submitForm}>
        {formikProps => (
          <FormikForm>
            {new GoogleArtifactRegistrySource().renderContent({ formik: formikProps, ...(passedProps ?? props) })}
          </FormikForm>
        )}
      </Formik>
    </TestWrapper>
  )
}

describe('GoogleArtifactRegistrySource tests', () => {
  beforeEach(() => {
    submitForm.mockReset()
  })

  test(`when isArtifactsRuntime is false`, () => {
    const { container } = renderComponent({ ...props, isArtifactsRuntime: false })

    expect(container.querySelector(`input[name='${artifactCommonPath}.artifacts.primary.spec.project']`)).toBeNull()
    expect(container.querySelector(`input[name='${artifactCommonPath}.artifacts.primary.spec.region']`)).toBeNull()
    expect(
      container.querySelector(`input[name='${artifactCommonPath}.artifacts.primary.spec.filePathRegex']`)
    ).toBeNull()
    expect(container.querySelector(`input[name='${artifactCommonPath}.artifacts.primary.spec.package']`)).toBeNull()
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

  test(`renders fine for all Runtime values when filePathRegex is present`, () => {
    const { container } = renderComponent({ ...props, template: templateGoogleArtifactRegistryWithVersionRegex })

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
    const packageInput = queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.package`)
    const repositoryNameInput = queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.repositoryName`)
    const projectInput = queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.project`)
    expect(connnectorRefInput).toBeDisabled()
    expect(packageInput).toBeDisabled()
    expect(repositoryNameInput).toBeDisabled()
    expect(projectInput).toBeDisabled()
  })

  test(`clicking on Region Name field should display list of regions and user can select from it`, async () => {
    const { container, getByText } = renderComponent({
      ...props,
      artifact: {
        identifier: '',
        type: 'GoogleArtifactRegistry',
        spec: {
          connectorRef: 'AWSX',
          project: 'testProject',
          region: '<+input>',
          repositoryName: 'testRepo',
          package: 'testPackage',
          version: 'testVersion'
        }
      },
      template: templateGoogleArtifactRegistryWithRegionRuntime
    })
    expect(container).toMatchSnapshot()
    const typeButton = container.querySelector('span[data-icon="fixed-input"]')
    fireEvent.click(typeButton as HTMLElement)
    const findPopover = findPopoverContainer()
    expect(findPopover).toBeTruthy()
    fireEvent.click(getByText('Expression'))
    expect(await waitFor(() => container.querySelector('.MultiTypeInput--EXPRESSION'))).toBeInTheDocument()
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip(`clicking on version list should fetch builds`, async () => {
    const { container } = renderComponent({
      ...props,
      artifact: {
        identifier: '',
        type: 'GoogleArtifactRegistry',
        spec: {
          connectorRef: 'AWSX',
          project: 'testProject',
          region: 'us-east',
          repositoryName: 'testRepo',
          package: 'testPackage',
          version: '<+input>'
        }
      },
      template: templateGoogleArtifactRegistryWithVersionRuntime
    })
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    const versionNameInput = queryByNameAttribute(
      `${artifactCommonPath}.artifacts.primary.spec.version`
    ) as HTMLInputElement
    expect(versionNameInput).not.toBeNull()
    expect(versionNameInput).not.toBeDisabled()
    expect(versionNameInput.value).toBe('')
    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)
    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    const versionNameDropDownIcon = dropdownIcons[0]
    act(() => {
      fireEvent.click(versionNameDropDownIcon)
    })

    await waitFor(() => {
      expect(fetchBuilds).toHaveBeenCalled()
    })
  })
})
