/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { isEmpty } from 'lodash-es'
import { parse } from 'yaml'
import type { GetDataError } from 'restful-react'
import { Card, Color, FontVariation, Icon, PageError, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { Failure } from 'services/cv'
import type { ResponseTemplateResponse } from 'services/template-ng'
import NoResultsView from '@templates-library/pages/TemplatesPage/views/NoResultsView/NoResultsView'
import HealthSourceInputsetTable from './components/HealthSourceInputsetTable/HealthSourceInputsetTable'
import HealthSourceInputsetForm from './components/HealthSourceInputsetForm/HealthSourceInputsetForm'
import type {
  MonitoredServiceTemplateInterface,
  TemplateDataInterface,
  YamlResponseInterface
} from '../../MonitoredServiceInputSetsTemplate.types'
import css from '@cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/MonitoredServiceInputSetsTemplate.module.scss'

interface HealthSourceInputsetInterface {
  templateRefData: TemplateDataInterface
  healthSourcesWithRuntimeList: string[]
  isReadOnlyInputSet?: boolean
  data: ResponseTemplateResponse | null
  loading: boolean
  error: GetDataError<Failure | Error> | null
  refetch: () => Promise<void>
}

export default function HealthSourceInputset({
  templateRefData,
  isReadOnlyInputSet,
  healthSourcesWithRuntimeList,
  data: msTemplateResponse,
  loading: msTemplateLoading,
  error: msTemplateError,
  refetch: msTemplateRefetch
}: HealthSourceInputsetInterface): JSX.Element {
  const { getString } = useStrings()
  const [monitoredServiceYaml, setMonitoredServiceYaml] = React.useState<MonitoredServiceTemplateInterface>()

  useEffect(() => {
    msTemplateRefetch()
  }, [templateRefData?.identifier, templateRefData?.versionLabel])

  const healthSources = monitoredServiceYaml?.spec?.sources?.healthSources

  // Set complete Yaml as state variable
  React.useEffect(() => {
    if (msTemplateResponse && msTemplateResponse?.data?.yaml) {
      const yaml = parse(msTemplateResponse?.data?.yaml) as YamlResponseInterface
      const filteredHealthSourceList = yaml?.template?.spec?.sources?.healthSources?.filter((i: any) =>
        healthSourcesWithRuntimeList?.includes(i.identifier)
      )
      const filteredTemplate = {
        ...yaml?.template,
        spec: {
          ...yaml?.template.spec,
          sources: {
            ...yaml?.template?.spec?.sources,
            healthSources: filteredHealthSourceList
          }
        }
      } as MonitoredServiceTemplateInterface
      setMonitoredServiceYaml(filteredTemplate)
    }
  }, [msTemplateResponse])

  let content = <></>
  if (msTemplateLoading) {
    content = <Icon name="spinner" />
  } else if (msTemplateError) {
    content = <PageError message={getErrorMessage(msTemplateError)} onClick={() => msTemplateRefetch()} />
  } else if (isEmpty(monitoredServiceYaml)) {
    content = <NoResultsView minimal={true} text={getString('templatesLibrary.noInputsRequired')} />
  } else if (!isEmpty(monitoredServiceYaml)) {
    content = (
      <>
        <HealthSourceInputsetTable healthSources={healthSources} />
        <HealthSourceInputsetForm healthSources={healthSources} isReadOnlyInputSet={isReadOnlyInputSet} />
      </>
    )
  }

  return (
    <Card className={css.cardStyle}>
      <Text
        font={{ variation: FontVariation.CARD_TITLE }}
        color={Color.BLACK}
        style={{ paddingBottom: 'var(--spacing-medium)' }}
      >
        {getString('cv.templates.healthSourceDetails')}
      </Text>
      {content}
    </Card>
  )
}
