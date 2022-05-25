/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, FormikProps } from 'formik'
import { noop } from 'lodash-es'
import * as Yup from 'yup'
import { GroupedThumbnailSelect } from '@wings-software/uicore'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { InfraDeploymentType } from '@cd/components/PipelineSteps/PipelineStepsUtil'
import type { InfrastructureGroup } from '../deployInfraHelper'
import css from './SelectInfrastructureType.module.scss'

export function getInfraDeploymentTypeSchema(
  getString: UseStringsReturn['getString']
): Yup.StringSchema<string | undefined> {
  return Yup.string()
    .oneOf(Object.values(InfraDeploymentType))
    .required(getString('cd.pipelineSteps.infraTab.deploymentType'))
}

interface SelectInfrastructureTypeProps {
  infraGroups: InfrastructureGroup[]
  selectedInfrastructureType?: string
  onChange: (deploymentType: string | undefined) => void
  isReadonly: boolean
}

export default function SelectInfrastructureType(props: SelectInfrastructureTypeProps): JSX.Element {
  const { selectedInfrastructureType, onChange, isReadonly, infraGroups } = props
  const { getString } = useStrings()

  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)

  const formikRef = React.useRef<FormikProps<unknown> | null>(null)

  const filteredInfraGroups = infraGroups.filter(item => !item.disabled)

  React.useEffect(() => {
    subscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
    return () => unSubscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
  }, [])

  return (
    <Formik<{ deploymentType?: string }>
      onSubmit={noop}
      initialValues={{
        deploymentType: selectedInfrastructureType
      }}
      enableReinitialize
      validationSchema={Yup.object().shape({
        deploymentType: getInfraDeploymentTypeSchema(getString)
      })}
    >
      {formik => {
        window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.INFRASTRUCTURE }))
        formikRef.current = formik as FormikProps<unknown> | null
        return (
          <GroupedThumbnailSelect
            className={css.thumbnailSelect}
            name={'deploymentType'}
            onChange={onChange}
            groups={filteredInfraGroups}
            isReadonly={isReadonly}
          />
        )
      }}
    </Formik>
  )
}
