/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import BuildTests from '@pipeline/pages/execution/ExecutionTestView/BuildTests'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { CopyText } from '@common/components/CopyText/CopyText'
import { Duration } from '@common/exports'
import useExpandErrorModal from '@pipeline/components/ExpandErrorModal/useExpandErrorModal'
import type { TIUIAppCustomProps } from './interfaces/TIUIApp.types'

// eslint-disable-next-line import/no-unresolved
const TIUIMicroFrontendPath = React.lazy(() => import('tiui/MicroFrontendApp'))

function BuildTestsApp() {
  const { TI_MFE_ENABLED } = useFeatureFlags()
  return TI_MFE_ENABLED ? (
    <ChildAppMounter<TIUIAppCustomProps>
      ChildApp={TIUIMicroFrontendPath}
      customComponents={{
        CopyText,
        Duration
      }}
      customHooks={{ useExecutionContext, useExpandErrorModal }}
    />
  ) : (
    <BuildTests />
  )
}

export default BuildTestsApp
