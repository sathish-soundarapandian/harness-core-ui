/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext } from 'react'
import { noop } from 'lodash-es'

import { VisualYamlSelectedView as SelectedView } from '@harness/uicore'

interface PipelineTriggersContextInterface {
  selectedView: SelectedView
  setSelectedView: (selectedView: SelectedView) => void
}

export const PipelineTriggersContext = React.createContext<PipelineTriggersContextInterface>({
  selectedView: SelectedView.VISUAL,
  setSelectedView: noop
})

export const usePipelineTriggersContext = (): PipelineTriggersContextInterface => useContext(PipelineTriggersContext)
