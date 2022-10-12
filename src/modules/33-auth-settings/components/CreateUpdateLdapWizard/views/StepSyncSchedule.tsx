/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement, useRef, useState } from 'react'
import {
  Button,
  ButtonVariation,
  FontVariation,
  Formik,
  FormikForm,
  Layout,
  StepProps,
  Text,
  useConfirmationDialog,
  useToaster
} from '@harness/uicore'
import * as Yup from 'yup'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import isEmpty from 'lodash-es/isEmpty'
// eslint-disable-next-line no-restricted-imports
import { useParams } from 'react-router'
import { get } from 'lodash-es'
import SchedulePanel from '@common/components/SchedulePanel/SchedulePanel'
import { ExpressionBreakdownInterface, getBreakdownValues } from '@common/components/SchedulePanel/components/utils'
import { String, useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetIterationsFromCron } from 'services/portal'
import { getErrorMessage } from '@auth-settings/utils'
import type { CreateUpdateLdapWizardProps, LdapWizardStepProps } from '../CreateUpdateLdapWizard'
import { getDateIterationsList, DEFAULT_LDAP_SYNC_CRON_EXPRESSION } from '../utils'
import css from '../CreateUpdateLdapWizard.module.scss'

export interface SyncSchedule {
  cronExpression: string
  isEdit?: boolean
}

interface ExpressionFormData extends ExpressionBreakdownInterface {
  expression: string
}

export const StepSyncSchedule: React.FC<StepProps<CreateUpdateLdapWizardProps> & LdapWizardStepProps<SyncSchedule>> =
  props => {
    const { showError } = useToaster()
    const { accountId } = useParams<ProjectPathProps>()
    const { getString } = useStrings()
    const { mutate: getCronIterations } = useGetIterationsFromCron({
      queryParams: { accountId }
    })

    const { stepData, createUpdateActionProps, name, updateStepData } = props
    const { cronExpression = DEFAULT_LDAP_SYNC_CRON_EXPRESSION, isEdit = false } = stepData || {}
    const { isUpdateInProgress, createUpdateError, triggerSaveData } = createUpdateActionProps || {}

    const cronExpressionFormRef = useRef<FormikProps<ExpressionFormData>>(null)

    const [updatedCronExpression, setUpdatedCronExpression] = useState<string>(cronExpression)
    const [cronIterationsList, setCronIterationsList] = useState<ReactElement>()

    const breakdownValues = getBreakdownValues(cronExpression)

    const onSyncScheduleSubmit = async (formData: ExpressionFormData): Promise<ExpressionFormData> => {
      const { expression } = formData
      setUpdatedCronExpression(expression)
      updateStepData({ cronExpression: expression })
      try {
        const response = await getCronIterations({ cronExpression: expression })
        const iterations = get(response, 'resource', []).slice(0, 5)
        setCronIterationsList(getDateIterationsList(iterations))
        confirmLdapSyncSetting()
      } catch (error) /* istanbul ignore next */ {
        showError(getErrorMessage(error))
      }
      return formData
    }
    const { openDialog: confirmLdapSyncSetting } = useConfirmationDialog({
      titleText: getString('authSettings.ldap.reviewLdapSyncExpression'),
      contentText: (
        <>
          <String
            useRichText
            stringID="authSettings.ldap.nextIterations"
            vars={{ cronExpression: updatedCronExpression }}
          />
          {cronIterationsList}
        </>
      ),
      confirmButtonText: getString('confirm'),
      cancelButtonText: getString('cancel'),
      onCloseDialog: async isConfirmed => {
        if (isConfirmed) {
          triggerSaveData?.()
        }
      }
    })
    const cronExpressionValidationSchema = Yup.object().shape({
      expression: Yup.string().trim().required(getString('common.schedulePanel.cronExpressionRequired'))
    })
    return (
      <Layout.Vertical className={cx(css.stepContainer, css.stepScheduleContainer)}>
        <Layout.Horizontal margin={{ bottom: 'large' }} style={{ alignItems: 'center' }}>
          <Text font={{ variation: FontVariation.H4 }} margin={{ right: 'small' }}>
            {name}
          </Text>
        </Layout.Horizontal>
        <Formik
          formName="ldapSyncScheduleForm"
          innerRef={cronExpressionFormRef}
          onSubmit={onSyncScheduleSubmit}
          initialValues={{ expression: cronExpression, ...breakdownValues }}
          validationSchema={cronExpressionValidationSchema}
        >
          {formikProps => {
            return (
              <FormikForm>
                <SchedulePanel formikProps={formikProps} isEdit={isEdit} renderFormTitle={false} hideSeconds={false} />
              </FormikForm>
            )
          }}
        </Formik>
        {createUpdateError}
        <Layout.Horizontal className={css.stepCtaContainer}>
          <Button
            onClick={() => {
              props.previousStep?.()
            }}
            text={getString('back')}
            icon="chevron-left"
            margin={{ right: 'small' }}
            variation={ButtonVariation.SECONDARY}
            data-testid="back-to-group-query-step"
          />
          <Button
            intent="primary"
            disabled={isUpdateInProgress}
            type="submit"
            onClick={async () => {
              if (cronExpressionFormRef.current) {
                const cronExpressionFormValidation = await cronExpressionFormRef.current.validateForm()
                if (!isEmpty(cronExpressionFormValidation)) {
                  return
                }
                cronExpressionFormRef.current.submitForm()
              }
            }}
            text={getString('save')}
            rightIcon="chevron-right"
            data-testid="submit-cron-expression-step"
          />
        </Layout.Horizontal>
      </Layout.Vertical>
    )
  }

export default StepSyncSchedule
