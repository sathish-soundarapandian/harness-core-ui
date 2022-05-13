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
import { IconName, GroupedThumbnailSelect } from '@wings-software/uicore'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { InfraDeploymentType } from '@cd/components/PipelineSteps/PipelineStepsUtil'
import { isServerlessDeploymentType } from '@pipeline/utils/stageHelpers'
import css from './SelectInfrastructureType.module.scss'

export function getInfraDeploymentTypeSchema(
  getString: UseStringsReturn['getString']
): Yup.StringSchema<string | undefined> {
  return Yup.string()
    .oneOf(Object.values(InfraDeploymentType))
    .required(getString('cd.pipelineSteps.infraTab.deploymentType'))
}

interface InfrastructureItem {
  label: string
  icon: IconName
  value: string
  disabled?: boolean
}

interface InfrastructureGroup {
  groupLabel: string
  items: InfrastructureItem[]
  disabled?: boolean
}

interface SelectInfrastructureTypeProps {
  deploymentType: string
  selectedInfrastructureType?: string
  onChange: (deploymentType: string | undefined) => void
  isReadonly: boolean
}

export default function SelectInfrastructureType(props: SelectInfrastructureTypeProps): JSX.Element {
  const { selectedInfrastructureType, onChange, isReadonly, deploymentType } = props
  const { NG_AZURE } = useFeatureFlags()
  const { getString } = useStrings()
  const infraGroups: InfrastructureGroup[] = isServerlessDeploymentType(deploymentType)
    ? [
        {
          groupLabel: '',
          items: [
            {
              label: getString('common.aws'),
              icon: 'service-aws',
              value: InfraDeploymentType.ServerlessAwsLambda
            },
            {
              label: getString('common.gcp'),
              icon: 'gcp',
              value: InfraDeploymentType.ServerlessGoogleFunctions,
              disabled: true
            },
            {
              label: getString('common.azure'),
              icon: 'service-azure',
              value: InfraDeploymentType.ServerlessAzureFunctions,
              disabled: true
            }
          ]
        }
      ]
    : [
        {
          groupLabel: getString('pipelineSteps.deploy.infrastructure.directConnection'),
          items: [
            {
              label: getString('pipelineSteps.deploymentTypes.kubernetes'),
              icon: 'service-kubernetes',
              value: InfraDeploymentType.KubernetesDirect
            }
          ]
        },
        {
          groupLabel: getString('pipelineSteps.deploy.infrastructure.viaCloudProvider'),
          items: NG_AZURE
            ? [
                {
                  label: getString('pipelineSteps.deploymentTypes.gk8engine'),
                  icon: 'google-kubernetes-engine',
                  value: InfraDeploymentType.KubernetesGcp
                },
                {
                  label: getString('cd.steps.azureInfraStep.azure'),
                  icon: 'microsoft-azure',
                  value: InfraDeploymentType.KubernetesAzure
                }
              ]
            : [
                {
                  label: getString('pipelineSteps.deploymentTypes.gk8engine'),
                  icon: 'google-kubernetes-engine',
                  value: InfraDeploymentType.KubernetesGcp
                }
              ]
        }
      ]

  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)

  const formikRef = React.useRef<FormikProps<unknown> | null>(null)

  React.useEffect(() => {
    subscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
    return () => unSubscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
  }, [])

  return (
    <Formik<{ deploymentType?: string }>
      onSubmit={noop}
      initialValues={{ deploymentType: selectedInfrastructureType }}
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
            groups={infraGroups.filter(item => !item.disabled)}
            isReadonly={isReadonly}
          />
        )
      }}
    </Formik>
  )
}
