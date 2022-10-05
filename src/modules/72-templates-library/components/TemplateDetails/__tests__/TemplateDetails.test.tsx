/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { useLocation } from 'react-router-dom'
import { defaultTo, unset } from 'lodash-es'
import produce from 'immer'
import { TestWrapper } from '@common/utils/testUtils'
import { mockTemplates, mockTemplatesSuccessResponse } from '@templates-library/TemplatesTestHelper'
import templateFactory from '@templates-library/components/Templates/TemplatesFactory'
import { StepTemplate } from '@templates-library/components/Templates/StepTemplate/StepTemplate'
import { templatePathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import { TemplateDetails, TemplateDetailsProps } from '../TemplateDetails'

const gitAppStoreValues = {
  featureFlags: {
    NG_TEMPLATE_GITX: true
  },
  isGitSyncEnabled: false,
  isGitSimplificationEnabled: true,
  supportingGitSimplification: true,
  gitSyncEnabledOnlyForFF: false,
  supportingTemplatesGitx: true
}

const TEST_PATH = routes.toTemplateStudio(templatePathProps)
const TEST_PATH_PARAMS = {
  templateIdentifier: '-1',
  accountId: 'accountId',
  orgIdentifier: 'default',
  projectIdentifier: 'projectId',
  module: 'cd',
  templateType: 'Step'
}

const useGetTemplateMock = jest.fn()

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => mockTemplatesSuccessResponse)
}))

jest.mock('@templates-library/components/TemplateInputs/TemplateInputs', () => ({
  ...jest.requireActual('@templates-library/components/TemplateInputs/TemplateInputs'),
  TemplateInputs: () => {
    return <div className="template-inputs-mock"></div>
  }
}))

jest.mock('services/template-ng', () => ({
  ...jest.requireActual('services/template-ng'),
  useGetTemplate: jest.fn().mockImplementation((...args) => {
    useGetTemplateMock(...args)
    return {}
  })
}))

function ComponentWrapper(props: TemplateDetailsProps): React.ReactElement {
  const location = useLocation()
  return (
    <React.Fragment>
      <TemplateDetails {...props} />
      <div data-testid="location">{`${location.pathname}${location.search}`}</div>
    </React.Fragment>
  )
}

describe('<TemplateDetails /> tests', () => {
  beforeAll(() => {
    templateFactory.registerTemplate(new StepTemplate())
  })
  const baseProps = {
    template: defaultTo(mockTemplates?.data?.content?.[0], {})
  }
  test('should match snapshot', async () => {
    const { container } = render(
      <TestWrapper>
        <ComponentWrapper {...baseProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should show selected version label', async () => {
    const { getByTestId } = render(
      <TestWrapper>
        <ComponentWrapper {...baseProps} isStandAlone />
      </TestWrapper>
    )
    const dropValue = getByTestId('dropdown-value')
    expect(dropValue).toHaveTextContent('v4COMMON.STABLE')
  })

  test('should show always use stable version of the template ', async () => {
    const newBaseProps = produce(baseProps, draft => {
      unset(draft, 'template.versionLabel')
    })
    const { getByTestId } = render(
      <TestWrapper>
        <ComponentWrapper {...newBaseProps} isStandAlone />
      </TestWrapper>
    )
    const dropValue = getByTestId('dropdown-value')
    expect(dropValue).toHaveTextContent('templatesLibrary.alwaysUseStableVersion')
  })

  test('should open template studio on clicking open in template studio', async () => {
    const { getByRole, getByTestId } = render(
      <TestWrapper>
        <ComponentWrapper {...baseProps} />
      </TestWrapper>
    )

    await act(async () => {
      fireEvent.click(getByRole('button', { name: 'templatesLibrary.openInTemplateStudio' }))
    })
    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/kmpySmUISimoRrJL6NL73w/home/orgs/default/projects/Templateproject/setup/resources/template-studio/Step/template/manjutesttemplate/?versionLabel=v4
      </div>
    `)
  })
})

describe('<TemplateDetails /> git experience', () => {
  afterEach(() => {
    useGetTemplateMock.mockReset()
  })

  test('Template GET API sends parent entity context in query params', () => {
    const baseProps: TemplateDetailsProps = {
      template: defaultTo(mockTemplates?.data?.content?.[0], {}),
      storeMetadata: {
        connectorRef: 'connectorRefTest',
        storeType: 'REMOTE',
        branch: 'branchTest',
        repoName: 'repoNameTest'
      }
    }

    render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS} defaultAppStoreValues={gitAppStoreValues}>
        <ComponentWrapper {...baseProps} />
      </TestWrapper>
    )

    expect(useGetTemplateMock).toHaveBeenCalledWith({
      lazy: true,
      queryParams: {
        accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
        branch: 'branchTest',
        getDefaultFromOtherRepo: true,
        orgIdentifier: 'default',
        parentEntityAccountIdentifier: 'accountId',
        parentEntityConnectorRef: 'connectorRefTest',
        parentEntityOrgIdentifier: 'default',
        parentEntityProjectIdentifier: 'projectId',
        parentEntityRepoName: 'repoNameTest',
        projectIdentifier: 'Templateproject',
        versionLabel: 'v4'
      },
      templateIdentifier: 'manjutesttemplate'
    })
  })

  test('Template GET API doesnt send parent entity context in query params for inline templates', () => {
    const baseProps: TemplateDetailsProps = {
      template: defaultTo(mockTemplates?.data?.content?.[0], {}),
      storeMetadata: undefined
    }

    render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS} defaultAppStoreValues={gitAppStoreValues}>
        <ComponentWrapper {...baseProps} />
      </TestWrapper>
    )

    expect(useGetTemplateMock).toHaveBeenCalledWith({
      lazy: true,
      queryParams: {
        accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
        getDefaultFromOtherRepo: true,
        orgIdentifier: 'default',
        projectIdentifier: 'Templateproject',
        versionLabel: 'v4'
      },
      templateIdentifier: 'manjutesttemplate'
    })
  })
})
