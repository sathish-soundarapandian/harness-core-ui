/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import {
  Container,
  Formik,
  FormInput,
  Layout,
  Button,
  Text,
  FormError,
  ButtonVariation,
  useToaster,
  MultiTypeInputType
} from '@harness/uicore'
import { Switch } from '@blueprintjs/core'
import { Form, FieldArray } from 'formik'
import produce from 'immer'
import * as Yup from 'yup'
import { get, defaultTo } from 'lodash-es'
import cx from 'classnames'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'

import { useStrings } from 'framework/strings'
import { parse } from '@common/utils/YamlHelperMethods'
import { isWinRmDeploymentType } from '@pipeline/utils/stageHelpers'
import { FormInstanceDropdown } from '@common/components'
import { InstanceTypes } from '@common/components/InstanceDropdownField/InstanceDropdownField'
import type { InstanceFieldValue } from '@common/components/InstanceDropdownField/InstanceDropdownField'
import {
  usePostExecutionStrategyYaml,
  GetExecutionStrategyYamlQueryParams,
  StrategyParameters,
  DeploymentStageConfig
} from 'services/cd-ng'
import type { StageElementConfig, StageElementWrapperConfig } from 'services/pipeline-ng'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import {
  packageTypeItems,
  ExecutionType,
  PackageTypeItem,
  PackageTypeItems,
  onPhaseFieldChange,
  packageTypeItemsWinrm,
  getPackageLabel
} from './ExecutionStrategyHelpers'
import { usePipelineContext } from '../PipelineContext/PipelineContext'
import { DrawerTypes } from '../PipelineContext/PipelineActions'

import css from './ExecutionStrategy.module.scss'

interface StrategyPayload extends StrategyParameters {
  instances?: number
}

export type StrategyType = GetExecutionStrategyYamlQueryParams['strategyType'] | 'BlankCanvas'

interface PhasesProps {
  selectedStrategy: StrategyType
  serviceDefinitionType: () => GetExecutionStrategyYamlQueryParams['serviceDefinitionType']
  selectedStage: StageElementWrapperConfig
  initialValues?: PhasesValues
}

interface PhasesValues {
  phases: InstanceFieldValue[]
  packageType: StrategyParameters['artifactType']
}

enum InstanceValue {
  COUNT = 'COUNT',
  PERCENTAGE = 'PERCENTAGE'
}

const getInstanceByType = (type: InstanceTypes): InstanceValue =>
  type === InstanceTypes.Instances ? InstanceValue.COUNT : InstanceValue.PERCENTAGE

const generatePayloadByStrategyType = (strategyType: StrategyType, values: PhasesValues): StrategyPayload => {
  switch (strategyType) {
    case ExecutionType.CANARY:
      return {
        phases: values.phases.map(val => {
          if (val.type === InstanceTypes.Instances && val?.spec?.count) {
            return +val.spec.count
          }
          if (val.type === InstanceTypes.Percentage && val?.spec?.percentage) {
            return +val.spec.percentage
          }
          return 0
        }),
        unitType: getInstanceByType(values.phases[0].type),
        artifactType: values.packageType
      }
    case ExecutionType.ROLLING:
      return {
        instances:
          (values?.phases[0].spec?.count && +values?.phases[0].spec?.count) ||
          (values?.phases[0].spec?.percentage && +values?.phases[0].spec?.percentage) ||
          1,
        unitType: getInstanceByType(values.phases[0].type),
        artifactType: values.packageType
      }
    default:
      return {
        artifactType: values.packageType
      }
  }
}

function Phases({ selectedStrategy, serviceDefinitionType, selectedStage }: PhasesProps): React.ReactElement {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const [isVerifyEnabled, setIsVerifyEnabled] = React.useState(false)
  const isWinRm = isWinRmDeploymentType(serviceDefinitionType())
  const { accountId } = useParams<AccountPathProps>()
  const { getRBACErrorMessage } = useRBACError()
  const packageTypes = React.useMemo(() => {
    return isWinRm ? packageTypeItemsWinrm : packageTypeItems
  }, [isWinRm])
  const [initialValues, setInitialValues] = React.useState<PhasesValues>({
    packageType: isWinRm ? PackageTypeItems.APPLICATION : PackageTypeItems.JAR,
    phases: [
      {
        type: InstanceTypes.Instances,
        spec: {
          count: 1
        }
      }
    ]
  } as PhasesValues)

  React.useEffect(() => {
    if (initialValues) {
      setInitialValues(initialValues)
      return
    }
    setInitialValues({
      packageType: isWinRm ? PackageTypeItems.APPLICATION : PackageTypeItems.JAR,
      phases: [
        {
          type: InstanceTypes.Instances,
          spec: {
            count: 1
          }
        }
      ]
    })
  }, [selectedStrategy, initialValues])
  const { expressions } = useVariablesExpression()
  const {
    state: { pipelineView },
    updateStage,
    updatePipelineView
  } = usePipelineContext()

  const updatePipelineViewState = (): void => {
    updatePipelineView({
      ...pipelineView,
      isDrawerOpened: false,
      drawerData: { type: DrawerTypes.ExecutionStrategy }
    })
  }

  const { mutate, loading } = usePostExecutionStrategyYaml({
    queryParams: {
      accountIdentifier: accountId,
      serviceDefinitionType: serviceDefinitionType(),
      strategyType: selectedStrategy !== 'BlankCanvas' ? selectedStrategy : ExecutionType.ROLLING,
      ...(isVerifyEnabled && { includeVerify: true })
    }
  })

  const isCanary = React.useMemo(() => {
    return selectedStrategy === ExecutionType.CANARY
  }, [selectedStrategy])

  const handleSubmit = async (values: PhasesValues): Promise<void> => {
    try {
      const yamlSnippet = await mutate(generatePayloadByStrategyType(selectedStrategy, values))

      if (yamlSnippet) {
        const newStage = produce(selectedStage, draft => {
          const jsonFromYaml = parse(defaultTo(yamlSnippet?.data, '')) as StageElementConfig
          if (draft.stage && draft.stage.spec) {
            draft.stage.failureStrategies = jsonFromYaml?.failureStrategies
            ;(draft.stage.spec as DeploymentStageConfig).execution = (jsonFromYaml?.spec as DeploymentStageConfig)
              ?.execution ?? { steps: [], rollbackSteps: [] }
          }
        }).stage

        if (newStage) {
          updateStage(newStage).then(() => {
            updatePipelineViewState()
          })
        }
      }
    } catch (e) {
      showError(getRBACErrorMessage(e))
    }
  }

  return (
    <Layout.Vertical className={css.phaseForm} data-testid="phases-container">
      <Formik<any>
        enableReinitialize
        formLoading={false}
        onSubmit={values => handleSubmit(values)}
        initialValues={initialValues}
        formName="phasesForm"
        validationSchema={Yup.object().shape({
          packageType: Yup.string().required(),
          phases: Yup.lazy((phases: any): Yup.Schema<unknown> => {
            return Yup.array().of(
              Yup.mixed().test({
                test(phase: InstanceFieldValue): boolean | Yup.ValidationError {
                  const currentIndex = +this.path.slice(7, this.path.length - 1)
                  const previousIndex = currentIndex - 1
                  if (currentIndex === 0 && phases[0].type === InstanceTypes.Instances) return true

                  if (phases[0].type === InstanceTypes.Percentage && phase?.spec?.percentage) {
                    if (currentIndex === 0 && phase?.spec?.percentage <= 100) {
                      return true
                    }
                    if (phase?.spec?.percentage <= 100 && phases[previousIndex].spec.percentage >= 100) {
                      return this.createError({
                        message: `${getString('pipeline.phasesForm.errors.wrongPercentageFormat')}`
                      })
                    }
                    if (phase?.spec?.percentage > 100) {
                      return this.createError({
                        message: `${getString('pipeline.phasesForm.errors.limitError')} 100`
                      })
                    }
                    if (
                      phase?.spec?.percentage === 100 &&
                      phase?.spec?.percentage === phases[previousIndex].spec.percentage
                    ) {
                      return this.createError({
                        message: `${getString('pipeline.phasesForm.errors.duplicationValue')}`
                      })
                    }
                    if (phase?.spec?.percentage <= phases[previousIndex].spec.percentage) {
                      return this.createError({
                        message: `${getString('pipeline.phasesForm.errors.prevLimitError')} ${
                          phases[previousIndex].spec.percentage
                        }`
                      })
                    }
                  }
                  if (phases[0].type === InstanceTypes.Instances && phase?.spec?.count && currentIndex !== 0) {
                    if (phase?.spec?.count <= phases[previousIndex].spec.count) {
                      return this.createError({
                        message: `${getString('pipeline.phasesForm.errors.prevLimitError')} ${
                          phases[previousIndex].spec.count
                        }`
                      })
                    }
                  }
                  return true
                }
              })
            )
          })
        })}
      >
        {formikProps => {
          if (selectedStrategy === ExecutionType.ROLLING && formikProps.values.phases.length > 1) {
            formikProps.setFieldValue('phases', initialValues.phases)
          }
          if (selectedStrategy === ExecutionType.BASIC && formikProps.values.phases.length > 1) {
            formikProps.setFieldValue('phases', initialValues.phases)
          }
          return (
            <Form className={css.phaseFormWrapper}>
              <Container className={cx(selectedStrategy === ExecutionType.CANARY ? css.canary : '')}>
                <FormInput.Select
                  className={css.selectPackageType}
                  value={
                    formikProps?.values?.packageType
                      ? {
                          label: getString(getPackageLabel(packageTypes, formikProps?.values?.packageType)),
                          value: formikProps?.values?.packageType
                        }
                      : null
                  }
                  items={packageTypes.map((item: PackageTypeItem) => ({
                    ...item,
                    label: getString(item.label)
                  }))}
                  name="packageType"
                  label={
                    isWinRm ? getString('pipeline.artifactsSelection.artifactType') : getString('pipeline.packageType')
                  }
                />
                {selectedStrategy === ExecutionType.CANARY || selectedStrategy === ExecutionType.ROLLING ? (
                  <FieldArray
                    name="phases"
                    data-testid="phases-field"
                    render={({ push, remove }) => {
                      return (
                        <>
                          <div className={css.phasesListContainer}>
                            {Array.isArray(formikProps.values.phases) &&
                              formikProps.values.phases.map((field: InstanceFieldValue, index: number) => {
                                return (
                                  <Layout.Vertical key={index}>
                                    <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                                      {selectedStrategy === ExecutionType.CANARY ? (
                                        <Layout.Vertical>
                                          <Text className={css.phaseLabel}>
                                            {getString('pipeline.phasesForm.phase')}
                                          </Text>
                                          <Text
                                            className={css.phaseName}
                                            margin={{ top: 'small', right: 'small' }}
                                            border
                                            font={{ align: 'center' }}
                                            width={80}
                                          >
                                            {getString('pipeline.phasesForm.phase')} {isCanary ? index + 1 : null}
                                          </Text>
                                        </Layout.Vertical>
                                      ) : null}
                                      <FormInstanceDropdown
                                        name={`phases[${index}]`}
                                        label={getString('common.instanceLabel')}
                                        readonly={false}
                                        onChange={value => {
                                          onPhaseFieldChange(formikProps, 'phases', index, value, field)
                                        }}
                                        allowableTypes={[MultiTypeInputType.FIXED]}
                                        expressions={expressions}
                                      />
                                      {isCanary ? (
                                        <Container className={css.removePhase}>
                                          <Button
                                            icon="main-trash"
                                            iconProps={{ size: 20 }}
                                            minimal
                                            data-testid={`remove-phases-[${index}]`}
                                            onClick={() => remove(index)}
                                            disabled={loading || formikProps.values.phases.length <= 1}
                                          />
                                        </Container>
                                      ) : null}
                                    </Layout.Horizontal>
                                    {get(formikProps?.errors, `phases[${index}]`) ? (
                                      <>
                                        <FormError
                                          name={`phases[${index}]`}
                                          errorMessage={get(formikProps?.errors, `phases[${index}]`)}
                                        />
                                      </>
                                    ) : null}
                                  </Layout.Vertical>
                                )
                              })}
                          </div>

                          {isCanary ? (
                            <Button
                              intent="primary"
                              minimal
                              className={css.addBtn}
                              text={`${getString('pipeline.phasesForm.addPhase')}`}
                              data-testid={`add-phase`}
                              onClick={() => {
                                if (formikProps.values.phases[0].type === InstanceTypes.Instances) {
                                  push({
                                    type: InstanceTypes.Instances,
                                    spec: {
                                      count: 1
                                    }
                                  })
                                } else {
                                  push({
                                    type: InstanceTypes.Percentage,
                                    spec: {
                                      percentage: 100
                                    }
                                  })
                                }
                              }}
                              disabled={loading}
                            />
                          ) : null}
                        </>
                      )
                    }}
                  />
                ) : null}
              </Container>
              <Container className={css.btnContainer}>
                <Switch
                  checked={isVerifyEnabled}
                  onChange={() => setIsVerifyEnabled(prevIsVerifyEnabled => !prevIsVerifyEnabled)}
                  data-testid="enable-verification-options-switch"
                  className={css.cvEnableSwitch}
                  labelElement={
                    <Text style={{ fontWeight: 500 }}>{getString('pipeline.phasesForm.useVerification')}</Text>
                  }
                />
                <Button
                  data-testid="execution-use-strategy-phases"
                  type="submit"
                  variation={ButtonVariation.PRIMARY}
                  text={getString('pipeline.executionStrategy.useStrategy')}
                  disabled={loading || !formikProps.isValid}
                  className={css.phasesSubmit}
                  loading={loading}
                />
              </Container>
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export default Phases
