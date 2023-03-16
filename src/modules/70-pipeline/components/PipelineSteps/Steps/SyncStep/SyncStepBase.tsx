/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Accordion,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  Label,
  MultiSelectOption,
  MultiTypeInputType
} from '@harness/uicore'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import { defaultTo, memoize, pick } from 'lodash-es'
import type { SelectOption } from '@harness/uicore'
import type { IItemRendererProps } from '@blueprintjs/select'
import { StepFormikFowardRef, StepViewType, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useDeepCompareEffect } from '@common/hooks'
import type { AccountPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { Servicev1ApplicationQuery, useApplicationServiceListApps } from 'services/gitops'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import { FormMultiTypeCheckboxField } from '@common/components'
import type { SyncStepProps } from './SyncStep'
import { SyncStepFormContentInterface, SyncStepData, ApplicationFilters, policyOptions } from './types'
import { useApplicationsFilter } from './useApplicationsFilter'
import { getNameAndIdentifierSchema } from '../StepsValidateUtils'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

function FormContent({
  formik,
  isNewStep,
  readonly,
  allowableTypes,
  stepViewType
}: SyncStepFormContentInterface): React.ReactElement {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const [data, setData] = useState<MultiSelectOption[]>([])
  const [filters, actions] = useApplicationsFilter()

  const { mutate: getApplications, loading, cancel: cancelGetApplications } = useApplicationServiceListApps({})

  async function refetchApplicationsList(
    filtersData: ApplicationFilters &
      Pick<Servicev1ApplicationQuery, 'accountIdentifier' | 'orgIdentifier' | 'projectIdentifier'>
  ): Promise<void> {
    cancelGetApplications()

    const body: Servicev1ApplicationQuery = pick(filtersData, [
      'accountIdentifier',
      'orgIdentifier',
      'projectIdentifier'
    ])

    body.pageIndex = filters.page
    body.pageSize = filters.size
    body.searchTerm = filters.search

    const response = await getApplications(body)
    setData(
      response.content?.map(app => {
        return {
          label: `${app.name} (${app.agentIdentifier})`,
          value: `${app.name}/${app.agentIdentifier}`
        }
      }) || []
    )
  }

  useDeepCompareEffect(() => {
    refetchApplicationsList({
      ...filters,
      projectIdentifier,
      orgIdentifier,
      accountIdentifier: accountId
    })
  }, [filters, accountId, orgIdentifier, projectIdentifier])

  const itemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={loading} />
  ))

  return (
    <React.Fragment>
      {stepViewType !== StepViewType.Template && (
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <FormInput.InputWithIdentifier
            inputLabel={getString('name')}
            isIdentifierEditable={isNewStep}
            inputGroupProps={{
              placeholder: getString('pipeline.stepNamePlaceholder'),
              disabled: readonly
            }}
          />
        </div>
      )}

      <div className={cx(stepCss.formGroup, stepCss.sm)}>
        <FormMultiTypeDurationField
          name="timeout"
          label={getString('pipelineSteps.timeoutLabel')}
          disabled={readonly}
          multiTypeDurationProps={{
            expressions,
            enableConfigureOptions: true,
            allowableTypes
          }}
        />
      </div>
      <Accordion className={stepCss.accordion}>
        <Accordion.Panel
          id="advanced-config"
          summary={getString('pipeline.advancedConfiguration')}
          details={
            <>
              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.MultiSelectTypeInput
                  selectItems={defaultTo(data, [])}
                  name="spec.applicationsList"
                  label={getString('pipeline.applicationName')}
                  placeholder={getString('pipeline.selectApplications')}
                  multiSelectTypeInputProps={{
                    multiSelectProps: {
                      items: defaultTo(data, []),
                      onQueryChange: actions.search,
                      itemRender: itemRenderer
                    }
                  }}
                />
                {getMultiTypeFromValue(formik.values.spec?.applicationsList as string) ===
                  MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    style={{ marginTop: -5 }}
                    value={formik.values.spec?.applicationsList as string}
                    type="String"
                    variableName="spec.applicationsList"
                    showRequiredField={false}
                    showDefaultField={false}
                    onChange={value => formik.setFieldValue('spec.applicationsList', value)}
                    isReadonly={readonly}
                  />
                )}
              </div>
              <div className={stepCss.grid2Coloumns}>
                <div className={cx(stepCss.md, stepCss.flex)}>
                  <FormMultiTypeCheckboxField
                    name="spec.prune"
                    style={{ flex: 1 }}
                    label={getString('pipeline.syncStep.prune')}
                    disabled={readonly}
                    multiTypeTextbox={{ expressions, allowableTypes }}
                  />
                  {getMultiTypeFromValue(formik.values.spec?.prune as string) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ marginTop: -5 }}
                      value={formik.values.spec?.prune as string}
                      type="String"
                      variableName="spec.prune"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => formik.setFieldValue('spec.prune', value)}
                      isReadonly={readonly}
                    />
                  )}
                </div>
                <div className={cx(stepCss.md, stepCss.flex)}>
                  <FormMultiTypeCheckboxField
                    name="spec.dryRun"
                    style={{ flex: 1 }}
                    disabled={readonly}
                    label={getString('pipeline.syncStep.dryRun')}
                    multiTypeTextbox={{ expressions, allowableTypes }}
                  />
                  {getMultiTypeFromValue(formik.values.spec?.dryRun as string) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ marginTop: -5 }}
                      value={formik.values.spec?.dryRun as string}
                      type="String"
                      variableName="spec.dryRun"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => formik.setFieldValue('spec.dryRun', value)}
                      isReadonly={readonly}
                    />
                  )}
                </div>
                <div className={cx(stepCss.md, stepCss.flex)}>
                  <FormMultiTypeCheckboxField
                    name="spec.applyOnly"
                    style={{ flex: 1 }}
                    label={getString('pipeline.syncStep.applyOnly')}
                    disabled={readonly}
                    multiTypeTextbox={{ expressions, allowableTypes }}
                  />
                  {getMultiTypeFromValue(formik.values.spec?.applyOnly as string) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ marginTop: -5 }}
                      value={formik.values.spec?.applyOnly as string}
                      type="String"
                      variableName="spec.applyOnly"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => formik.setFieldValue('spec.applyOnly', value)}
                      isReadonly={readonly}
                    />
                  )}
                </div>
                <div className={cx(stepCss.md, stepCss.flex)}>
                  <FormMultiTypeCheckboxField
                    name="spec.forceApply"
                    style={{ flex: 1 }}
                    label={getString('pipeline.syncStep.forceApply')}
                    disabled={readonly}
                    multiTypeTextbox={{ expressions, allowableTypes }}
                  />
                  {getMultiTypeFromValue(formik.values.spec?.forceApply as string) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ marginTop: -5 }}
                      value={formik.values.spec?.forceApply as string}
                      type="String"
                      variableName="spec.forceApply"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => formik.setFieldValue('spec.forceApply', value)}
                      isReadonly={readonly}
                    />
                  )}
                </div>
              </div>
              <div className={stepCss.md}>
                <Label style={{ marginBottom: '10px' }}>{getString('pipeline.syncStep.syncOptionsLabel')}</Label>
                <div className={stepCss.grid2Coloumns}>
                  <div className={cx(stepCss.md, stepCss.flex)}>
                    <FormMultiTypeCheckboxField
                      name="spec.syncOptions.skipSchemaValidation"
                      style={{ flex: 1 }}
                      label={getString('pipeline.syncStep.skipSchemaValidation')}
                      disabled={readonly}
                      multiTypeTextbox={{ expressions, allowableTypes }}
                    />
                    {getMultiTypeFromValue(formik.values.spec?.syncOptions?.skipSchemaValidation as string) ===
                      MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ marginTop: -5 }}
                        value={formik.values.spec?.syncOptions?.skipSchemaValidation as string}
                        type="String"
                        variableName="spec.syncOptions.skipSchemaValidation"
                        showRequiredField={false}
                        showDefaultField={false}
                        onChange={value => formik.setFieldValue('spec.syncOptions.skipSchemaValidation', value)}
                        isReadonly={readonly}
                      />
                    )}
                  </div>
                  <div className={cx(stepCss.md, stepCss.flex)}>
                    <FormMultiTypeCheckboxField
                      name="spec.syncOptions.autoCreateNamespace"
                      label={getString('pipeline.syncStep.autoCreateNamespace')}
                      style={{ flex: 1 }}
                      disabled={readonly}
                      multiTypeTextbox={{ expressions, allowableTypes }}
                    />
                    {getMultiTypeFromValue(formik.values.spec?.syncOptions?.autoCreateNamespace as string) ===
                      MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ marginTop: -5 }}
                        value={formik.values.spec?.syncOptions?.autoCreateNamespace as string}
                        type="String"
                        variableName="spec.syncOptions.autoCreateNamespace"
                        showRequiredField={false}
                        showDefaultField={false}
                        onChange={value => formik.setFieldValue('spec.syncOptions.autoCreateNamespace', value)}
                        isReadonly={readonly}
                      />
                    )}
                  </div>
                  <div className={cx(stepCss.md, stepCss.flex)}>
                    <FormMultiTypeCheckboxField
                      name="spec.syncOptions.pruneResourcesAtLast"
                      label={getString('pipeline.syncStep.pruneResourcesAtLast')}
                      style={{ flex: 1 }}
                      disabled={readonly}
                      multiTypeTextbox={{ expressions, allowableTypes }}
                    />
                    {getMultiTypeFromValue(formik.values.spec?.syncOptions?.pruneResourcesAtLast as string) ===
                      MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ marginTop: -5 }}
                        value={formik.values.spec?.syncOptions?.pruneResourcesAtLast as string}
                        type="String"
                        variableName="spec.syncOptions.pruneResourcesAtLast"
                        showRequiredField={false}
                        showDefaultField={false}
                        onChange={value => formik.setFieldValue('spec.syncOptions.pruneResourcesAtLast', value)}
                        isReadonly={readonly}
                      />
                    )}
                  </div>
                  <div className={cx(stepCss.md, stepCss.flex)}>
                    <FormMultiTypeCheckboxField
                      name="spec.syncOptions.applyOutOfSyncOnly"
                      label={getString('pipeline.syncStep.applyOutOfSyncOnly')}
                      style={{ flex: 1 }}
                      disabled={readonly}
                      multiTypeTextbox={{ expressions, allowableTypes }}
                    />
                    {getMultiTypeFromValue(formik.values.spec?.syncOptions?.applyOutOfSyncOnly as string) ===
                      MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ marginTop: -5 }}
                        value={formik.values.spec?.syncOptions?.applyOutOfSyncOnly as string}
                        type="String"
                        variableName="spec.syncOptions.applyOutOfSyncOnly"
                        showRequiredField={false}
                        showDefaultField={false}
                        onChange={value => formik.setFieldValue('spec.syncOptions.applyOutOfSyncOnly', value)}
                        isReadonly={readonly}
                      />
                    )}
                  </div>
                </div>
                <FormInput.Select
                  usePortal
                  label={getString('pipeline.syncStep.prunePropagationPolicy')}
                  name="spec.syncOptions.prunePropagationPolicy"
                  tooltipProps={{ dataTooltipId: 'prunePropagationPolicy' }}
                  placeholder={getString('pipeline.syncStep.pruneProgrationPolicyPlaceholder')}
                  items={policyOptions}
                />
                <div className={cx(stepCss.formGroup, stepCss.md, stepCss.flex)}>
                  <FormMultiTypeCheckboxField
                    name="spec.syncOptions.replaceResources"
                    label={getString('pipeline.syncStep.replaceResources')}
                    style={{ flex: 1 }}
                    disabled={readonly}
                    multiTypeTextbox={{ expressions, allowableTypes }}
                  />
                  {getMultiTypeFromValue(formik.values.spec?.syncOptions?.replaceResources as string) ===
                    MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ marginTop: -5 }}
                      value={formik.values.spec?.syncOptions?.replaceResources as string}
                      type="String"
                      variableName="spec.syncOptions.replaceResources"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => formik.setFieldValue('spec.syncOptions.replaceResources', value)}
                      isReadonly={readonly}
                    />
                  )}
                </div>
                <div className={cx(stepCss.formGroup, stepCss.md, stepCss.flex)}>
                  <FormMultiTypeCheckboxField
                    name="spec.retry"
                    label={getString('retry')}
                    style={{ flex: 1 }}
                    disabled={readonly}
                    multiTypeTextbox={{ expressions, allowableTypes }}
                  />
                  {getMultiTypeFromValue(formik.values.spec?.retry as string) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ marginTop: -5 }}
                      value={formik.values.spec?.retry as string}
                      type="String"
                      variableName="spec.retry"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => formik.setFieldValue('spec.retry', value)}
                      isReadonly={readonly}
                    />
                  )}
                </div>
                {formik.values.spec?.retry === true && (
                  <div className={stepCss.grid2Coloumns}>
                    <div className={cx(stepCss.md, stepCss.flex)}>
                      <FormInput.MultiTextInput
                        label={getString('pipeline.syncStep.limit')}
                        style={{ flexGrow: 1, marginBottom: 0 }}
                        name={'spec.retryStrategy.limit'}
                        multiTextInputProps={{
                          allowableTypes
                        }}
                      />
                      {getMultiTypeFromValue(formik.values.spec?.retryStrategy?.limit as string) ===
                        MultiTypeInputType.RUNTIME && (
                        <ConfigureOptions
                          style={{ marginTop: 5 }}
                          value={formik.values.spec?.retryStrategy?.limit as string}
                          type="String"
                          variableName="spec.retryStrategy.limit"
                          showRequiredField={false}
                          showDefaultField={false}
                          onChange={value => formik.setFieldValue('spec.retryStrategy.limit', value)}
                          isReadonly={readonly}
                        />
                      )}
                    </div>
                    <div className={stepCss.md}>
                      <FormMultiTypeDurationField
                        name={'spec.retryStrategy.baseBackoffDuration'}
                        label={getString('pipeline.duration')}
                        disabled={readonly}
                        multiTypeDurationProps={{
                          expressions,
                          enableConfigureOptions: true,
                          allowableTypes
                        }}
                      />
                    </div>
                    <div className={stepCss.md}>
                      <FormMultiTypeDurationField
                        name={'spec.retryStrategy.maxBackoffDuration'}
                        label={getString('pipeline.syncStep.maxBackoffDuration')}
                        disabled={readonly}
                        multiTypeDurationProps={{
                          expressions,
                          enableConfigureOptions: true,
                          allowableTypes
                        }}
                      />
                    </div>
                    <div className={cx(stepCss.md, stepCss.flex)}>
                      <FormInput.MultiTextInput
                        label={getString('pipeline.syncStep.increaseBackoffByFactor')}
                        style={{ flexGrow: 1, marginBottom: 0 }}
                        name={'spec.retryStrategy.increaseBackoffByFactor'}
                        multiTextInputProps={{
                          allowableTypes
                        }}
                      />
                      {getMultiTypeFromValue(formik.values.spec?.retryStrategy?.increaseBackoffByFactor as string) ===
                        MultiTypeInputType.RUNTIME && (
                        <ConfigureOptions
                          style={{ marginTop: 5 }}
                          value={formik.values.spec?.retryStrategy?.increaseBackoffByFactor as string}
                          type="String"
                          variableName="spec.retryStrategy.increaseBackoffByFactor"
                          showRequiredField={false}
                          showDefaultField={false}
                          onChange={value => formik.setFieldValue('spec.retryStrategy.increaseBackoffByFactor', value)}
                          isReadonly={readonly}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          }
        />
      </Accordion>
    </React.Fragment>
  )
}

export function SyncStepBase(
  { initialValues, onUpdate, isNewStep = true, readonly, allowableTypes, stepViewType }: SyncStepProps,
  formikRef: StepFormikFowardRef<SyncStepData>
): React.ReactElement {
  const { getString } = useStrings()
  const validationSchema = Yup.object().shape({
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
    spec: Yup.object().shape({
      retry: Yup.boolean(),
      retryStrategy: Yup.object().when('retry', {
        is: true,
        then: Yup.object().shape({
          limit: Yup.string().trim().required(getString('pipeline.syncStep.validation.limit')),
          baseBackoffDuration: Yup.string().trim().required(getString('connectors.cdng.validations.durationRequired')),
          increaseBackoffByFactor: Yup.string()
            .trim()
            .required(getString('pipeline.syncStep.validation.increaseBackoffByFactor')),
          maxBackoffDuration: Yup.string().trim().required(getString('pipeline.syncStep.validation.maxBackoffDuration'))
        })
      })
    }),
    ...getNameAndIdentifierSchema(getString, stepViewType)
  })
  return (
    <Formik
      initialValues={initialValues}
      formName="SyncStep"
      onSubmit={(_values: SyncStepData) => {
        onUpdate?.(_values)
      }}
      validationSchema={validationSchema}
    >
      {(formik: FormikProps<SyncStepData>) => {
        // This is required
        setFormikRef?.(formikRef, formik)

        return (
          <FormikForm>
            <FormContent
              formik={formik}
              allowableTypes={allowableTypes}
              stepViewType={stepViewType}
              readonly={readonly}
              isNewStep={isNewStep}
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const SyncStepBaseWithRef = React.forwardRef(SyncStepBase)
