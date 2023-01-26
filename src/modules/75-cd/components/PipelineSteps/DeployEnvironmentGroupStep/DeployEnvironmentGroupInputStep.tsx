/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { defaultTo, isEmpty, isNil } from 'lodash-es'
import { useFormikContext } from 'formik'
import { Spinner } from '@blueprintjs/core'

import { AllowedTypes, getMultiTypeFromValue, Layout, MultiTypeInputType } from '@harness/uicore'

import { useStrings } from 'framework/strings'

import { MultiTypeEnvironmentGroupField } from '@pipeline/components/FormMultiTypeEnvironmentGroupField/FormMultiTypeEnvironmentGroupField'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import ExperimentalInput from '../K8sServiceSpec/K8sServiceSpecForms/ExperimentalInput'
import type { DeployEnvironmentEntityConfig } from '../DeployEnvironmentEntityStep/types'
import { useGetEnvironmentGroupsData } from '../DeployEnvironmentEntityStep/DeployEnvironmentGroup/useGetEnvironmentGroupsData'

import css from './DeployEnvironmentGroupStep.module.scss'

export interface DeployEnvironmentGroupInputStepProps {
  allowableTypes: AllowedTypes
  inputSetData?: {
    template?: DeployEnvironmentEntityConfig
    path?: string
    readonly?: boolean
    allValues?: DeployEnvironmentEntityConfig
  }
  gitOpsEnabled: boolean
}

export default function DeployEnvironmentGroupInputStep({
  allowableTypes,
  inputSetData,
  gitOpsEnabled
}: DeployEnvironmentGroupInputStepProps): React.ReactElement {
  const { getString } = useStrings()
  const formik = useFormikContext<DeployEnvironmentEntityConfig>()

  const pathPrefix = isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`

  const { CDS_OrgAccountLevelServiceEnvEnvGroup } = useFeatureFlags()

  // API
  const {
    environmentGroupsList,
    loadingEnvironmentGroupsList,
    // This is required only when updating the entities list
    updatingEnvironmentGroupsList
  } = useGetEnvironmentGroupsData()

  const selectOptions = useMemo(() => {
    /* istanbul ignore else */
    if (!isNil(environmentGroupsList)) {
      return environmentGroupsList.map(environmentGroupInList => ({
        label: defaultTo(environmentGroupInList.envGroup?.name, ''),
        value: defaultTo(environmentGroupInList.envGroup?.identifier, '')
      }))
    }

    return []
  }, [environmentGroupsList])

  const loading = loadingEnvironmentGroupsList || updatingEnvironmentGroupsList

  return (
    <>
      {getMultiTypeFromValue(inputSetData?.template?.environmentGroup?.envGroupRef) === MultiTypeInputType.RUNTIME && (
        <Layout.Horizontal spacing="medium" style={{ alignItems: 'flex-end' }}>
          {CDS_OrgAccountLevelServiceEnvEnvGroup && !gitOpsEnabled ? (
            <MultiTypeEnvironmentGroupField
              tooltipProps={{ dataTooltipId: 'specifyYourEnvironmentGroup' }}
              label={getString('cd.pipelineSteps.environmentTab.specifyYourEnvironmentGroup')}
              name={`${pathPrefix}environmentGroup.envGroupRef`}
              placeholder={getString('cd.pipelineSteps.environmentTab.selectEnvironmentGroup')}
              setRefValue
              multiTypeProps={{
                allowableTypes: (allowableTypes as MultiTypeInputType[])?.filter(
                  item => item !== MultiTypeInputType.EXPRESSION && item !== MultiTypeInputType.EXECUTION_TIME
                ) as AllowedTypes
              }}
              disabled={inputSetData?.readonly}
              className={css.inputWidth}
            />
          ) : (
            <ExperimentalInput
              tooltipProps={{ dataTooltipId: 'specifyYourEnvironmentGroup' }}
              label={getString('cd.pipelineSteps.environmentTab.specifyYourEnvironmentGroup')}
              name={`${pathPrefix}environmentGroup.envGroupRef`}
              placeholder={getString('cd.pipelineSteps.environmentTab.selectEnvironmentGroup')}
              selectItems={selectOptions}
              useValue
              multiTypeInputProps={{
                allowableTypes: (allowableTypes as MultiTypeInputType[])?.filter(
                  item => item !== MultiTypeInputType.EXPRESSION && item !== MultiTypeInputType.EXECUTION_TIME
                ) as AllowedTypes,
                selectProps: {
                  items: selectOptions
                }
              }}
              disabled={inputSetData?.readonly}
              className={css.inputWidth}
              formik={formik}
            />
          )}
          {loading ? <Spinner className={css.inputSetSpinner} size={16} /> : null}
        </Layout.Horizontal>
      )}
    </>
  )
}
