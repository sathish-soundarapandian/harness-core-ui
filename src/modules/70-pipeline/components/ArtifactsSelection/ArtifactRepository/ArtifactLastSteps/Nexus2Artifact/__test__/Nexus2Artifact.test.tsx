/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { act, findByText, fireEvent, queryByAttribute, render, waitFor } from '@testing-library/react'

import { AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import {
  ArtifactType,
  Nexus2InitialValuesType,
  RepositoryPortOrServer,
  TagTypes
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { RepositoryFormatTypes, ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import type { UseGetMockDataWithMutateAndRefetch } from '@common/utils/testUtils'
import type { ResponseListNexusRepositories } from 'services/cd-ng'
import { Nexus2Artifact } from '../Nexus2Artifact'

const mockRepositoryResponse: UseGetMockDataWithMutateAndRefetch<ResponseListNexusRepositories> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  data: {
    status: 'SUCCESS',
    data: [
      { repositoryName: 'docker-group', repositoryId: 'docker-group' },
      { repositoryName: 'usheerdocker', repositoryId: 'usheerdocker' },
      { repositoryName: 'ken-test-docker', repositoryId: 'ken-test-docker' },
      { repositoryName: 'zee-repo', repositoryId: 'zee-repo' },
      { repositoryName: 'cdp-qa-automation-2', repositoryId: 'cdp-qa-automation-2' },
      { repositoryName: 'cdp-qa-automation-1', repositoryId: 'cdp-qa-automation-1' },
      { repositoryName: 'francisco-swat', repositoryId: 'francisco-swat' },
      { repositoryName: 'todolist', repositoryId: 'todolist' },
      { repositoryName: 'aleksadocker', repositoryId: 'aleksadocker' },
      { repositoryName: 'cdp-test-group1', repositoryId: 'cdp-test-group1' },
      { repositoryName: 'cdp-test-group2', repositoryId: 'cdp-test-group2' },
      { repositoryName: 'cdp-test-group3', repositoryId: 'cdp-test-group3' },
      { repositoryName: 'docker-private', repositoryId: 'docker-private' },
      { repositoryName: 'lukicm-test', repositoryId: 'lukicm-test' }
    ],
    correlationId: 'c938e28e-6359-481e-9e75-3141561c4186'
  }
}

const props = {
  name: 'Artifact details',
  expressions: [],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  context: 2,
  handleSubmit: jest.fn(),
  artifactIdentifiers: [],
  selectedArtifact: 'Nexus2Registry' as ArtifactType,
  selectedDeploymentType: ServiceDeploymentType.Kubernetes
}

jest.mock('services/cd-ng', () => ({
  useGetBuildDetailsForNexusArtifact: jest.fn().mockImplementation(() => {
    return {
      data: {},
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  })
}))
jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => mockRepositoryResponse)
}))
const initialValues: Nexus2InitialValuesType = {
  identifier: '',
  tagType: TagTypes.Value,
  tag: '<+input>',
  tagRegex: '',
  repository: 'repository',
  spec: {
    artifactPath: '',
    repositoryPortorRepositoryURL: RepositoryPortOrServer.RepositoryUrl,
    repositoryUrl: '',
    repositoryPort: ''
  }
} as Nexus2InitialValuesType

describe('Nexus Artifact tests', () => {
  // beforeEach(() => {
  //   // eslint-disable-next-line
  //   // @ts-ignore
  //   useMutateAsGet.mockImplementation(() => {
  //     return mockRepositoryResponse
  //   })
  // })
  test(`renders without crashing`, () => {
    const { container } = render(
      <TestWrapper>
        <Nexus2Artifact key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test(`tag is disabled if imagepath and repository is empty`, () => {
    const { container } = render(
      <TestWrapper>
        <Nexus2Artifact key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    const tagInput = container.querySelector('input[name="tag"]')
    expect(tagInput).toBeDisabled()
  })
  test('render form correctly when repositoryFormat is Maven', async () => {
    const defaultValues: Nexus2InitialValuesType = {
      identifier: '',
      tag: '',
      tagType: TagTypes.Value,
      tagRegex: '',
      repository: '',
      spec: {
        artifactPath: '',
        repositoryPortorRepositoryURL: RepositoryPortOrServer.RepositoryPort,
        repositoryUrl: '',
        repositoryPort: '',
        classifier: 'Test-classifier',
        extension: 'test-extension'
      }
    } as Nexus2InitialValuesType
    const { container, getByText } = render(
      <TestWrapper>
        <Nexus2Artifact key={'key'} initialValues={defaultValues} {...props} />
      </TestWrapper>
    )
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('spec.classifier')!, { target: { value: 'test-classifier' } })

      fireEvent.change(queryByNameAttribute('spec.extension')!, { target: { value: 'test-extension' } })
    })
    const repoFormatDropdown = container.querySelector('input[name="repositoryFormat"]') as HTMLInputElement
    const repoFormatCaret = container
      .querySelector(`input[name="repositoryFormat"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')
    await waitFor(() => {
      fireEvent.click(repoFormatCaret!)
    })
    const repoFormatSelect = await findByText(container, 'Maven')
    act(() => {
      fireEvent.click(repoFormatSelect)
    })
    expect(repoFormatDropdown.value).toBe('Maven')
    expect(container).toMatchSnapshot()
    expect(getByText('pipeline.artifactsSelection.groupId')).toBeDefined()
  })

  test('render form correctly when repositoryFormat is NPM', async () => {
    const defaultValues: Nexus2InitialValuesType = {
      identifier: '',
      tag: '',
      tagType: TagTypes.Value,
      tagRegex: '',
      repository: '',
      spec: {
        artifactPath: '',
        repositoryPortorRepositoryURL: RepositoryPortOrServer.RepositoryPort,
        repositoryUrl: '',
        repositoryPort: ''
      }
    } as Nexus2InitialValuesType
    const { container, getByText } = render(
      <TestWrapper>
        <Nexus2Artifact key={'key'} initialValues={defaultValues} {...props} />
      </TestWrapper>
    )

    const repoFormatDropdown = container.querySelector('input[name="repositoryFormat"]') as HTMLInputElement
    const repoFormatCaret = container
      .querySelector(`input[name="repositoryFormat"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')
    await waitFor(() => {
      fireEvent.click(repoFormatCaret!)
    })
    const repoFormatSelect = await findByText(container, 'NPM')
    act(() => {
      fireEvent.click(repoFormatSelect)
    })
    expect(repoFormatDropdown.value).toBe('NPM')
    expect(container).toMatchSnapshot()
    expect(getByText('pipeline.artifactsSelection.packageName')).toBeDefined()
  })

  test('render form correctly when repositoryFormat is NuGet', async () => {
    const defaultValues: Nexus2InitialValuesType = {
      identifier: '',
      tag: '',
      tagType: TagTypes.Value,
      tagRegex: '',
      repository: '',
      spec: {
        artifactPath: '',
        repositoryPortorRepositoryURL: RepositoryPortOrServer.RepositoryPort,
        repositoryUrl: '',
        repositoryPort: ''
      }
    } as Nexus2InitialValuesType
    const { container, getByText } = render(
      <TestWrapper>
        <Nexus2Artifact key={'key'} initialValues={defaultValues} {...props} />
      </TestWrapper>
    )

    const repoFormatDropdown = container.querySelector('input[name="repositoryFormat"]') as HTMLInputElement
    const repoFormatCaret = container
      .querySelector(`input[name="repositoryFormat"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')
    await waitFor(() => {
      fireEvent.click(repoFormatCaret!)
    })
    const repoFormatSelect = await findByText(container, 'NuGet')
    act(() => {
      fireEvent.click(repoFormatSelect)
    })
    expect(repoFormatDropdown.value).toBe('NuGet')
    expect(container).toMatchSnapshot()
    expect(getByText('pipeline.artifactsSelection.packageName')).toBeDefined()
  })
  test('render form correctly when tagType is regex', async () => {
    const defaultValues: Nexus2InitialValuesType = {
      connectorRef: '<+input>',
      repository: 'werewre',
      repositoryFormat: 'docker',
      tag: '<+input>',
      type: 'Nexus2Registry',
      spec: {
        artifactPath: 'ewrewr',
        repositoryUrl: 'werewr',
        repositoryPortorRepositoryURL: 'repositoryUrl'
      },
      tagType: TagTypes.Regex,
      tagRegex: '<+input>',
      identifier: 'sdfds'
    } as any
    const { container } = render(
      <TestWrapper>
        <Nexus2Artifact key={'key'} initialValues={defaultValues} {...props} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
  test('when fields are all runtime inputs for maven repositoryformat type', () => {
    const defaultValues: Nexus2InitialValuesType = {
      connectorRef: '<+input>',
      repository: '<+input>',
      repositoryFormat: 'maven',
      tag: '<+input>',
      type: 'Nexus2Registry',
      spec: {
        groupId: '<+input>',
        artifactId: '<+input>',
        extension: '<+input>',
        classifier: '<+input>'
      },
      tagType: TagTypes.Regex,
      tagRegex: '<+input>',
      identifier: 'sdfds'
    } as any

    const { container } = render(
      <TestWrapper>
        <Nexus2Artifact key={'key'} initialValues={defaultValues} {...props} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('when fields are all runtime inputs for maven repositoryformat type', () => {
    const defaultValues: Nexus2InitialValuesType = {
      connectorRef: '<+input>',
      repository: '<+input>',
      repositoryFormat: 'Maven',
      tag: '<+input>',
      type: 'Nexus2Registry',
      spec: {
        groupId: '<+input>',
        artifactId: '<+input>',
        extension: '<+input>',
        classifier: '<+input>'
      },
      tagType: TagTypes.Regex,
      tagRegex: '<+input>',
      identifier: 'sdfds'
    } as any

    const { container } = render(
      <TestWrapper>
        <Nexus2Artifact key={'key'} initialValues={defaultValues} {...props} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('when fields are all runtime inputs for nonmaven repositoryformat type', () => {
    const defaultValues: Nexus2InitialValuesType = {
      connectorRef: '<+input>',
      repository: '<+input>',
      repositoryFormat: 'Nuget',
      tag: '<+input>',
      type: 'Nexus2Registry',
      spec: {
        packageName: '<+input>'
      },
      tagType: TagTypes.Regex,
      tagRegex: '<+input>',
      identifier: 'sdfds'
    } as any

    const { container } = render(
      <TestWrapper>
        <Nexus2Artifact key={'key'} initialValues={defaultValues} {...props} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test(`able to submit form when the form is non empty`, async () => {
    const defaultValues: Nexus2InitialValuesType = {
      spec: {
        connectorRef: '<+input>',
        repository: 'cdp-test-group2',
        repositoryFormat: RepositoryFormatTypes.Maven,
        tag: '<+input>',

        spec: {
          groupId: 'test-groupId',
          artifactId: 'test-artifactId',
          extension: 'test-extension',
          classifier: 'test-classifer'
        }
      },
      type: 'Nexus2Registry',
      identifier: 'testidentifier'
    } as any
    const { container } = render(
      <TestWrapper>
        <Nexus2Artifact key={'key'} initialValues={defaultValues} {...props} />
      </TestWrapper>
    )
    const submitBtn = container.querySelector('button[type="submit"]')!
    fireEvent.click(submitBtn)

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)
    // Select repository from dropdown
    const repositoryDropDownButton = container.querySelectorAll('[data-icon="chevron-down"]')[1]
    fireEvent.click(repositoryDropDownButton!)
    expect(portalDivs.length).toBe(1)
    const dropdownPortalDiv = portalDivs[0]
    const selectListMenu = dropdownPortalDiv.querySelector('.bp3-menu')
    const selectItem = await findByText(selectListMenu as HTMLElement, 'cdp-test-group2')
    act(() => {
      fireEvent.click(selectItem)
    })
    const repositorySelect = queryByNameAttribute('repository') as HTMLInputElement
    expect(repositorySelect.value).toBe('cdp-test-group2')

    fireEvent.click(submitBtn)

    expect(container).toMatchSnapshot()
    await waitFor(() => {
      expect(props.handleSubmit).toBeCalled()
      expect(props.handleSubmit).toHaveBeenCalledWith({
        identifier: 'testidentifier',
        spec: {
          connectorRef: '',
          repository: 'cdp-test-group2',
          tag: '<+input>',
          repositoryFormat: 'maven',
          spec: {
            groupId: 'test-groupId',
            artifactId: 'test-artifactId',
            extension: 'test-extension',
            classifier: 'test-classifer'
          }
        }
      })
    })
  })

  test(`not able to submit and throw errors for fields which are required `, async () => {
    const defaultValues: Nexus2InitialValuesType = {
      spec: {
        connectorRef: '<+input>',
        repository: 'cdp-test-group2',
        repositoryFormat: RepositoryFormatTypes.Maven,
        tagRegex: '<+input>',
        spec: {
          groupId: '',
          artifactId: '',
          extension: 'test-extension',
          classifier: 'test-classifer'
        }
      },
      type: 'Nexus2Registry',
      identifier: 'testidentifier'
    } as any
    const { container, getByText } = render(
      <TestWrapper>
        <Nexus2Artifact key={'key'} initialValues={defaultValues} {...props} />
      </TestWrapper>
    )
    const submitBtn = container.querySelector('button[type="submit"]')!
    fireEvent.click(submitBtn)

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)
    // Select repository from dropdown
    const repositoryDropDownButton = container.querySelectorAll('[data-icon="chevron-down"]')[1]
    fireEvent.click(repositoryDropDownButton!)
    expect(portalDivs.length).toBe(1)
    const dropdownPortalDiv = portalDivs[0]
    const selectListMenu = dropdownPortalDiv.querySelector('.bp3-menu')
    const selectItem = await findByText(selectListMenu as HTMLElement, 'cdp-test-group2')
    act(() => {
      fireEvent.click(selectItem)
    })
    const repositorySelect = queryByNameAttribute('repository') as HTMLInputElement
    expect(repositorySelect.value).toBe('cdp-test-group2')

    fireEvent.click(submitBtn)

    expect(container).toMatchSnapshot()

    expect(props.handleSubmit).toBeCalled()

    expect(getByText('pipeline.artifactsSelection.validation.artifactId')).toBeDefined()
  })
})
