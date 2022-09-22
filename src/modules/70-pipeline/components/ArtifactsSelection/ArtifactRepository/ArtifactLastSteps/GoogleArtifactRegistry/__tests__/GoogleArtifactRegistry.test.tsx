/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  act,
  findByText,
  fireEvent,
  queryByAttribute,
  render,
  waitFor,
  getByText as getElementByText
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AllowedTypesWithRunTime, MultiTypeInputType, RUNTIME_INPUT_VALUE, StepProps } from '@harness/uicore'
import type * as cdng from 'services/cd-ng'

import { TestWrapper } from '@common/utils/testUtils'
import {
  ArtifactType,
  TagTypes,
  GoogleArtifactRegistryInitialValuesType,
  GoogleArtifactRegistryProps
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { ModalViewFor } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { GoogleArtifactRegistry } from '../GoogleArtifactRegistry'

const commonInitialValues: GoogleArtifactRegistryInitialValuesType = {
  identifier: '',
  versionType: TagTypes.Value,
  spec: {
    connectorRef: '',
    package: '',
    repositoryType: 'docker',
    project: '',
    region: { label: '', value: '' } as any,
    repositoryName: '',
    version: ''
  }
}

const buildData = {
  status: 'SUCCESS',
  data: {
    buildDetailsList: [
      {
        version: 'v3.0'
      },
      {
        version: 'v1.0'
      },
      {
        version: 'latest'
      }
    ]
  },
  metaData: null,
  correlationId: '441c6388-e3df-44cd-86f8-ccc6f1a4558b'
}

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
const fetchBuilds = jest.fn().mockReturnValue(buildData)

jest.mock('services/cd-ng', () => ({
  useGetBuildDetailsForGoogleArtifactRegistry: jest.fn().mockImplementation(() => {
    return { data: buildData, refetch: fetchBuilds, error: null, loading: false }
  }),
  useGetRegionsForGoogleArtifactRegistry: jest.fn().mockImplementation(() => {
    return { data: regionData }
  })
}))

const onSubmit = jest.fn()
export const props: Omit<StepProps<cdng.ConnectorConfigDTO> & GoogleArtifactRegistryProps, 'initialValues'> = {
  key: 'key',
  name: 'Artifact details',
  expressions: [],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  context: 1,
  handleSubmit: onSubmit,
  artifactIdentifiers: [],
  selectedArtifact: 'GoogleArtifactRegistry' as ArtifactType,
  prevStepData: {
    connectorId: {
      value: 'testConnector'
    }
  }
}

const doConfigureOptionsTesting = async (cogModal: HTMLElement, fieldElement: HTMLInputElement) => {
  // Type regex and submit
  // check if field has desired value
  await waitFor(() => expect(getElementByText(cogModal, 'common.configureOptions.regex')).toBeInTheDocument())
  const regexRadio = getElementByText(cogModal, 'common.configureOptions.regex')
  userEvent.click(regexRadio)
  const regexTextArea = queryByAttribute('name', cogModal, 'regExValues')
  act(() => {
    fireEvent.change(regexTextArea!, { target: { value: '<+input>.includes(/test/)' } })
  })
  const cogSubmit = getElementByText(cogModal, 'submit')
  userEvent.click(cogSubmit)
  await waitFor(() => expect(fieldElement.value).toBe('<+input>.regex(<+input>.includes(/test/))'))
}

describe('GoogleArtifactRegistry tests', () => {
  beforeEach(() => {
    fetchBuilds.mockReset(), onSubmit.mockReset()
  })
  test(`renders fine for the NEW artifact`, () => {
    const { container } = render(
      <TestWrapper>
        <GoogleArtifactRegistry initialValues={commonInitialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders fine for the versionType as value`, async () => {
    const initialValues = {
      type: 'GoogleArtifactRegistry',
      ...commonInitialValues,
      spec: {
        ...commonInitialValues.spec,
        project: 'testProject',
        package: 'testPackage',
        region: { label: 'us-east1', value: 'us-east1' } as any,
        repositoryName: 'testRepo',
        version: 'xyz.zip'
      }
    }
    const { container, getByText } = render(
      <TestWrapper>
        <GoogleArtifactRegistry initialValues={initialValues as any} {...props} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    expect(queryByNameAttribute('spec.project')).not.toBeNull()
    expect(queryByNameAttribute('spec.region')).not.toBeNull()
    expect(queryByNameAttribute('spec.repositoryName')).not.toBeNull()
    expect(queryByNameAttribute('spec.version')).not.toBeNull()
    expect(container).toMatchSnapshot()

    const submitBtn = getByText('submit')
    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(props.handleSubmit).toBeCalled()
      expect(props.handleSubmit).toHaveBeenCalledWith({
        spec: {
          connectorRef: 'testConnector',
          project: 'testProject',
          package: 'testPackage',

          region: 'us-east1',
          repositoryName: 'testRepo',
          repositoryType: 'docker',
          version: 'xyz.zip'
        }
      })
    })
  })

  test(`renders fine for sidecar artifact`, async () => {
    const initialValues = {
      type: 'GoogleArtifactRegistry',
      ...commonInitialValues,
      identifier: 'initial_id',
      spec: {
        ...commonInitialValues.spec,
        project: 'testProject',
        package: 'testPackage',

        region: { label: 'us-east1', value: 'us-east1' } as any,
        repositoryName: 'testRepo',
        version: 'xyz.zip'
      }
    }
    const { container, getByText } = render(
      <TestWrapper>
        <GoogleArtifactRegistry initialValues={initialValues as any} {...props} context={ModalViewFor.SIDECAR} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    const identifierField = queryByNameAttribute('identifier') as HTMLInputElement
    expect(identifierField.value).toBe('initial_id')
    // change value of identifier to empty
    act(() => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: '' } })
    })

    const submitBtn = getByText('submit')
    fireEvent.click(submitBtn)

    const identifierRequiredErr = await findByText(container, 'common.validation.nameIsRequired')
    expect(identifierRequiredErr).toBeDefined()

    // change value of identifier
    act(() => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'test_id' } })
    })

    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(props.handleSubmit).toBeCalled()
      expect(props.handleSubmit).toHaveBeenCalledWith({
        identifier: 'test_id',
        spec: {
          connectorRef: 'testConnector',
          project: 'testProject',
          package: 'testPackage',

          region: 'us-east1',
          repositoryName: 'testRepo',
          repositoryType: 'docker',
          version: 'xyz.zip'
        }
      })
    })
  })

  test(`renders fine for the versionType as regex`, async () => {
    const initialValues = {
      type: 'GoogleArtifactRegistry',
      ...commonInitialValues,
      versionType: TagTypes.Regex,
      spec: {
        ...commonInitialValues.spec,
        project: 'testProject',
        package: 'testPackage',

        region: { label: 'us-east1', value: 'us-east1' } as any,
        repositoryName: 'testRepo',
        versionRegex: '*.zip'
      }
    }
    const { container, getByText } = render(
      <TestWrapper>
        <GoogleArtifactRegistry initialValues={initialValues as any} {...props} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    expect(queryByNameAttribute('spec.project')).not.toBeNull()
    expect(queryByNameAttribute('spec.region')).not.toBeNull()
    expect(queryByNameAttribute('spec.repositoryName')).not.toBeNull()
    expect(queryByNameAttribute('spec.versionRegex')).not.toBeNull()
    expect(container).toMatchSnapshot()

    const submitBtn = getByText('submit')
    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(props.handleSubmit).toBeCalled()
      expect(props.handleSubmit).toHaveBeenCalledWith({
        spec: {
          connectorRef: 'testConnector',
          package: 'testPackage',

          project: 'testProject',
          region: 'us-east1',
          repositoryName: 'testRepo',
          repositoryType: 'docker',
          versionRegex: '*.zip'
        }
      })
    })
  })

  test(`configure values should work fine when all values are runtime input and versionType as value`, async () => {
    const initialValues = {
      type: 'GoogleArtifactRegistry',
      ...commonInitialValues,
      spec: {
        ...commonInitialValues.spec,
        project: RUNTIME_INPUT_VALUE,
        package: RUNTIME_INPUT_VALUE,

        region: RUNTIME_INPUT_VALUE,
        repositoryName: RUNTIME_INPUT_VALUE,
        version: RUNTIME_INPUT_VALUE
      }
    }
    const { container } = render(
      <TestWrapper>
        <GoogleArtifactRegistry initialValues={initialValues as any} {...props} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    const versionInput = queryByNameAttribute('spec.version') as HTMLInputElement
    expect(versionInput).not.toBeNull()

    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    // Configure options testing for bucketName and filePath fields
    const cogVersion = document.getElementById('configureOptions_version')
    userEvent.click(cogVersion!)
    await waitFor(() => expect(modals.length).toBe(1))
    const versionCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(versionCOGModal, versionInput)

    const submitBtn = getElementByText(container, 'submit')
    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(props.handleSubmit).toBeCalled()
      expect(props.handleSubmit).toHaveBeenCalledWith({
        spec: {
          connectorRef: 'testConnector',
          project: '<+input>',
          package: '<+input>',
          region: '<+input>',
          repositoryName: '<+input>',
          repositoryType: 'docker',
          version: '<+input>.regex(<+input>.includes(/test/))'
        }
      })
    })
  })

  test(`configure values should work fine when all values are runtime input and versionType as regex`, async () => {
    const initialValues = {
      type: 'GoogleArtifactRegistry',
      ...commonInitialValues,
      versionType: TagTypes.Regex,
      spec: {
        ...commonInitialValues.spec,
        project: RUNTIME_INPUT_VALUE,
        package: RUNTIME_INPUT_VALUE,
        region: RUNTIME_INPUT_VALUE,
        repositoryName: RUNTIME_INPUT_VALUE,
        versionRegex: RUNTIME_INPUT_VALUE
      }
    }
    const { container } = render(
      <TestWrapper>
        <GoogleArtifactRegistry initialValues={initialValues as any} {...props} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    const projectInput = queryByNameAttribute('spec.project') as HTMLInputElement
    const regionInput = queryByNameAttribute('spec.region') as HTMLInputElement
    const packageInput = queryByNameAttribute('spec.package') as HTMLInputElement
    const repositoryNameInput = queryByNameAttribute('spec.repositoryName') as HTMLInputElement
    const versionRegexInput = queryByNameAttribute('spec.versionRegex') as HTMLInputElement
    expect(projectInput).not.toBeNull()
    expect(regionInput).not.toBeNull()
    expect(repositoryNameInput).not.toBeNull()
    expect(versionRegexInput).not.toBeNull()

    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    // Configure options testing for bucketName and filePath fields
    const cogProject = document.getElementById('configureOptions_project')
    userEvent.click(cogProject!)
    await waitFor(() => expect(modals.length).toBe(1))
    const projectCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(projectCOGModal, projectInput)

    const cogRegion = document.getElementById('configureOptions_region')
    userEvent.click(cogRegion!)
    await waitFor(() => expect(modals.length).toBe(1))
    const regionCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(regionCOGModal, regionInput)

    const cogPackage = document.getElementById('configureOptions_package')
    userEvent.click(cogPackage!)
    await waitFor(() => expect(modals.length).toBe(1))
    const packageCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(packageCOGModal, packageInput)

    const cogRepositoryName = document.getElementById('configureOptions_repositoryName')
    userEvent.click(cogRepositoryName!)
    await waitFor(() => expect(modals.length).toBe(1))
    const repositoryNameCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(repositoryNameCOGModal, repositoryNameInput)

    const cogVersionRegex = document.getElementById('configureOptions_versionRegex')
    userEvent.click(cogVersionRegex!)
    await waitFor(() => expect(modals.length).toBe(2))
    const versionRegexCOGModal = modals[1] as HTMLElement
    await doConfigureOptionsTesting(versionRegexCOGModal, versionRegexInput)

    const submitBtn = getElementByText(container, 'submit')
    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(props.handleSubmit).toBeCalled()
      expect(props.handleSubmit).toHaveBeenCalledWith({
        spec: {
          connectorRef: 'testConnector',
          project: '<+input>.regex(<+input>.includes(/test/))',
          package: '<+input>.regex(<+input>.includes(/test/))',
          region: '<+input>.regex(<+input>.includes(/test/))',
          repositoryName: '<+input>.regex(<+input>.includes(/test/))',
          repositoryType: 'docker',
          versionRegex: '<+input>.regex(<+input>.includes(/test/))'
        }
      })
    })
  })

  test(`clicking on version list should fetch builds`, async () => {
    const initialValues = {
      type: 'GoogleArtifactRegistry',
      ...commonInitialValues,
      spec: {
        ...commonInitialValues.spec,
        project: 'testProject',
        package: 'testPackage',
        region: 'testRegion',
        repositoryName: 'testRepo',
        version: 'xyz'
      }
    }
    const { container } = render(
      <TestWrapper>
        <GoogleArtifactRegistry initialValues={initialValues as any} {...props} />
      </TestWrapper>
    )
    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    const versionNameDropDownIcon = dropdownIcons[2]
    act(() => {
      fireEvent.click(versionNameDropDownIcon)
    })
    await waitFor(() => expect(fetchBuilds).toHaveBeenCalled())
  })
})
