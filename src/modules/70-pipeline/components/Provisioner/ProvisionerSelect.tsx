/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import type { SelectOption } from '@harness/uicore';
import { FormInput } from '@harness/uicore'
import { connect } from 'formik'

import { useStrings } from 'framework/strings'
import type { ExecutionWrapperConfig } from 'services/cd-ng'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

interface ProvisionerSelectFieldProps {
  provisioners?: ExecutionWrapperConfig[]
  name: string
  formik?: any
  isReadonly?: boolean
  path: string
}

function ProvisionerSelectField(props: ProvisionerSelectFieldProps): React.ReactElement {
  const { name, formik, isReadonly = false, provisioners } = props
  const { CD_NG_DYNAMIC_PROVISIONING_ENV_V2 } = useFeatureFlags()

  const [options, setOptions] = useState<SelectOption[]>([])

  const { getString } = useStrings()

  const includeProvisioner = [
    StepType.TerraformApply,
    StepType.ShellScriptProvision,
    StepType.TerragruntApply,
    StepType.CloudFormationCreateStack,
    StepType.CreateAzureARMResource
  ]

  const getProvisionerSteps = (arr: ExecutionWrapperConfig[]): ExecutionWrapperConfig[] => {
    let result: ExecutionWrapperConfig[] = []

    arr.forEach((obj: ExecutionWrapperConfig) => {
      if (obj?.step) {
        result.push(obj)
      } else if (obj.parallel) {
        result = result.concat(getProvisionerSteps(obj.parallel))
      } else if (obj.stepGroup) {
        result = result.concat(getProvisionerSteps(obj.stepGroup.steps as ExecutionWrapperConfig[]))
      }
    })
    return result.filter(({ step }) => step?.type && includeProvisioner.includes(step.type as StepType))
  }

  React.useEffect(() => {
    if (provisioners) {
      setOptions(
        getProvisionerSteps(provisioners).map(({ step }: ExecutionWrapperConfig) => {
          return {
            label: /* istanbul ignore next */ step?.name,
            value: /* istanbul ignore next */ step?.identifier
          }
        }) as SelectOption[]
      )
    }
  }, [provisioners])

  return (
    <>
      {CD_NG_DYNAMIC_PROVISIONING_ENV_V2 && (
        <FormInput.Select
          disabled={isReadonly}
          label={getString('common.provisioner')}
          name={name}
          items={options}
          data-testid="provisioner-select"
          onChange={option => {
            formik.setFieldValue(name, option.value)
          }}
        />
      )}
    </>
  )
}

export default connect(ProvisionerSelectField)
