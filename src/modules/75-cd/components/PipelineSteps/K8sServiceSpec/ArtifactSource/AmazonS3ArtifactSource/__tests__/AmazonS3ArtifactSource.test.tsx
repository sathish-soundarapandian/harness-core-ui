/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import userEvent from '@testing-library/user-event'
import {
  act,
  findByText,
  fireEvent,
  getByText,
  queryByAttribute,
  render,
  waitFor,
  RenderResult
} from '@testing-library/react'
import { Formik, FormikForm, RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { useMutateAsGet } from '@common/hooks'
import { TestWrapper } from '@common/utils/testUtils'
import type { FeatureFlag } from '@common/featureFlags'
import { connectorsData } from '@connectors/pages/connectors/__tests__/mockData'
import type { ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'
import { ArtifactSourceBaseFactory } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBaseFactory'
import type { K8SDirectServiceStep } from '@cd/components/PipelineSteps/K8sServiceSpec/K8sServiceSpecInterface'
import { AmazonS3ArtifactSource } from '../AmazonS3ArtifactSource'
import {
  awsRegionsData,
  bucketListData,
  templateAmazonS3Artifact,
  templateAmazonS3ArtifactWithFilePathRegex,
  templateAmazonS3ArtifactWithoutConnectorRef,
  filePathListData
} from './mock'

// Mock API and Functions
const fetchConnectors = (): Promise<unknown> => Promise.resolve(connectorsData)
const fetchBuckets = jest.fn().mockReturnValue(bucketListData)
const fetchFilePaths = jest.fn().mockReturnValue(filePathListData)
jest.mock('services/cd-ng', () => ({
  getConnectorListPromise: jest.fn().mockImplementation(() => Promise.resolve(connectorsData)),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: connectorsData.data.content[0], refetch: fetchConnectors, loading: false }
  }),
  useListBucketsWithServiceV2: jest.fn().mockImplementation(() => {
    return { data: bucketListData, refetch: fetchBuckets, error: null, loading: false }
  }),
  useGetFilePathsForS3: jest.fn().mockImplementation(() => {
    return { data: filePathListData, refetch: fetchFilePaths, error: null, loading: false }
  })
}))
jest.mock('services/portal', () => ({
  useListAwsRegions: jest.fn().mockImplementation(() => {
    return { data: awsRegionsData, error: null, loading: false }
  })
}))

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return { data: bucketListData, refetch: fetchBuckets, error: null, loading: false }
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
  template: templateAmazonS3Artifact,
  path: artifactCommonPath,
  initialValues: commonInitialValues,
  accountId: 'testAccoountId',
  projectIdentifier: 'testProject',
  orgIdentifier: 'testOrg',
  readonly: false,
  stageIdentifier: 'Stage_1',
  allowableTypes: [],
  fromTrigger: false,
  artifacts: {
    primary: {
      type: 'AmazonS3',
      spec: {
        region: '',
        connectorRef: '',
        bucketName: '',
        filePath: ''
      }
    }
  },
  artifact: {
    identifier: '',
    type: 'AmazonS3',
    spec: {
      region: RUNTIME_INPUT_VALUE,
      connectorRef: RUNTIME_INPUT_VALUE,
      bucketName: RUNTIME_INPUT_VALUE,
      filePath: RUNTIME_INPUT_VALUE
    }
  },
  isSidecar: false,
  artifactPath: 'primary',
  isArtifactsRuntime: true,
  pipelineIdentifier: 'testPipeline',
  artifactSourceBaseFactory: new ArtifactSourceBaseFactory()
}

const renderComponent = (
  passedProps?: Omit<ArtifactSourceRenderProps, 'formik'>,
  featureFlags?: Partial<Record<FeatureFlag, boolean>>
): RenderResult => {
  return render(
    <TestWrapper defaultFeatureFlagValues={featureFlags}>
      <Formik initialValues={passedProps?.artifact} formName="amazonS3Artifact" onSubmit={submitForm}>
        {formikProps => (
          <FormikForm>
            {new AmazonS3ArtifactSource().renderContent({ formik: formikProps, ...(passedProps ?? props) })}
          </FormikForm>
        )}
      </Formik>
    </TestWrapper>
  )
}

describe('AmazonS3ArtifactSource tests', () => {
  beforeEach(() => {
    ;(useMutateAsGet as any).mockImplementation(() => {
      return { data: bucketListData, refetch: fetchBuckets, error: null, loading: false }
    })
    fetchBuckets.mockReset()
    fetchFilePaths.mockReset()
  })

  test(`when isArtifactsRuntime is false`, () => {
    const { container } = renderComponent({ ...props, isArtifactsRuntime: false })

    expect(container.querySelector(`input[name='${artifactCommonPath}.artifacts.primary.spec.bucketName']`)).toBeNull()
    expect(container.querySelector(`input[name='${artifactCommonPath}.artifacts.primary.spec.filePath']`)).toBeNull()
    expect(
      container.querySelector(`input[name='${artifactCommonPath}.artifacts.primary.spec.filePathRegex']`)
    ).toBeNull()
    expect(container).toMatchSnapshot()
  })

  test(`renders fine for all Runtime values when filePath is present`, () => {
    const { container } = renderComponent()

    expect(
      container.querySelector(`input[name='${artifactCommonPath}.artifacts.primary.spec.bucketName']`)
    ).not.toBeNull()
    expect(
      container.querySelector(`input[name='${artifactCommonPath}.artifacts.primary.spec.filePath']`)
    ).not.toBeNull()
    expect(
      container.querySelector(`input[name='${artifactCommonPath}.artifacts.primary.spec.filePathRegex']`)
    ).toBeNull()
    expect(container).toMatchSnapshot()
  })

  test(`renders fine for all Runtime values when filePathRegex is present`, () => {
    const { container } = renderComponent({ ...props, template: templateAmazonS3ArtifactWithFilePathRegex })

    expect(
      container.querySelector(`input[name='${artifactCommonPath}.artifacts.primary.spec.bucketName']`)
    ).not.toBeNull()
    expect(container.querySelector(`input[name='${artifactCommonPath}.artifacts.primary.spec.filePath']`)).toBeNull()
    expect(
      container.querySelector(`input[name='${artifactCommonPath}.artifacts.primary.spec.filePathRegex']`)
    ).not.toBeNull()
    expect(container).toMatchSnapshot()
  })

  test(`when readonly is true, all fields should be disabled`, () => {
    const { container } = renderComponent({ ...props, readonly: true })

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    const connnectorRefInput = queryByAttribute('data-testid', container, /connectorRef/)
    const regionInput = queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.region`)
    const bucketNameInput = queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.bucketName`)
    const filePathInput = queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.filePath`)
    expect(regionInput).toBeDisabled()
    expect(connnectorRefInput).toBeDisabled()
    expect(bucketNameInput).toBeDisabled()
    expect(filePathInput).toBeDisabled()
  })

  test(`clicking on Bucket Name field should call fetchBuckets function and display no buckets option when bucket data is not present`, async () => {
    ;(useMutateAsGet as any).mockImplementation(() => {
      return { data: null, refetch: fetchBuckets, error: null, loading: false }
    })

    const { container } = renderComponent({
      ...props,
      artifact: {
        identifier: '',
        type: 'AmazonS3',
        spec: {
          connectorRef: 'AWSX',
          region: RUNTIME_INPUT_VALUE,
          bucketName: RUNTIME_INPUT_VALUE,
          filePath: RUNTIME_INPUT_VALUE
        }
      },
      template: templateAmazonS3ArtifactWithoutConnectorRef
    })

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    const bucketNameDropDownButton = container.querySelectorAll('[data-icon="chevron-down"]')[1]
    fireEvent.click(bucketNameDropDownButton!)
    expect(portalDivs.length).toBe(1)
    const dropdownPortalDiv = portalDivs[0]
    const selectListMenu = dropdownPortalDiv.querySelector('.bp3-menu')
    const noBucketsOption = await findByText(selectListMenu as HTMLElement, 'pipeline.noBucketsFound')
    expect(noBucketsOption).toBeDefined()
    await waitFor(() => expect(fetchBuckets).toHaveBeenCalled())
  })

  test(`clicking on Bucket Name field should NOT call fetchBuckets function when loading is already true`, async () => {
    ;(useMutateAsGet as any).mockImplementation(() => {
      return { data: null, refetch: fetchBuckets, error: null, loading: true }
    })

    const { container } = renderComponent({
      ...props,
      artifact: {
        identifier: '',
        type: 'AmazonS3',
        spec: {
          connectorRef: 'AWSX',
          region: RUNTIME_INPUT_VALUE,
          bucketName: RUNTIME_INPUT_VALUE,
          filePath: RUNTIME_INPUT_VALUE
        }
      },
      template: templateAmazonS3ArtifactWithoutConnectorRef
    })

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    const bucketNameDropDownButton = container.querySelectorAll('[data-icon="chevron-down"]')[1]
    userEvent.click(bucketNameDropDownButton!)
    expect(portalDivs.length).toBe(1)
    await waitFor(() => expect(fetchBuckets).not.toHaveBeenCalled())
  })

  test(`clicking on File Path field should call fetchFilePaths function and display no file path option when file path data is not present`, async () => {
    ;(useMutateAsGet as any).mockImplementation(() => {
      return { data: null, refetch: fetchFilePaths, error: null, loading: false }
    })

    const { container } = renderComponent({
      ...props,
      artifact: {
        identifier: '',
        type: 'AmazonS3',
        spec: {
          connectorRef: 'AWSX',
          region: RUNTIME_INPUT_VALUE,
          bucketName: 'cdng-terraform-state',
          filePath: RUNTIME_INPUT_VALUE
        }
      },
      template: templateAmazonS3ArtifactWithoutConnectorRef
    })

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    const filePathDropDownButton = container.querySelectorAll('[data-icon="chevron-down"]')[2]
    fireEvent.click(filePathDropDownButton!)
    expect(portalDivs.length).toBe(1)
    const dropdownPortalDiv = portalDivs[0]
    const selectListMenu = dropdownPortalDiv.querySelector('.bp3-menu')
    const noFilePathsOption = await findByText(selectListMenu as HTMLElement, 'pipeline.noFilePathsFound')
    expect(noFilePathsOption).toBeDefined()
    await waitFor(() => expect(fetchFilePaths).toHaveBeenCalled())
  })

  test(`clicking on File Path field should NOT call fetchFilePaths function when loading is already true`, async () => {
    ;(useMutateAsGet as any).mockImplementation(() => {
      return { data: null, refetch: fetchFilePaths, error: null, loading: true }
    })

    const { container } = renderComponent({
      ...props,
      artifact: {
        identifier: '',
        type: 'AmazonS3',
        spec: {
          connectorRef: 'AWSX',
          region: RUNTIME_INPUT_VALUE,
          bucketName: 'cdng-terraform-state',
          filePath: RUNTIME_INPUT_VALUE
        }
      },
      template: templateAmazonS3ArtifactWithoutConnectorRef
    })

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    const filePathDropDownButton = container.querySelectorAll('[data-icon="chevron-down"]')[2]
    userEvent.click(filePathDropDownButton!)
    expect(portalDivs.length).toBe(1)
    await waitFor(() => expect(fetchFilePaths).not.toHaveBeenCalled())
  })

  test(`selecting connector should reset bucketName value`, async () => {
    ;(useMutateAsGet as any).mockImplementation(() => {
      return { data: bucketListData, refetch: fetchBuckets, error: null, loading: false }
    })

    const { container } = renderComponent({
      ...props,
      artifacts: {
        primary: {
          type: 'AmazonS3',
          spec: {
            connectorRef: 'Git_CTR',
            bucketName: '',
            filePath: ''
          }
        }
      },
      artifact: {
        identifier: '',
        type: 'AmazonS3',
        spec: {
          connectorRef: 'Git_CTR',
          bucketName: RUNTIME_INPUT_VALUE,
          filePath: RUNTIME_INPUT_VALUE
        }
      },
      template: templateAmazonS3Artifact
    })

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    // Choose first option for bucketName from dropdown
    const bucketNameInput = queryByNameAttribute(
      `${artifactCommonPath}.artifacts.primary.spec.bucketName`
    ) as HTMLInputElement
    expect(bucketNameInput).not.toBeNull()
    expect(bucketNameInput).not.toBeDisabled()
    expect(bucketNameInput.value).toBe('')
    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)
    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    const bucketNameDropDownIcon = dropdownIcons[2]
    fireEvent.click(bucketNameDropDownIcon!)
    expect(fetchBuckets).toHaveBeenCalledTimes(1)
    expect(portalDivs.length).toBe(1)
    const dropdownPortalDiv = portalDivs[0]
    const selectListMenu = dropdownPortalDiv.querySelector('.bp3-menu')
    const firstOption = await findByText(selectListMenu as HTMLElement, 'tdp-tdp2-1rc6irugmilkh')
    expect(firstOption).toBeDefined()
    userEvent.click(firstOption)
    expect(bucketNameInput.value).toBe('tdp-tdp2-1rc6irugmilkh')

    // Switch the connector - choose AWS connector for connectorRef field
    const connnectorRefInput = queryByAttribute('data-testid', container, /connectorRef/)
    expect(connnectorRefInput).toBeTruthy()
    if (connnectorRefInput) {
      act(() => {
        fireEvent.click(connnectorRefInput)
      })
    }
    await act(async () => {
      const connectorSelectorDialog = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement
      const awsConnector = await findByText(connectorSelectorDialog as HTMLElement, 'AWS')
      expect(awsConnector).toBeTruthy()
      fireEvent.click(awsConnector)
      const applySelected = getByText(connectorSelectorDialog, 'entityReference.apply')
      await act(async () => {
        fireEvent.click(applySelected)
      })
    })
    expect(fetchBuckets).toHaveBeenCalledTimes(1)
    // Expect bucketName field values to be empty after switching connector
    expect(bucketNameInput.value).toBe('')

    // Choose second option for bucketName from dropdown
    expect(portalDivs.length).toBe(2)
    userEvent.click(bucketNameDropDownIcon!)
    expect(fetchBuckets).toHaveBeenCalledTimes(1)
    expect(portalDivs.length).toBe(2)
    const bucketNameDropdownPortalDiv = portalDivs[0]
    const dropdownOptionList = bucketNameDropdownPortalDiv.querySelector('.bp3-menu')
    const secondOption = await findByText(dropdownOptionList as HTMLElement, 'cdng-terraform-state')
    expect(secondOption).toBeDefined()
    userEvent.click(secondOption)
    expect(bucketNameInput.value).toBe('cdng-terraform-state')
  })

  test(`selecting connector should reset filePath value`, async () => {
    ;(useMutateAsGet as any).mockImplementation(() => {
      return { data: filePathListData, refetch: fetchFilePaths, error: null, loading: false }
    })

    const { container } = renderComponent({
      ...props,
      artifacts: {
        primary: {
          type: 'AmazonS3',
          spec: {
            connectorRef: 'Git_CTR',
            bucketName: 'cdng-terraform-state',
            filePath: ''
          }
        }
      },
      artifact: {
        identifier: '',
        type: 'AmazonS3',
        spec: {
          connectorRef: 'Git_CTR',
          bucketName: 'cdng-terraform-state',
          filePath: RUNTIME_INPUT_VALUE
        }
      },
      template: templateAmazonS3Artifact
    })

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    // Choose first option for bucketName from dropdown
    const filePathInput = queryByNameAttribute(
      `${artifactCommonPath}.artifacts.primary.spec.filePath`
    ) as HTMLInputElement
    expect(filePathInput).not.toBeNull()
    expect(filePathInput).not.toBeDisabled()
    expect(filePathInput.value).toBe('')
    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)
    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    expect(dropdownIcons.length).toBe(4)
    const filePathDropDownIcon = dropdownIcons[3]
    userEvent.click(filePathDropDownIcon!)
    expect(fetchFilePaths).toHaveBeenCalledTimes(1)
    expect(portalDivs.length).toBe(1)
    const dropdownPortalDiv = portalDivs[0]
    const selectListMenu = dropdownPortalDiv.querySelector('.bp3-menu')
    const firstOption = await findByText(selectListMenu as HTMLElement, 'folderName/filePath1.yaml')
    expect(firstOption).toBeDefined()
    userEvent.click(firstOption)
    expect(filePathInput.value).toBe('folderName/filePath1.yaml')

    // Switch the connector - choose AWS connector for connectorRef field
    const connnectorRefInput = queryByAttribute('data-testid', container, /connectorRef/)
    expect(connnectorRefInput).toBeTruthy()
    if (connnectorRefInput) {
      userEvent.click(connnectorRefInput)
    }
    await act(async () => {
      const connectorSelectorDialog = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement
      const awsConnector = await findByText(connectorSelectorDialog as HTMLElement, 'AWS')
      expect(awsConnector).toBeTruthy()
      userEvent.click(awsConnector)
      const applySelected = getByText(connectorSelectorDialog, 'entityReference.apply')
      userEvent.click(applySelected)
    })
    expect(fetchFilePaths).toHaveBeenCalledTimes(1)
    // Expect filePath field values to be empty after switching connector
    expect(filePathInput.value).toBe('')

    // Choose second option for bucketName from dropdown
    expect(portalDivs.length).toBe(2)
    userEvent.click(filePathDropDownIcon!)
    expect(fetchFilePaths).toHaveBeenCalledTimes(1)
    expect(portalDivs.length).toBe(2)
    const filePathDropdownPortalDiv = portalDivs[0]
    const dropdownOptionList = filePathDropdownPortalDiv.querySelector('.bp3-menu')
    const secondOption = await findByText(dropdownOptionList as HTMLElement, 'folderName/filePath2.yaml')
    expect(secondOption).toBeDefined()
    userEvent.click(secondOption)
    expect(filePathInput.value).toBe('folderName/filePath2.yaml')
  })

  test(`on change of region value, existing bucketName should be cleared`, async () => {
    const { container } = renderComponent({
      ...props,
      artifacts: {
        primary: {
          type: 'AmazonS3',
          spec: {
            connectorRef: 'Git_CTR',
            bucketName: '',
            region: '',
            filePath: ''
          }
        }
      },
      artifact: {
        identifier: '',
        type: 'AmazonS3',
        spec: {
          connectorRef: 'Git_CTR',
          region: RUNTIME_INPUT_VALUE,
          bucketName: RUNTIME_INPUT_VALUE,
          filePath: RUNTIME_INPUT_VALUE
        }
      },
      template: templateAmazonS3Artifact
    })

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    const bucketNameSelect = queryByNameAttribute(
      `${artifactCommonPath}.artifacts.primary.spec.bucketName`
    ) as HTMLInputElement

    // Select bucketName from dropdown
    const bucketNameDropDownButton = container.querySelectorAll('[data-icon="chevron-down"]')[2]
    fireEvent.click(bucketNameDropDownButton!)
    expect(portalDivs.length).toBe(1)
    const dropdownPortalDiv = portalDivs[0]
    const selectListMenu = dropdownPortalDiv.querySelector('.bp3-menu')
    const selectItem = await findByText(selectListMenu as HTMLElement, 'prod-bucket-339')
    act(() => {
      fireEvent.click(selectItem)
    })
    expect(bucketNameSelect.value).toBe('prod-bucket-339')

    // Select region from dropdown
    const regionDropDownButton = container.querySelectorAll('[data-icon="chevron-down"]')[1]
    fireEvent.click(regionDropDownButton!)
    expect(portalDivs.length).toBe(2)
    const dropdownPortalDivRegion = portalDivs[1]
    const selectListMenuRegion = dropdownPortalDivRegion.querySelector('.bp3-menu')
    const selectItemRegion = await findByText(selectListMenuRegion as HTMLElement, 'GovCloud (US-West)')
    act(() => {
      fireEvent.click(selectItemRegion)
    })
    const regionSelect = queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.region`) as HTMLInputElement
    expect(regionSelect.value).toBe('GovCloud (US-West)')
    // Expect bucketName's value to be empty string
    await waitFor(() => expect(bucketNameSelect.value).toBe(''))
  })

  test(`Servive V2 - file options should appear if connectorRef and bucketName values are available`, async () => {
    ;(useMutateAsGet as any).mockImplementation(() => {
      return { data: filePathListData, refetch: fetchFilePaths, error: null, loading: false }
    })
    const { container } = renderComponent(
      {
        ...props,
        artifacts: {
          primary: {
            type: 'AmazonS3',
            spec: {
              connectorRef: 'Git_CTR',
              bucketName: '',
              region: '',
              filePath: ''
            }
          }
        },
        artifact: {
          identifier: '',
          type: 'AmazonS3',
          spec: {
            connectorRef: 'Git_CTR',
            region: RUNTIME_INPUT_VALUE,
            bucketName: 'cdng-terraform-state',
            filePath: RUNTIME_INPUT_VALUE
          }
        },
        template: templateAmazonS3Artifact
      },
      { NG_SVC_ENV_REDESIGN: true }
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    const regionSelect = queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.region`) as HTMLInputElement
    expect(regionSelect).toBeInTheDocument()
    const bucketNameSelect = queryByNameAttribute(
      `${artifactCommonPath}.artifacts.primary.spec.bucketName`
    ) as HTMLInputElement
    expect(bucketNameSelect).toBeInTheDocument()
    const filePathSelect = queryByNameAttribute(
      `${artifactCommonPath}.artifacts.primary.spec.filePath`
    ) as HTMLInputElement
    expect(filePathSelect).toBeInTheDocument()
    expect(fetchFilePaths).not.toBeCalled()

    // Select region from dropdown
    const regionDropDownButton = container.querySelectorAll('[data-icon="chevron-down"]')[1]
    fireEvent.click(regionDropDownButton!)
    expect(portalDivs.length).toBe(1)
    const dropdownPortalDivRegion = portalDivs[0]
    const selectListMenuRegion = dropdownPortalDivRegion.querySelector('.bp3-menu')
    const selectItemRegion = await findByText(selectListMenuRegion as HTMLElement, 'GovCloud (US-West)')
    act(() => {
      fireEvent.click(selectItemRegion)
    })
    expect(regionSelect.value).toBe('GovCloud (US-West)')

    // Select filePath from dropdown
    const filePathDropDownButton = container.querySelectorAll('[data-icon="chevron-down"]')[3]
    userEvent.click(filePathDropDownButton!)
    expect(portalDivs.length).toBe(2)
    const filePathDropdownPortalDiv = portalDivs[1]
    const filePathSelectListMenu = filePathDropdownPortalDiv.querySelector('.bp3-menu')
    const filePathSelectItem = await findByText(filePathSelectListMenu as HTMLElement, 'folderName/filePath1.yaml')
    userEvent.click(filePathSelectItem)
    expect(filePathSelect.value).toBe('folderName/filePath1.yaml')
  })

  test(`Servive V2 - bucket options should appear if connectorRef value is available`, async () => {
    ;(useMutateAsGet as any).mockImplementation(() => {
      return { data: bucketListData, refetch: fetchBuckets, error: null, loading: false }
    })
    const { container } = renderComponent(
      {
        ...props,
        artifacts: {
          primary: {
            type: 'AmazonS3',
            spec: {
              connectorRef: 'Git_CTR',
              bucketName: '',
              region: '',
              filePath: ''
            }
          }
        },
        artifact: {
          identifier: '',
          type: 'AmazonS3',
          spec: {
            connectorRef: 'Git_CTR',
            region: RUNTIME_INPUT_VALUE,
            bucketName: RUNTIME_INPUT_VALUE,
            filePath: RUNTIME_INPUT_VALUE
          }
        },
        template: templateAmazonS3Artifact
      },
      { NG_SVC_ENV_REDESIGN: true }
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    const regionSelect = queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.region`) as HTMLInputElement
    expect(regionSelect).toBeInTheDocument()
    const bucketNameSelect = queryByNameAttribute(
      `${artifactCommonPath}.artifacts.primary.spec.bucketName`
    ) as HTMLInputElement
    expect(bucketNameSelect).toBeInTheDocument()
    expect(fetchBuckets).not.toBeCalled()
    const filePathSelect = queryByNameAttribute(
      `${artifactCommonPath}.artifacts.primary.spec.filePath`
    ) as HTMLInputElement
    expect(filePathSelect).toBeInTheDocument()
    expect(fetchFilePaths).not.toBeCalled()

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    // Select region from dropdown
    const bucketNameDropDownButton = container.querySelectorAll('[data-icon="chevron-down"]')[2]
    userEvent.click(bucketNameDropDownButton!)
    expect(portalDivs.length).toBe(1)
    const dropdownPortalDivBucketName = portalDivs[0]
    const selectListMenuBucketName = dropdownPortalDivBucketName.querySelector('.bp3-menu')
    const selectItemBucketName = await findByText(selectListMenuBucketName as HTMLElement, 'cdng-terraform-state')
    userEvent.click(selectItemBucketName)
    expect(bucketNameSelect.value).toBe('cdng-terraform-state')
  })

  test(`on change of region value, existing filePath should be cleared`, async () => {
    ;(useMutateAsGet as any).mockImplementation(() => {
      return { data: filePathListData, refetch: fetchFilePaths, error: null, loading: false }
    })
    const { container } = renderComponent({
      ...props,
      artifacts: {
        primary: {
          type: 'AmazonS3',
          spec: {
            connectorRef: 'Git_CTR',
            bucketName: 'cdng-terraform-state',
            region: '',
            filePath: ''
          }
        }
      },
      artifact: {
        identifier: '',
        type: 'AmazonS3',
        spec: {
          connectorRef: 'Git_CTR',
          region: RUNTIME_INPUT_VALUE,
          bucketName: 'cdng-terraform-state',
          filePath: RUNTIME_INPUT_VALUE
        }
      },
      template: templateAmazonS3Artifact
    })

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    const filePathSelect = queryByNameAttribute(
      `${artifactCommonPath}.artifacts.primary.spec.filePath`
    ) as HTMLInputElement

    // Select filePath from dropdown
    const filePathDropDownButton = container.querySelectorAll('[data-icon="chevron-down"]')[3]
    fireEvent.click(filePathDropDownButton!)
    expect(portalDivs.length).toBe(1)
    const dropdownPortalDiv = portalDivs[0]
    const selectListMenu = dropdownPortalDiv.querySelector('.bp3-menu')
    const selectItem = await findByText(selectListMenu as HTMLElement, 'folderName/filePath3.yaml')
    act(() => {
      fireEvent.click(selectItem)
    })
    expect(filePathSelect.value).toBe('folderName/filePath3.yaml')

    // Select region from dropdown
    const regionDropDownButton = container.querySelectorAll('[data-icon="chevron-down"]')[1]
    fireEvent.click(regionDropDownButton!)
    expect(portalDivs.length).toBe(2)
    const dropdownPortalDivRegion = portalDivs[1]
    const selectListMenuRegion = dropdownPortalDivRegion.querySelector('.bp3-menu')
    const selectItemRegion = await findByText(selectListMenuRegion as HTMLElement, 'GovCloud (US-West)')
    act(() => {
      fireEvent.click(selectItemRegion)
    })
    const regionSelect = queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.region`) as HTMLInputElement
    expect(regionSelect.value).toBe('GovCloud (US-West)')
    // Expect filePath's value to be empty string
    await waitFor(() => expect(filePathSelect.value).toBe(''))
  })
})
