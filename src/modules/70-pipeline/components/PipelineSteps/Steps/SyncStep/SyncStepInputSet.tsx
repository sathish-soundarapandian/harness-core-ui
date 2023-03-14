/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import {
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormikForm,
  FormInput,
  SelectOption,
  MultiSelectOption,
  MultiSelectTypeInput
} from '@harness/uicore'
import { defaultTo, get, isEmpty, memoize, pick } from 'lodash-es'
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
    const applicationItems = defaultTo(get(formik, `values.${prefix}spec.applicationsList`), [])
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

  const retryValue = get(formik, `values.${prefix}spec.retry`)

  return (
    <>
      <FormikForm className={css.removeBpPopoverWrapperTopMargin}>
        {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME && (
          <TimeoutFieldInputSetView
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
          <div className={cx(css.formGroup, css.lg)}>
            <MultiSelectTypeInput
              name={`${prefix}spec.applicationsList`}
              disabled={readonly}
              multiSelectProps={{
                onQueryChange: actions.search,
                items: defaultTo(data, []),
                allowCreatingNewItems: false,
                itemRender: itemRenderer
              }}
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
              <FormInput.MultiTextInput
                label={getString('retry')}
                style={{ flexGrow: 1, marginBottom: 0 }}
                name={`${prefix}spec.retry`}
                multiTextInputProps={{
                  allowableTypes,
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
