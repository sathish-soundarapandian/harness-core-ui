/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import MonacoEditorMock from '@common/components/MonacoEditor/__mocks__/MonacoEditor'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { AddManifestSteps } from '../AddManifestSteps'

const suggestedManifest = {
  function: {
    name: '<functionName>',
    buildConfig: {
      runtime: 'nodejs18',
      entryPoint: 'helloGET'
    },
    environment: 'GEN_2'
  },
  function_id: '<functionName>'
}

const suggestedManifestYaml =
  `# Following are the minimum set of parameters required to create a Google Cloud Function.
# Please make sure your uploaded manifest file includes all of them.

` + yamlStringify(suggestedManifest)

const manifestFileName = 'Google-cloud-function-manifest.yaml'

jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => ({
  YamlBuilderMemo: ({ existingJSON, renderCustomHeader, existingYaml, ...rest }: any) => (
    <React.Fragment>
      {renderCustomHeader()}
      <MonacoEditorMock data-testid="editor" value={existingYaml ?? yamlStringify(existingJSON)} {...rest} />
    </React.Fragment>
  )
}))

describe('AddManifestSteps tests', () => {
  test('should display correct UI based on passed props', async () => {
    const { container } = render(
      <TestWrapper>
        <AddManifestSteps
          manifestType={ManifestDataType.GoogleCloudFunctionDefinition}
          selectedDeploymentType={ServiceDeploymentType.GoogleCloudFunctions}
          manifestFileName={manifestFileName}
          suggestedManifestYaml={suggestedManifestYaml}
        />
      </TestWrapper>
    )

    // First step title
    const firstStepTitle = screen.getByText('cd.pipelineSteps.serviceTab.manifest.manifestFirstStepTitle')
    expect(firstStepTitle).toBeInTheDocument()

    // Test file header - name, copy icon and download icon
    const yamlFileName = screen.getByText(manifestFileName)
    expect(yamlFileName).toBeInTheDocument()
    // Copy to Clipboard icon
    const copyIcon = container.querySelector('span[data-icon="copy-alt"]')
    expect(copyIcon).toBeInTheDocument()
    // Download icon
    const downloadIcon = container.querySelector('span[icon="download"]')
    expect(downloadIcon).toBeInTheDocument()
    // This anchor help in dowload action
    const downloadLinkAnchor = screen.getByTestId('fakeDownloadLink')
    expect(downloadLinkAnchor).toBeInTheDocument()

    // Editor content
    const yamlEditorTextArea = screen.getByTestId('editor')
    expect(yamlEditorTextArea).toHaveValue(suggestedManifestYaml)

    // Second step title
    const secondStepTitle = screen.getByText('cd.pipelineSteps.serviceTab.manifest.manifestSecondStepTitle')
    expect(secondStepTitle).toBeInTheDocument()
  })
})
