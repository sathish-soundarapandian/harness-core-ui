/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import {
  Formik,
  Layout,
  Button,
  StepProps,
  Text,
  ButtonVariation,
  MultiTypeInputType,
  SelectOption,
  getMultiTypeFromValue,
  FormInput,
  MultiSelectOption,
  FormikForm
} from '@harness/uicore'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { defaultTo, get, memoize } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { IItemRendererProps } from '@blueprintjs/select'
import type { GetDataError } from 'restful-react'

import { useStrings } from 'framework/strings'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useMutateAsGet, useQueryParams } from '@common/hooks'

import {
  ConnectorConfigDTO,
  BuildDetails,
  useGetPlansKey,
  useGetBuildsForBamboo,
  useGetArtifactPathsForBamboo,
  BambooPlanNames,
  Failure,
  ServiceDefinition
} from 'services/cd-ng'
import {
  getConnectorIdValue,
  getArtifactFormData,
  shouldHideHeaderAndNavBtns
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import type {
  ArtifactFormikProps,
  ArtifactType,
  BambooArtifactProps,
  BambooArtifactType
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import { isTASDeploymentType } from '@pipeline/utils/stageHelpers'
import { ArtifactIdentifierValidation, ModalViewFor } from '../../../ArtifactHelper'
import { ArtifactSourceIdentifier, SideCarArtifactIdentifier } from '../ArtifactIdentifier'

import { NoTagResults } from '../ArtifactImagePathTagView/ArtifactImagePathTagView'
import css from '../../ArtifactConnector.module.scss'

function FormComponent({
  context,
  expressions,
  allowableTypes,
  prevStepData,
  previousStep,
  isReadonly = false,
  formik,
  isMultiArtifactSource,
  formClassName = '',
  editArtifactModePrevStepData,
  isTasDeploymentTypeSelected
}: StepProps<ConnectorConfigDTO> & BambooArtifactProps & ArtifactFormikProps<BambooArtifactType>): React.ReactElement {
  const modifiedPrevStepData = defaultTo(prevStepData, editArtifactModePrevStepData)

  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [planDetails, setPlanDetails] = useState<SelectOption[]>([])
  const [errText, setPlanErrText] = useState<GetDataError<Failure | Error> | null>(null)
  const [artifactPaths, setFilePath] = useState<SelectOption[]>([])
  const [builds, setBambooBuilds] = useState<SelectOption[]>([])
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }

  const connectorRefValue = getConnectorIdValue(modifiedPrevStepData)
  const planNameValue = get(formik.values, 'spec.planKey', '')
  const [planValue, setPlanValue] = useState<SelectOption>(planNameValue)

  // const artifactValue = getGenuineValue(formik.values?.spec?.artifactPaths)

  const artifactPathValue = get(formik.values, 'spec.artifactPaths', [])
  const hideHeaderAndNavBtns = shouldHideHeaderAndNavBtns(context)

  const {
    data: plansResponse,
    loading: loadingPlans,
    error: plansError,
    refetch: refetchPlans
  } = useMutateAsGet(useGetPlansKey, {
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefValue?.toString() as string
    },
    lazy: true,
    body: {}
  })

  const {
    refetch: refetchArtifactPaths,
    data: artifactPathsResponse,
    loading: fetchingArtifacts,
    error: artifactPathError
  } = useMutateAsGet(useGetArtifactPathsForBamboo, {
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefValue?.toString(),

      planName: planNameValue
    },
    lazy: true,
    body: {}
  })

  const {
    refetch: refetchBambooBuild,
    data: bambooBuildResponse,
    loading: fetchingBuild,
    error: buildError
  } = useMutateAsGet(useGetBuildsForBamboo, {
    queryParams: {
      ...commonParams,

      connectorRef: connectorRefValue?.toString(),

      planName: planNameValue
    },
    lazy: true,
    body: {}
  })

  const artifactPathComponent = React.useMemo((): JSX.Element => {
    const commonProps = {
      selectItems: defaultTo(artifactPaths, []),
      label: getString('common.artifactPaths'),
      name: 'spec.artifactPaths',
      placeholder: fetchingArtifacts ? getString('loading') : getString('pipeline.selectArtifactPathPlaceholder'),
      multiSelectTypeInputProps: {}
    }
    return <FormInput.MultiSelectTypeInput {...commonProps} />
  }, [artifactPaths, fetchingArtifacts, getString, isTasDeploymentTypeSelected])

  useEffect(() => {
    if (planValue) {
      refetchArtifactPaths()
    }
  }, [planValue])

  useEffect(() => {
    if (artifactPathsResponse?.data) {
      const artifactPathResponseFormatted: MultiSelectOption[] = artifactPathsResponse?.data?.map(
        (artifactPathVal: string) => {
          return {
            label: artifactPathVal,
            value: artifactPathVal
          } as MultiSelectOption
        }
      )
      setFilePath(artifactPathResponseFormatted)
    }
  }, [artifactPathsResponse])

  useEffect(() => {
    if (artifactPathError?.message) {
      setFilePath([])
    }
  }, [artifactPathError])

  useEffect(() => {
    if (plansError) {
      setPlanDetails([])
      setPlanErrText(plansError)
    }
  }, [plansError])

  useEffect(() => {
    const bambooArtifactRes = get(bambooBuildResponse, 'data', [])
    if (bambooArtifactRes) {
      const bambooBuildResponseFormatted: MultiSelectOption[] = (bambooArtifactRes || [])?.map(
        (jenkinsBuild: BuildDetails) => {
          return {
            label: jenkinsBuild.uiDisplayName,
            value: jenkinsBuild.number
          } as MultiSelectOption
        }
      )
      setBambooBuilds(bambooBuildResponseFormatted)
    }
  }, [bambooBuildResponse])

  useEffect(() => {
    const planKeys = get(plansResponse, 'data.planKeys', [])
    if (planKeys) {
      const planOptions: SelectOption[] = (planKeys || [])?.map((plan: BambooPlanNames) => {
        return {
          label: plan.name,
          value: plan.name
        } as SelectOption
      }) || [
        {
          label: getString('common.loadingFieldOptions', {
            fieldName: getString('common.subscriptions.tabs.plans')
          }),
          value: getString('common.loadingFieldOptions', {
            fieldName: getString('common.subscriptions.overview.plan')
          })
        }
      ]
      setPlanDetails(planOptions)
    }
  }, [plansResponse?.data?.planKeys])

  const planPathItemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={loadingPlans} />
  ))

  const buildItemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={fetchingBuild} />
  ))

  const onFocus = (e: React.FocusEvent<HTMLInputElement>, callBack: CallableFunction) => {
    const targetType = get(e, 'target.type', '')
    const targetPlaceHolder = get(e, 'target.placeholder', '')
    /* istanbul ignore next */
    if (targetType === 'text' && targetPlaceHolder === EXPRESSION_STRING) {
      return
    }
    callBack()
  }

  return (
    <FormikForm>
      <div className={cx(css.artifactForm, formClassName)}>
        {isMultiArtifactSource && context === ModalViewFor.PRIMARY && <ArtifactSourceIdentifier />}
        {context === ModalViewFor.SIDECAR && <SideCarArtifactIdentifier />}
        <div className={css.imagePathContainer}>
          <FormInput.MultiTypeInput
            label={getString('pipeline.bamboo.planKey')}
            name="spec.planKey"
            useValue
            selectItems={planDetails}
            placeholder={
              loadingPlans
                ? getString('common.loadingFieldOptions', {
                    fieldName: getString('common.subscriptions.overview.plan')
                  })
                : getString('pipeline.planNamePlaceholder')
            }
            multiTypeInputProps={{
              expressions,
              selectProps: {
                allowCreatingNewItems: true,
                addClearBtn: !isReadonly,
                items: planDetails,
                loadingItems: loadingPlans,
                itemRenderer: planPathItemRenderer,

                noResults: (
                  <NoTagResults
                    tagError={errText}
                    isServerlessDeploymentTypeSelected={false}
                    defaultErrorText={loadingPlans ? getString('loading') : getString('common.filters.noResultsFound')}
                  />
                )
              },
              onChange: (val: any) => {
                setPlanValue(get(val, 'value', ''))
              },
              onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                onFocus(e, refetchPlans)
              },

              allowableTypes
            }}
          />
          {getMultiTypeFromValue(formik.values.spec?.planKey) === MultiTypeInputType.RUNTIME && (
            <SelectConfigureOptions
              options={planDetails}
              value={planNameValue as string}
              style={{ marginTop: 22 }}
              type="String"
              variableName="spec.planKey"
              showRequiredField={false}
              showDefaultField={false}
              onChange={value => {
                /* istanbul ignore next */
                formik.setFieldValue('spec.planKey', value)
              }}
              isReadonly={isReadonly}
            />
          )}
        </div>
        <div className={css.imagePathContainer}>
          {artifactPathComponent}
          {getMultiTypeFromValue(artifactPathValue) === MultiTypeInputType.RUNTIME && (
            <div className={css.configureOptions}>
              <SelectConfigureOptions
                options={artifactPaths}
                value={artifactPathValue}
                type="String"
                variableName="spec.artifactPaths"
                showRequiredField={false}
                showDefaultField={false}
                onChange={value => {
                  /* istanbul ignore next */
                  formik.setFieldValue('spec.artifactPaths', value)
                }}
                isReadonly={isReadonly}
              />
            </div>
          )}
        </div>
        <div className={css.imagePathContainer}>
          <FormInput.MultiTypeInput
            label={getString('pipeline.bambooBuilds')}
            name="spec.build"
            useValue
            placeholder={fetchingBuild ? getString('loading') : getString('pipeline.selectBambooBuildsPlaceholder')}
            multiTypeInputProps={{
              /* istanbul ignore next */
              onTypeChange: (type: MultiTypeInputType) => formik.setFieldValue('spec.build', type),
              expressions,
              selectProps: {
                allowCreatingNewItems: true,
                addClearBtn: !isReadonly,
                items: defaultTo(builds, []),
                loadingItems: fetchingBuild,
                itemRenderer: buildItemRenderer,
                noResults: (
                  <NoTagResults
                    tagError={buildError}
                    isServerlessDeploymentTypeSelected={false}
                    defaultErrorText={fetchingBuild ? getString('loading') : getString('common.filters.noResultsFound')}
                  />
                )
              },
              onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                onFocus(e, refetchBambooBuild)
              },
              allowableTypes
            }}
            selectItems={builds || []}
          />
          {getMultiTypeFromValue(formik.values?.spec?.build) === MultiTypeInputType.RUNTIME && (
            <div className={css.configureOptions}>
              <SelectConfigureOptions
                options={builds}
                value={formik.values?.spec?.build as string}
                type="String"
                variableName="spec.build"
                showRequiredField={false}
                showDefaultField={false}
                onChange={value => {
                  /* istanbul ignore next */
                  formik.setFieldValue('spec.build', value)
                }}
                isReadonly={isReadonly}
              />
            </div>
          )}
        </div>
      </div>
      {!hideHeaderAndNavBtns && (
        <Layout.Horizontal spacing="medium">
          <Button
            variation={ButtonVariation.SECONDARY}
            text={getString('back')}
            icon="chevron-left"
            onClick={() => previousStep?.(modifiedPrevStepData)}
          />
          <Button
            variation={ButtonVariation.PRIMARY}
            type="submit"
            text={getString('submit')}
            rightIcon="chevron-right"
          />
        </Layout.Horizontal>
      )}
    </FormikForm>
  )
}

export function BambooArtifact(props: StepProps<ConnectorConfigDTO> & BambooArtifactProps): React.ReactElement {
  const { getString } = useStrings()
  const {
    context,
    handleSubmit,
    initialValues,
    prevStepData,
    selectedArtifact,
    artifactIdentifiers,
    editArtifactModePrevStepData,
    selectedDeploymentType = ''
  } = props

  const modifiedPrevStepData = defaultTo(prevStepData, editArtifactModePrevStepData)

  const isIdentifierAllowed = context === ModalViewFor.SIDECAR || !!props.isMultiArtifactSource
  const isTasDeploymentTypeSelected = isTASDeploymentType(selectedDeploymentType)

  const hideHeaderAndNavBtns = shouldHideHeaderAndNavBtns(context)

  const getInitialValues = (): BambooArtifactType => {
    return getArtifactFormData(
      initialValues,
      selectedArtifact as ArtifactType,
      isIdentifierAllowed,
      selectedDeploymentType as ServiceDefinition['type']
    ) as BambooArtifactType
  }

  const submitFormData = (formData: BambooArtifactType, connectorId?: string): void => {
    const planKey = get(formData, 'spec.planKey', '')
    let artifactPaths = get(formData, 'spec.artifactPaths', [])
    const build = get(formData, 'spec.build', '')

    if (isTasDeploymentTypeSelected && getMultiTypeFromValue(artifactPaths) === MultiTypeInputType.FIXED) {
      artifactPaths = [artifactPaths]
    }
    handleSubmit({
      identifier: formData.identifier,
      spec: {
        connectorRef: connectorId,
        artifactPaths:
          getMultiTypeFromValue(artifactPaths) === MultiTypeInputType.FIXED
            ? (artifactPaths || []).map((artifactPath: any) => artifactPath.value) || []
            : artifactPaths,
        build,
        planKey
      }
    })
  }

  const handleValidate = (formData: BambooArtifactType) => {
    /* istanbul ignore next */
    if (hideHeaderAndNavBtns) {
      submitFormData(
        {
          ...formData
        },
        getConnectorIdValue(modifiedPrevStepData)
      )
    }
  }

  const schemaObject = {
    spec: Yup.object().shape({
      planKey: Yup.lazy(value =>
        typeof value === 'object'
          ? Yup.object().required(
              getString('common.validation.fieldIsRequired', {
                name: getString('pipeline.bamboo.planKey')
              })
            ) // typeError is necessary here, otherwise we get a bad-looking yup error
          : Yup.string().required(
              getString('common.validation.fieldIsRequired', {
                name: getString('pipeline.bamboo.planKey')
              })
            )
      ),
      artifactPaths: Yup.string()
    })
  }

  const primarySchema = Yup.object().shape(schemaObject)
  const schemaWithIdentifier = Yup.object().shape({
    ...schemaObject,
    ...ArtifactIdentifierValidation(
      getString,
      artifactIdentifiers,
      initialValues?.identifier,
      getString('pipeline.uniqueIdentifier')
    )
  })

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      {!hideHeaderAndNavBtns && (
        <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
          {getString('pipeline.artifactsSelection.artifactDetails')}
        </Text>
      )}
      <Formik
        initialValues={getInitialValues()}
        formName="imagePath"
        validationSchema={isIdentifierAllowed ? schemaWithIdentifier : primarySchema}
        validate={handleValidate}
        onSubmit={formData => {
          submitFormData(
            {
              ...formData
            },
            getConnectorIdValue(modifiedPrevStepData)
          )
        }}
      >
        {formik => {
          return <FormComponent {...props} formik={formik} isTasDeploymentTypeSelected={isTasDeploymentTypeSelected} />
        }}
      </Formik>
    </Layout.Vertical>
  )
}
