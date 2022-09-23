/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { ModuleName } from 'framework/types/ModuleName'
import ModuleSelectionFactory, { ModuleSelectionPanel, ModuleSelectionPanelProps } from '../ModuleSelectionFactory'

const TestPanel: ModuleSelectionPanel = ({ projectData }) => (
  <pre data-testid="TestPanel">{JSON.stringify(projectData)}</pre>
)

const renderModuleSelectionPanel = (
  moduleName: ModuleName,
  projectData?: ModuleSelectionPanelProps['projectData']
): RenderResult => render(<>{ModuleSelectionFactory.getModuleSelectionPanel(moduleName, projectData)}</>)

describe('ModuleSelectionFactory', () => {
  beforeEach(() => {
    ModuleSelectionFactory.clear()
  })

  test('it should return the panel that was registered', async () => {
    ModuleSelectionFactory.registerModuleSelection(ModuleName.CF, TestPanel)

    renderModuleSelectionPanel(ModuleName.CF)

    expect(screen.getByTestId('TestPanel')).toBeInTheDocument()
  })

  test('it should pass the projectData to the panel that was registered', async () => {
    ModuleSelectionFactory.registerModuleSelection(ModuleName.CF, TestPanel)

    const projectData: ModuleSelectionPanelProps['projectData'] = {
      identifier: 'my_project',
      name: 'My Project'
    }

    renderModuleSelectionPanel(ModuleName.CF, projectData)

    expect(screen.getByTestId('TestPanel')).toHaveTextContent(JSON.stringify(projectData))
  })

  test('it should return nothing when a module panel is not registered', async () => {
    renderModuleSelectionPanel(ModuleName.CI)

    expect(screen.queryByTestId('TestPanel')).not.toBeInTheDocument()
  })
})
