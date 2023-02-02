/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { Formik, Page, Container, Heading } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetDowntime } from 'services/cv'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { DowntimeForm } from './CVCreateDowntime.types'
import {
  getDowntimeFormValidationSchema,
  getDowntimeInitialFormData,
  handleDowntimeSubmit
} from './CVCreateDowntime.utils'
import { CreateDowntimeForm } from './components/CreateDowntimeForm/CreateDowntimeForm'

const CVCreateDowntime = (): JSX.Element => {
  const { getString } = useStrings()

  const { accountId, orgIdentifier, projectIdentifier, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()

  const pathParams = { accountIdentifier: accountId, orgIdentifier, projectIdentifier }

  const { data, error, refetch, loading } = useGetDowntime({
    ...pathParams,
    identifier,
    lazy: true
  })

  useEffect(() => {
    if (identifier) {
      refetch()
    }
  }, [identifier])

  return (
    <Container margin={{ bottom: 'large' }}>
      <Page.Header
        breadcrumbs={<NGBreadcrumbs />}
        title={
          <Heading level={3} font={{ variation: FontVariation.H4 }}>
            {getString('cv.sloDowntime.addDowntime')}
          </Heading>
        }
      />
      <Formik<DowntimeForm>
        initialValues={getDowntimeInitialFormData(data?.resource?.downtime)}
        formName="downtimeForm"
        onSubmit={handleDowntimeSubmit}
        validationSchema={getDowntimeFormValidationSchema(getString)}
        enableReinitialize
      >
        <CreateDowntimeForm
          loading={loading}
          error={getErrorMessage(error)}
          retryOnError={refetch}
          runValidationOnMount={Boolean(identifier)}
          loadingSaveButton={false}
        />
      </Formik>
    </Container>
  )
}

export default CVCreateDowntime
