/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Page, Button, ButtonVariation } from '@harness/uicore'
import { useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { CVStepper } from '@cv/components/CVStepper/CVStepper'
import { CreateDowntimeFormInterface, CreateDowntimeSteps } from './CreateDowntimeForm.types'
import type { DowntimeForm } from '../../CVCreateDowntime.types'
import DowntimeName from './components/DowntimeName/DowntimeName'
import { getErrorMessageByTabId, isFormDataValid } from './CreateDowntimeForm.utils'
import { CreateDowntimePreview } from './components/CreateDowntimePreview/CreateDowntimePreview'
import DowntimeWindow from './components/DowntimeWindow/DowntimeWindow'
import css from './CreateDowntimeForm.module.scss'

export const CreateDowntimeForm = ({
  loading,
  error,
  retryOnError,
  loadingSaveButton,
  runValidationOnMount
}: CreateDowntimeFormInterface): JSX.Element => {
  const { identifier } = useParams<ProjectPathProps & { identifier: string }>()
  const { getString } = useStrings()
  const formikProps = useFormikContext<DowntimeForm>()
  const isStepValid = useCallback(
    (stepId: string) => isFormDataValid(formikProps, stepId as CreateDowntimeSteps),
    [formikProps.values, formikProps.errors]
  )

  const [validateAllSteps, setValidateAllSteps] = useState<boolean | undefined>(runValidationOnMount)

  return (
    <>
      <Page.Body loading={loading} error={error} retryOnError={() => retryOnError()}>
        <>
          <CVStepper
            id="createDowntimeTabs"
            isStepValid={isStepValid}
            runValidationOnMount={validateAllSteps}
            stepList={[
              {
                id: CreateDowntimeSteps.DEFINE_DOWNTIME,
                title: getString('cv.sloDowntime.steps.identification'),
                panel: <DowntimeName identifier={identifier} />,
                errorMessage: getErrorMessageByTabId(formikProps, CreateDowntimeSteps.DEFINE_DOWNTIME),
                preview: <CreateDowntimePreview id={CreateDowntimeSteps.DEFINE_DOWNTIME} data={formikProps.values} />
              },
              {
                id: CreateDowntimeSteps.SELECT_DOWNTIME_WINDOW,
                title: getString('cv.sloDowntime.steps.downtimeWindow'),
                panel: <DowntimeWindow />,
                errorMessage: getErrorMessageByTabId(formikProps, CreateDowntimeSteps.SELECT_DOWNTIME_WINDOW),
                preview: (
                  <CreateDowntimePreview id={CreateDowntimeSteps.SELECT_DOWNTIME_WINDOW} data={formikProps.values} />
                )
              },
              {
                id: CreateDowntimeSteps.SELECT_MONITORED_SERVICES,
                title: getString('cv.sloDowntime.steps.monitoredServices'),
                panel: <></>,
                errorMessage: getErrorMessageByTabId(formikProps, CreateDowntimeSteps.SELECT_DOWNTIME_WINDOW),
                preview: <></>
              }
            ]}
          />
          <Page.Header
            className={css.footer}
            title={
              <Layout.Horizontal spacing="medium">
                <Button text={getString('cancel')} variation={ButtonVariation.SECONDARY} />
                <Button
                  text={getString('save')}
                  loading={loadingSaveButton}
                  variation={ButtonVariation.PRIMARY}
                  onClick={() => setValidateAllSteps(true)}
                />
              </Layout.Horizontal>
            }
          />
        </>
      </Page.Body>
    </>
  )
}
