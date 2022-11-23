/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Text, Container, Utils } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useValidateK8sConnectivity } from 'services/cv'
import { FormConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/FormConnectorReferenceField'
import type { ConnectorReferenceFieldProps } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import ValidationStatus from '@cv/pages/components/ValidationStatus/ValidationStatus'
import { useStrings } from 'framework/strings'
import { determineValidationStatus } from './kubernetesChangeSource.utils'
import type { ChangeSourceProps } from '../../ChangeSourceDrawer.types'

export default function KubernetesChangeSource(props: ChangeSourceProps): JSX.Element {
  const { formik, isEdit } = props
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps & { identifier: string }>()
  const { loading, error, refetch, data } = useValidateK8sConnectivity({ lazy: true })

  useEffect(() => {
    if (!isEdit && formik.values?.spec?.connectorRef && !loading) {
      refetch({
        queryParams: {
          accountId,
          projectIdentifier,
          orgIdentifier,
          tracingId: Utils.randomId(),
          connectorIdentifier: formik.values.spec.connectorRef
        }
      })
    }
  }, [formik.values?.spec?.connectorRef])

  useEffect(() => {
    if (isEdit || !formik.values?.spec?.connectorRef) {
      return
    }

    if (error || data?.data === false || loading) {
      formik.setFieldValue('spec', { ...formik.values?.spec, isConnectorInvalid: true })
    } else if (data?.data) {
      delete formik.values?.spec?.isConnectorInvalid
      formik.setFieldValue('spec', { ...formik.values?.spec })
    }
  }, [data, error, loading])

  const validationResult = useMemo(
    () => determineValidationStatus({ isEdit, loading, result: data?.data, error, getString }),
    [isEdit, loading, error]
  )

  return (
    <Container data-name="kubechangesource">
      <FormConnectorReferenceField
        width={400}
        formik={formik}
        type={formik.values?.type as ConnectorReferenceFieldProps['type']}
        name={'spec.connectorRef'}
        disabled={isEdit}
        accountIdentifier={accountId}
        projectIdentifier={projectIdentifier}
        orgIdentifier={orgIdentifier}
        placeholder={getString('cv.healthSource.connectors.selectConnector', {
          sourceType: formik?.values?.type
        })}
        label={
          <Text color={Color.BLACK} font={'small'} margin={{ bottom: 'small' }}>
            {getString('connectors.selectConnector')}
          </Text>
        }
        tooltipProps={{ dataTooltipId: 'selectKubeConnector' }}
      />
      <ValidationStatus
        validationStatus={validationResult.status}
        textToDisplay={validationResult.text}
        onRetry={() =>
          refetch({
            queryParams: {
              accountId,
              projectIdentifier,
              orgIdentifier,
              tracingId: Utils.randomId(),
              connectorIdentifier: formik.values.spec.connectorRef
            }
          })
        }
      />
    </Container>
  )
}
