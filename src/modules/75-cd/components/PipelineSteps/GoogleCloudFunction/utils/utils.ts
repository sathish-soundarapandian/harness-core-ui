/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StringsMap } from 'stringTypes'
import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import { GoogleCloudFunctionsEnvType } from '@pipeline/utils/stageHelpers'

export const getGoogleCloudFunctionsEnvOptions = (
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
): SelectOption[] => [
  { label: getString('cd.steps.googleCloudFunctionCommon.envTypes.gen1'), value: GoogleCloudFunctionsEnvType.GenOne },
  { label: getString('cd.steps.googleCloudFunctionCommon.envTypes.gen2'), value: GoogleCloudFunctionsEnvType.GenTwo }
]
