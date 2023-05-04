import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { Formik, FormikForm, MultiTypeInputType } from '@harness/uicore'

import { TestWrapper } from '@common/utils/testUtils'

import { ConfigFileGitCoreSection } from '../ConfigFileGitCoreSection/ConfigFileGitCoreSection'

jest.useFakeTimers()

const handleSubmit = jest.fn()

const prevStepData = {
  connectorRef: {
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
        url: 'https://github.com/aaa',
        validationRepo: 'test',
        authentication: {
          type: 'Http',
          spec: {
            type: 'UsernameToken',
            spec: {
              username: 'aaa@aa.com',
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
  },
  gitFetchType: 'Branch',
  paths: ['dasda'],
  repoName: 'dasdas',
  branch: 'dasd',
  store: 'Github',
  identifier: 'asdas'
}

const defaultProps = {
  stepName: 'Git Core Config File',
  prevStepData,
  allowedTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME],
  previousStep: jest.fn(),
  isEditMode: false,
  handleSubmit,
  listOfConfigFiles: [],
  configFileIndex: 0
}

function WrapperComponent(props: any): JSX.Element {
  const { initialErrors } = props || {}
  return (
    <TestWrapper>
      <Formik
        initialErrors={initialErrors}
        initialValues={props.prevStepData}
        onSubmit={() => undefined}
        formName="TestWrapper"
      >
        {formikProps => (
          <FormikForm>
            <ConfigFileGitCoreSection {...formikProps} {...props} />
          </FormikForm>
        )}
      </Formik>
    </TestWrapper>
  )
}

describe('Define git core config step', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('<ConfigFileGitCoreSection />', async () => {
    const props = {
      ...defaultProps,
      formik: {
        values: {
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
        }
      }
    }

    const { container } = render(<WrapperComponent {...props} />)
    const identifierField = container.querySelector('input[name="identifier"]') as HTMLInputElement
    fireEvent.change(identifierField, { target: { value: 'testTemp' } })
    expect(identifierField).toHaveValue('testTemp')
  })
})
