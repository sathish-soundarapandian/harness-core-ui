/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudio'
import StageBuilder from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilder'
import { RightBar as PipelineStudioRightBar } from '@pipeline/components/PipelineStudio/RightBar/RightBar'
import { TemplateDrawer } from '@templates-library/components/TemplateDrawer/TemplateDrawer'
import { RightDrawer } from '@templates-library/components/TemplateStudio/RightDrawer/RightDrawer'
import { useSaveTemplateListener } from '@pipeline/components/PipelineStudio/hooks/useSaveTemplateListener'

const PipelineTemplateCanvas = (_props: unknown, _formikRef: TemplateFormRef): JSX.Element => {
  useSaveTemplateListener()

  return (
    <>
      <StageBuilder />
      <PipelineStudioRightBar />
      <TemplateDrawer />
      <RightDrawer />
    </>
  )
}

export const PipelineTemplateCanvasWithRef = React.forwardRef(PipelineTemplateCanvas)
