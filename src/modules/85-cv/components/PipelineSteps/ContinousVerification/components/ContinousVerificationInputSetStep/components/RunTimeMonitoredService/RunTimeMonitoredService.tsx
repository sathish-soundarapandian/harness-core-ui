/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useState } from 'react'
import cx from 'classnames'
import { Container, FormInput } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { isEmpty } from 'lodash-es'
import type { ProjectPathProps, AccountPathProps } from '@common/interfaces/RouteInterfaces'
import {
  ChangeSourceDTO,
  HealthSource,
  MonitoredServiceResponse,
  useGetMonitoredServiceFromServiceAndEnvironment
} from 'services/cv'
import { useStrings } from 'framework/strings'
import Card from '@cv/components/Card/Card'
import VerifyStepHealthSourceTable from '@cv/pages/health-source/HealthSourceTable/VerifyStepHealthSourceTable'
import type { MonitoringSourceData, RunTimeMonitoredServiceProps } from './RunTimeMonitoredService.types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './RunTimeMonitoredService.module.scss'

export default function RunTimeMonitoredService({
  serviceIdentifier,
  envIdentifier,
  // onUpdate,
  prefix,
  initialValues
}: RunTimeMonitoredServiceProps): JSX.Element {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps & AccountPathProps>()
  const { getString } = useStrings()
  const [monitoringSource, setMonitoringSourceData] = useState<MonitoringSourceData>({
    monitoredService: { name: '', identifier: '', sources: { healthSources: [] } }
  })

  const { data, loading, error } = useGetMonitoredServiceFromServiceAndEnvironment({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      environmentIdentifier: envIdentifier,
      serviceIdentifier
    }
  })
  const monitoredServiceData = data?.data

  useEffect(() => {
    if (!loading && !error && envIdentifier && serviceIdentifier) {
      // Note - This code is commented as we decided to not to pass Monitored service
      // and health sources in yaml. This could be useful in future depending on product requirements.

      // updateMonitoredServiceData(initialValues, onUpdate, monitoredServiceData)
      setMonitoringSourceData(monitoredServiceData as MonitoringSourceData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monitoredServiceData, error, loading, envIdentifier, serviceIdentifier])

  const onSuccess = useCallback(
    (updatedMonitoredService: MonitoredServiceResponse) => {
      // updateMonitoredServiceData(initialValues, onUpdate, monitoredServiceData)
      setMonitoringSourceData(updatedMonitoredService as MonitoringSourceData)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [initialValues, monitoredServiceData]
  )

  if (isEmpty(serviceIdentifier) || isEmpty(envIdentifier)) {
    return (
      <Card>
        <div className={css.emptyFields}>
          <div className={css.emptyFieldItem}>
            {`
              ${getString('connectors.cdng.runTimeMonitoredService.pleaseSpecify')}
              ${isEmpty(serviceIdentifier) ? getString('service') : ''}
              ${isEmpty(serviceIdentifier) && isEmpty(envIdentifier) ? getString('and') : ''}
              ${isEmpty(envIdentifier) ? getString('environment') : ''}
              ${getString('connectors.cdng.runTimeMonitoredService.toFetchMonitoredService')}
            `}
          </div>
        </div>
      </Card>
    )
  } else if (loading) {
    return (
      <Card>
        <>{getString('connectors.cdng.monitoredService.fetchingMonitoredService')}</>
      </Card>
    )
  } else if (error) {
    return (
      <Card>
        <>{getString('connectors.cdng.runTimeMonitoredService.fetchingMonitoredServiceError')}</>
      </Card>
    )
  } else if (
    !isEmpty(monitoringSource?.monitoredService?.name) &&
    !isEmpty(monitoringSource?.monitoredService?.sources?.healthSources)
  ) {
    return (
      <>
        <Card>
          <div className={cx(stepCss.formGroup)}>
            <FormInput.CustomRender
              name={`${prefix}spec.monitoredServiceRef`}
              label={getString('connectors.cdng.monitoredService.label')}
              render={() => (
                <Container data-testid="monitored-service">{monitoringSource?.monitoredService?.name}</Container>
              )}
            />
          </div>
        </Card>
        <VerifyStepHealthSourceTable
          serviceIdentifier={serviceIdentifier}
          envIdentifier={envIdentifier}
          changeSourcesList={monitoringSource?.monitoredService?.sources?.changeSources as ChangeSourceDTO[]}
          healthSourcesList={monitoringSource?.monitoredService?.sources?.healthSources as HealthSource[]}
          monitoredServiceRef={{
            identifier: monitoringSource?.monitoredService?.identifier,
            name: monitoringSource?.monitoredService?.name
          }}
          onSuccess={onSuccess}
          isRunTimeInput
        />
      </>
    )
  } else if (isEmpty(monitoringSource?.monitoredService?.name)) {
    return (
      <Card>
        <div className={css.error}>
          {getString('connectors.cdng.runTimeMonitoredService.noMonitoringSercvicePresent')}
        </div>
      </Card>
    )
  } else if (isEmpty(monitoringSource?.monitoredService?.sources?.healthSources)) {
    return (
      <Card>
        <div className={css.error}>{getString('connectors.cdng.runTimeMonitoredService.noHealthSourcePresent')}</div>
      </Card>
    )
  }
  return <></>
}
