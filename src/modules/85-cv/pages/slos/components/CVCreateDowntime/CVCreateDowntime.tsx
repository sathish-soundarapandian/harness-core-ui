/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { Formik, Page, Container, Heading, useToaster } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useHistory, useParams } from 'react-router-dom'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetDowntime, useSaveDowntime, useUpdateDowntimeData } from 'services/cv'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import routes from '@common/RouteDefinitions'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { DowntimeForm } from './CVCreateDowntime.types'
import {
  createSLODowntimeRequestPayload,
  getDowntimeFormValidationSchema,
  getDowntimeInitialFormData
} from './CVCreateDowntime.utils'
import { CreateDowntimeForm } from './components/CreateDowntimeForm/CreateDowntimeForm'

const CVCreateDowntime = (): JSX.Element => {
  const { getString } = useStrings()
  const history = useHistory()
  useDocumentTitle([getString('cv.srmTitle'), getString('cv.sloDowntime.label')])
  const { showSuccess, showError } = useToaster()

  const { accountId, orgIdentifier, projectIdentifier, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()
  const pathParams = { accountIdentifier: accountId, orgIdentifier, projectIdentifier }

  const { mutate: createDowntime, loading: createDowntimeLoading } = useSaveDowntime(pathParams)

  const { mutate: updateDowntime, loading: updateDowntimeLoading } = useUpdateDowntimeData({
    identifier,
    ...pathParams
  })

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

  const handleRedirect = (): void => {
    history.push(routes.toCVSLODowntime({ accountId, orgIdentifier, projectIdentifier, module: 'cv' }))
  }

  const handleDowntimeSubmit = async (values: DowntimeForm): Promise<void> => {
    const sloDowntimeRequestPayload = createSLODowntimeRequestPayload(values, orgIdentifier, projectIdentifier)

    try {
      if (identifier) {
        await updateDowntime(sloDowntimeRequestPayload)
        showSuccess(getString('cv.sloDowntime.downtimeUpdated'))
      } else {
        await createDowntime(sloDowntimeRequestPayload)
        showSuccess(getString('cv.sloDowntime.downtimeCreated'))
      }
      handleRedirect()
    } catch (e) {
      showError(getErrorMessage(e))
    }
  }

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
      <Page.Body loading={loading} error={getErrorMessage(error)} retryOnError={() => refetch()}>
        {((identifier && data) || !identifier) && (
          <Formik<DowntimeForm>
            initialValues={getDowntimeInitialFormData(data?.resource?.downtime)}
            formName="downtimeForm"
            onSubmit={values => {
              handleDowntimeSubmit(values)
            }}
            validationSchema={getDowntimeFormValidationSchema(getString)}
          >
            <CreateDowntimeForm
              handleRedirect={handleRedirect}
              runValidationOnMount={Boolean(identifier)}
              loadingSaveButton={createDowntimeLoading || updateDowntimeLoading}
            />
          </Formik>
        )}
      </Page.Body>
    </Container>
  )
}

export default CVCreateDowntime
