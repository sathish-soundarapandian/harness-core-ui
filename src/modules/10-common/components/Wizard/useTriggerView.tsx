/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Dispatch, SetStateAction, useEffect } from 'react'
import { VisualYamlSelectedView } from '@harness/uicore'
import { useLocalStorage } from '@common/hooks'

const useTriggerView = (
  isNewTrigger: boolean
): [VisualYamlSelectedView, Dispatch<SetStateAction<VisualYamlSelectedView>>] => {
  const [selectedView, setSelectedView] = useLocalStorage<VisualYamlSelectedView>(
    'trigger_view',
    VisualYamlSelectedView.VISUAL
  )

  useEffect(() => {
    // If the user preference stored in local storage is YAML, set the Visual View for the new trigger.
    if (isNewTrigger && selectedView === VisualYamlSelectedView.YAML) {
      setSelectedView(VisualYamlSelectedView.VISUAL)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNewTrigger])

  return [selectedView, setSelectedView]
}

export default useTriggerView
