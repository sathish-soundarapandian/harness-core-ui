/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { defaultTo, isEmpty } from 'lodash-es'
import { parse } from 'yaml'
import { useHistory, useParams } from 'react-router-dom'
import {
  Button,
  ButtonVariation,
  Card,
  Formik,
  Layout,
  Page,
  PageError,
  PageSpinner,
  useToaster
} from '@harness/uicore'
import routes from '@common/RouteDefinitions'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { useGetTemplateInputSetYaml, useGetTemplate } from 'services/template-ng'
import { useSaveMonitoredServiceFromYaml } from 'services/cv'
import { TemplateType, TemplateUsage } from '@templates-library/utils/templatesUtils'
import { TemplateBar } from '@pipeline/components/PipelineStudio/TemplateBar/TemplateBar'
import { useTemplateSelector } from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'
import NoResultsView from '@templates-library/pages/TemplatesPage/views/NoResultsView/NoResultsView'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import DetailsBreadcrumb from '@cv/pages/monitored-service/views/DetailsBreadcrumb'
import { Scope } from '@common/interfaces/SecretsInterface'
import ServiceEnvironmentInputSet from './components/ServiceEnvironmentInputSet/ServiceEnvironmentInputSet'
import HealthSourceInputset from './components/HealthSourceInputset/HealthSourceInputset'
import MonitoredServiceInputsetVariables from './components/MonitoredServiceInputsetVariables/MonitoredServiceInputsetVariables'
import {
  getPopulateSource,
  getQueryParamsForTemplateInputSetYaml,
  validateInputSet
} from './MonitoredServiceInputSetsTemplate.utils'
import type {
  TemplateDataInterface,
  MonitoredServiceInputSetInterface
} from './MonitoredServiceInputSetsTemplate.types'
import css from './MonitoredServiceInputSetsTemplate.module.scss'

export default function MonitoredServiceInputSetsTemplate({
  templateData
}: {
  templateData?: TemplateDataInterface
}): JSX.Element {
  const { templateRef } = useQueryParams<{ templateRef?: string }>()
  const isReadOnlyInputSet = Boolean(templateData)
  const { updateQueryParams } = useUpdateQueryParams()
  const { getTemplate } = useTemplateSelector()
  const templateRefData: TemplateDataInterface = isReadOnlyInputSet ? templateData : JSON.parse(templateRef || '{}')
  const { getString } = useStrings()
  const history = useHistory()
  const { showSuccess, showError } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const pathParams = {
    accountId,
    orgIdentifier,
    projectIdentifier
  }

  const [showLoading, setShowLoading] = React.useState(false)

  // InputSet Yaml
  const {
    data: templateInputYaml,
    loading: loadingTemplateYaml,
    error: errorTemplateYaml,
    refetch: refetchTemplateInputYaml
  } = useGetTemplateInputSetYaml({
    lazy: true,
    templateIdentifier: defaultTo(templateRefData?.identifier, ''),
    queryParams: {
      ...getQueryParamsForTemplateInputSetYaml(templateRefData),
      versionLabel: defaultTo(templateRefData?.versionLabel, ''),
      getDefaultFromOtherRepo: true
    }
  })

  const {
    data: msTemplateResponse,
    loading: msTemplateLoading,
    error: msTemplateError,
    refetch: msTemplateRefetch
  } = useGetTemplate({
    templateIdentifier: templateRefData?.identifier,
    queryParams: {
      ...getQueryParamsForTemplateInputSetYaml(templateRefData),
      versionLabel: defaultTo(templateRefData?.versionLabel, ''),
      getDefaultFromOtherRepo: true
    }
  })

  React.useEffect(() => {
    refetchTemplateInputYaml()
  }, [templateRefData?.identifier, templateRefData?.versionLabel])

  // default value for formik
  const [monitoredServiceInputSet, setMonitoredServiceInputSet] = React.useState<MonitoredServiceInputSetInterface>()

  // Set InputSet Yaml as state variable
  React.useEffect(() => {
    if (templateInputYaml && templateInputYaml?.data && !loadingTemplateYaml) {
      const inputSet = isReadOnlyInputSet
        ? parse(templateInputYaml?.data)
        : (parse(templateInputYaml?.data?.replace(/"<\+input>"/g, '""')) as any)
      setMonitoredServiceInputSet(inputSet)
    }
  }, [templateInputYaml])

  const { mutate: refetchSaveTemplateYaml } = useSaveMonitoredServiceFromYaml({
    queryParams: {
      accountId: templateRefData?.accountId,
      orgIdentifier: defaultTo(templateRefData?.orgIdentifier, orgIdentifier),
      projectIdentifier: defaultTo(templateRefData?.projectIdentifier, projectIdentifier)
    }
  })

  const templateScope = useMemo(
    () => msTemplateResponse?.data?.templateScope,
    [msTemplateResponse?.data?.templateScope]
  )

  const templateIdentifierWithScope = useMemo(
    () =>
      templateScope !== Scope.PROJECT ? `${templateScope}.${templateRefData?.identifier}` : templateRefData?.identifier,
    [templateScope, templateRefData?.identifier]
  )

  const onSave = (value: MonitoredServiceInputSetInterface): void => {
    if (monitoredServiceInputSet?.serviceRef !== undefined) {
      monitoredServiceInputSet.serviceRef = value.serviceRef
    }
    if (monitoredServiceInputSet?.environmentRef !== undefined) {
      monitoredServiceInputSet.environmentRef = value.environmentRef
    }
    const populateSource = getPopulateSource(value)
    const populateVariables = value.variables ? { variables: value.variables } : {}
    const structure = {
      monitoredService: {
        template: {
          templateRef: templateIdentifierWithScope,
          versionLabel: templateRefData?.versionLabel,
          templateInputs: {
            ...monitoredServiceInputSet,
            ...populateSource,
            ...populateVariables
          }
        }
      }
    }
    setShowLoading(true)
    refetchSaveTemplateYaml(yamlStringify(structure))
      .then(() => {
        showSuccess(getString('cv.monitoredServices.monitoredServiceCreated'))
        history.push({
          pathname: routes.toCVMonitoringServices(pathParams)
        })
      })
      .catch(error => {
        setShowLoading(false)
        showError(getErrorMessage(error))
      })
  }

  const onUseTemplate = async (): Promise<void> => {
    const { template } = await getTemplate({
      templateType: TemplateType.MonitoredService,
      allowedUsages: [TemplateUsage.USE]
    })
    const {
      identifier: selectedTemplateIdentifier = '',
      versionLabel: selectedTemplateVersionLabel = '',
      accountId: selectedTemplateAccountId = '',
      orgIdentifier: selectedTemplateOrgIdentifier = '',
      projectIdentifier: selectedTemplateProjectIdentifier = ''
    } = template
    if (selectedTemplateVersionLabel && selectedTemplateIdentifier) {
      updateQueryParams({
        templateRef: JSON.stringify({
          identifier: selectedTemplateIdentifier,
          versionLabel: selectedTemplateVersionLabel,
          accountId: selectedTemplateAccountId,
          orgIdentifier: selectedTemplateOrgIdentifier,
          projectIdentifier: selectedTemplateProjectIdentifier
        })
      })
    }
  }

  let content = <></>
  const healthSourcesWithRuntimeList = monitoredServiceInputSet?.sources?.healthSources?.map(
    healthSource => healthSource.identifier as string
  )
  if (loadingTemplateYaml) {
    content = <PageSpinner />
  } else if (errorTemplateYaml) {
    content = (
      <Card className={css.cardStyle}>
        <PageError message={getErrorMessage(errorTemplateYaml)} onClick={() => refetchTemplateInputYaml()} />
      </Card>
    )
  } else if (!monitoredServiceInputSet || isEmpty(monitoredServiceInputSet)) {
    content = (
      <>
        <Layout.Vertical className={css.inputSetForm}>
          <Card className={css.cardStyle}>
            <NoResultsView minimal={true} text={getString('templatesLibrary.noInputsRequired')} />
          </Card>
          {!isReadOnlyInputSet && (
            <Button
              disabled={showLoading || isEmpty(monitoredServiceInputSet)}
              loading={showLoading}
              variation={ButtonVariation.PRIMARY}
              onClick={() => {
                if (monitoredServiceInputSet) {
                  onSave(monitoredServiceInputSet)
                }
              }}
            >
              {getString('submit')}
            </Button>
          )}
        </Layout.Vertical>
      </>
    )
  } else if (monitoredServiceInputSet) {
    content = (
      <Formik<MonitoredServiceInputSetInterface>
        formName="MonitoredServiceForm"
        onSubmit={(values: MonitoredServiceInputSetInterface, _fn) => onSave(values)}
        initialValues={monitoredServiceInputSet}
        enableReinitialize
        validate={value => validateInputSet(value, getString)}
      >
        {formik => {
          return (
            <>
              <Layout.Vertical className={css.inputSetForm}>
                <TemplateBar
                  className={css.cardStyle}
                  templateLinkConfig={{
                    templateRef: templateIdentifierWithScope,
                    versionLabel: templateRefData?.versionLabel
                  }}
                  isReadonly={isReadOnlyInputSet}
                  onOpenTemplateSelector={onUseTemplate}
                />
                <ServiceEnvironmentInputSet
                  serviceValue={formik.values.serviceRef}
                  environmentValue={formik.values.environmentRef}
                  onChange={formik.setFieldValue}
                  isReadOnlyInputSet={isReadOnlyInputSet}
                />
                <HealthSourceInputset
                  templateRefData={templateRefData}
                  isReadOnlyInputSet={isReadOnlyInputSet}
                  data={msTemplateResponse}
                  loading={msTemplateLoading}
                  error={msTemplateError}
                  refetch={msTemplateRefetch}
                  healthSourcesWithRuntimeList={defaultTo(healthSourcesWithRuntimeList, [])}
                />
                <MonitoredServiceInputsetVariables monitoredServiceVariables={monitoredServiceInputSet?.variables} />
                {!isReadOnlyInputSet && (
                  <Button
                    disabled={showLoading}
                    loading={showLoading}
                    className={css.cardStyle}
                    variation={ButtonVariation.PRIMARY}
                    onClick={formik.submitForm}
                  >
                    {getString('submit')}
                  </Button>
                )}
              </Layout.Vertical>
            </>
          )
        }}
      </Formik>
    )
  }

  return (
    <>
      {!isReadOnlyInputSet && <Page.Header breadcrumbs={<DetailsBreadcrumb />} title={'Monitored service inputset'} />}
      <div className={css.inputsetContainer}>{content}</div>
    </>
  )
}
