/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikErrors } from 'formik'

import type { StringsMap } from 'stringTypes'
import type { K8SDirectServiceStep } from '../K8sServiceSpec/K8sServiceSpecInterface'

export interface ValidateInputSetFieldArgs {
  data: K8SDirectServiceStep
  template?: K8SDirectServiceStep
  isRequired: boolean
  errors: FormikErrors<K8SDirectServiceStep>
  getString: ((key: keyof StringsMap, vars?: Record<string, string> | undefined) => string) | undefined
}

export interface ValidateArtifactInputSetFieldArgs extends ValidateInputSetFieldArgs {
  artifactType?: string
  dataPathToField: string
  templatePathToField: string
}
