/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  act,
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
  GithubPackageRegistryInitialValuesType,
  GithubPackageRegistryProps
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { GithubPackageRegistry } from '../GithubPackageRegistry'

const commonInitialValues: GithubPackageRegistryInitialValuesType = {
  identifier: '',
  versionType: TagTypes.Value,
  spec: {
    connectorRef: '',
    packageType: '',
    org: '',
    packageName: '',
    version: '',
    versionRegex: ''
  }
}

const onSubmit = jest.fn()
export const props: Omit<StepProps<cdng.ConnectorConfigDTO> & GithubPackageRegistryProps, 'initialValues'> = {
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
  selectedArtifact: 'GithubPackageRegistry' as ArtifactType,
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

describe('GithubPackageRegistry tests', () => {
  beforeEach(() => {
    onSubmit.mockReset()
  })
  test(`renders fine for the NEW artifact`, () => {
    const { container } = render(
      <TestWrapper>
        <GithubPackageRegistry initialValues={commonInitialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders fine for the versionType as value`, async () => {
    const initialValues = {
      type: 'GithubPackageRegistry',
      ...commonInitialValues,
      versionType: TagTypes.Value,
      spec: {
        ...commonInitialValues.spec,
        packageType: 'npm',
        org: 'testOrg',
        packageName: 'testPackage',
        version: 'xyz.zip'
      }
    }
    const { container, getByText } = render(
      <TestWrapper>
        <GithubPackageRegistry initialValues={initialValues as any} {...props} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    expect(queryByNameAttribute('spec.packageType')).not.toBeNull()
    expect(queryByNameAttribute('spec.org')).not.toBeNull()
    expect(queryByNameAttribute('spec.packageName')).not.toBeNull()
    expect(queryByNameAttribute('spec.version')).not.toBeNull()
    expect(container).toMatchSnapshot()

    const submitBtn = getByText('submit')
    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(props.handleSubmit).toBeCalled()
      expect(props.handleSubmit).toHaveBeenCalledWith({
        spec: {
          connectorRef: 'testConnector',
          packageType: 'npm',
          org: 'testOrg',
          packageName: 'testPackage',
          version: 'xyz.zip'
        }
      })
    })
  })

  test(`renders fine for sidecar artifact`, async () => {
    const initialValues = {
      type: 'GithubPackageRegistry',
      ...commonInitialValues,
      identifier: 'initial_id',
      versionType: TagTypes.Value,
      spec: {
        ...commonInitialValues.spec,
        packageType: 'npm',
        org: 'testOrg',
        packageName: 'testPackage',
        version: 'xyz.zip'
      }
    }
    const { container, getByText } = render(
      <TestWrapper>
        <GithubPackageRegistry initialValues={initialValues as any} {...props} isMultiArtifactSource={true} />
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
          packageType: 'npm',
          org: 'testOrg',
          packageName: 'testPackage',
          version: 'xyz.zip'
        }
      })
    })
  })

  test(`renders fine for the versionType as regex`, async () => {
    const initialValues = {
      type: 'GithubPackageRegistry',
      ...commonInitialValues,
      versionType: TagTypes.Regex,
      spec: {
        ...commonInitialValues.spec,
        packageType: 'npm',
        org: 'testOrg',
        packageName: 'testPackage',
        versionRegex: '*.zip'
      }
    }
    const { container, getByText } = render(
      <TestWrapper>
        <GithubPackageRegistry initialValues={initialValues as any} {...props} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    expect(queryByNameAttribute('spec.packageType')).not.toBeNull()
    expect(queryByNameAttribute('spec.org')).not.toBeNull()
    expect(queryByNameAttribute('spec.packageName')).not.toBeNull()
    expect(queryByNameAttribute('spec.versionRegex')).not.toBeNull()
    expect(container).toMatchSnapshot()

    const submitBtn = getByText('submit')
    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(props.handleSubmit).toBeCalled()
      expect(props.handleSubmit).toHaveBeenCalledWith({
        spec: {
          connectorRef: 'testConnector',
          packageType: 'npm',
          org: 'testOrg',
          packageName: 'testPackage',
          versionRegex: '*.zip'
        }
      })
    })
  })

  test(`configure values should work fine when all values are runtime input and versionType as value`, async () => {
    const initialValues = {
      type: 'GithubPackageRegistry',
      ...commonInitialValues,
      versionType: TagTypes.Value,
      spec: {
        ...commonInitialValues.spec,
        packageType: 'npm',
        org: RUNTIME_INPUT_VALUE,
        packageName: RUNTIME_INPUT_VALUE,
        version: RUNTIME_INPUT_VALUE
      }
    }
    const { container } = render(
      <TestWrapper>
        <GithubPackageRegistry initialValues={initialValues as any} {...props} />
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
          packageType: 'npm',
          org: '<+input>',
          packageName: '<+input>',
          version: '<+input>.regex(<+input>.includes(/test/))'
        }
      })
    })
  })

  test(`configure values should work fine when all values are runtime input and versionType as regex`, async () => {
    const initialValues = {
      type: 'GithubPackageRegistry',
      ...commonInitialValues,
      versionType: TagTypes.Regex,
      spec: {
        ...commonInitialValues.spec,
        packageType: 'npm',
        org: RUNTIME_INPUT_VALUE,
        packageName: RUNTIME_INPUT_VALUE,
        versionRegex: RUNTIME_INPUT_VALUE
      }
    }
    const { container } = render(
      <TestWrapper>
        <GithubPackageRegistry initialValues={initialValues as any} {...props} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    const packageTypeInput = queryByNameAttribute('spec.packageType') as HTMLInputElement
    const orgInput = queryByNameAttribute('spec.org') as HTMLInputElement
    const packageNameInput = queryByNameAttribute('spec.packageName') as HTMLInputElement
    const versionRegexInput = queryByNameAttribute('spec.versionRegex') as HTMLInputElement
    expect(packageTypeInput).not.toBeNull()
    expect(orgInput).not.toBeNull()
    expect(packageNameInput).not.toBeNull()
    expect(versionRegexInput).not.toBeNull()

    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    // Configure options testing for bucketName and filePath fields

    const cogOrg = document.getElementById('configureOptions_org')
    userEvent.click(cogOrg!)
    await waitFor(() => expect(modals.length).toBe(1))
    const orgCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(orgCOGModal, orgInput)

    const cogPackageName = document.getElementById('configureOptions_packageName')
    userEvent.click(cogPackageName!)
    await waitFor(() => expect(modals.length).toBe(1))
    const packageNameCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(packageNameCOGModal, packageNameInput)

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
          packageType: 'npm',
          org: '<+input>.regex(<+input>.includes(/test/))',
          packageName: '<+input>.regex(<+input>.includes(/test/))',
          versionRegex: '<+input>.regex(<+input>.includes(/test/))'
        }
      })
    })
  })
})
