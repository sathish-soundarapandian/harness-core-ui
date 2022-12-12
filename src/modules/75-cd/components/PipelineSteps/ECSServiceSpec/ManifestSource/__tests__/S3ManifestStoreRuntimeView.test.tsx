/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  render,
  waitFor,
  queryByAttribute,
  getByText as getElementByText,
  findByText as findElementByText,
  fireEvent,
  act
} from '@testing-library/react'
import { Formik } from 'formik'
import userEvent from '@testing-library/user-event'
import { FormikForm, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'

import * as ngServices from 'services/cd-ng'
import { useMutateAsGet } from '@common/hooks'
import { TestWrapper } from '@common/utils/testUtils'
import { connectorsData } from '@connectors/pages/connectors/__tests__/mockData'
import { awsRegionsData } from '@pipeline/components/ManifestSelection/ManifestWizardSteps/ECSWithS3/__tests__/mocks'
import { ManifestDataType, ManifestStoreMap } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { ManifestSourceBaseFactory } from '@cd/factory/ManifestSourceFactory/ManifestSourceBaseFactory'
import { S3ManifestStoreRuntimeView, S3ManifestStoreRuntimeViewProps } from '../S3ManifestStoreRuntimeView'
import { S3ManifestStoreRuntimeViewExistingInitialValues, s3ManifestStoreRuntimeViewTemplate } from './helpers/helper'
import { bucketNameList } from './helpers/mock'

const fetchConnectors = (): Promise<unknown> => Promise.resolve(connectorsData)
const fetchBuckets = jest.fn().mockReturnValue(bucketNameList)
jest.mock('services/portal', () => ({
  useListAwsRegions: jest.fn().mockImplementation(() => {
    return { data: awsRegionsData, refetch: jest.fn(), error: null, loading: false }
  })
}))
jest.mock('services/cd-ng', () => ({
  getConnectorListPromise: jest.fn().mockImplementation(() => Promise.resolve(connectorsData)),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: connectorsData.data.content[0], refetch: fetchConnectors, loading: false }
  }),
  useGetBucketsInManifests: jest.fn().mockImplementation(() => {
    return { data: bucketNameList, refetch: fetchBuckets, error: null, loading: false }
  })
}))

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return { data: bucketNameList, refetch: fetchBuckets, error: null, loading: false }
  })
}))

const doConfigureOptionsTesting = async (cogModal: HTMLElement) => {
  // Type regex and submit
  // check if field has desired value
  await waitFor(() => expect(getElementByText(cogModal, 'common.configureOptions.regex')).toBeInTheDocument())
  const regexRadio = getElementByText(cogModal, 'common.configureOptions.regex')
  userEvent.click(regexRadio)
  const regexTextArea = queryByAttribute('name', cogModal, 'regExValues')
  fireEvent.change(regexTextArea!, { target: { value: '<+input>.includes(/test/)' } })
  const cogSubmit = getElementByText(cogModal, 'submit')
  userEvent.click(cogSubmit)
}

const props: S3ManifestStoreRuntimeViewProps = {
  initialValues: S3ManifestStoreRuntimeViewExistingInitialValues,
  template: s3ManifestStoreRuntimeViewTemplate,
  path: 'stage.serviceInputs',
  manifestPath: 'manifests[0].manifest',
  manifest: {
    identifier: 'S3 Manifest',
    type: ManifestDataType.EcsTaskDefinition,
    spec: {
      store: {
        spec: {
          region: 'us-east-1',
          bucketName: 'cdng-terraform-state',
          paths: ['path1.yaml']
        }
      }
    }
  },
  fromTrigger: false,
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
  readonly: false,
  formik: {},
  accountId: 'testAccountId',
  projectIdentifier: 'testProject',
  orgIdentifier: 'testOrg',
  repoIdentifier: 'testRepo',
  branch: 'testBranch',
  stageIdentifier: 'stage_1',
  serviceIdentifier: 'service_1',
  stepViewType: StepViewType.InputSet,
  pathFieldlabel: 'fileFolderPathText',
  isManifestsRuntime: true,
  manifestSourceBaseFactory: new ManifestSourceBaseFactory(),
  pipelineIdentifier: 'testPipeline'
}

const renderComponent = (passedProps = props) => {
  return render(
    <TestWrapper>
      <Formik
        initialValues={{
          stage: {
            serviceInputs: {
              ...passedProps.initialValues
            }
          }
        }}
        onSubmit={jest.fn()}
      >
        {(formik: unknown) => (
          <FormikForm>
            <S3ManifestStoreRuntimeView {...passedProps} formik={formik} />
          </FormikForm>
        )}
      </Formik>
    </TestWrapper>
  )
}

describe('S3ManifestStoreRuntimeView tests', () => {
  beforeEach(() => {
    fetchBuckets.mockReset()
  })
  beforeAll(() => {
    jest.spyOn(ngServices, 'useGetBucketsInManifests').mockImplementation((): any => {
      return { data: bucketNameList, refetch: fetchBuckets, error: null, loading: false }
    })
  })

  test(`renders fine for existing runtime manifest values`, async () => {
    const { container, getByTestId } = renderComponent()

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    expect(
      getByTestId('cr-field-stage.serviceInputs.manifests[0].manifest.spec.store.spec.connectorRef')
    ).not.toBeNull()
    expect(queryByNameAttribute('stage.serviceInputs.manifests[0].manifest.spec.store.spec.region')).not.toBeNull()
    expect(queryByNameAttribute('stage.serviceInputs.manifests[0].manifest.spec.store.spec.bucketName')).not.toBeNull()
    expect(queryByNameAttribute('stage.serviceInputs.manifests[0].manifest.spec.store.spec.paths[0]')).not.toBeNull()
  })

  test('renders runtime view fine with S3 manifest store', async () => {
    const { container, getByTestId } = renderComponent()

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    expect(
      getByTestId('cr-field-stage.serviceInputs.manifests[0].manifest.spec.store.spec.connectorRef')
    ).not.toBeNull()
    const regionSelect = queryByNameAttribute(
      'stage.serviceInputs.manifests[0].manifest.spec.store.spec.region'
    ) as HTMLInputElement
    expect(regionSelect).not.toBeNull()
    const bucketNameSelect = queryByNameAttribute(
      'stage.serviceInputs.manifests[0].manifest.spec.store.spec.bucketName'
    ) as HTMLInputElement
    expect(bucketNameSelect).not.toBeNull()
    expect(queryByNameAttribute('stage.serviceInputs.manifests[0].manifest.spec.store.spec.paths[0]')).not.toBeNull()

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    // Switch the connector - choose AWS connector for connectorRef field
    const connnectorRefInput = queryByAttribute('data-testid', container, /connectorRef/)
    expect(connnectorRefInput).toBeInTheDocument()
    if (connnectorRefInput) {
      fireEvent.click(connnectorRefInput)
    }
    await act(async () => {
      const connectorSelectorDialog = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement
      const awsConnector = await findElementByText(connectorSelectorDialog as HTMLElement, 'AWS')
      expect(awsConnector).toBeTruthy()
      fireEvent.click(awsConnector)
      const applySelected = getElementByText(connectorSelectorDialog, 'entityReference.apply')
      await act(async () => {
        fireEvent.click(applySelected)
      })
    })
    expect(fetchBuckets).toHaveBeenCalledTimes(0)

    // Select region from dropdown
    const regionDropDownButton = container.querySelectorAll('[data-icon="chevron-down"]')[1]
    fireEvent.click(regionDropDownButton!)
    await waitFor(() => expect(portalDivs.length).toBe(2))
    const dropdownPortalDivRegion = portalDivs[1]
    const selectListMenuRegion = dropdownPortalDivRegion.querySelector('.bp3-menu')
    const selectItemRegion = await findElementByText(selectListMenuRegion as HTMLElement, 'GovCloud (US-West)')
    fireEvent.click(selectItemRegion)
    const regionSelect1 = queryByNameAttribute(
      'stage.serviceInputs.manifests[0].manifest.spec.store.spec.region'
    ) as HTMLInputElement
    expect(regionSelect1.value).toBe('GovCloud (US-West)')

    // Select bucketName from dropdown
    const bucketNameDropDownButton = container.querySelectorAll('[data-icon="chevron-down"]')[2]
    fireEvent.click(bucketNameDropDownButton!)
    await waitFor(() => expect(portalDivs.length).toBe(3))
    const dropdownPortalDiv = portalDivs[2]
    const selectListMenuBucketName = dropdownPortalDiv.querySelector('.bp3-menu')
    const selectItem = await findElementByText(selectListMenuBucketName as HTMLElement, 'prod-bucket-339')
    fireEvent.click(selectItem)
    const bucketNameSelect1 = queryByNameAttribute(
      'stage.serviceInputs.manifests[0].manifest.spec.store.spec.bucketName'
    ) as HTMLInputElement
    expect(bucketNameSelect1.value).toBe('prod-bucket-339')

    // change value of paths
    const pathField1 = queryByNameAttribute('stage.serviceInputs.manifests[0].manifest.spec.store.spec.paths[0]')
    expect(pathField1).not.toBeNull()
    fireEvent.change(pathField1!, { target: { value: 'path1.yaml' } })
    await waitFor(() => expect(pathField1).toHaveValue('path1.yaml'))
  })

  test(`configure values should work fine region and bucketName are runtime inputs`, async () => {
    const { container, getByTestId } = renderComponent({
      ...props,
      initialValues: {
        manifests: [
          {
            manifest: {
              identifier: 'S3 Manifest',
              type: ManifestDataType.EcsTaskDefinition,
              spec: {
                store: {
                  type: ManifestStoreMap.S3,
                  spec: {
                    connectorRef: 'AWSX',
                    region: RUNTIME_INPUT_VALUE,
                    bucketName: RUNTIME_INPUT_VALUE,
                    paths: ['path1.yaml']
                  }
                }
              }
            }
          }
        ]
      }
    })

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    expect(
      getByTestId('cr-field-stage.serviceInputs.manifests[0].manifest.spec.store.spec.connectorRef')
    ).not.toBeNull()
    const regionSelect = queryByNameAttribute(
      'stage.serviceInputs.manifests[0].manifest.spec.store.spec.region'
    ) as HTMLInputElement
    expect(regionSelect).not.toBeNull()
    const bucketNameSelect = queryByNameAttribute(
      'stage.serviceInputs.manifests[0].manifest.spec.store.spec.bucketName'
    ) as HTMLInputElement
    expect(bucketNameSelect).not.toBeNull()
    expect(queryByNameAttribute('stage.serviceInputs.manifests[0].manifest.spec.store.spec.paths[0]')).not.toBeNull()

    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    // Configure options testing for region, bucketName and filePath fields
    const cogRegion = document.getElementById(
      'configureOptions_stage.serviceInputs.manifests[0].manifest.spec.store.spec.region'
    )
    userEvent.click(cogRegion!)
    await waitFor(() => expect(modals.length).toBe(1))
    const regionCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(regionCOGModal)

    const cogBucketName = document.getElementById(
      'configureOptions_stage.serviceInputs.manifests[0].manifest.spec.store.spec.bucketName'
    )
    userEvent.click(cogBucketName!)
    await waitFor(() => expect(modals.length).toBe(1))
    const bucketNameCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(bucketNameCOGModal)
  })

  test('when loading is true for bucket field', async () => {
    ;(useMutateAsGet as any).mockImplementation(() => {
      return { data: null, refetch: fetchBuckets, error: null, loading: true }
    })

    const { container } = renderComponent()
    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    expect(dropdownIcons).toHaveLength(3)
    await waitFor(() => expect(fetchBuckets).toHaveBeenCalledTimes(0))
    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)
    const bucketNameDropDownButton = dropdownIcons[2]
    userEvent.click(bucketNameDropDownButton!)
    await waitFor(() => expect(portalDivs.length).toBe(1))
    const dropdownPortalDiv = portalDivs[0]
    const selectListMenu = dropdownPortalDiv.querySelector('.bp3-menu')
    const loadingBucketsOption = await findElementByText(selectListMenu as HTMLElement, 'Loading Buckets...')
    expect(loadingBucketsOption).toBeDefined()
    await waitFor(() => expect(fetchBuckets).toHaveBeenCalledTimes(0))
  })

  test('when readonly is true, all fields should be disabled', async () => {
    const { container, getByTestId } = renderComponent({
      ...props,
      readonly: true
    })

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    expect(
      getByTestId('cr-field-stage.serviceInputs.manifests[0].manifest.spec.store.spec.connectorRef')
    ).not.toBeNull()
    const regionSelect = queryByNameAttribute(
      'stage.serviceInputs.manifests[0].manifest.spec.store.spec.region'
    ) as HTMLInputElement
    expect(regionSelect).not.toBeNull()
    const bucketNameSelect = queryByNameAttribute(
      'stage.serviceInputs.manifests[0].manifest.spec.store.spec.bucketName'
    ) as HTMLInputElement
    expect(bucketNameSelect).not.toBeNull()
    const pathsInput = queryByNameAttribute('stage.serviceInputs.manifests[0].manifest.spec.store.spec.paths[0]')
    expect(pathsInput).not.toBeNull()

    expect(regionSelect).toBeDisabled()
    expect(bucketNameSelect).toBeDisabled()
    expect(pathsInput).toBeDisabled()

    await waitFor(() => expect(fetchBuckets).toHaveBeenCalledTimes(0))
    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)
    const bucketNameDropDownButton = container.querySelectorAll('[data-icon="chevron-down"]')[2]
    userEvent.click(bucketNameDropDownButton!)
    expect(portalDivs.length).toBe(0)
    await waitFor(() => expect(fetchBuckets).toHaveBeenCalledTimes(0))
  })
})
