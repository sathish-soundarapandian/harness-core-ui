/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Button,
  ButtonVariation,
  Text,
  Container,
  Formik,
  Layout,
  StepProps,
  FormInput,
  MultiTypeInputType,
  getMultiTypeFromValue,
  FormikForm,
  AllowedTypes
} from '@harness/uicore'
import cx from 'classnames'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { defaultTo, get } from 'lodash-es'
import { ServiceHookWrapper, useHookActions } from 'services/cd-ng'
import { StringUtils } from '@common/exports'
import { useStrings } from 'framework/strings'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'

import { MonacoTextField } from '@common/components/MonacoTextField/MonacoTextField'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { ServiceHooksMap, hookTypes } from '../../ServiceHooksHelper'
import type { ServiceHookInitStepData } from '../../ServiceHooksInterface'
import css from './ServiceHooksDetailsStep.module.scss'

interface ServiceHooksDetailsPropType {
  stepName: string
  handleSubmit: (serviceHookWrapperData: ServiceHookWrapper) => void
  expressions: string[]
  isEditMode: boolean
  listOfServiceHooks: ServiceHookWrapper[]
  serviceHookIndex?: number
  deploymentType?: string
  isReadonly?: boolean
  allowableTypes: AllowedTypes
}
const defaultInitValues = {
  identifier: '',
  storeType: ServiceHooksMap.Inline,
  hookType: 'preHook',
  actions: [],
  store: {
    content: ''
  }
}
export function ServiceHooksDetailsStep({
  stepName = 'stepName',
  listOfServiceHooks,
  prevStepData,
  previousStep,
  isEditMode,
  serviceHookIndex,
  deploymentType,
  handleSubmit,
  expressions,
  isReadonly,
  allowableTypes
}: StepProps<any> & ServiceHooksDetailsPropType): React.ReactElement {
  const { getString } = useStrings()
  const isEditState = defaultTo(prevStepData.isEditMode, isEditMode)
  const fileIndex = defaultTo(prevStepData.serviceHookIndex, serviceHookIndex)

  const [initialValues, setInitialValues] = useState<ServiceHookInitStepData>(
    defaultTo(prevStepData, defaultInitValues)
  )

  //  Hook Actions Data
  const { data: actionTypes, loading } = useHookActions({
    queryParams: {
      serviceSpecType: deploymentType as string
    }
  })

  const hookActions = React.useMemo(
    () =>
      (actionTypes?.data || []).map(item => ({
        label: item,
        value: item
      })),
    [actionTypes]
  )

  React.useEffect(() => {
    /* istanbul ignore else */ if (!isEditState) {
      setInitialValues({
        ...initialValues,
        ...prevStepData
      })
      return
    }
    /* istanbul ignore next */
    setInitialValues({
      ...initialValues,
      ...prevStepData,
      actions:
        getMultiTypeFromValue(prevStepData?.actions) === MultiTypeInputType.FIXED &&
        prevStepData.actions &&
        prevStepData.actions.length
          ? prevStepData?.actions?.map((action: string) => ({ label: action, value: action }))
          : prevStepData?.actions
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevStepData])

  const submitFormData = (formData: ServiceHookInitStepData): void => {
    const { hookType, actions, store } = formData
    const serviceHookWrapperData: ServiceHookWrapper = {
      [hookType as string]: {
        identifier: formData.identifier,
        storeType: defaultTo(prevStepData?.storeType, ServiceHooksMap.Inline),
        actions:
          getMultiTypeFromValue(actions) === MultiTypeInputType.FIXED
            ? (actions || []).map((action: any) => action?.value)
            : actions,
        store: {
          content: store?.content
        }
      }
    }
    handleSubmit(serviceHookWrapperData)
  }

  const identifierValidation = Yup.lazy(value => {
    const hooksIdentifiers = listOfServiceHooks.map(d => (d.preHook || d.postHook)?.identifier)
    return !isEditState
      ? Yup.mixed()
          .notOneOf(
            [...hooksIdentifiers],
            getString('pipeline.serviceHooks.error.duplicateIdError', { servciceHookIdentifier: value })
          )
          .required(getString('validation.identifierRequired'))
      : /* istanbul ignore next */ hooksIdentifiers.indexOf(value as string) === fileIndex
      ? Yup.mixed().required(getString('validation.identifierRequired'))
      : Yup.mixed()
          .notOneOf([...hooksIdentifiers], getString('pipeline.serviceHooks.error.duplicateIdError'))
          .required(getString('validation.identifierRequired'))
  })
  const validationSchema = Yup.object().shape({
    identifier: identifierValidation,
    actions: Yup.lazy((value): Yup.Schema<unknown> => {
      /* istanbul ignore else */ if (getMultiTypeFromValue(value as string[]) === MultiTypeInputType.FIXED) {
        return Yup.array().min(1, getString('pipeline.serviceHooks.error.actionsRequired'))
      }
      /* istanbul ignore next */ return Yup.string().required(getString('pipeline.serviceHooks.error.actionsRequired'))
    }),
    store: Yup.object().shape({
      content: Yup.string().trim().required(getString('common.contentRequired'))
    })
  })

  return (
    <Container className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'xxlarge' }}>
        {stepName}
      </Text>
      {initialValues.store && (
        <Formik
          initialValues={initialValues}
          formName="serviceHooksDetails"
          validationSchema={validationSchema}
          enableReinitialize={true}
          onSubmit={formData => {
            submitFormData({
              ...prevStepData,
              ...formData
            })
          }}
        >
          {formikProps => {
            return (
              <FormikForm>
                <Layout.Vertical
                  flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
                  className={css.headerContainer}
                >
                  <Container width={'100%'}>
                    <div className={css.halfWidth}>
                      <FormInput.Text
                        name="identifier"
                        label={getString('pipeline.serviceHooks.identifierLabel')}
                        onChange={e => {
                          const { value } = e.target as HTMLInputElement
                          /* istanbul ignore else */ if (value) {
                            formikProps.setFieldValue('identifier', StringUtils.getIdentifierFromName(value))
                          }
                        }}
                      />{' '}
                    </div>

                    <div className={css.halfWidth}>
                      <FormInput.Select
                        name="hookType"
                        label={getString('pipeline.serviceHooks.hookType')}
                        items={hookTypes(getString)}
                      />
                    </div>

                    <div className={css.halfWidth}>
                      <FormInput.MultiSelect
                        label={getString('action')}
                        name="actions"
                        placeholder={
                          loading
                            ? /* istanbul ignore next */ getString('loading')
                            : getString('pipeline.serviceHooks.selectActionType')
                        }
                        items={defaultTo(hookActions, [])}
                        multiSelectProps={{}}
                        disabled={isReadonly}
                      />
                    </div>

                    <Layout.Horizontal
                      flex={{ justifyContent: 'flex-start' }}
                      className={cx(css.halfWidth, {
                        [css.runtimeInput]:
                          getMultiTypeFromValue(formikProps.values?.store?.content) === MultiTypeInputType.RUNTIME
                      })}
                    >
                      <MultiTypeFieldSelector
                        name={'store.content'}
                        label={getString('pipelineSteps.content')}
                        defaultValueToReset=""
                        disabled={isReadonly}
                        allowedTypes={allowableTypes}
                        style={{ width: 450 }}
                        disableTypeSelection={isReadonly}
                        skipRenderValueInExpressionLabel
                        expressionRender={
                          /* istanbul ignore next */ () => (
                            <MonacoTextField
                              name={'store.content'}
                              expressions={expressions}
                              height={80}
                              fullScreenAllowed
                              fullScreenTitle={getString('pipelineSteps.content')}
                            />
                          )
                        }
                      >
                        <MonacoTextField
                          name={'store.content'}
                          expressions={expressions}
                          height={80}
                          fullScreenAllowed
                          fullScreenTitle={getString('pipelineSteps.content')}
                        />
                      </MultiTypeFieldSelector>
                      {getMultiTypeFromValue(get(formikProps, 'values.store.content')) ===
                        MultiTypeInputType.RUNTIME && (
                        /* istanbul ignore next */ <ConfigureOptions
                          value={get(formikProps, 'values.store.content') as string}
                          type="String"
                          variableName="extractionScript"
                          showRequiredField={false}
                          showDefaultField={false}
                          onChange={
                            /* istanbul ignore next */ value => formikProps.setFieldValue('store.content', value)
                          }
                          isReadonly={isReadonly}
                        />
                      )}
                    </Layout.Horizontal>
                  </Container>

                  <Layout.Horizontal spacing="medium" className={css.saveBtn}>
                    <Button
                      text={getString('back')}
                      icon="chevron-left"
                      variation={ButtonVariation.SECONDARY}
                      onClick={() => previousStep?.({ ...prevStepData })}
                    />
                    <Button
                      variation={ButtonVariation.PRIMARY}
                      type="submit"
                      disabled={formikProps.values.store === null}
                      text={getString('submit')}
                      rightIcon="chevron-right"
                    />
                  </Layout.Horizontal>
                </Layout.Vertical>
              </FormikForm>
            )
          }}
        </Formik>
      )}
    </Container>
  )
}
