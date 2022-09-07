/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, FormikProps } from 'formik'
import { get, noop } from 'lodash-es'
import * as Yup from 'yup'
import { Card, Checkbox, FormError, HarnessDocTooltip, Layout, Thumbnail, Utils } from '@harness/uicore'
import cx from 'classnames'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { useGetCommunity } from '@common/utils/utils'
import { errorCheck } from '@common/utils/formikHelpers'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type { DeploymentTypeItem } from './DeploymentInterface'
import stageCss from '../DeployStageSetupShell/DeployStage.module.scss'

export function getServiceDeploymentTypeSchema(
  getString: UseStringsReturn['getString']
): Yup.StringSchema<string | undefined | null> {
  return Yup.string().nullable().required(getString('cd.pipelineSteps.serviceTab.deploymentTypeRequired'))
}

interface SelectServiceDeploymentTypeProps {
  isReadonly: boolean
  shouldShowGitops: boolean
  handleDeploymentTypeChange: (deploymentType: ServiceDeploymentType) => void
  selectedDeploymentType?: ServiceDeploymentType
  viewContext?: string
  handleGitOpsCheckChanged?: (ev: React.FormEvent<HTMLInputElement>) => void
  gitOpsEnabled?: boolean
}

interface CardListProps {
  items: DeploymentTypeItem[]
  isReadonly: boolean
  selectedValue?: string
  onChange: (deploymentType: ServiceDeploymentType) => void
  allowDisabledItemClick?: boolean
}

const DEPLOYMENT_TYPE_KEY = 'deploymentType'

const CardList = ({ items, isReadonly, selectedValue, onChange }: CardListProps): JSX.Element => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onChange(e.target.value as ServiceDeploymentType)
  }
  return (
    <Layout.Horizontal spacing={'medium'} className={stageCss.cardListContainer}>
      {items
        .filter(item => (isReadonly && item.value === selectedValue) || !isReadonly)
        .map(item => {
          const itemContent = (
            <Thumbnail
              key={item.value}
              label={item.label}
              value={item.value}
              icon={item.icon}
              disabled={item.disabled || isReadonly}
              selected={item.value === selectedValue}
              onClick={handleChange}
            />
          )

          return (
            <Utils.WrapOptionalTooltip key={item.value} tooltipProps={item.tooltipProps} tooltip={item.tooltip}>
              {itemContent}
            </Utils.WrapOptionalTooltip>
          )
        })}
    </Layout.Horizontal>
  )
}

export default function SelectDeploymentType({
  selectedDeploymentType,
  gitOpsEnabled,
  isReadonly,
  viewContext,
  shouldShowGitops,
  handleDeploymentTypeChange,
  handleGitOpsCheckChanged
}: SelectServiceDeploymentTypeProps): JSX.Element {
  const { getString } = useStrings()
  const formikRef = React.useRef<FormikProps<unknown> | null>(null)
  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)
  const { SSH_NG, AZURE_WEBAPP_NG, ECS_NG, NG_DEPLOYMENT_TEMPLATE } = useFeatureFlags()

  // Supported in NG (Next Gen - The one for which you are coding right now)
  const ngSupportedDeploymentTypes: DeploymentTypeItem[] = React.useMemo(() => {
    const baseTypes = [
      {
        label: getString('pipeline.serviceDeploymentTypes.kubernetes'),
        icon: 'service-kubernetes',
        value: ServiceDeploymentType.Kubernetes
      },
      {
        label: getString('pipeline.nativeHelm'),
        icon: 'service-helm',
        value: ServiceDeploymentType.NativeHelm
      },
      {
        label: getString('pipeline.serviceDeploymentTypes.serverlessAwsLambda'),
        icon: 'service-serverless-aws',
        value: ServiceDeploymentType.ServerlessAwsLambda
      }
    ]
    if (SSH_NG) {
      baseTypes.push({
        label: getString('pipeline.serviceDeploymentTypes.ssh'),
        icon: 'secret-ssh',
        value: ServiceDeploymentType.Ssh
      })
      baseTypes.push({
        label: getString('pipeline.serviceDeploymentTypes.winrm'),
        icon: 'command-winrm',
        value: ServiceDeploymentType.WinRm
      })
    }
    if (AZURE_WEBAPP_NG) {
      baseTypes.push({
        label: 'Azure Web App',
        icon: 'azurewebapp',
        value: ServiceDeploymentType.AzureWebApp
      })
    }
    if (ECS_NG) {
      baseTypes.push({
        label: getString('pipeline.serviceDeploymentTypes.amazonEcs'),
        icon: 'service-amazon-ecs',
        value: ServiceDeploymentType.ECS
      })
    }
    if (NG_DEPLOYMENT_TEMPLATE) {
      baseTypes.push({
        label: getString('pipeline.serviceDeploymentTypes.deploymentTemplate'),
        icon: 'template-library',
        value: ServiceDeploymentType.CustomDeployment
      })
    }

    return baseTypes as DeploymentTypeItem[]
  }, [getString, SSH_NG, AZURE_WEBAPP_NG])

  // Suppported in CG (First Gen - Old Version of Harness App)
  const cgSupportedDeploymentTypes: DeploymentTypeItem[] = React.useMemo(() => {
    const types = [
      ...(!ECS_NG
        ? [
            {
              label: getString('pipeline.serviceDeploymentTypes.amazonEcs'),
              icon: 'service-amazon-ecs',
              value: ServiceDeploymentType.ECS
            }
          ]
        : []),
      {
        label: getString('pipeline.serviceDeploymentTypes.amazonAmi'),
        icon: 'main-service-ami',
        value: ServiceDeploymentType.amazonAmi
      },
      {
        label: getString('pipeline.serviceDeploymentTypes.awsCodeDeploy'),
        icon: 'app-aws-code-deploy',
        value: ServiceDeploymentType.awsCodeDeploy
      },
      {
        label: getString('pipeline.serviceDeploymentTypes.awsLambda'),
        icon: 'app-aws-lambda',
        value: ServiceDeploymentType.awsLambda
      },
      {
        label: getString('pipeline.serviceDeploymentTypes.pcf'),
        icon: 'service-pivotal',
        value: ServiceDeploymentType.pcf
      }
    ]
    if (!SSH_NG) {
      types.splice(3, 0, {
        label: getString('pipeline.serviceDeploymentTypes.ssh'),
        icon: 'secret-ssh',
        value: ServiceDeploymentType.Ssh
      })
      types.splice(4, 0, {
        label: getString('pipeline.serviceDeploymentTypes.winrm'),
        icon: 'command-winrm',
        value: ServiceDeploymentType.WinRm
      })
    }
    return types as DeploymentTypeItem[]
  }, [getString, SSH_NG, ECS_NG])

  const [cgDeploymentTypes, setCgDeploymentTypes] = React.useState(cgSupportedDeploymentTypes)
  const [ngDeploymentTypes, setNgDeploymentTypes] = React.useState(ngSupportedDeploymentTypes)
  const isCommunity = useGetCommunity()
  const hasError = errorCheck(DEPLOYMENT_TYPE_KEY, formikRef?.current)

  React.useEffect(() => {
    if (isCommunity) {
      cgSupportedDeploymentTypes.forEach(deploymentType => {
        deploymentType['disabled'] = true
      })
      setCgDeploymentTypes(cgSupportedDeploymentTypes)
    } else {
      setNgDeploymentTypes(ngSupportedDeploymentTypes)
    }
  }, [])

  React.useEffect(() => {
    subscribeForm({ tab: DeployTabs.SERVICE, form: formikRef })
    return () => unSubscribeForm({ tab: DeployTabs.SERVICE, form: formikRef })
  }, [formikRef])

  const renderDeploymentTypes = React.useCallback((): JSX.Element => {
    if (!isCommunity) {
      return (
        <Layout.Vertical margin={{ top: 'medium' }}>
          <Layout.Vertical padding={viewContext ? { right: 'huge' } : { right: 'small' }} margin={{ bottom: 'large' }}>
            <CardList
              items={ngDeploymentTypes}
              isReadonly={isReadonly}
              onChange={handleDeploymentTypeChange}
              selectedValue={selectedDeploymentType}
            />
            {hasError ? (
              <FormError
                name={DEPLOYMENT_TYPE_KEY}
                errorMessage={get(formikRef?.current?.errors, DEPLOYMENT_TYPE_KEY)}
              />
            ) : null}
          </Layout.Vertical>
        </Layout.Vertical>
      )
    }
    return (
      <CardList
        items={viewContext ? [...ngSupportedDeploymentTypes, ...cgDeploymentTypes] : [...ngSupportedDeploymentTypes]}
        isReadonly={isReadonly}
        onChange={handleDeploymentTypeChange}
        selectedValue={selectedDeploymentType}
      />
    )
  }, [cgDeploymentTypes, ngSupportedDeploymentTypes, getString, isReadonly, handleDeploymentTypeChange])

  const renderGitops = (): JSX.Element | null => {
    if (shouldShowGitops && selectedDeploymentType === ServiceDeploymentType.Kubernetes) {
      return (
        <Checkbox
          label={getString('common.gitOps')}
          name="gitOpsEnabled"
          checked={gitOpsEnabled}
          onChange={handleGitOpsCheckChanged}
          disabled={isReadonly}
        />
      )
    }
    return null
  }

  return (
    <Formik<{ deploymentType: string; gitOpsEnabled: boolean }>
      onSubmit={noop}
      enableReinitialize={true}
      initialValues={{
        deploymentType: selectedDeploymentType as string,
        gitOpsEnabled: shouldShowGitops ? !!gitOpsEnabled : false
      }}
      validationSchema={Yup.object().shape({
        deploymentType: getServiceDeploymentTypeSchema(getString)
      })}
    >
      {formik => {
        window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.SERVICE }))
        formikRef.current = formik as FormikProps<unknown> | null
        if (viewContext) {
          return (
            <Card className={stageCss.sectionCard}>
              <div
                className={cx(stageCss.tabSubHeading, 'ng-tooltip-native')}
                data-tooltip-id="stageOverviewDeploymentType"
              >
                {getString('deploymentTypeText')}
                <HarnessDocTooltip tooltipId="stageOverviewDeploymentType" useStandAlone={true} />
              </div>
              {renderDeploymentTypes()}
              {renderGitops()}
            </Card>
          )
        } else {
          return (
            <div className={stageCss.stageView}>
              <div
                className={cx(stageCss.deploymentTypeHeading, 'ng-tooltip-native')}
                data-tooltip-id="stageOverviewDeploymentType"
              >
                {getString('deploymentTypeText')}
                <HarnessDocTooltip tooltipId="stageOverviewDeploymentType" useStandAlone={true} />
              </div>
              {renderDeploymentTypes()}
            </div>
          )
        }
      }}
    </Formik>
  )
}
