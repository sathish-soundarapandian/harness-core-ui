/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, queryByText, waitFor } from '@testing-library/react'
import { Formik, FormikForm } from '@wings-software/uicore'
import { renderHook } from '@testing-library/react-hooks'
import { TestWrapper } from '@common/utils/testUtils'
import { useStrings } from 'framework/strings'

import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, triggerPathProps } from '@common/utils/routeUtils'
import {
  iValues,
  errorInitialValuesWithoutRuntime,
  errorIntitialValuesWithoutAnyArtifact,
  errorIntitialValuesWithoutSelectedArtifact
} from './ArtifactConfigPanelMocks'
import ArtifactTriggerConfigPanel from '../views/ArtifactTriggerConfigPanel'

const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
  <TestWrapper>{children}</TestWrapper>
)
const { result } = renderHook(() => useStrings(), { wrapper })

jest.mock('@wings-software/monaco-yaml/lib/esm/languageservice/yamlLanguageService', () => ({
  getLanguageService: jest.fn()
}))

const params = {
  accountId: 'testAcc',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'test',
  pipelineIdentifier: 'pipeline',
  triggerIdentifier: 'triggerIdentifier',
  module: 'cd'
}

const TEST_PATH = routes.toTriggersWizardPage({ ...accountPathProps, ...triggerPathProps, ...pipelineModuleParams })

jest.mock('@pipeline/factories/ArtifactTriggerInputFactory', () => ({
  getTriggerFormDetails: jest.fn().mockImplementation(() => () => {
    return {
      component: <div>ABC</div>
    }
  })
}))
function WrapperComponent(props: { initialValues: any; isEdit?: boolean }): JSX.Element {
  const { initialValues, isEdit = false } = props
  return (
    <Formik initialValues={initialValues} onSubmit={() => undefined} formName="artifactTriggerConfigPanel">
      {formikProps => (
        <FormikForm>
          <TestWrapper path={TEST_PATH} pathParams={params}>
            <ArtifactTriggerConfigPanel formikProps={formikProps} isEdit={isEdit} />
          </TestWrapper>
        </FormikForm>
      )}
    </Formik>
  )
}

describe('Artifact Trigger Config Panel  tests', () => {
  describe('Renders/snapshots', () => {
    test('inital Render', async () => {
      const { container } = render(<WrapperComponent initialValues={iValues} isEdit={false} />)
      await waitFor(() => expect(queryByText(container, result.current.getString('manifestsText'))).not.toBeNull())
      //   await waitFor(() =>
      //     expect(
      //       document.body.querySelector('[class*="ArtifactTriggerConfigPanel"] [data-name="plusAdd"]')
      //     ).not.toBeNull()
      //   )
      expect(container).toMatchSnapshot()
    })

    test('No Runtime Tags selected but artifact present', async () => {
      const { container } = render(<WrapperComponent initialValues={errorInitialValuesWithoutRuntime} isEdit={false} />)
      expect(container).toMatchSnapshot()
      await waitFor(() =>
        expect(
          queryByText(container, 'pipeline.artifactTriggerConfigPanel.noSelectableRuntimeArtifactsFound')
        ).not.toBeNull()
      )
    })
    test('No Artifact Present Error String', async () => {
      const { container } = render(
        <WrapperComponent initialValues={errorIntitialValuesWithoutAnyArtifact} isEdit={false} />
      )
      expect(container).toMatchSnapshot()
      await waitFor(() =>
        expect(queryByText(container, 'pipeline.artifactTriggerConfigPanel.noSelectableArtifactsFound')).not.toBeNull()
      )
    })
    test('Artifact of selected type not present', async () => {
      const { container } = render(
        <WrapperComponent initialValues={errorIntitialValuesWithoutSelectedArtifact} isEdit={false} />
      )
      expect(container).toMatchSnapshot()
      await waitFor(() =>
        expect(queryByText(container, 'pipeline.artifactTriggerConfigPanel.noSelectableArtifactsFound')).not.toBeNull()
      )
    })

    test('edit render', async () => {
      const initialValueObj = {
        ...iValues,
        artifactRef: 's3manifestid',
        selectedArtifact: {
          identifier: 's3manifestid',
          spec: {
            chartPath: 'test',
            connectorRef: '<+input>',
            store: {
              region: 'regionA'
            }
          }
        },
        stageId: 'stage'
      }
      const { container } = render(<WrapperComponent initialValues={initialValueObj} isEdit={true} />)
      await waitFor(() =>
        expect(document.body.querySelector('[class*="ArtifactTriggerConfigPanel"] [data-name="plusAdd"]')).toBeNull()
      )
      await waitFor(() =>
        expect(
          queryByText(
            container,
            result.current.getString('pipeline.artifactTriggerConfigPanel.locationRepoPath').toUpperCase()
          )
        ).not.toBeNull()
      )
      //   !todo: update snapshot so that it shows table
      expect(container).toMatchSnapshot()
    })
  })
})
