/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo } from 'react'
import { Container, FormInput, Layout, SelectOption, Utils, Text } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { Color } from '@harness/design-system'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import { useGetServicesFromPagerDuty } from 'services/cv'
import { useToaster } from '@common/exports'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { FormConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/FormConnectorReferenceField'
import type { UpdatedChangeSourceDTO } from '../../ChangeSourceDrawer.types'
import style from './PagerDutyChangeSource.module.scss'

export default function PageDutyChangeSource({
  formik,
  isEdit
}: {
  formik: FormikProps<UpdatedChangeSourceDTO>
  isEdit?: boolean
}): JSX.Element {
  const { getString } = useStrings()
  const { showError, clear } = useToaster()
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps & { identifier: string }>()

  const {
    data: pagerdutyServices,
    error: pagerdutyServicesError,
    refetch: fetchPagerDutyServices,
    loading: loadingPagerdutyServices
  } = useGetServicesFromPagerDuty({
    lazy: true
  })

  useEffect(() => {
    if (formik?.values?.spec?.connectorRef) {
      fetchPagerDutyServices({
        queryParams: {
          orgIdentifier,
          projectIdentifier,
          accountId,
          connectorIdentifier: formik?.values?.spec?.connectorRef,
          requestGuid: Utils.randomId()
        }
      })
    }
  }, [formik?.values?.spec?.connectorRef])

  if (pagerdutyServicesError) {
    clear()
    showError(getErrorMessage(pagerdutyServicesError))
  }

  const pagerDutyServiceOptions = useMemo(
    () =>
      pagerdutyServices?.resource?.map(item => {
        const service: SelectOption = {
          label: item.name || '',
          value: item.id || ''
        }
        return service
      }) || [],
    [pagerdutyServices?.resource]
  )

  return (
    <Layout.Horizontal spacing={'xxlarge'}>
      <Container margin={{ bottom: 'large' }} width={'400px'}>
        <div className={style.connectorField}>
          <FormConnectorReferenceField
            width={400}
            formik={formik}
            disabled={isEdit}
            type={formik?.values?.type as any}
            name={'spec.connectorRef'}
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            placeholder={getString('cv.healthSource.connectors.selectConnector', {
              sourceType: formik?.values?.type
            })}
            label={getString('connectors.selectConnector')}
            tooltipProps={{ dataTooltipId: 'selectPageDutyConnector' }}
          />
        </div>
      </Container>
      {formik?.values?.spec?.connectorRef && (
        <Container margin={{ bottom: 'large' }} width={'400px'}>
          <FormInput.Select
            disabled={isEdit}
            name="spec.pagerDutyServiceId"
            label={getString('cv.changeSource.PageDuty.pagerDutyService')}
            placeholder={
              loadingPagerdutyServices
                ? getString('loading')
                : getString('cv.changeSource.PageDuty.selectPagerDutyService')
            }
            tooltipProps={{ dataTooltipId: 'pagerDutyService' }}
            items={pagerDutyServiceOptions}
          />
          {!pagerDutyServiceOptions.length && !loadingPagerdutyServices && (
            <Text font={'xsmall'} color={Color.ERROR}>
              {getString('cv.changeSource.PageDuty.pagerDutyEmptyService', {
                connector: formik?.values?.spec?.connectorRef
              })}
            </Text>
          )}
        </Container>
      )}
    </Layout.Horizontal>
  )
}
