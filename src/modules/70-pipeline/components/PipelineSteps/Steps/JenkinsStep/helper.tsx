/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption, SelectWithSubmenuOption } from '@harness/uicore'
import type { SelectWithBiLevelOption } from '@harness/uicore/dist/components/Select/BiLevelSelect'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import type { UseStringsReturn } from 'framework/strings'
import { isValueFixed } from '@common/utils/utils'
import type { JenkinsStepData } from './types'
const JENKINS_JOB_NAME_SEPARATOR = '/'

export const resetForm = (
  formik: FormikProps<JenkinsStepData>,
  parent: string,
  prefix: string,
  updateJobName?: boolean
): void => {
  if (parent === 'connectorRef') {
    if (updateJobName) {
      formik.setFieldValue(`${prefix}spec.jobName`, '')
      formik.setFieldValue(`${prefix}spec.jobParameter`, [])
    }
  }
  if (parent === 'jobName') {
    formik.setFieldValue(`${prefix}spec.jobParameter`, [])
  }
}

export const scriptInputType: SelectOption[] = [
  { label: 'String', value: 'String' },
  { label: 'Number', value: 'Number' }
]

export const variableSchema = (
  getString: UseStringsReturn['getString']
): Yup.NotRequiredArraySchema<
  | {
      name: string
      value: string
      type: string
    }
  | undefined
> =>
  Yup.array().of(
    Yup.object({
      name: Yup.string().required(getString('common.validation.nameIsRequired')),
      value: Yup.string().required(getString('common.validation.valueIsRequired')),
      type: Yup.string().trim().required(getString('common.validation.typeIsRequired'))
    })
  )

export const getJenkinsJobParentChildName = (
  jobName: SelectWithBiLevelOption | string
): { jobName: SelectWithBiLevelOption | string; childJobName?: string } => {
  if (isValueFixed(jobName)) {
    const fullJobName = typeof jobName === 'string' ? jobName : jobName.label
    const jobNameSeparatorIndex = fullJobName.indexOf(JENKINS_JOB_NAME_SEPARATOR)

    if (jobNameSeparatorIndex > 0) {
      return {
        jobName: fullJobName.substring(0, jobNameSeparatorIndex),
        childJobName: fullJobName
      }
    }

    return {
      jobName: fullJobName
    }
  }

  return { jobName }
}

export const getJobValue = (job: SelectWithBiLevelOption | string): SelectWithBiLevelOption => {
  const label = typeof job === 'string' ? job : job?.label

  return {
    label,
    value: label
  }
}

export const getJobName = (
  jobName?: SelectWithBiLevelOption | string,
  childJobName?: SelectWithSubmenuOption | string
): string | undefined => {
  if (childJobName) {
    return typeof childJobName === 'string' ? childJobName : childJobName.label
  }

  if (jobName) {
    return typeof jobName === 'string' ? jobName : jobName.label
  }
}
