import React from 'react'
import { Formik, FormikProps } from 'formik'
import { findByText, getByText, queryByAttribute, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AllowedTypesWithRunTime, FormikForm } from '@harness/uicore'

import type { ManifestConfig, ManifestConfigWrapper, ServiceSpec } from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'
import { connectorsData } from '@connectors/pages/connectors/__tests__/mockData'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { K8SDirectServiceStep } from '@pipeline/factories/ArtifactTriggerInputFactory/types'
import { ManifestSourceBaseFactory } from '@cd/factory/ManifestSourceFactory/ManifestSourceBaseFactory'
import { template, manifests, manifest, initialValues } from './mock'
import { AwsSamDirectoryManifestSource } from '../AwsSamDirectoryManifestSource'

const fetchConnectors = (): Promise<unknown> => Promise.resolve(connectorsData)

jest.mock('services/cd-ng', () => ({
  getConnectorListV2Promise: jest.fn().mockImplementation(() => Promise.resolve(connectorsData)),
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectors })),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: connectorsData.data.content[1], refetch: fetchConnectors, loading: false }
  }),
  useGetServiceV2: jest.fn().mockImplementation(() => ({ loading: false, data: {}, refetch: jest.fn() }))
}))

const getProps = () => {
  return {
    stepViewType: StepViewType.InputSet,
    stageIdentifier: 'Stage_1',
    formik: {},
    path: 'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.spec',
    readonly: false,
    allowableTypes: ['FIXED', 'EXPRESSION'] as AllowedTypesWithRunTime[],
    manifestPath: 'manifests[0].manifest',
    projectIdentifier: 'Chetan_Non_Git_Sync',
    orgIdentifier: 'default',
    accountId: 'kmpySmUISimoRrJL6NL73w',
    pipelineIdentifier: 'Pipeline_1',
    pathFieldlabel: 'common.git.filePath'
  }
}

const manifestSourceBaseFactory = new ManifestSourceBaseFactory()
const awsSamDirectoryManifestSource = new AwsSamDirectoryManifestSource()

describe('AwsSamDirectoryManifestSource tests', () => {
  test('renders manifest source runtime inputs for Github store', async () => {
    const onSubmit = jest.fn()
    const { container } = render(
      <TestWrapper>
        <Formik initialValues={initialValues} onSubmit={onSubmit}>
          {(formik: FormikProps<unknown>) => (
            <FormikForm>
              {awsSamDirectoryManifestSource.renderContent({
                ...getProps(),
                formik: formik,
                manifest: manifest as ManifestConfig,
                initialValues: initialValues as K8SDirectServiceStep,
                template: template as ServiceSpec,
                manifests: manifests as ManifestConfigWrapper[],
                isManifestsRuntime: true,
                manifestSourceBaseFactory
              })}
            </FormikForm>
          )}
        </Formik>
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    // Connector
    const connnectorRefInput = screen.getByTestId(/connectorRef/)
    expect(connnectorRefInput).toBeInTheDocument()
    userEvent.click(connnectorRefInput!)

    const connectorSelectorDialog = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement
    const githubConnector1 = await findByText(connectorSelectorDialog, 'Git CTR')
    expect(githubConnector1).toBeInTheDocument()
    const githubConnector2 = await findByText(connectorSelectorDialog, 'Sample')
    expect(githubConnector2).toBeInTheDocument()
    userEvent.click(githubConnector1)
    const applySelected = getByText(connectorSelectorDialog, 'entityReference.apply')
    userEvent.click(applySelected)
    await waitFor(() => expect(document.getElementsByClassName('bp3-dialog')).toHaveLength(0))

    // Repo Name
    const repoNameInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.spec.manifests[0].manifest.spec.store.spec.repoName'
    ) as HTMLInputElement
    expect(repoNameInput).toBeInTheDocument()
    userEvent.type(repoNameInput, 'test-repo')
    await waitFor(() => expect(repoNameInput.value).toBe('test-repo'))

    // Branch
    const branchInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.spec.manifests[0].manifest.spec.store.spec.branch'
    ) as HTMLInputElement
    expect(branchInput).toBeInTheDocument()
    userEvent.type(branchInput, 'test-branch')
    await waitFor(() => expect(branchInput.value).toBe('test-branch'))

    // Path1
    const path1Input = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.spec.manifests[0].manifest.spec.store.spec.paths[0]'
    ) as HTMLInputElement
    expect(path1Input).toBeInTheDocument()
    userEvent.type(path1Input, 'test-path')

    // Add Path
    const plusButton = screen.queryByText('plusAdd')
    expect(plusButton).not.toBeInTheDocument()
  })
})
