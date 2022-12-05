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
  fireEvent
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AllowedTypesWithRunTime, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'

import * as ngServices from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'
import { ManifestStoreMap, ManifestDataType } from '../../../Manifesthelper'
import { ECSWithS3 } from '../ECSWithS3'
import { awsRegionsData, bucketListData } from './mocks'

const props = {
  stepName: 'Manifest Details',
  expressions: [],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  handleSubmit: jest.fn(),
  manifestIdsList: [],
  selectedManifest: ManifestDataType.EcsTaskDefinition,
  prevStepData: { connectorRef: { value: 'testConnectorRef', live: true }, store: ManifestStoreMap.S3 },
  previousStep: jest.fn()
}

const fetchBuckets = jest.fn().mockReturnValue(bucketListData)
jest.mock('services/portal', () => ({
  useListAwsRegions: jest.fn().mockImplementation(() => {
    return { data: awsRegionsData, refetch: jest.fn(), error: null, loading: false }
  })
}))
jest.mock('services/cd-ng', () => ({
  useGetV2BucketListForS3: jest.fn().mockImplementation(() => {
    return { data: bucketListData, refetch: fetchBuckets, error: null, loading: false }
  })
}))

const doConfigureOptionsTesting = async (cogModal: HTMLElement, fieldElement: HTMLInputElement) => {
  // Type regex and submit
  // check if field has desired value
  await waitFor(() => expect(getElementByText(cogModal, 'common.configureOptions.regex')).toBeInTheDocument())
  const regexRadio = getElementByText(cogModal, 'common.configureOptions.regex')
  userEvent.click(regexRadio)
  const regexTextArea = queryByAttribute('name', cogModal, 'regExValues')
  fireEvent.change(regexTextArea!, { target: { value: '<+input>.includes(/test/)' } })
  const cogSubmit = getElementByText(cogModal, 'submit')
  userEvent.click(cogSubmit)
  await waitFor(() => expect(fieldElement.value).toBe('<+input>.regex(<+input>.includes(/test/))'))
}

describe('ECSWithS3 tests', () => {
  beforeEach(() => {
    props.handleSubmit.mockReset()
    fetchBuckets.mockReset()
  })
  beforeAll(() => {
    jest.spyOn(ngServices, 'useGetV2BucketListForS3').mockImplementation((): any => {
      return { data: bucketListData, refetch: fetchBuckets, error: null, loading: false }
    })
  })

  test(`renders fine for existing manifest values`, async () => {
    const initialValues = {
      identifier: 'testidentifier',
      type: ManifestDataType.EcsTaskDefinition,
      spec: {
        store: {
          spec: {
            region: 'us-east-1',
            bucketName: 'cdng-terraform-state',
            paths: ['path1.yaml']
          },
          type: ManifestStoreMap.S3
        }
      }
    }
    const { container, getByText } = render(
      <TestWrapper>
        <ECSWithS3 {...props} initialValues={initialValues} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    expect(queryByNameAttribute('region')).not.toBeNull()
    expect(queryByNameAttribute('bucketName')).not.toBeNull()
    expect(queryByNameAttribute('paths[0].path')).not.toBeNull()

    const submitBtn = getByText('submit')
    userEvent.click(submitBtn)
    await waitFor(() => {
      expect(props.handleSubmit).toHaveBeenCalledWith({
        manifest: {
          identifier: 'testidentifier',
          type: ManifestDataType.EcsTaskDefinition,
          spec: {
            store: {
              spec: {
                connectorRef: 'testConnectorRef',
                region: 'us-east-1',
                bucketName: 'cdng-terraform-state',
                paths: ['path1.yaml']
              },
              type: ManifestStoreMap.S3
            }
          }
        }
      })
    })
  })

  test('renders and submit works fine for new manifest with S3 manifest store', async () => {
    const initialValues = {
      identifier: 'test',
      type: ManifestDataType.EcsTaskDefinition,
      spec: {
        store: {
          type: ManifestStoreMap.S3
        }
      }
    }
    const { container, getByText, findByText } = render(
      <TestWrapper>
        <ECSWithS3 {...props} initialValues={initialValues} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    const idField = queryByNameAttribute('identifier')
    expect(idField).not.toBeNull()
    expect(queryByNameAttribute('region')).not.toBeNull()
    expect(queryByNameAttribute('bucketName')).not.toBeNull()
    expect(queryByNameAttribute('paths[0].path')).not.toBeNull()

    const submitBtn = getByText('submit')
    fireEvent.click(submitBtn)
    const regionRequiredErr = await findByText('pipeline.artifactsSelection.validation.region')
    expect(regionRequiredErr).toBeInTheDocument()
    // const bucketNameRequiredErr = await findByText('pipeline.manifestType.bucketNameRequired')
    // expect(bucketNameRequiredErr).toBeInTheDocument()
    const pathsRequiredErr = await findByText('pipeline.manifestType.pathRequired')
    expect(pathsRequiredErr).toBeInTheDocument()

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    // Type manifest identifier value
    fireEvent.change(idField!, { target: { value: 'Jest Manifest' } })

    // Select region from dropdown
    const regionDropDownButton = container.querySelectorAll('[data-icon="chevron-down"]')[0]
    fireEvent.click(regionDropDownButton!)
    expect(portalDivs.length).toBe(1)
    const dropdownPortalDivRegion = portalDivs[0]
    const selectListMenuRegion = dropdownPortalDivRegion.querySelector('.bp3-menu')
    const selectItemRegion = await findElementByText(selectListMenuRegion as HTMLElement, 'GovCloud (US-West)')
    fireEvent.click(selectItemRegion)
    const regionSelect = queryByNameAttribute('region') as HTMLInputElement
    expect(regionSelect.value).toBe('GovCloud (US-West)')

    // Select bucketName from dropdown
    const bucketNameDropDownButton = container.querySelectorAll('[data-icon="chevron-down"]')[1]
    fireEvent.click(bucketNameDropDownButton!)
    expect(portalDivs.length).toBe(2)
    const dropdownPortalDiv = portalDivs[1]
    const selectListMenu = dropdownPortalDiv.querySelector('.bp3-menu')
    const selectItem = await findElementByText(selectListMenu as HTMLElement, 'prod-bucket-339')
    fireEvent.click(selectItem)
    const bucketNameSelect = queryByNameAttribute('bucketName') as HTMLInputElement
    expect(bucketNameSelect.value).toBe('prod-bucket-339')

    // change value of paths
    const pathField1 = queryByNameAttribute('paths[0].path')
    expect(pathField1).not.toBeNull()
    fireEvent.change(pathField1!, { target: { value: 'path1.yaml' } })
    await waitFor(() => expect(pathField1).toHaveValue('path1.yaml'))

    // Submit the form
    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(props.handleSubmit).toBeCalled()
      expect(props.handleSubmit).toHaveBeenCalledWith({
        manifest: {
          identifier: 'Jest Manifest',
          type: ManifestDataType.EcsTaskDefinition,
          spec: {
            store: {
              spec: {
                connectorRef: 'testConnectorRef',
                region: 'us-gov-west-1',
                bucketName: 'prod-bucket-339',
                paths: ['path1.yaml']
              },
              type: ManifestStoreMap.S3
            }
          }
        }
      })
    })
  })

  test('when loading true for bucket field', async () => {
    jest.spyOn(ngServices, 'useGetV2BucketListForS3').mockImplementation((): any => {
      return { data: null, refetch: fetchBuckets, error: null, loading: true }
    })

    const initialValues = {
      identifier: 'test',
      type: ManifestDataType.EcsTaskDefinition,
      spec: {
        store: {
          type: 'S3',
          spec: {
            connectorRef: 'testConnectorRef',
            region: 'us-east-1',
            bucketName: 'cdng-terraform-state',
            paths: ['path1.yaml']
          }
        }
      }
    }
    const { container } = render(
      <TestWrapper>
        <ECSWithS3 {...props} initialValues={initialValues} />
      </TestWrapper>
    )

    await waitFor(() => expect(fetchBuckets).toHaveBeenCalledTimes(1))
    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)
    const bucketNameDropDownButton = container.querySelectorAll('[data-icon="chevron-down"]')[1]
    userEvent.click(bucketNameDropDownButton!)
    expect(portalDivs.length).toBe(1)
    const dropdownPortalDiv = portalDivs[0]
    const selectListMenu = dropdownPortalDiv.querySelector('.bp3-menu')
    const loadingBucketsOption = await findElementByText(selectListMenu as HTMLElement, 'Loading Buckets...')
    expect(loadingBucketsOption).toBeDefined()
    await waitFor(() => expect(fetchBuckets).toHaveBeenCalledTimes(1))
  })

  test(`configure values should work fine when all values are runtime inputs including filePath`, async () => {
    const initialValues = {
      identifier: 'test',
      type: ManifestDataType.EcsTaskDefinition,
      spec: {
        store: {
          type: ManifestStoreMap.S3,
          spec: {
            connectorRef: 'testConnectorRef',
            region: RUNTIME_INPUT_VALUE,
            bucketName: RUNTIME_INPUT_VALUE,
            paths: RUNTIME_INPUT_VALUE
          }
        }
      }
    }

    const { container } = render(
      <TestWrapper>
        <ECSWithS3 initialValues={initialValues as any} {...props} />
      </TestWrapper>
    )

    const regionInput = queryByAttribute('name', container, 'region') as HTMLInputElement
    const bucketNameInput = queryByAttribute('name', container, 'bucketName') as HTMLInputElement
    const pathsInput = queryByAttribute('name', container, 'paths') as HTMLInputElement
    expect(regionInput).not.toBeNull()
    expect(bucketNameInput).not.toBeNull()
    expect(pathsInput).not.toBeNull()

    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    // Configure options testing for region, bucketName and filePath fields
    const cogRegion = document.getElementById('configureOptions_region')
    userEvent.click(cogRegion!)
    await waitFor(() => expect(modals.length).toBe(1))
    const regionCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(regionCOGModal, regionInput)

    const cogBucketName = document.getElementById('configureOptions_bucketName')
    userEvent.click(cogBucketName!)
    await waitFor(() => expect(modals.length).toBe(1))
    const bucketNameCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(bucketNameCOGModal, bucketNameInput)

    const cogPaths = document.getElementById('configureOptions_paths')
    userEvent.click(cogPaths!)
    await waitFor(() => expect(modals.length).toBe(2))
    const filePathCOGModal = modals[1] as HTMLElement
    await doConfigureOptionsTesting(filePathCOGModal, pathsInput)

    const submitBtn = getElementByText(container, 'submit')
    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(props.handleSubmit).toBeCalled()
      expect(props.handleSubmit).toHaveBeenCalledWith({
        manifest: {
          identifier: 'test',
          type: ManifestDataType.EcsTaskDefinition,
          spec: {
            store: {
              spec: {
                connectorRef: 'testConnectorRef',
                region: '<+input>.regex(<+input>.includes(/test/))',
                bucketName: '<+input>.regex(<+input>.includes(/test/))',
                paths: '<+input>.regex(<+input>.includes(/test/))'
              },
              type: ManifestStoreMap.S3
            }
          }
        }
      })
    })
  })

  test(`configure values should work fine when only bucketName is runtime input`, async () => {
    const initialValues = {
      identifier: 'test',
      type: ManifestDataType.EcsTaskDefinition,
      spec: {
        store: {
          type: ManifestStoreMap.S3,
          spec: {
            connectorRef: 'testConnectorRef',
            region: 'us-east-1',
            bucketName: RUNTIME_INPUT_VALUE,
            paths: ['path1.yaml']
          }
        }
      }
    }

    const { container } = render(
      <TestWrapper>
        <ECSWithS3 initialValues={initialValues as any} {...props} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    expect(queryByNameAttribute('region')).not.toBeNull()
    const bucketNameInput = queryByAttribute('name', container, 'bucketName') as HTMLInputElement
    expect(bucketNameInput).not.toBeNull()
    expect(queryByNameAttribute('paths[0].path')).not.toBeNull()

    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    // Configure options testing for bucketName
    const cogBucketName = document.getElementById('configureOptions_bucketName')
    userEvent.click(cogBucketName!)
    await waitFor(() => expect(modals.length).toBe(1))
    const bucketNameCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(bucketNameCOGModal, bucketNameInput)

    const submitBtn = getElementByText(container, 'submit')
    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(props.handleSubmit).toBeCalled()
      expect(props.handleSubmit).toHaveBeenCalledWith({
        manifest: {
          identifier: 'test',
          type: ManifestDataType.EcsTaskDefinition,
          spec: {
            store: {
              spec: {
                connectorRef: 'testConnectorRef',
                region: 'us-east-1',
                bucketName: '<+input>.regex(<+input>.includes(/test/))',
                paths: ['path1.yaml']
              },
              type: ManifestStoreMap.S3
            }
          }
        }
      })
    })
  })

  test(`clicking on back button should call `, async () => {
    const initialValues = {
      identifier: 'test',
      type: ManifestDataType.EcsTaskDefinition,
      spec: {
        store: {
          type: ManifestStoreMap.S3,
          spec: {
            connectorRef: 'testConnectorRef',
            region: 'us-east-1',
            bucketName: 'cdng-terraform-state',
            paths: ['path1.yaml']
          }
        }
      }
    }

    const { container } = render(
      <TestWrapper>
        <ECSWithS3 initialValues={initialValues as any} {...props} />
      </TestWrapper>
    )

    const backBtn = getElementByText(container, 'back')
    fireEvent.click(backBtn)
    await waitFor(() => {
      expect(props.previousStep).toBeCalled()
      expect(props.previousStep).toHaveBeenCalledWith({
        connectorRef: { value: 'testConnectorRef', live: true },
        store: ManifestStoreMap.S3
      })
    })
  })
})
