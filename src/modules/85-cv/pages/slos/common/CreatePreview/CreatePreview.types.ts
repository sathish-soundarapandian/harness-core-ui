/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type React from 'react'
import type { SLOV2Form } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import type { CreateCompositeSLOSteps } from '../../components/CVCreateSLOV2/components/CreateCompositeSloForm/CreateCompositeSloForm.types'
import type { CreateSimpleSLOSteps } from '../../components/CVCreateSLOV2/components/CreateSimpleSloForm/CreateSimpleSloForm.types'

export interface CreatePreviewProps {
  id: CreateCompositeSLOSteps | CreateSimpleSLOSteps
  data: SLOV2Form
}

export interface LabelValueProps {
  label: string
  value: string | React.ReactElement
  className?: string
  isLabelHeading?: boolean
  isValueHeading?: boolean
}

export interface CalenderValuePreviewProps {
  data: SLOV2Form
  isPreview?: boolean
}
