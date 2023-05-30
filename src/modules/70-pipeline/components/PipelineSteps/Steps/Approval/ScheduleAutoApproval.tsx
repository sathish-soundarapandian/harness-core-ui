/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import type { SelectOption } from '@harness/uicore'
import {
  Checkbox,
  FormInput,
  FormikForm,
  MultiTypeInputType,
  getMultiTypeFromValue,
  Icon,
  Container,
  Text
} from '@harness/uicore'
import { Color, FontVariation, Intent } from '@harness/design-system'
import type { UseStringsReturn } from 'framework/strings'
import { useStrings } from 'framework/strings'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeTextAreaField } from '@common/components'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeDateTimePickerField } from '@common/components/MultiTypeDateTimePicker/MultiTypeDateTimePicker'
import { ALL_TIME_ZONES } from '@common/utils/dateUtils'
import { isApprovalStepFieldDisabled } from '../Common/ApprovalCommons'
import type { HarnessApprovalFormContentProps } from './types'
import { ApproveAction } from './helper'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './HarnessApproval.module.scss'

const showAutoApproveScheduleTimeoutWarning = (getString: UseStringsReturn['getString']): JSX.Element => (
  <div className={cx(stepCss.formGroup, css.scheduleTimeoutWarningContainer)}>
    <Container intent="warning" flex={{ justifyContent: 'flex-start' }}>
      <Icon name="warning-icon" intent={Intent.WARNING} margin={{ right: 'small' }} />
      <Text font={{ variation: FontVariation.FORM_HELP }} color={Color.ORANGE_900}>
        {getString('pipeline.approvalStep.validation.autoApproveScheduleTimeout')}
      </Text>
    </Container>
  </div>
)

export default function ScheduleAutoApproval({
  formik,
  readonly,
  allowableTypes
}: Partial<HarnessApprovalFormContentProps>): JSX.Element {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const autoApprovalSpec = formik?.values.spec?.autoApproval
  const isApproveActionChecked = autoApprovalSpec?.action === ApproveAction.Approve
  const timeZoneList: SelectOption[] = ALL_TIME_ZONES.map(timeZone => ({ value: timeZone, label: timeZone }))

  return (
    <FormikForm>
      <Checkbox
        name="AutoApprove"
        label={getString('pipeline.approvalStep.autoApproveLabel')}
        checked={isApproveActionChecked}
        disabled={isApprovalStepFieldDisabled(readonly)}
        onChange={val => {
          if (val.currentTarget.checked && !isApproveActionChecked) {
            formik?.setFieldValue('spec.autoApproval.action', ApproveAction.Approve)
          } else {
            formik?.setFieldValue('spec.autoApproval.action', ApproveAction.Reject)
          }
        }}
        width={120}
        margin={{ bottom: 'medium', top: 'small' }}
      />
      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormInput.DropDown
          label={getString('common.timezone')}
          name="spec.autoApproval.scheduledDeadline.timeZone"
          items={timeZoneList}
          dropDownProps={{
            minWidth: 200
          }}
          usePortal
          disabled={isApprovalStepFieldDisabled(readonly) || !isApproveActionChecked}
        />
      </div>
      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormMultiTypeDateTimePickerField
          label={getString('timeLabel')}
          name="spec.autoApproval.scheduledDeadline.time"
          placeholder={getString('pipeline.approvalStep.autoApproveDeadline')}
          disabled={isApprovalStepFieldDisabled(readonly) || !isApproveActionChecked}
          defaultToCurrentTime
          defaultValueToReset={Date.now().toString()}
          multiTypeDateTimePicker={{
            expressions,
            allowableTypes,
            placeholder: getString('pipeline.approvalStep.autoApproveDeadline'),
            dateInputProps: {
              dateProps: {
                defaultValue: undefined
              }
            }
          }}
        />
        {getMultiTypeFromValue(autoApprovalSpec?.scheduledDeadline?.time) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={autoApprovalSpec?.scheduledDeadline?.time as string}
            type="String"
            variableName="spec.autoApproval.scheduledDeadline.time"
            showRequiredField={false}
            showDefaultField={false}
            className={css.scheduledDeadlineConfigBtn}
            onChange={
              /* istanbul ignore next */ value =>
                formik?.setFieldValue('spec.autoApproval.scheduledDeadline.time', value)
            }
            isReadonly={readonly}
          />
        )}
      </div>
      {getMultiTypeFromValue(formik?.values.timeout) === MultiTypeInputType.RUNTIME &&
        showAutoApproveScheduleTimeoutWarning(getString)}
      <div className={cx(stepCss.formGroup)}>
        <FormMultiTypeTextAreaField
          name="spec.autoApproval.comments"
          label={getString('message')}
          className={css.approvalMessage}
          multiTypeTextArea={{ enableConfigureOptions: false, expressions, allowableTypes }}
          placeholder="Please add relevant information for this step"
          disabled={isApprovalStepFieldDisabled(readonly) || !isApproveActionChecked}
        />
        {getMultiTypeFromValue(autoApprovalSpec?.comments) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={autoApprovalSpec?.comments as string}
            type="String"
            variableName="spec.autoApproval.comments"
            showRequiredField={false}
            showDefaultField={false}
            onChange={/* istanbul ignore next */ value => formik?.setFieldValue('spec.autoApproval.comments', value)}
            isReadonly={readonly}
          />
        )}
      </div>
    </FormikForm>
  )
}
