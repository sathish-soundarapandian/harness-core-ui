/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Dispatch, SetStateAction } from 'react'
import { VisualYamlSelectedView } from '@harness/uicore'
import { useLocalStorage } from '@common/hooks'

const useTriggerView = (): [VisualYamlSelectedView, Dispatch<SetStateAction<VisualYamlSelectedView>>] =>
  useLocalStorage<VisualYamlSelectedView>('trigger_view', VisualYamlSelectedView.VISUAL)

export default useTriggerView
