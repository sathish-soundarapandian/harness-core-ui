/*
 * Copyright 2021 Harness Inc. All rights reserved.
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
import { imagesListData } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/ECRArtifact/__tests__/mock'
import { ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import type { ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'
import { ArtifactSourceBaseFactory } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBaseFactory'
import type { K8SDirectServiceStep } from '@cd/components/PipelineSteps/K8sServiceSpec/K8sServiceSpecInterface'
import { ECRArtifactSource } from '../ECRArtifactSource'
import {
  awsRegionsData,
  templateECRArtifact,
  templateECRArtifactWithTagRegex,
  templateECRArtifactWithoutConnectorRef,
  tagsListData
} from './mock'

// Mock API and Functions
const fetchConnectors = (): Promise<unknown> => Promise.resolve(connectorsData)
const fetchImages = jest.fn().mockReturnValue(imagesListData)
const fetchTags = jest.fn().mockReturnValue(tagsListData)
jest.mock('services/cd-ng', () => ({
  getConnectorListV2Promise: jest.fn().mockImplementation(() => Promise.resolve(connectorsData)),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: connectorsData.data.content[0], refetch: fetchConnectors, loading: false }
  }),
  useGetImagesListForEcr: jest.fn().mockImplementation(() => {
    return { data: null, refetch: fetchImages, error: null, loading: false }
  }),
  useGetBuildDetailsForEcr: () =>
    jest.fn().mockImplementation(() => {
      return { data: { data: { buildDetailsList: [] } }, refetch: jest.fn(), error: null }
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
    return { data: null, refetch: fetchImages, error: null, loading: false }
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
  template: templateECRArtifact,
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
      type: ENABLED_ARTIFACT_TYPES.Ecr,
      spec: {
        connectorRef: '',
        region: '',
        imagePath: '',
        tag: ''
      }
    }
  },
  artifact: {
    identifier: '',
    type: ENABLED_ARTIFACT_TYPES.Ecr,
    spec: {
      connectorRef: RUNTIME_INPUT_VALUE,
      region: RUNTIME_INPUT_VALUE,
      imagePath: RUNTIME_INPUT_VALUE,
      tag: RUNTIME_INPUT_VALUE
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
      <Formik initialValues={passedProps?.artifact} formName="ecrArtifact" onSubmit={submitForm}>
        {formikProps => (
          <FormikForm>
            {new ECRArtifactSource().renderContent({ formik: formikProps, ...(passedProps ?? props) })}
          </FormikForm>
        )}
      </Formik>
    </TestWrapper>
  )
}

describe('ECRArtifactSource tests', () => {
  beforeEach(() => {
    ;(useMutateAsGet as any).mockImplementation(() => {
      return { data: imagesListData, refetch: fetchImages, error: null, loading: false }
    })
    fetchImages.mockReset()
    fetchTags.mockReset()
  })

  test(`when isArtifactsRuntime is false`, () => {
    const { container } = renderComponent({ ...props, isArtifactsRuntime: false })

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    expect(queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.connectorRef`)).toBeNull()
    expect(queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.region`)).toBeNull()
    expect(queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.imagePath`)).toBeNull()
    expect(queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.tag`)).toBeNull()
    expect(queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.tagRegex`)).toBeNull()
  })

  test(`renders fine for all Runtime values when tag is present`, () => {
    const { container } = renderComponent()

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    expect(queryByAttribute('data-testid', container, /connectorRef/)).not.toBeNull()
    expect(queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.region`)).not.toBeNull()
    expect(queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.imagePath`)).not.toBeNull()
    expect(queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.tag`)).not.toBeNull()
    expect(queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.tagRegex`)).toBeNull()
  })

  test(`renders fine for all Runtime values when tagRegex is present`, () => {
    const { container } = renderComponent({ ...props, template: templateECRArtifactWithTagRegex })

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    expect(queryByAttribute('data-testid', container, /connectorRef/)).not.toBeNull()
    expect(queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.region`)).not.toBeNull()
    expect(queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.imagePath`)).not.toBeNull()
    expect(queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.tag`)).toBeNull()
    expect(queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.tagRegex`)).not.toBeNull()
  })

  test(`when readonly is true, all fields should be disabled`, () => {
    const { container } = renderComponent({ ...props, readonly: true })

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    const connnectorRefInput = queryByAttribute('data-testid', container, /connectorRef/)
    const regionInput = queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.region`)
    const imagePathInput = queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.imagePath`)
    const tagInput = queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.tag`)
    expect(regionInput).toBeDisabled()
    expect(connnectorRefInput).toBeDisabled()
    expect(imagePathInput).toBeDisabled()
    expect(tagInput).toBeDisabled()
  })

  test(`clicking on Image Path field should call fetchImages function and display no images option when images data is not present`, async () => {
    ;(useMutateAsGet as any).mockImplementation(() => {
      return { data: null, refetch: fetchImages, error: null, loading: false }
    })

    const { container } = renderComponent({
      ...props,
      artifact: {
        identifier: '',
        type: ENABLED_ARTIFACT_TYPES.Ecr,
        spec: {
          connectorRef: 'AWSX',
          region: 'US East (N. Virginia)',
          imagePath: RUNTIME_INPUT_VALUE,
          tag: RUNTIME_INPUT_VALUE
        }
      },
      template: templateECRArtifactWithoutConnectorRef
    })

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    const imagePathDropDownButton = container.querySelectorAll('[data-icon="chevron-down"]')[1]
    fireEvent.click(imagePathDropDownButton!)
    expect(portalDivs.length).toBe(1)
    const dropdownPortalDiv = portalDivs[0]
    const selectListMenu = dropdownPortalDiv.querySelector('.bp3-menu')
    const noImagesOption = await findByText(selectListMenu as HTMLElement, 'pipeline.noImagesFound')
    expect(noImagesOption).toBeInTheDocument()
    await waitFor(() => expect(fetchImages).toHaveBeenCalled())
  })

  test(`clicking on Image Path field should NOT call fetchImages function when loading is already true`, async () => {
    ;(useMutateAsGet as any).mockImplementation(() => {
      return { data: null, refetch: fetchImages, error: null, loading: true }
    })

    const { container } = renderComponent({
      ...props,
      artifact: {
        identifier: '',
        type: ENABLED_ARTIFACT_TYPES.Ecr,
        spec: {
          connectorRef: 'AWSX',
          region: RUNTIME_INPUT_VALUE,
          imagePath: RUNTIME_INPUT_VALUE,
          tag: RUNTIME_INPUT_VALUE
        }
      },
      template: templateECRArtifactWithoutConnectorRef
    })

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    const imagePathDropDownButton = container.querySelectorAll('[data-icon="chevron-down"]')[1]
    await userEvent.click(imagePathDropDownButton!)
    expect(portalDivs.length).toBe(1)
    await waitFor(() => expect(fetchImages).not.toHaveBeenCalled())
  })

  test(`clicking on Tag field should call fetchTags function and display no tags option when tag data is not present`, async () => {
    ;(useMutateAsGet as any).mockImplementation(() => {
      return { data: null, refetch: fetchTags, error: null, loading: false }
    })

    const { container } = renderComponent({
      ...props,
      artifact: {
        identifier: '',
        type: ENABLED_ARTIFACT_TYPES.Ecr,
        spec: {
          connectorRef: 'AWSX',
          region: 'US East (N. Virginia)',
          imagePath: 'helm-test-chart',
          tag: RUNTIME_INPUT_VALUE
        }
      },
      template: templateECRArtifactWithoutConnectorRef
    })

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    const tagDropDownButton = container.querySelectorAll('[data-icon="chevron-down"]')[2]
    await userEvent.click(tagDropDownButton!)
    const allSelectListMenu = document.getElementsByClassName('bp3-menu')
    const noTagsOption = await findByText(allSelectListMenu[0] as HTMLElement, 'pipelineSteps.deploy.errors.notags')
    expect(noTagsOption).toBeDefined()
    await waitFor(() => expect(fetchTags).toHaveBeenCalled())
  })

  test(`selecting connector should reset Image Path value`, async () => {
    ;(useMutateAsGet as any).mockImplementation(() => {
      return { data: imagesListData, refetch: fetchImages, error: null, loading: false }
    })

    const { container } = renderComponent({
      ...props,
      artifacts: {
        primary: {
          type: ENABLED_ARTIFACT_TYPES.Ecr,
          spec: {
            connectorRef: 'Git_CTR',
            region: 'us-east-1',
            imagePath: '',
            tag: ''
          }
        }
      },
      artifact: {
        identifier: '',
        type: ENABLED_ARTIFACT_TYPES.Ecr,
        spec: {
          connectorRef: 'Git_CTR',
          region: 'US East (N. Virginia)',
          imagePath: RUNTIME_INPUT_VALUE,
          tag: RUNTIME_INPUT_VALUE
        }
      },
      template: templateECRArtifact
    })

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    // Choose third option for imagePath from dropdown
    const imagePathInput = queryByNameAttribute(
      `${artifactCommonPath}.artifacts.primary.spec.imagePath`
    ) as HTMLInputElement
    expect(imagePathInput).not.toBeNull()
    expect(imagePathInput).not.toBeDisabled()
    expect(imagePathInput.value).toBe('')
    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)
    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    const imagePathDropDownIcon = dropdownIcons[2]
    await userEvent.click(imagePathDropDownIcon!)
    expect(fetchImages).toHaveBeenCalledTimes(1)
    expect(portalDivs.length).toBe(1)
    const dropdownPortalDiv = portalDivs[0]
    const selectListMenu = dropdownPortalDiv.querySelector('.bp3-menu')
    const thirdOption = await findByText(selectListMenu as HTMLElement, 'helm-test-chart')
    expect(thirdOption).toBeDefined()
    await userEvent.click(thirdOption)
    expect(imagePathInput.value).toBe('helm-test-chart')

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
    expect(fetchImages).toHaveBeenCalledTimes(1)
    // Expect imagePath field values to be empty after switching connector
    expect(imagePathInput.value).toBe('')

    // Choose first option for imagePath from dropdown
    expect(portalDivs.length).toBe(2)
    await userEvent.click(imagePathDropDownIcon!)
    expect(fetchImages).toHaveBeenCalledTimes(1)
    expect(portalDivs.length).toBe(2)
    const imagePathDropdownPortalDiv = portalDivs[0]
    const dropdownOptionList = imagePathDropdownPortalDiv.querySelector('.bp3-menu')
    const firstOption = await findByText(dropdownOptionList as HTMLElement, 'harnesscie-advanced-testingui')
    expect(firstOption).toBeDefined()
    await userEvent.click(firstOption)
    expect(imagePathInput.value).toBe('harnesscie-advanced-testingui')
  })

  test(`selecting connector should reset tag value`, async () => {
    ;(useMutateAsGet as any).mockImplementation(() => {
      return { data: tagsListData, refetch: fetchTags, error: null, loading: false }
    })

    const { container } = renderComponent({
      ...props,
      artifacts: {
        primary: {
          type: ENABLED_ARTIFACT_TYPES.Ecr,
          spec: {
            connectorRef: 'Git_CTR',
            region: 'us-east-1',
            imagePath: 'harnesscie-advanced-testingui',
            tag: ''
          }
        }
      },
      artifact: {
        identifier: '',
        type: ENABLED_ARTIFACT_TYPES.Ecr,
        spec: {
          connectorRef: 'Git_CTR',
          region: 'us-east-1',
          imagePath: 'harnesscie-advanced-testingui',
          tag: RUNTIME_INPUT_VALUE
        }
      },
      template: templateECRArtifact
    })

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    // Choose first option for imagePath from dropdown
    const tagInput = queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.tag`) as HTMLInputElement
    expect(tagInput).not.toBeNull()
    expect(tagInput).not.toBeDisabled()
    expect(tagInput.value).toBe('')
    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)
    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    expect(dropdownIcons.length).toBe(4)
    const tagDropDownIcon = dropdownIcons[3]
    await userEvent.click(tagDropDownIcon!)
    expect(fetchTags).toHaveBeenCalledTimes(1)
    expect(portalDivs.length).toBe(1)
    const tagDropdownPortalDiv = portalDivs[0]
    const selectListMenu = tagDropdownPortalDiv.querySelector('.bp3-menu')
    const firstOption = await findByText(selectListMenu as HTMLElement, '0.0.1')
    expect(firstOption).toBeDefined()
    await userEvent.click(firstOption)
    expect(tagInput.value).toBe('0.0.1')

    // Switch the connector - choose AWS connector for connectorRef field
    const connnectorRefInput = queryByAttribute('data-testid', container, /connectorRef/)
    expect(connnectorRefInput).toBeTruthy()
    if (connnectorRefInput) {
      await userEvent.click(connnectorRefInput)
    }
    await act(async () => {
      const connectorSelectorDialog = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement
      const awsConnector = await findByText(connectorSelectorDialog as HTMLElement, 'AWS')
      expect(awsConnector).toBeTruthy()
      await userEvent.click(awsConnector)
      const applySelected = getByText(connectorSelectorDialog, 'entityReference.apply')
      await userEvent.click(applySelected)
    })
    expect(fetchTags).toHaveBeenCalledTimes(1)
    // Expect tag field values to be empty after switching connector
    expect(tagInput.value).toBe('')
  })

  test(`on change of region value, existing imagePath should be cleared`, async () => {
    const { container } = renderComponent({
      ...props,
      artifacts: {
        primary: {
          type: ENABLED_ARTIFACT_TYPES.Ecr,
          spec: {
            connectorRef: 'Git_CTR',
            region: '',
            imagePath: '',
            tag: ''
          }
        }
      },
      artifact: {
        identifier: '',
        type: ENABLED_ARTIFACT_TYPES.Ecr,
        spec: {
          connectorRef: 'Git_CTR',
          region: RUNTIME_INPUT_VALUE,
          imagePath: RUNTIME_INPUT_VALUE,
          tag: RUNTIME_INPUT_VALUE
        }
      },
      template: templateECRArtifact
    })

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    const imagePathSelect = queryByNameAttribute(
      `${artifactCommonPath}.artifacts.primary.spec.imagePath`
    ) as HTMLInputElement

    // Select imagePath from dropdown
    const imagePathDropDownButton = container.querySelectorAll('[data-icon="chevron-down"]')[2]
    fireEvent.click(imagePathDropDownButton!)
    expect(portalDivs.length).toBe(1)
    const dropdownPortalDiv = portalDivs[0]
    const selectListMenu = dropdownPortalDiv.querySelector('.bp3-menu')
    const selectItem = await findByText(selectListMenu as HTMLElement, 'harnesscie-advanced-testingui')
    act(() => {
      fireEvent.click(selectItem)
    })
    expect(imagePathSelect.value).toBe('harnesscie-advanced-testingui')

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
    // Expect imagePath's value to be empty string
    await waitFor(() => expect(imagePathSelect.value).toBe(''))
  })

  test(`Servive V2 - tag options should appear if connectorRef, region and imagePath values are available`, async () => {
    ;(useMutateAsGet as any).mockImplementation(() => {
      return { data: tagsListData, refetch: fetchTags, error: null, loading: false }
    })
    const { container } = renderComponent(
      {
        ...props,
        artifacts: {
          primary: {
            type: ENABLED_ARTIFACT_TYPES.Ecr,
            spec: {
              connectorRef: 'Git_CTR',
              region: 'US East (N. Virginia)',
              imagePath: 'harnesscie-advanced-testingui',
              tag: ''
            }
          }
        },
        artifact: {
          identifier: '',
          type: ENABLED_ARTIFACT_TYPES.Ecr,
          spec: {
            connectorRef: 'Git_CTR',
            region: 'US East (N. Virginia)',
            imagePath: 'harnesscie-advanced-testingui',
            tag: RUNTIME_INPUT_VALUE
          }
        },
        template: templateECRArtifact
      },
      { NG_SVC_ENV_REDESIGN: true }
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    const regionSelect = queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.region`) as HTMLInputElement
    expect(regionSelect).toBeInTheDocument()
    const imagePathSelect = queryByNameAttribute(
      `${artifactCommonPath}.artifacts.primary.spec.imagePath`
    ) as HTMLInputElement
    expect(imagePathSelect).toBeInTheDocument()
    expect(imagePathSelect).not.toBeDisabled()
    const tagSelect = queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.tag`) as HTMLInputElement
    expect(tagSelect).toBeInTheDocument()
    expect(tagSelect).not.toBeDisabled()
    expect(fetchTags).not.toBeCalled()

    // Select tag from dropdown
    const tagDropDownButton = container.querySelectorAll('[data-icon="chevron-down"]')[3]
    await userEvent.click(tagDropDownButton!)
    expect(portalDivs.length).toBe(1)
    const dropdownPortalDivTag = portalDivs[0]
    const selectListMenuTag = dropdownPortalDivTag.querySelector('.bp3-menu')
    const tagSelectItem = await findByText(selectListMenuTag as HTMLElement, '0.0.2')
    await userEvent.click(tagSelectItem)
    expect(tagSelect.value).toBe('0.0.2')
  })

  test(`Servive V2 - image path options should appear if connectorRef value is available`, async () => {
    ;(useMutateAsGet as any).mockImplementation(() => {
      return { data: imagesListData, refetch: fetchImages, error: null, loading: false }
    })
    const { container } = renderComponent(
      {
        ...props,
        artifacts: {
          primary: {
            type: ENABLED_ARTIFACT_TYPES.Ecr,
            spec: {
              connectorRef: 'Git_CTR',
              region: '',
              imagePath: '',
              tag: ''
            }
          }
        },
        artifact: {
          identifier: '',
          type: ENABLED_ARTIFACT_TYPES.Ecr,
          spec: {
            connectorRef: 'Git_CTR',
            region: RUNTIME_INPUT_VALUE,
            imagePath: RUNTIME_INPUT_VALUE,
            tag: RUNTIME_INPUT_VALUE
          }
        },
        template: templateECRArtifact
      },
      { NG_SVC_ENV_REDESIGN: true }
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    const regionSelect = queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.region`) as HTMLInputElement
    expect(regionSelect).toBeInTheDocument()
    const imagePathSelect = queryByNameAttribute(
      `${artifactCommonPath}.artifacts.primary.spec.imagePath`
    ) as HTMLInputElement
    expect(imagePathSelect).toBeInTheDocument()
    expect(fetchImages).not.toBeCalled()
    const tagSelect = queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.tag`) as HTMLInputElement
    expect(tagSelect).toBeInTheDocument()
    expect(fetchTags).not.toBeCalled()

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    // Select image from dropdown
    const imagePathDropDownButton = container.querySelectorAll('[data-icon="chevron-down"]')[2]
    await userEvent.click(imagePathDropDownButton!)
    expect(portalDivs.length).toBe(1)
    const dropdownPortalDivImagePath = portalDivs[0]
    const selectListMenuImagePath = dropdownPortalDivImagePath.querySelector('.bp3-menu')
    const selectItemImagePath = await findByText(selectListMenuImagePath as HTMLElement, 'helm-test-chart')
    await userEvent.click(selectItemImagePath)
    expect(imagePathSelect.value).toBe('helm-test-chart')
  })

  test(`on change of region value, existing tag should be cleared`, async () => {
    ;(useMutateAsGet as any).mockImplementation(() => {
      return { data: tagsListData, refetch: fetchTags, error: null, loading: false }
    })
    const { container } = renderComponent({
      ...props,
      artifacts: {
        primary: {
          type: ENABLED_ARTIFACT_TYPES.Ecr,
          spec: {
            connectorRef: 'Git_CTR',
            region: 'US East (N. Virginia)',
            imagePath: 'cdng-terraform-state',
            tag: ''
          }
        }
      },
      artifact: {
        identifier: '',
        type: ENABLED_ARTIFACT_TYPES.Ecr,
        spec: {
          connectorRef: 'Git_CTR',
          region: 'US East (N. Virginia)',
          imagePath: 'cdng-terraform-state',
          tag: RUNTIME_INPUT_VALUE
        }
      },
      template: templateECRArtifact
    })

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    const tagSelect = queryByNameAttribute(`${artifactCommonPath}.artifacts.primary.spec.tag`) as HTMLInputElement

    // Select tag from dropdown
    const tagDropDownButton = container.querySelectorAll('[data-icon="chevron-down"]')[3]
    fireEvent.click(tagDropDownButton!)
    expect(portalDivs.length).toBe(1)
    const dropdownPortalDivTag = portalDivs[0]
    const selectListMenuTag = dropdownPortalDivTag.querySelector('.bp3-menu')
    const tagSelectItem = await findByText(selectListMenuTag as HTMLElement, '0.0.3')
    await userEvent.click(tagSelectItem)
    expect(tagSelect.value).toBe('0.0.3')

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
    // Expect tag field's value to be empty string
    await waitFor(() => expect(tagSelect.value).toBe(''))
  })
})
