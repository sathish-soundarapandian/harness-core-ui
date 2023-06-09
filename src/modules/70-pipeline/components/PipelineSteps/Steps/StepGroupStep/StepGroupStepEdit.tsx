/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import * as Yup from 'yup'
import cx from 'classnames'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { defaultTo, isUndefined, uniqBy } from 'lodash-es'
import type { FormikProps } from 'formik'
import { Switch } from '@blueprintjs/core'
import { AllowedTypes, Formik, FormikForm, FormInput } from '@harness/uicore'

import type { Toleration } from 'services/cd-ng'
import type { EmptyDirYaml, HostPathYaml, PersistentVolumeClaimYaml } from 'services/pipeline-ng'
import { useStrings, UseStringsReturn } from 'framework/strings'
import type { StringsMap } from 'framework/strings/StringsContext'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { k8sLabelRegex, k8sAnnotationRegex } from '@common/utils/StringUtils'
import type { ListUIType } from '@common/components/List/List'
import type { MapType, MapUIType } from '@common/components/Map/Map'
import type { StepViewType, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { VolumesTypes } from '@pipeline/components/Volumes/Volumes'
import { OsTypes } from '@pipeline/utils/constants'
import type { MultiTypeListType, MultiTypeListUIType } from '../StepsTypes'
import { getNameAndIdentifierSchema } from '../StepsValidateUtils'
import { KubernetesStepGroupInfra } from './KubernetesStepGroupInfra'
import type { K8sDirectInfraStepGroupElementConfig, StepGroupFormikValues, TolerationFormik } from './StepGroupUtil'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface StepGroupWidgetProps {
  initialValues: K8sDirectInfraStepGroupElementConfig
  isNewStep?: boolean
  onUpdate?: (data: K8sDirectInfraStepGroupElementConfig) => void
  stepViewType?: StepViewType
  readonly?: boolean
  allowableTypes?: AllowedTypes
}

const validateUniqueList = ({
  value,
  getString,
  uniqueKey,
  stringKey
}: {
  value: string[] | unknown
  getString: UseStringsReturn['getString']
  uniqueKey?: string
  stringKey?: keyof StringsMap
}): any => {
  if (Array.isArray(value)) {
    return Yup.array().test('valuesShouldBeUnique', getString(stringKey || 'validation.uniqueValues'), list => {
      if (!list) {
        return true
      }

      return uniqBy(list, uniqueKey || 'value').length === list.length
    })
  } else {
    return Yup.string()
  }
}

const getInitialMapValues: (value?: MapType[]) => MapUIType = value => {
  const modifiedList = (value || []).map(currValue => {
    const objKey = Object.keys(currValue)[0]
    const keyValue = currValue[objKey]
    return {
      id: uuid('', nameSpace()),
      key: objKey,
      value: keyValue
    }
  })
  return modifiedList
}

const getInitialListValues = (value: MultiTypeListType): MultiTypeListUIType => {
  return typeof value === 'string'
    ? value
    : value
        ?.filter((path: string) => !!path)
        ?.map((_value: string) => ({
          id: uuid('', nameSpace()),
          value: _value
        })) || []
}

const getInitialComplexMapValues = (value?: Toleration[]): TolerationFormik[] => {
  if (typeof value === 'string') {
    return value
  }
  const modifiedList = (value || []).map(currValue => {
    return {
      id: uuid('', nameSpace()),
      ...currValue
    }
  })
  return modifiedList
}

function StepGroupStepEdit(
  props: StepGroupWidgetProps,
  formikRef: StepFormikFowardRef<StepGroupFormikValues>
): React.ReactElement {
  const { initialValues, onUpdate, isNewStep = true, readonly, allowableTypes, stepViewType } = props

  const { getString } = useStrings()
  const { CDS_CONTAINER_STEP_GROUP } = useFeatureFlags()

  const [isContainerBasedExecutionEnabled, setIsContainerBasedExecutionEnabled] = useState<boolean>(
    defaultTo(CDS_CONTAINER_STEP_GROUP && !!initialValues.stepGroupInfra?.type, false)
  )

  React.useEffect(() => {
    const formikRefCurrent = (formikRef as React.MutableRefObject<FormikProps<StepGroupFormikValues>>)?.current
    if (isContainerBasedExecutionEnabled) {
      formikRefCurrent?.setValues({
        ...formikRefCurrent.values,
        steps: formikRefCurrent.values.steps,
        type: 'KubernetesDirect',
        os: OsTypes.Linux
      })
    } else {
      formikRefCurrent?.setValues({
        identifier: formikRefCurrent.values.identifier,
        name: formikRefCurrent.values.name,
        steps: formikRefCurrent.values.steps
      })
    }
  }, [isContainerBasedExecutionEnabled, formikRef])

  const getFieldSchema = (value: MapUIType, regex: RegExp): Record<string, any> => {
    if (Array.isArray(value)) {
      return Yup.array()
        .of(
          Yup.object().shape(
            {
              key: Yup.string().when('value', {
                is: val => val?.length,
                then: Yup.string()
                  .matches(regex, getString?.('validation.validKeyRegex'))
                  .required(getString?.('validation.keyRequired'))
              }),
              value: Yup.string().when('key', {
                is: val => val?.length,
                then: Yup.string().required(getString?.('validation.valueRequired'))
              })
            },
            [['key', 'value']]
          )
        )
        .test('keysShouldBeUnique', getString?.('validation.uniqueKeys') || '', map => {
          if (!map) return true

          return uniqBy(map, 'key').length === map.length
        })
    } else {
      return Yup.string()
    }
  }

  const getStepGroupInfraValidationObject = () => {
    if (!isContainerBasedExecutionEnabled) {
      return {}
    }
    return {
      connectorRef: Yup.string().required(
        getString('common.validation.fieldIsRequired', { name: getString('connectors.title.k8sCluster') })
      ),
      namespace: Yup.string().required(
        getString('common.validation.fieldIsRequired', { name: getString('common.namespace') })
      ),
      runAsUser: Yup.string().test(
        'Must be a number and allows runtimeinput or expression',
        getString('pipeline.stepCommonFields.validation.mustBeANumber', {
          label: getString('pipeline.stepCommonFields.runAsUser')
        }) || '',
        function (runAsUser) {
          if (isUndefined(runAsUser) || !runAsUser) {
            return true
          } else if (runAsUser.startsWith('<+')) {
            return true
          }
          return !isNaN(runAsUser)
        }
      ),
      volumes: Yup.array()
        .nullable()
        .test({
          test: value => !value || uniqBy(value, 'mountPath').length === value.length,
          message: getString('pipeline.ci.validations.mountPathUnique')
        })
        .test({
          test: value => {
            const pattern = /^\d+(\.\d+)?$|^\d+(\.\d+)?(G|M|Gi|Mi)$|^$/
            // invalid if size doesn't follow pattern or is an integer without units
            const isSizeInvalid = value?.some(
              (volume: EmptyDirYaml) =>
                volume?.spec?.size && (!pattern.test(volume.spec.size) || !isNaN(volume.spec.size as unknown as number))
            )
            return !isSizeInvalid
          },
          message: getString('pipeline.ci.validations.invalidSize')
        })
        .test({
          test: value => {
            const isPathMissing = value?.some(
              (volume: HostPathYaml) => volume.type === VolumesTypes.HostPath && !volume.spec?.path
            )
            return !isPathMissing
          },
          message: getString('pipeline.ci.validations.pathRequiredForHostPath')
        })
        .test({
          test: value => {
            const isTypeMissing = value?.some(
              (volume: EmptyDirYaml | PersistentVolumeClaimYaml | HostPathYaml) => volume.mountPath && !volume.type
            )
            return !isTypeMissing
          },
          message: getString('common.validation.fieldIsRequired', { name: getString('typeLabel') })
        }),
      annotations: Yup.lazy((value: MapUIType) => getFieldSchema(value, k8sAnnotationRegex) as Yup.Schema<MapUIType>),
      labels: Yup.lazy((value: MapUIType) => getFieldSchema(value, k8sLabelRegex) as Yup.Schema<MapUIType>),
      addCapabilities: Yup.lazy(value => validateUniqueList({ value, getString })),
      dropCapabilities: Yup.lazy(value => validateUniqueList({ value, getString })),
      tolerations: Yup.lazy(value =>
        validateUniqueList({ value, getString, uniqueKey: 'key', stringKey: 'pipeline.ci.validations.keyUnique' })
      ),
      os: Yup.string().required(getString('fieldRequired', { field: getString('pipeline.infraSpecifications.os') })),
      hostNames: Yup.lazy(value => validateUniqueList({ value, getString }))
    }
  }

  const validationSchema = Yup.object().shape({
    ...getNameAndIdentifierSchema(getString, stepViewType),
    sharedPaths: Yup.lazy(value => {
      if (Array.isArray(value)) {
        return Yup.array().test('valuesShouldBeUnique', getString('validation.uniqueValues'), list => {
          if (!list) return true

          return uniqBy(list, 'value').length === list.length
        })
      } else {
        return Yup.string()
      }
    }),
    ...getStepGroupInfraValidationObject()
  })

  const getKubernetesInfraPayload = (): Omit<StepGroupFormikValues, 'identifier' | 'name'> => {
    const autoServiceAccountToken = initialValues.stepGroupInfra?.spec?.automountServiceAccountToken
    return {
      type: 'KubernetesDirect',
      connectorRef: initialValues.stepGroupInfra?.spec.connectorRef,
      namespace: initialValues.stepGroupInfra?.spec?.namespace,
      serviceAccountName: initialValues.stepGroupInfra?.spec?.serviceAccountName,
      volumes: initialValues.stepGroupInfra?.spec?.volumes,
      runAsUser: initialValues.stepGroupInfra?.spec?.containerSecurityContext?.runAsUser,
      initTimeout: initialValues.stepGroupInfra?.spec?.initTimeout,
      annotations: getInitialMapValues((initialValues.stepGroupInfra?.spec?.annotations as any) || []),
      labels: getInitialMapValues((initialValues.stepGroupInfra?.spec?.labels as any) || []),
      priorityClassName: initialValues.stepGroupInfra?.spec?.priorityClassName as unknown as string,
      automountServiceAccountToken: typeof autoServiceAccountToken === 'undefined' ? true : autoServiceAccountToken,
      privileged: initialValues.stepGroupInfra?.spec?.containerSecurityContext?.privileged,
      allowPrivilegeEscalation: initialValues.stepGroupInfra?.spec?.containerSecurityContext?.allowPrivilegeEscalation,
      addCapabilities: getInitialListValues(
        initialValues.stepGroupInfra?.spec?.containerSecurityContext?.capabilities?.add || []
      ),
      dropCapabilities: getInitialListValues(
        initialValues.stepGroupInfra?.spec?.containerSecurityContext?.capabilities?.drop || []
      ),
      runAsNonRoot: initialValues.stepGroupInfra?.spec?.containerSecurityContext?.runAsNonRoot,
      readOnlyRootFilesystem: initialValues.stepGroupInfra?.spec?.containerSecurityContext?.readOnlyRootFilesystem,
      tolerations: getInitialComplexMapValues(initialValues.stepGroupInfra?.spec?.tolerations),
      nodeSelector: getInitialMapValues((initialValues.stepGroupInfra?.spec?.nodeSelector as any) || []),
      harnessImageConnectorRef: initialValues.stepGroupInfra?.spec?.harnessImageConnectorRef,
      os: initialValues.stepGroupInfra?.spec?.os || OsTypes.Linux,
      hostNames: getInitialListValues(initialValues.stepGroupInfra?.spec?.hostNames || [])
    }
  }

  const getInitialValues = (): StepGroupFormikValues => {
    if (initialValues?.stepGroupInfra?.type && initialValues.identifier) {
      const sharedPaths: ListUIType | string =
        typeof initialValues.sharedPaths === 'string'
          ? initialValues.sharedPaths
          : (initialValues.sharedPaths as any)
              ?.filter((path: string) => !!path)
              ?.map((_value: string) => ({
                id: uuid('', nameSpace()),
                value: _value
              })) || []

      return {
        ...initialValues,
        sharedPaths,
        ...getKubernetesInfraPayload()
      } as StepGroupFormikValues
    }

    return initialValues
  }

  return (
    <>
      <Formik<StepGroupFormikValues>
        onSubmit={values => {
          onUpdate?.(values)
        }}
        formName="stepGroup"
        initialValues={getInitialValues()}
        validationSchema={validationSchema}
      >
        {(formik: FormikProps<StepGroupFormikValues>) => {
          setFormikRef(formikRef, formik)
          return (
            <FormikForm>
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormInput.InputWithIdentifier inputLabel={getString('name')} isIdentifierEditable={isNewStep} />
              </div>
              {CDS_CONTAINER_STEP_GROUP && (
                <>
                  <Switch
                    checked={isContainerBasedExecutionEnabled}
                    label={getString('pipeline.enableContainerBasedExecution')}
                    onChange={() => setIsContainerBasedExecutionEnabled(!isContainerBasedExecutionEnabled)}
                    disabled={readonly}
                  />
                  {isContainerBasedExecutionEnabled && (
                    <KubernetesStepGroupInfra formikRef={formik} allowableTypes={allowableTypes} readonly={readonly} />
                  )}
                </>
              )}
            </FormikForm>
          )
        }}
      </Formik>
    </>
  )
}

export const StepGroupStepEditRef = React.forwardRef(StepGroupStepEdit)
