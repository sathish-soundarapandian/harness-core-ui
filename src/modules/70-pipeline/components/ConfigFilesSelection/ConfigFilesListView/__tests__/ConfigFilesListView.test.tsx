/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, getByText as getElementByText, waitFor, RenderResult } from '@testing-library/react'
import type { AllowedTypesWithRunTime } from '@harness/uicore'

import type { ServiceDefinition, StoreConfigWrapper } from 'services/cd-ng'
import { queryByNameAttribute, TestWrapper } from '@common/utils/testUtils'
import type { FeatureFlag } from '@common/featureFlags'
import { connectorsData } from '@connectors/pages/connectors/__tests__/mockData'
import type { DeploymentStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import type { ConfigFilesListViewProps, ConfigFileType } from '../../ConfigFilesInterface'
import { ConfigFilesMap } from '../../ConfigFilesHelper'
import ConfigFilesListView from '../ConfigFilesListView'

const fetchConnectors = (): Promise<unknown> => Promise.resolve(connectorsData)
jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: connectorsData.data.content[1], refetch: fetchConnectors, loading: false }
  })
}))

const defaultProps = {
  allowableTypes: ['FIXED', 'RUNTIME', 'EXPRESSION'] as AllowedTypesWithRunTime[],
  deploymentType: 'Ssh' as ServiceDefinition['type'],
  isPropagating: false,
  isReadonly: false,
  isReadonlyServiceMode: false,
  selectedConfig: 'Harness' as ConfigFileType,
  selectedServiceResponse: null,
  serviceCacheId: 'test1',
  setSelectedConfig: jest.fn(),
  stage: {
    stage: {
      name: 'Stage 1',
      identifier: 'stage_1',
      spec: {
        serviceConfig: {
          serviceDefinition: {
            spec: {
              configFiles: [
                {
                  configFile: {
                    identifier: 'test_config_file_1',
                    spec: {
                      store: {
                        spec: {
                          files: ['account:/test_config'],
                          secretFiles: []
                        },
                        type: 'Harness'
                      }
                    }
                  }
                }
              ],
              type: 'Ssh'
            }
          },
          serviceRef: 'asdasd2'
        }
      }
    }
  },
  updateStage: jest.fn()
}

const renderComponent = (
  featureFlags?: Partial<Record<FeatureFlag, boolean>> | undefined,
  props?: ConfigFilesListViewProps
): RenderResult => {
  const commonProps = {
    ...defaultProps,
    ...props
  }
  return render(
    <TestWrapper defaultFeatureFlagValues={featureFlags}>
      <ConfigFilesListView {...commonProps} />
    </TestWrapper>
  )
}

describe('Define Config Files list view', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should render config list files', async () => {
    const renderObj = renderComponent()
    const addBtn = await renderObj.findByText('pipeline.configFiles.addConfigFile')
    fireEvent.click(addBtn)
    const closeBtn = document.body.querySelector('.bp3-button') as HTMLElement
    fireEvent.click(closeBtn)
    expect(renderObj.container).toBeDefined()
  })

  test('should render edit config files', async () => {
    const { container } = renderComponent()

    // Click on edit button
    const editBtn = container.querySelector('.bp3-button') as HTMLElement
    fireEvent.click(editBtn)
    const dialog = document.body.querySelector('.bp3-dialog') as HTMLElement

    // Ensure that file store step is NOT rendered because last step should be shown on edit click
    const harnessStoreTile = dialog.querySelector('input[value="Harness"]')
    expect(harnessStoreTile).toBeNull()

    // Identifier
    await waitFor(() => expect(getElementByText(dialog, 'pipeline.configFiles.identifierLabel')).toBeInTheDocument())
    const identifierInput = queryByNameAttribute('identifier', dialog) as HTMLInputElement
    expect(identifierInput).toBeInTheDocument()
    expect(identifierInput.value).toBe('test_config_file_1')

    // File/Folder
    const fileFolderPathLabel = getElementByText(dialog, 'fileFolderPathText')
    expect(fileFolderPathLabel).toBeInTheDocument()
    const fileNameInput = getElementByText(dialog, '/test_config')
    expect(fileNameInput).toBeInTheDocument()
  })

  test('should show last step directly while editing', async () => {
    const { container } = renderComponent({})

    // Click on edit button
    const editBtn = container.querySelector('.bp3-button') as HTMLElement
    fireEvent.click(editBtn)
    const dialog = document.body.querySelector('.bp3-dialog') as HTMLElement

    // Ensure that file store step is not rendered
    const harnessStoreTile = dialog.querySelector('input[value="Harness"]')
    expect(harnessStoreTile).not.toBeInTheDocument()

    // Identifier
    await waitFor(() => expect(getElementByText(dialog, 'pipeline.configFiles.identifierLabel')).toBeInTheDocument())
    const identifierInput = queryByNameAttribute('identifier', dialog) as HTMLInputElement
    expect(identifierInput).toBeInTheDocument()
    expect(identifierInput.value).toBe('test_config_file_1')

    // File/Folder
    const fileFolderPathLabel = getElementByText(dialog, 'fileFolderPathText')
    expect(fileFolderPathLabel).toBeInTheDocument()
    const fileNameInput = getElementByText(dialog, '/test_config')
    expect(fileNameInput).toBeInTheDocument()
  })

  test('should show last step directly while editing for Github store when CDS_GIT_CONFIG_FILES are true', async () => {
    const gitConfigFileStage: StageElementWrapper<DeploymentStageElementConfig> = {
      stage: {
        name: 'Stage 1',
        identifier: 'stage_1',
        spec: {
          serviceConfig: {
            serviceRef: 'asdasd2',
            serviceDefinition: {
              type: 'Ssh',
              spec: {
                configFiles: [
                  {
                    configFile: {
                      identifier: 'Github_Config_File_1',
                      spec: {
                        store: {
                          type: ConfigFilesMap.Github as StoreConfigWrapper['type'],
                          spec: {
                            connectorRef: 'Git_CTR',
                            gitFetchType: 'Branch',
                            branch: 'main',
                            paths: ['config_path1.yaml']
                          }
                        }
                      }
                    }
                  }
                ]
              }
            }
          },
          execution: {
            steps: []
          }
        }
      }
    }
    defaultProps.stage = gitConfigFileStage as any

    const { container } = renderComponent({ CDS_GIT_CONFIG_FILES: true }, defaultProps as any)

    // Click on edit button
    const editBtn = container.querySelector('.bp3-button') as HTMLElement
    fireEvent.click(editBtn)
    const dialog = document.body.querySelector('.bp3-dialog') as HTMLElement

    // Ensure that file store step is not rendered
    const githubStoreTile = dialog.querySelector('input[value="Github"]')
    expect(githubStoreTile).not.toBeInTheDocument()

    // Identifier
    await waitFor(() => expect(getElementByText(dialog, 'pipeline.configFiles.name')).toBeInTheDocument())
    const identifierInput = queryByNameAttribute('identifier', dialog) as HTMLInputElement
    expect(identifierInput).toBeInTheDocument()
    expect(identifierInput.value).toBe('Github_Config_File_1')
    // Git Fetch Type
    const gitFetchTypeInput = queryByNameAttribute('gitFetchType', dialog) as HTMLInputElement
    expect(gitFetchTypeInput).toBeInTheDocument()
    expect(gitFetchTypeInput.value).toBe('Latest from Branch')
    //Branch
    const branchInput = queryByNameAttribute('branch', dialog) as HTMLInputElement
    expect(branchInput).toBeInTheDocument()
    expect(branchInput.value).toBe('main')
    // File Path for config files from Git
    const path1Input = queryByNameAttribute('paths[0].path', dialog) as HTMLInputElement
    expect(path1Input).toBeInTheDocument()
    expect(path1Input.value).toBe('config_path1.yaml')
  })
})
