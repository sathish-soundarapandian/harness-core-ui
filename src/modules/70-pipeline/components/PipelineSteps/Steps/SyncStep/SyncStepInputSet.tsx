/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import {
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormikForm,
  FormInput,
  SelectOption,
  MultiSelectOption,
  MultiSelectTypeInput,
  Label
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { cloneDeep, defaultTo, get, isEmpty, memoize, pick, set } from 'lodash-es'
import type { IItemRendererProps } from '@blueprintjs/select'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useDeepCompareEffect } from '@common/hooks'
import type { AccountPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import { Servicev1ApplicationQuery, useApplicationServiceListApps } from 'services/gitops'
import { FormMultiTypeCheckboxField } from '@common/components'
import type { ApplicationFilters, applicationListItemInterface } from './types'
import { useApplicationsFilter } from './useApplicationsFilter'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const jobParameterInputType: SelectOption[] = [
  { label: 'String', value: 'String' },
  { label: 'Number', value: 'Number' }
]

function SyncStepInputSet(formContentProps: any): JSX.Element {
  const { allowableTypes, template, path, readonly, formik, stepViewType } = formContentProps
  const prefix = isEmpty(path) ? '' : `${path}.`
  const [data, setData] = useState<MultiSelectOption[]>([])
  const [filters, actions] = useApplicationsFilter()

  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()

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
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const getAppValue = () => {
    const applicationItems = get(formik, `values.${prefix}spec.applicationsList`) || []
    return getMultiTypeFromValue(applicationItems) === MultiTypeInputType.FIXED
      ? applicationItems?.map((app: applicationListItemInterface) => {
          return {
            label: `${app?.applicationName} (${app?.agentId})`,
            value: `${app?.applicationName}/${app?.agentId}`
          }
        })
      : applicationItems
  }

  const itemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={loading} />
  ))

  useEffect(() => {
    const clonedFormikValue = cloneDeep(formik.values)
    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME)
      set(clonedFormikValue, `${prefix}timeout`, get(formik, `values.${prefix}timeout`) || '10m')

    if (getMultiTypeFromValue(template?.spec?.applicationsList) === MultiTypeInputType.RUNTIME)
      set(
        clonedFormikValue,
        `${prefix}spec.applicationsList`,
        get(formik, `values.${prefix}spec.applicationsList`) || []
      )

    if (getMultiTypeFromValue(template?.spec?.prune) === MultiTypeInputType.RUNTIME)
      set(clonedFormikValue, `${prefix}spec.prune`, get(formik, `values.${prefix}spec.prune`) || false)

    if (getMultiTypeFromValue(template?.spec?.dryRun) === MultiTypeInputType.RUNTIME)
      set(clonedFormikValue, `${prefix}spec.dryRun`, get(formik, `values.${prefix}spec.dryRun`) || false)

    if (getMultiTypeFromValue(template?.spec?.applyOnly) === MultiTypeInputType.RUNTIME)
      set(clonedFormikValue, `${prefix}spec.applyOnly`, get(formik, `values.${prefix}spec.applyOnly`) || false)

    if (getMultiTypeFromValue(template?.spec?.forceApply) === MultiTypeInputType.RUNTIME)
      set(clonedFormikValue, `${prefix}spec.forceApply`, get(formik, `values.${prefix}spec.forceApply`) || false)

    if (getMultiTypeFromValue(template?.spec?.syncOptions?.skipSchemaValidation) === MultiTypeInputType.RUNTIME)
      set(
        clonedFormikValue,
        `${prefix}spec.syncOptions.skipSchemaValidation`,
        get(formik, `values.${prefix}spec.syncOptions.skipSchemaValidation`) || false
      )

    if (getMultiTypeFromValue(template?.spec?.syncOptions?.autoCreateNamespace) === MultiTypeInputType.RUNTIME)
      set(
        clonedFormikValue,
        `${prefix}spec.syncOptions.autoCreateNamespace`,
        get(formik, `values.${prefix}spec.syncOptions.autoCreateNamespac`) || false
      )

    if (getMultiTypeFromValue(template?.spec?.syncOptions?.pruneResourcesAtLast) === MultiTypeInputType.RUNTIME)
      set(
        clonedFormikValue,
        `${prefix}spec.syncOptions.pruneResourcesAtLast`,
        get(formik, `values.${prefix}spec.syncOptions.pruneResourcesAtLast`) || false
      )

    if (getMultiTypeFromValue(template?.spec?.syncOptions?.applyOutOfSyncOnly) === MultiTypeInputType.RUNTIME)
      set(
        clonedFormikValue,
        `${prefix}spec.syncOptions.applyOutOfSyncOnly`,
        get(formik, `values.${prefix}spec.syncOptions.applyOutOfSyncOnly`) || false
      )

    if (getMultiTypeFromValue(template?.spec?.syncOptions?.replaceResources) === MultiTypeInputType.RUNTIME)
      set(
        clonedFormikValue,
        `${prefix}spec.syncOptions.replaceResources`,
        get(formik, `values.${prefix}spec.syncOptions.replaceResources`) || false
      )

    if (getMultiTypeFromValue(template?.spec?.retry) === MultiTypeInputType.RUNTIME) {
      set(clonedFormikValue, `${prefix}spec.retry`, get(formik, `values.${prefix}spec.retry`) || false)
      set(clonedFormikValue, `${prefix}spec.retryStrategy`, get(formik, `values.${prefix}spec.retryStrategy`) || {})
    }

    formik.setValues({ ...clonedFormikValue })
  }, [])

  const retryValue = get(formik, `values.${prefix}spec.retry`)

  return (
    <>
      <FormikForm className={css.removeBpPopoverWrapperTopMargin}>
        {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME && (
          <TimeoutFieldInputSetView
            shallAppendSpace={false}
            multiTypeDurationProps={{
              width: 400,
              configureOptionsProps: {
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
              },
              allowableTypes,
              expressions,
              disabled: readonly
            }}
            label={getString('pipelineSteps.timeoutLabel')}
            name={`${prefix}timeout`}
            disabled={readonly}
            fieldPath={'timeout'}
            template={template}
            className={cx(css.formGroup, css.sm)}
          />
        )}

        {getMultiTypeFromValue(template?.spec?.applicationsList) === MultiTypeInputType.RUNTIME ? (
          <div className={css.bottomSpacing}>
            <Label style={{ color: Color.GREY_900 }}>{getString('pipeline.applicationName')}</Label>
            <MultiSelectTypeInput
              name={`${prefix}spec.applicationsList`}
              disabled={readonly}
              multiSelectProps={{
                onQueryChange: actions.search,
                items: defaultTo(data, []),
                allowCreatingNewItems: false,
                itemRender: itemRenderer
              }}
              allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
              width={400}
              value={getAppValue()}
              onChange={items => {
                formik.setFieldValue(
                  `${prefix}spec.applicationsList`,
                  getMultiTypeFromValue(items) === MultiTypeInputType.FIXED
                    ? (defaultTo(items, []) as MultiSelectOption[])?.map((item: MultiSelectOption) => {
                        const appName = item.value as string
                        return {
                          applicationName: appName?.split('/')?.[0],
                          agentId: appName?.split('/')?.[1]
                        }
                      })
                    : items
                )
              }}
              data-testid={`${path}.spec.configuration.capabilities`}
            />
          </div>
        ) : null}

        {getMultiTypeFromValue(template?.spec?.prune) === MultiTypeInputType.RUNTIME ? (
          <>
            <div className={cx(css.formGroup, css.lg)}>
              <FormMultiTypeCheckboxField
                name={`${prefix}spec.prune`}
                label={getString('pipeline.syncStep.prune')}
                disabled={readonly}
                checkboxStyle={{ flexGrow: 'unset' }}
                multiTypeTextbox={{ expressions, allowableTypes, width: 400 }}
              />
            </div>
          </>
        ) : null}

        {getMultiTypeFromValue(template?.spec?.dryRun) === MultiTypeInputType.RUNTIME ? (
          <>
            <div className={cx(css.formGroup, css.lg)}>
              <FormMultiTypeCheckboxField
                name={`${prefix}spec.dryRun`}
                label={getString('pipeline.syncStep.dryRun')}
                checkboxStyle={{ flexGrow: 'unset' }}
                disabled={readonly}
                multiTypeTextbox={{ expressions, allowableTypes, width: 400 }}
              />
            </div>
          </>
        ) : null}

        {getMultiTypeFromValue(template?.spec?.applyOnly) === MultiTypeInputType.RUNTIME ? (
          <>
            <div className={cx(css.formGroup, css.lg)}>
              <FormMultiTypeCheckboxField
                name={`${prefix}spec.applyOnly`}
                label={getString('pipeline.syncStep.applyOnly')}
                disabled={readonly}
                checkboxStyle={{ flexGrow: 'unset' }}
                multiTypeTextbox={{ expressions, allowableTypes, width: 400 }}
              />
            </div>
          </>
        ) : null}

        {getMultiTypeFromValue(template?.spec?.forceApply) === MultiTypeInputType.RUNTIME ? (
          <>
            <div className={cx(css.formGroup, css.lg)}>
              <FormMultiTypeCheckboxField
                name={`${prefix}spec.forceApply`}
                label={getString('pipeline.syncStep.forceApply')}
                disabled={readonly}
                checkboxStyle={{ flexGrow: 'unset' }}
                multiTypeTextbox={{ expressions, allowableTypes, width: 400 }}
              />
            </div>
          </>
        ) : null}

        {getMultiTypeFromValue(template?.spec?.syncOptions?.skipSchemaValidation) === MultiTypeInputType.RUNTIME ? (
          <>
            <div className={cx(css.formGroup, css.lg)}>
              <FormMultiTypeCheckboxField
                name={`${prefix}spec.syncOptions.skipSchemaValidation`}
                label={getString('pipeline.syncStep.skipSchemaValidation')}
                disabled={readonly}
                checkboxStyle={{ flexGrow: 'unset' }}
                multiTypeTextbox={{ expressions, allowableTypes, width: 400 }}
              />
            </div>
          </>
        ) : null}

        {getMultiTypeFromValue(template?.spec?.syncOptions?.autoCreateNamespace) === MultiTypeInputType.RUNTIME ? (
          <>
            <div className={cx(css.formGroup, css.lg)}>
              <FormMultiTypeCheckboxField
                name={`${prefix}spec.syncOptions.autoCreateNamespace`}
                label={getString('pipeline.syncStep.autoCreateNamespace')}
                disabled={readonly}
                checkboxStyle={{ flexGrow: 'unset' }}
                multiTypeTextbox={{ expressions, allowableTypes, width: 400 }}
              />
            </div>
          </>
        ) : null}

        {getMultiTypeFromValue(template?.spec?.syncOptions?.pruneResourcesAtLast) === MultiTypeInputType.RUNTIME ? (
          <>
            <div className={cx(css.formGroup, css.lg)}>
              <FormMultiTypeCheckboxField
                name={`${prefix}spec.syncOptions.pruneResourcesAtLast`}
                label={getString('pipeline.syncStep.pruneResourcesAtLast')}
                disabled={readonly}
                checkboxStyle={{ flexGrow: 'unset' }}
                multiTypeTextbox={{ expressions, allowableTypes, width: 400 }}
              />
            </div>
          </>
        ) : null}

        {getMultiTypeFromValue(template?.spec?.syncOptions?.applyOutOfSyncOnly) === MultiTypeInputType.RUNTIME ? (
          <>
            <div className={cx(css.formGroup, css.lg)}>
              <FormMultiTypeCheckboxField
                name={`${prefix}spec.syncOptions.applyOutOfSyncOnly`}
                label={getString('pipeline.syncStep.applyOutOfSyncOnly')}
                disabled={readonly}
                checkboxStyle={{ flexGrow: 'unset' }}
                multiTypeTextbox={{ expressions, allowableTypes, width: 400 }}
              />
            </div>
          </>
        ) : null}

        {getMultiTypeFromValue(template?.spec?.syncOptions?.replaceResources) === MultiTypeInputType.RUNTIME ? (
          <>
            <div className={cx(css.formGroup, css.lg)}>
              <FormMultiTypeCheckboxField
                name={`${prefix}spec.syncOptions.replaceResources`}
                label={getString('pipeline.syncStep.replaceResources')}
                disabled={readonly}
                checkboxStyle={{ flexGrow: 'unset' }}
                multiTypeTextbox={{ expressions, allowableTypes, width: 400 }}
              />
            </div>
          </>
        ) : null}

        {getMultiTypeFromValue(template?.spec?.retry) === MultiTypeInputType.RUNTIME ? (
          <>
            <div className={cx(css.formGroup, css.lg)}>
              <FormMultiTypeCheckboxField
                label={getString('retry')}
                name={`${prefix}spec.retry`}
                disabled={readonly}
                onChange={value => {
                  if (value === true) {
                    const clonedFormik = cloneDeep(formik.values)
                    set(clonedFormik, `${prefix}spec.retryStrategy.limit`, 2)
                    set(clonedFormik, `${prefix}spec.retryStrategy.baseBackoffDuration`, '5s')
                    set(clonedFormik, `${prefix}spec.retryStrategy.increaseBackoffByFactor`, 2)
                    set(clonedFormik, `${prefix}spec.retryStrategy.maxBackoffDuration`, '3m5s')
                    set(clonedFormik, `${prefix}spec.retry`, true)
                    formik.setValues({ ...clonedFormik })
                  } else {
                    const clonedFormik = cloneDeep(formik.values)
                    set(clonedFormik, `${prefix}spec.retryStrategy`, {})
                    set(clonedFormik, `${prefix}spec.retry`, value)
                    formik.setValues({ ...clonedFormik })
                  }
                }}
                checkboxStyle={{ flexGrow: 'unset' }}
                multiTypeTextbox={{
                  expressions,
                  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME],
                  width: 400
                }}
              />
            </div>
          </>
        ) : null}
        <>
          {getMultiTypeFromValue(template?.spec?.retryStrategy?.limit) === MultiTypeInputType.RUNTIME ||
          retryValue === true ? (
            <div className={cx(css.formGroup, css.lg)}>
              <FormInput.MultiTextInput
                label={getString('pipeline.syncStep.limit')}
                style={{ flexGrow: 1, marginBottom: 0 }}
                name={`${prefix}spec.retryStrategy.limit`}
                multiTextInputProps={{
                  allowableTypes,
                  width: 400
                }}
              />
            </div>
          ) : null}
          {getMultiTypeFromValue(template?.spec?.retryStrategy?.baseBackoffDuration) === MultiTypeInputType.RUNTIME ||
          retryValue === true ? (
            <div className={cx(css.formGroup, css.lg)}>
              <TimeoutFieldInputSetView
                shallAppendSpace={false}
                multiTypeDurationProps={{
                  configureOptionsProps: {
                    isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
                  },
                  allowableTypes,
                  expressions,
                  width: 400,
                  disabled: readonly
                }}
                label={getString('pipeline.duration')}
                name={`${prefix}spec.retryStrategy.baseBackoffDuration`}
                disabled={readonly}
                fieldPath={'timeout'}
                template={template}
                className={cx(css.formGroup, css.sm)}
              />
            </div>
          ) : null}
          {getMultiTypeFromValue(template?.spec?.retryStrategy?.maxBackoffDuration) === MultiTypeInputType.RUNTIME ||
          retryValue === true ? (
            <div className={cx(css.formGroup, css.lg)}>
              <TimeoutFieldInputSetView
                shallAppendSpace={false}
                multiTypeDurationProps={{
                  width: 400,
                  configureOptionsProps: {
                    isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
                  },
                  allowableTypes,
                  expressions,
                  disabled: readonly
                }}
                label={getString('pipeline.syncStep.maxBackoffDuration')}
                name={`${prefix}spec.retryStrategy.maxBackoffDuration`}
                disabled={readonly}
                fieldPath={'timeout'}
                template={template}
                className={cx(css.formGroup, css.sm)}
              />
            </div>
          ) : null}
          {getMultiTypeFromValue(template?.spec?.retryStrategy?.increaseBackoffByFactor) ===
            MultiTypeInputType.RUNTIME || retryValue === true ? (
            <div className={cx(css.formGroup, css.lg)}>
              <FormInput.MultiTextInput
                label={getString('pipeline.syncStep.increaseBackoffByFactor')}
                style={{ flexGrow: 1, marginBottom: 0 }}
                name={`${prefix}spec.retryStrategy.increaseBackoffByFactor`}
                multiTextInputProps={{
                  allowableTypes,
                  width: 400
                }}
              />
            </div>
          ) : null}
        </>
      </FormikForm>
    </>
  )
}

export default SyncStepInputSet
