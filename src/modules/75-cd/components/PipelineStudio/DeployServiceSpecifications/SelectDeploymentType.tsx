/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, ReactNode } from 'react'
import { Formik, FormikProps } from 'formik'
import { get, noop } from 'lodash-es'
import * as Yup from 'yup'
import {
  Button,
  Card,
  Checkbox,
  Container,
  FormError,
  HarnessDocTooltip,
  Layout,
  Text,
  Thumbnail,
  Utils
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { Spinner } from '@blueprintjs/core'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { useGetCommunity } from '@common/utils/utils'
import { errorCheck } from '@common/utils/formikHelpers'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import {
  DeploymentTypeItem,
  getCgSupportedDeploymentTypes,
  getNgSupportedDeploymentTypes
} from '@cd/utils/deploymentUtils'
import type { TemplateLinkConfig } from 'services/pipeline-ng'
import { TemplateBar } from '@pipeline/components/PipelineStudio/TemplateBar/TemplateBar'
import { TemplateSummaryResponse, useGetTemplateList } from 'services/template-ng'
import { useMutateAsGet } from '@common/hooks'
import { TemplateType, TemplateUsage } from '@templates-library/utils/templatesUtils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  getIconForTemplate,
  Sort,
  SortFields,
  TemplateListType
} from '@templates-library/pages/TemplatesPage/TemplatesPageUtils'
import { getTemplateRefVersionLabelObject } from '@pipeline/utils/templateUtils'
import { useTemplateSelector } from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'
import stageCss from '../DeployStageSetupShell/DeployStage.module.scss'
import deployServiceCss from './DeployServiceSpecifications.module.scss'

const DEPLOYMENT_TYPE_KEY = 'deploymentType'

export function getServiceDeploymentTypeSchema(
  getString: UseStringsReturn['getString']
): Yup.StringSchema<string | undefined | null> {
  return Yup.string().nullable().required(getString('cd.pipelineSteps.serviceTab.deploymentTypeRequired'))
}

interface RecentDeploymentTemplatesProps {
  readonly: boolean
  labelClassName?: string
  templateLinkConfig?: TemplateLinkConfig
  selectedDeploymentType?: ServiceDeploymentType
  onDeploymentTemplateSelect: (template: TemplateSummaryResponse, fromTemplateSelector: boolean) => void
}

const RecentDeploymentTemplates: FC<RecentDeploymentTemplatesProps> = ({
  readonly,
  labelClassName,
  templateLinkConfig,
  selectedDeploymentType,
  onDeploymentTemplateSelect
}) => {
  const { getString } = useStrings()
  const { getTemplate } = useTemplateSelector()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const { data, loading, error } = useMutateAsGet(useGetTemplateList, {
    body: {
      filterType: 'Template',
      templateEntityTypes: [TemplateType.CustomDeployment]
    },
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      templateListType: TemplateListType.Stable,
      page: 0,
      sort: [SortFields.LastUpdatedAt, Sort.DESC],
      size: 5,
      includeAllTemplatesAvailableAtScope: true
    },
    queryParamStringifyOptions: { arrayFormat: 'comma' }
  })
  const templates = data?.data?.content

  const onTemplateSelectorClick = async (): Promise<void> => {
    try {
      const { template } = await getTemplate({
        templateType: TemplateType.CustomDeployment,
        allowedUsages: [TemplateUsage.USE]
      })

      onDeploymentTemplateSelect(template, true)
    } catch (e) {
      // don't do anything when template isn't selected
    }
  }

  const isSelected = (currentTemplateLinkConfig: TemplateLinkConfig): boolean => {
    return currentTemplateLinkConfig.templateRef === templateLinkConfig?.templateRef
  }

  if (loading) {
    return (
      <Container height={'100px'} margin={{ top: 'medium' }} flex={{ alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size={20} />
      </Container>
    )
  }
  if (error || !templates?.length || (readonly && selectedDeploymentType !== ServiceDeploymentType.CustomDeployment)) {
    return null
  }

  const filteredTemplates = templates?.filter(
    template => !readonly || isSelected(getTemplateRefVersionLabelObject(template))
  )

  if (!filteredTemplates?.length) return null

  return (
    <>
      <div className={labelClassName}>{getString('cd.deploymentTemplates')}</div>
      <div className={deployServiceCss.recentDeploymentTemplates}>
        {filteredTemplates?.map(template => {
          const currentTemplateLinkConfig = getTemplateRefVersionLabelObject(template)
          const templateIconName = getIconForTemplate(getString, template)

          return (
            <div key={currentTemplateLinkConfig.templateRef} className={deployServiceCss.thumbnailContainer}>
              <Thumbnail
                className={cx(!readonly && deployServiceCss.cursorPointer)}
                value={currentTemplateLinkConfig.templateRef}
                icon={templateIconName}
                imageProps={{
                  src: template.icon,
                  alt: getString('cd.logoOfName', { name: template.name })
                }}
                disabled={readonly}
                selected={isSelected(currentTemplateLinkConfig)}
                onClick={() => onDeploymentTemplateSelect(template, false)}
              />
              <Text
                lineClamp={2}
                font={{ weight: 'semi-bold', size: 'small' }}
                color={readonly ? Color.GREY_500 : Color.GREY_600}
              >
                {template.name}
              </Text>
            </div>
          )
        })}

        {!readonly && (
          <Button
            disabled={readonly}
            className={deployServiceCss.doubleChevron}
            type="button"
            intent="primary"
            icon="double-chevron-right"
            minimal
            iconProps={{ size: 18 }}
            onClick={onTemplateSelectorClick}
          />
        )}
      </div>
    </>
  )
}

interface CardListProps {
  items: DeploymentTypeItem[]
  isReadonly: boolean
  selectedValue?: string
  onChange: (deploymentType: ServiceDeploymentType) => void
  allowDisabledItemClick?: boolean
}

const CardList = ({ items, isReadonly, selectedValue, onChange }: CardListProps): JSX.Element => {
  const { getString } = useStrings()
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
              label={getString(item.label)}
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

interface SelectServiceDeploymentTypeProps {
  isReadonly: boolean
  shouldShowGitops: boolean
  handleDeploymentTypeChange: (deploymentType: ServiceDeploymentType) => void
  selectedDeploymentType?: ServiceDeploymentType
  viewContext?: string
  handleGitOpsCheckChanged?: (ev: React.FormEvent<HTMLInputElement>) => void
  gitOpsEnabled?: boolean
  templateLinkConfig?: TemplateLinkConfig
  onDeploymentTemplateSelect: (template: TemplateSummaryResponse, fromTemplateSelector: boolean) => void
  addOrUpdateTemplate?: () => void | Promise<void>
  templateBarOverrideClassName?: string
}

export default function SelectDeploymentType({
  selectedDeploymentType,
  gitOpsEnabled,
  isReadonly,
  viewContext,
  shouldShowGitops,
  handleDeploymentTypeChange,
  handleGitOpsCheckChanged,
  templateLinkConfig,
  onDeploymentTemplateSelect,
  addOrUpdateTemplate,
  templateBarOverrideClassName = ''
}: SelectServiceDeploymentTypeProps): JSX.Element {
  const { getString } = useStrings()
  const formikRef = React.useRef<FormikProps<unknown> | null>(null)
  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)
  const { SSH_NG, NG_SVC_ENV_REDESIGN, SPOT_ELASTIGROUP_NG } = useFeatureFlags()

  // Supported in NG (Next Gen - The one for which you are coding right now)
  const ngSupportedDeploymentTypes = React.useMemo(() => {
    return getNgSupportedDeploymentTypes({ SSH_NG, NG_SVC_ENV_REDESIGN, SPOT_ELASTIGROUP_NG })
  }, [SSH_NG, NG_SVC_ENV_REDESIGN, SPOT_ELASTIGROUP_NG])

  // Suppported in CG (First Gen - Old Version of Harness App)
  const cgSupportedDeploymentTypes: DeploymentTypeItem[] = React.useMemo(() => {
    return getCgSupportedDeploymentTypes({ SSH_NG, NG_SVC_ENV_REDESIGN, SPOT_ELASTIGROUP_NG })
  }, [SSH_NG, NG_SVC_ENV_REDESIGN, SPOT_ELASTIGROUP_NG])

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

  const renderDeploymentTypes = (): JSX.Element => {
    if (!isCommunity) {
      return (
        <Layout.Vertical margin={{ bottom: 'medium' }}>
          <Layout.Vertical padding={viewContext ? { right: 'huge' } : { right: 'small' }}>
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
            {templateLinkConfig ? (
              <Layout.Vertical padding={0} margin={{ top: 'medium' }}>
                <TemplateBar
                  templateLinkConfig={templateLinkConfig}
                  onOpenTemplateSelector={addOrUpdateTemplate}
                  className={cx(deployServiceCss.templateBar, templateBarOverrideClassName)}
                  isReadonly={isReadonly}
                />
              </Layout.Vertical>
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
  }

  const renderGitops = (): JSX.Element | null => {
    if (shouldShowGitops && selectedDeploymentType === ServiceDeploymentType.Kubernetes) {
      return (
        <Checkbox
          label={getString('common.gitOps')}
          name="gitOpsEnabled"
          checked={gitOpsEnabled}
          onChange={handleGitOpsCheckChanged}
          disabled={isReadonly}
          className={deployServiceCss.gitOpsCheck}
        />
      )
    }
    return null
  }

  const renderRecentDeploymentTemplates = (): ReactNode => (
    <RecentDeploymentTemplates
      labelClassName={viewContext ? stageCss.tabSubHeading : stageCss.deploymentTypeHeading}
      readonly={isReadonly}
      templateLinkConfig={templateLinkConfig}
      onDeploymentTemplateSelect={onDeploymentTemplateSelect}
      selectedDeploymentType={selectedDeploymentType}
    />
  )

  const renderDeploymentTypeLabel = (): ReactNode => {
    // only selected deployment type thumbnail is rendered in readonly mode,
    // but the thumbnail for CustomDeployment has been removed, so this helps in hiding the label in that case
    if (isReadonly && selectedDeploymentType === ServiceDeploymentType.CustomDeployment) {
      return null
    }

    return (
      <div
        className={cx(viewContext ? stageCss.tabSubHeading : stageCss.deploymentTypeHeading, 'ng-tooltip-native')}
        data-tooltip-id="stageOverviewDeploymentType"
      >
        {getString('deploymentTypeText')}
        <HarnessDocTooltip tooltipId="stageOverviewDeploymentType" useStandAlone={true} />
      </div>
    )
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
              {renderDeploymentTypeLabel()}
              {renderDeploymentTypes()}
              {renderGitops()}
              {renderRecentDeploymentTemplates()}
            </Card>
          )
        } else {
          return (
            <div className={stageCss.stageView}>
              {renderDeploymentTypeLabel()}
              {renderDeploymentTypes()}
              {renderRecentDeploymentTemplates()}
            </div>
          )
        }
      }}
    </Formik>
  )
}
