/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import userEvent from '@testing-library/user-event'
import {
  findAllByText,
  findByText,
  fireEvent,
  getByPlaceholderText,
  getByText,
  render,
  waitFor
} from '@testing-library/react'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@wings-software/uicore'
import { TestWrapper, findDialogContainer, queryByNameAttribute } from '@common/utils/testUtils'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@connectors/constants'
import ArtifactWizard from '../ArtifactWizard/ArtifactWizard'
import type { ArtifactType, InitialArtifactDataType, TagTypes } from '../ArtifactInterface'
import { DockerRegistryArtifact } from '../ArtifactRepository/ArtifactLastSteps/DockerRegistryArtifact/DockerRegistryArtifact'
import connectorsData from './connectors_mock.json'
import { GCRImagePath } from '../ArtifactRepository/ArtifactLastSteps/GCRImagePath/GCRImagePath'
import { AmazonS3 } from '../ArtifactRepository/ArtifactLastSteps/AmazonS3Artifact/AmazonS3'
import { awsRegionsData, bucketListData } from '../ArtifactRepository/ArtifactLastSteps/AmazonS3Artifact/__tests__/mock'

const fetchConnector = jest.fn().mockReturnValue({ data: connectorsData.data?.content?.[1] })
const fetchBuckets = jest.fn().mockReturnValue(bucketListData)
jest.mock('services/cd-ng', () => ({
  getConnectorListPromise: jest.fn().mockImplementation(() => Promise.resolve(connectorsData)),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: connectorsData.data?.content?.[1], refetch: fetchConnector, loading: false }
  }),
  useGetBuildDetailsForDocker: jest.fn().mockImplementation(() => {
    return { data: { buildDetailsList: [] }, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetBuildDetailsForGcr: jest.fn().mockImplementation(() => {
    return { data: { buildDetailsList: [] }, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetV2BucketListForS3: jest.fn().mockImplementation(() => {
    return { data: bucketListData, refetch: fetchBuckets, error: null, loading: false }
  })
}))

jest.mock('services/portal', () => ({
  useListAwsRegions: jest.fn().mockImplementation(() => {
    return { data: awsRegionsData, error: null, loading: false }
  })
}))

const laststepProps = {
  name: 'Artifact Location',
  expressions: [''],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  context: 1,
  initialValues: {
    identifier: 'id',
    imagePath: '',
    tag: '',
    tagType: 'value' as TagTypes,
    tagRegex: ''
  },
  handleSubmit: jest.fn(),
  artifactIdentifiers: [],
  selectedArtifact: 'DockerRegistry' as ArtifactType,
  selectedDeploymentType: ServiceDeploymentType.Kubernetes
}

const AmazsonS3LastStepProps = {
  name: 'Artifact Location',
  expressions: [''],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  context: 1,
  initialValues: {
    identifier: '',
    bucketName: '',
    tagType: 'value' as TagTypes,
    filePath: '',
    region: ''
  },
  handleSubmit: jest.fn(),
  artifactIdentifiers: [],
  selectedArtifact: 'AmazonS3' as ArtifactType
}

const newConnectorStepProps = {
  auth: {
    identifier: CONNECTOR_CREDENTIALS_STEP_IDENTIFIER,
    isEditMode: true,
    setIsEditMode: jest.fn(),
    accountId: 'accountId',
    orgIdentifier: 'orgIdentifier',
    projectIdentifier: 'projectIdentifier',
    connectorInfo: undefined
  },
  delegate: {
    name: 'delegate.DelegateselectionLabel',
    isEditMode: true,
    setIsEditMode: jest.fn(),
    connectorInfo: undefined
  },
  connectivity: {
    gitDetails: { repoIdentifier: 'repoIdentifier', branch: 'branch', getDefaultFromOtherRepo: true },
    isEditMode: true,
    setIsEditMode: jest.fn(),
    connectorInfo: undefined
  },
  verify: {
    name: 'connectors.stepThreeName',
    connectorInfo: undefined,
    isStep: true,
    isLastStep: false
  }
}

describe('Artifact WizardStep tests', () => {
  test(`renders without crashing`, () => {
    const { container } = render(
      <TestWrapper>
        <ArtifactWizard
          handleViewChange={jest.fn()}
          artifactInitialValue={{} as InitialArtifactDataType}
          types={[]}
          expressions={[]}
          isReadonly={false}
          showConnectorStep={true}
          labels={{
            firstStepName: 'first step',
            secondStepName: 'second step'
          }}
          selectedArtifact={'DockerRegistry'}
          changeArtifactType={jest.fn()}
          newConnectorView={false}
          newConnectorProps={newConnectorStepProps}
          iconsProps={{ name: 'info' }}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          lastSteps={<DockerRegistryArtifact {...laststepProps} key={'key'} />}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders correctly with connector Data`, () => {
    const initialValues = {
      connectorId: 'connectorId'
    }
    const { container } = render(
      <TestWrapper>
        <ArtifactWizard
          handleViewChange={jest.fn()}
          artifactInitialValue={initialValues as InitialArtifactDataType}
          types={[]}
          expressions={[]}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          showConnectorStep={true}
          isReadonly={false}
          labels={{
            firstStepName: 'first step',
            secondStepName: 'second step'
          }}
          selectedArtifact={'DockerRegistry'}
          changeArtifactType={jest.fn()}
          newConnectorView={false}
          newConnectorProps={newConnectorStepProps}
          iconsProps={{ name: 'info' }}
          lastSteps={<DockerRegistryArtifact {...laststepProps} key={'key'} />}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders correctly with differnet artifact types`, () => {
    const initialValues = {
      connectorId: 'connectorId'
    }
    const { container } = render(
      <TestWrapper>
        <ArtifactWizard
          handleViewChange={jest.fn()}
          artifactInitialValue={initialValues as InitialArtifactDataType}
          types={['DockerRegistry', 'Gcr', 'Ecr']}
          expressions={[]}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          showConnectorStep={true}
          isReadonly={false}
          labels={{
            firstStepName: 'first step',
            secondStepName: 'second step'
          }}
          selectedArtifact={'Gcr'}
          changeArtifactType={jest.fn()}
          newConnectorView={false}
          newConnectorProps={newConnectorStepProps}
          iconsProps={{ name: 'info' }}
          lastSteps={<GCRImagePath {...laststepProps} key={'key'} />}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`new connector view works correctly`, async () => {
    const initialValues = {
      connectorId: 'connectorId'
    }
    const { container } = render(
      <TestWrapper>
        <ArtifactWizard
          handleViewChange={jest.fn()}
          artifactInitialValue={initialValues as InitialArtifactDataType}
          types={['DockerRegistry', 'Gcr', 'Ecr']}
          expressions={[]}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          showConnectorStep={true}
          isReadonly={false}
          labels={{
            firstStepName: 'first step',
            secondStepName: 'second step'
          }}
          selectedArtifact={'DockerRegistry'}
          changeArtifactType={jest.fn()}
          newConnectorView={true}
          newConnectorProps={newConnectorStepProps}
          iconsProps={{ name: 'info' }}
          lastSteps={<DockerRegistryArtifact {...laststepProps} key={'key'} />}
        />
      </TestWrapper>
    )
    const artifactLabel = await findByText(container, 'connectors.artifactRepository')
    expect(artifactLabel).toBeDefined()
    const DockerArtifactType = await findAllByText(container, 'dockerRegistry')
    expect(DockerArtifactType).toBeDefined()

    const changeText = await findByText(container, 'Change')
    fireEvent.click(changeText)

    const GCRArtifactType = await findByText(container, 'connectors.GCR.name')
    expect(GCRArtifactType).toBeDefined()

    const continueButton = await findByText(container, 'continue')
    expect(continueButton).toBeDefined()
    fireEvent.click(continueButton)

    const artifactRepoLabel = await findByText(container, 'Docker Registry connector')
    expect(artifactRepoLabel).toBeDefined()
    const newConnectorLabel = await findByText(container, 'newLabel Docker Registry connector')
    expect(newConnectorLabel).toBeDefined()

    fireEvent.click(newConnectorLabel)

    expect(getByPlaceholderText(container, 'common.namePlaceholder')!).toBeDefined()

    expect(container).toMatchSnapshot()
  })

  test(`new connector view works correctly in select dialog`, async () => {
    const initialValues = {
      connectorId: 'connectorId'
    }
    const { container } = render(
      <TestWrapper>
        <ArtifactWizard
          handleViewChange={jest.fn()}
          artifactInitialValue={initialValues as InitialArtifactDataType}
          types={['DockerRegistry', 'Gcr', 'Ecr']}
          expressions={[]}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          showConnectorStep={true}
          isReadonly={false}
          labels={{
            firstStepName: 'first step',
            secondStepName: 'second step'
          }}
          selectedArtifact={'DockerRegistry'}
          changeArtifactType={jest.fn()}
          newConnectorView={true}
          newConnectorProps={newConnectorStepProps}
          iconsProps={{ name: 'info' }}
          lastSteps={<DockerRegistryArtifact {...laststepProps} key={'key'} />}
        />
      </TestWrapper>
    )
    const artifactLabel = await findByText(container, 'connectors.artifactRepository')
    expect(artifactLabel).toBeDefined()
    const DockerArtifactType = await findAllByText(container, 'dockerRegistry')
    expect(DockerArtifactType).toBeDefined()

    const changeText = await findByText(container, 'Change')
    fireEvent.click(changeText)

    const GCRArtifactType = await findByText(container, 'connectors.GCR.name')
    expect(GCRArtifactType).toBeDefined()
    fireEvent.click(GCRArtifactType)

    const continueButton = await findByText(container, 'continue')
    expect(continueButton).toBeDefined()
    fireEvent.click(continueButton)

    const artifactRepoLabel = await findByText(container, 'Docker Registry connector')
    expect(artifactRepoLabel).toBeDefined()
    expect(container).toMatchSnapshot()

    const newConnectorLabel = await findByText(container, 'select Docker Registry connector')
    expect(newConnectorLabel).toBeDefined()
    fireEvent.click(newConnectorLabel)
    const connectorDialog = findDialogContainer()
    expect(connectorDialog).toBeTruthy()

    if (connectorDialog) {
      const nextStepButton = await findByText(connectorDialog, '+ newLabel Docker Registry connector')
      expect(nextStepButton).toBeDefined()
    }
  })

  test(`last step data without initial values`, async () => {
    const initialValues = {
      connectorId: 'connectorId'
    }

    const { container } = render(
      <TestWrapper>
        <ArtifactWizard
          handleViewChange={jest.fn()}
          artifactInitialValue={initialValues as InitialArtifactDataType}
          types={['DockerRegistry', 'Gcr', 'Ecr']}
          expressions={[]}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          showConnectorStep={true}
          isReadonly={false}
          labels={{
            firstStepName: 'first step',
            secondStepName: 'second step'
          }}
          selectedArtifact={'DockerRegistry'}
          changeArtifactType={jest.fn()}
          newConnectorView={true}
          newConnectorProps={newConnectorStepProps}
          iconsProps={{ name: 'info' }}
          lastSteps={<DockerRegistryArtifact {...laststepProps} key={'key'} />}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test(`select AmazonS3 artifact type and validate last step`, async () => {
    const initialValues = {
      connectorId: 'account.Git_CTR',
      submittedArtifact: 'AmazonS3'
    }
    const { container, getByTestId } = render(
      <TestWrapper>
        <ArtifactWizard
          handleViewChange={jest.fn()}
          artifactInitialValue={initialValues as InitialArtifactDataType}
          types={['ArtifactoryRegistry', 'Ecr', 'AmazonS3']}
          expressions={[]}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          showConnectorStep={true}
          isReadonly={false}
          labels={{
            firstStepName: 'first step',
            secondStepName: 'second step'
          }}
          selectedArtifact={'AmazonS3'}
          changeArtifactType={jest.fn()}
          newConnectorView={false}
          newConnectorProps={newConnectorStepProps}
          iconsProps={{ name: 'info' }}
          lastSteps={<AmazonS3 {...AmazsonS3LastStepProps} key={'key'} />}
        />
      </TestWrapper>
    )

    // First step
    const artifactLabel = await findByText(container, 'connectors.artifactRepository')
    expect(artifactLabel).toBeInTheDocument()
    const AmazonS3ArtifactType = await findAllByText(container, 'pipeline.artifactsSelection.amazonS3Title')
    expect(AmazonS3ArtifactType).toHaveLength(2)
    const changeText = await findByText(container, 'Change')
    fireEvent.click(changeText)
    const ArtifactoryArtifactType = await findByText(container, 'connectors.artifactory.artifactoryLabel')
    expect(ArtifactoryArtifactType).toBeInTheDocument()
    const ECRArtifactType = await findByText(container, 'connectors.ECR.name')
    expect(ECRArtifactType).toBeInTheDocument()
    const continueButton = await findByText(container, 'continue')
    expect(continueButton).toBeInTheDocument()
    userEvent.click(continueButton)

    // Second step
    const artifactConnectorLabel = await findByText(container, 'AWS connector')
    expect(artifactConnectorLabel).toBeInTheDocument()
    const connnectorRefInput = getByTestId(/cr-field-connectorId/)
    expect(connnectorRefInput).toBeTruthy()
    userEvent.click(connnectorRefInput!)
    const dialogs = document.getElementsByClassName('bp3-dialog')
    await waitFor(() => expect(dialogs).toHaveLength(1))
    const connectorSelectorDialog = dialogs[0] as HTMLElement
    const awsConnector1 = await findByText(connectorSelectorDialog, 'Git CTR')
    await waitFor(() => expect(awsConnector1).toBeInTheDocument())
    userEvent.click(awsConnector1)
    const applySelected = getByText(connectorSelectorDialog, 'entityReference.apply')
    userEvent.click(applySelected)
    await waitFor(() => expect(document.getElementsByClassName('bp3-dialog')).toHaveLength(0))
    const secondStepContinueButton = await findByText(container, 'continue')
    expect(secondStepContinueButton).toBeInTheDocument()
    userEvent.click(secondStepContinueButton)

    // Last step
    // region and bucketName both should be dropdown
    const lastStepTitle = await findByText(container, 'pipeline.artifactsSelection.artifactDetails')
    await waitFor(() => expect(lastStepTitle).toBeInTheDocument())
    const bucketNameDropDownButtons = container.querySelectorAll('[data-icon="chevron-down"]')
    await waitFor(() => expect(bucketNameDropDownButtons.length).toBe(2))
    const regionInput = queryByNameAttribute('region', container)
    expect(regionInput).toBeInTheDocument()
    const bucketNameInput = queryByNameAttribute('bucketName', container)
    expect(bucketNameInput).toBeInTheDocument()
    const filePathInput = queryByNameAttribute('filePath', container)
    expect(filePathInput).toBeInTheDocument()
  })
})
