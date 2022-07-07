/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { defaultTo, get, isEmpty, isNil } from 'lodash-es'
import { connect, FormikProps } from 'formik'

import { FormInput, MultiTypeInputType, RUNTIME_INPUT_VALUE, SelectOption } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import type { EnvironmentGroupResponseDTO, EnvironmentResponse, EnvironmentResponseDTO } from 'services/cd-ng'

import type { DeployStageConfig, EnvironmentInEnvGroup } from '@pipeline/utils/DeployStageInterface'

import DeployClustersInMultiEnvironment from '../DeployClustersInMultiEnvironment/DeployClustersInMultiEnvironment'

import css from './DeployEnvironmentInEnvGroup.module.scss'

interface DeployEnvironmentInEnvGroupProps {
  formik?: FormikProps<DeployStageConfig>
  readonly: boolean
  selectedEnvironmentGroup: EnvironmentGroupResponseDTO
  allowableTypes: MultiTypeInputType[]
}

function DeployEnvironmentInEnvGroup({
  formik,
  readonly,
  selectedEnvironmentGroup,
  allowableTypes
}: DeployEnvironmentInEnvGroupProps) {
  const { getString } = useStrings()

  const [environments, setEnvironments] = useState<EnvironmentResponseDTO[]>()
  const [environmentsSelectOptions, setEnvironmentsSelectOptions] = useState<SelectOption[]>()

  useEffect(() => {
    if (get(selectedEnvironmentGroup, 'envResponse')) {
      setEnvironments(
        defaultTo(
          get(selectedEnvironmentGroup, 'envResponse', [])?.map((environmentObj: EnvironmentResponse) => ({
            ...environmentObj.environment
          })),
          []
        )
      )
    }
  }, [selectedEnvironmentGroup])

  useEffect(() => {
    if (!isNil(environments)) {
      setEnvironmentsSelectOptions([
        {
          label: getString('cd.pipelineSteps.environmentTab.allEnvironmentsInEnvGroupSelected'),
          value: getString('all')
        },
        ...environments.map(environment => {
          return { label: defaultTo(environment.name, ''), value: defaultTo(environment.identifier, '') }
        })
      ])
    }
  }, [environments])

  useEffect(() => {
    if (
      !isEmpty(environmentsSelectOptions) &&
      !isNil(environmentsSelectOptions) &&
      formik?.values?.environmentsInEnvGroup
    ) {
      if (formik?.values?.environmentsInEnvGroup !== RUNTIME_INPUT_VALUE) {
        const environmentsSelected = (formik?.values?.environmentsInEnvGroup as EnvironmentInEnvGroup[]).map(
          environment => environment.name
        )

        if (environmentsSelected?.[0] === getString('all')) {
          formik?.setFieldValue('environmentInEnvGroupRef', [
            {
              label: getString('cd.pipelineSteps.environmentTab.allEnvironmentsInEnvGroupSelected'),
              value: getString('all')
            }
          ])
        } else {
          const existingEnvironments = environments?.filter(
            environment => environmentsSelected.indexOf(defaultTo(environment.identifier, '')) !== -1
          )

          if (environmentsSelected.length !== existingEnvironments?.length) {
            if (!readonly) {
              formik?.setFieldValue('environmentInEnvGroupRef', [])
            } else {
              const options = [...environmentsSelectOptions]
              options.push({
                label: formik?.values?.environmentInEnvGroupRef as string,
                value: formik?.values?.environmentInEnvGroupRef as string
              })
              setEnvironmentsSelectOptions(options)
            }
          } else {
            formik?.setFieldValue(
              'environmentInEnvGroupRef',
              existingEnvironments.map(environmentObj => ({
                label: environmentObj.name,
                value: environmentObj.identifier
              }))
            )
          }
        }
      }
    }
  }, [environmentsSelectOptions])

  return (
    <>
      <FormInput.MultiSelectTypeInput
        label={getString('cd.pipelineSteps.environmentTab.specifyYourEnvironment')}
        tooltipProps={{ dataTooltipId: 'specifyYourEnvironmentUnderAnEnvGroup' }}
        name="environmentInEnvGroupRef"
        disabled={readonly}
        placeholder={getString('cd.pipelineSteps.environmentTab.specifyYourEnvironment')}
        className={css.environmentMultiSelect}
        multiSelectTypeInputProps={{
          width: 280,
          multiSelectProps: {
            items: defaultTo(environmentsSelectOptions, [])
          },
          allowableTypes: [MultiTypeInputType.FIXED],
          onChange: items => {
            if (items !== RUNTIME_INPUT_VALUE && (items as SelectOption[]).length !== 1) {
              const selectAllItemIndex = (items as SelectOption[]).findIndex(item => item.value === getString('all'))

              if (selectAllItemIndex === 0) {
                formik?.setFieldValue('environmentInEnvGroupRef', (items as SelectOption[]).slice(1))
              } else if (selectAllItemIndex === (items as SelectOption[]).length - 1) {
                formik?.setFieldValue('environmentInEnvGroupRef', (items as SelectOption[]).slice(-1))
              } else {
                formik?.setFieldValue('environmentInEnvGroupRef', items)
              }
            } else {
              formik?.setFieldValue('environmentInEnvGroupRef', items)
            }
          }
        }}
        selectItems={defaultTo(environmentsSelectOptions, [])}
      />
      {!!defaultTo(formik?.values?.environmentInEnvGroupRef, []).length &&
        (formik?.values?.environmentInEnvGroupRef as SelectOption[])?.[0].value !== getString('all') &&
        formik?.values?.environmentInEnvGroupRef !== RUNTIME_INPUT_VALUE && (
          <DeployClustersInMultiEnvironment allowableTypes={allowableTypes} />
        )}
    </>
  )
}

export default connect(DeployEnvironmentInEnvGroup)
