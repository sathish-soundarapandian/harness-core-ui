import React from 'react'
import { render, findByText, fireEvent, waitFor } from '@testing-library/react'
import { MultiTypeInputType } from '@harness/uicore'

import { TestWrapper } from '@common/utils/testUtils'

import { GitConfigStep } from '../GitConfigStep'

jest.useFakeTimers()

const handleSubmit = jest.fn()

const connectorRef = {
  label: 'git',
  value: 'git',
  scope: 'project',
  live: true,
  connector: {
    name: 'git',
    identifier: 'git',
    description: '',
    orgIdentifier: 'default',
    projectIdentifier: 'defaultproject',
    tags: {},
    type: 'Github',
    spec: {
      url: 'https://github.com/test',
      validationRepo: 'test',
      authentication: {
        type: 'Http',
        spec: {
          type: 'UsernameToken',
          spec: {
            username: 'a@a.com',
            usernameRef: null,
            tokenRef: 'gittocket'
          }
        }
      },
      apiAccess: null,
      delegateSelectors: [],
      executeOnDelegate: true,
      type: 'Account'
    }
  }
}

const defaultProps = {
  stepName: 'Config File Details',
  prevStepData: {
    paths: ['account:/vit'],
    identifier: 'test1',
    store: 'Github',
    branch: 'asd11',
    commitId: 'asd12',
    gitFetchType: 'Branch',
    skipResourceVersioning: false,
    enableDeclarativeRollback: false,
    repoName: '',
    valuesPaths: [''],
    connectorRef
  },
  allowedTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME],
  previousStep: jest.fn(),
  isEditMode: false,
  handleSubmit,
  listOfConfigFiles: [],
  configFileIndex: 0
}

function WrapperComponent(props: any): JSX.Element {
  return (
    <TestWrapper>
      <GitConfigStep {...props} />
    </TestWrapper>
  )
}

describe('<GitConfigStep /> tests', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  test('should render github config step', async () => {
    const props = { ...defaultProps }

    const { container } = render(<WrapperComponent {...props} />)
    const identifierField = container.querySelector('input[name="identifier"]') as HTMLInputElement
    fireEvent.change(identifierField, { target: { value: 'testTemp' } })
    expect(identifierField).toHaveValue('testTemp')
    fireEvent.change(identifierField, { target: { value: 'test1' } })
    expect(identifierField).toHaveValue('test1')
    expect(container).toBeDefined()
  })
  test('<GitConfigStore /> submit data', async () => {
    const props = { ...defaultProps, stepName: undefined }

    const { container } = render(<WrapperComponent {...props} />)
    const submitBtn = await findByText(container, 'submit')
    fireEvent.click(submitBtn)

    waitFor(() => expect(handleSubmit).toHaveBeenCalled())
  })
  test('<GitConfigStep /> should submit paths, valuesPaths', async () => {
    const props = {
      ...defaultProps,
      prevStepData: {
        ...defaultProps.prevStepData,
        paths: ['account:/vit'],
        identifier: 'test1',
        store: 'Github',
        branch: 'asd11',
        commitId: 'asd12',
        gitFetchType: 'Branch',
        skipResourceVersioning: false,
        enableDeclarativeRollback: false,
        repoName: 'asd123',
        valuesPaths: ['account:/vit']
      },
      isEditMode: true
    }

    const { container } = render(<WrapperComponent {...props} />)
    const submitBtn = await findByText(container, 'submit')
    fireEvent.click(submitBtn)

    waitFor(() => expect(handleSubmit).toHaveBeenCalled())
  })
  test('should submit runtime case and branch commit', async () => {
    const props = {
      ...defaultProps,
      prevStepData: {
        ...defaultProps.prevStepData,
        paths: '<+input>',
        identifier: 'test1',
        store: 'Github',
        branch: 'asd11',
        commitId: 'asd12',
        gitFetchType: 'Commit',
        skipResourceVersioning: false,
        enableDeclarativeRollback: false,
        repoName: 'asd123',
        valuesPaths: '<+input>'
      },
      isEditMode: true
    }

    const { container } = render(<WrapperComponent {...props} />)
    const submitBtn = await findByText(container, 'submit')
    fireEvent.click(submitBtn)

    waitFor(() => expect(handleSubmit).toHaveBeenCalled())
    waitFor(() =>
      expect(handleSubmit).toHaveBeenCalledWith({
        paths: '<+input>',
        identifier: 'test1',
        store: 'Github',
        branch: 'asd11',
        commitId: 'asd12',
        gitFetchType: 'Commit',
        skipResourceVersioning: false,
        enableDeclarativeRollback: false,
        repoName: 'asd123',
        valuesPaths: '<+input>'
      })
    )
  })
})
