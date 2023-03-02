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
import { defaultTo, memoize } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { IItemRendererProps } from '@blueprintjs/select'
import { useStrings } from 'framework/strings'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useMutateAsGet, useQueryParams } from '@common/hooks'

import {
  ConnectorConfigDTO,
  BuildDetails,
  useGetPlansKey,
  useGetBuildsForBamboo,
  useGetArtifactPathsForBamboo,
  BambooPlanNames
} from 'services/cd-ng'
import {
  getConnectorIdValue,
  getArtifactFormData,
  shouldHideHeaderAndNavBtns
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import type {
  ArtifactType,
  BambooArtifactProps,
  BambooArtifactType
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { getGenuineValue } from '@pipeline/components/PipelineSteps/Steps/JiraApproval/helper'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
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
  formClassName = ''
}: any): React.ReactElement {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [planDetails, setPlanDetails] = useState<SelectOption[]>([])
  const [artifactPath, setFilePath] = useState<SelectOption[]>([])
  const [builds, setBambooBuilds] = useState<SelectOption[]>([])
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }

  const connectorRefValue = getGenuineValue(prevStepData?.connectorId?.value || prevStepData?.identifier)
  const planNameValue = formik.values?.spec?.planKey
  // const artifactValue = getGenuineValue(formik.values?.spec?.artifactPaths)
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
    if (bambooBuildResponse?.data) {
      const bambooBuildResponseFormatted: MultiSelectOption[] = bambooBuildResponse?.data?.map(
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
    if (plansResponse?.data?.planKeys) {
      const planOptions: SelectOption[] = (plansResponse?.data?.planKeys || [])?.map((plan: BambooPlanNames) => {
        return {
          label: plan.name,
          value: plan.name
        } as SelectOption
      }) || [
        {
          label: 'Loading plans ...',
          value: 'Loading plans ...'
        }
      ]
      setPlanDetails(planOptions)
    }
  }, [plansResponse?.data?.planKeys])

  const planPathItemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={loadingPlans} />
  ))

  const artifactPathItemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={fetchingArtifacts} />
  ))

  const buildItemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={fetchingBuild} />
  ))

  const canFetchBuildsOrArtifacts =
    getMultiTypeFromValue(connectorRefValue) === MultiTypeInputType.RUNTIME ||
    getMultiTypeFromValue(planNameValue) === MultiTypeInputType.RUNTIME ||
    !planNameValue ||
    !connectorRefValue

  return (
    <FormikForm>
      <div className={cx(css.artifactForm, formClassName)}>
        {isMultiArtifactSource && context === ModalViewFor.PRIMARY && <ArtifactSourceIdentifier />}
        {context === ModalViewFor.SIDECAR && <SideCarArtifactIdentifier />}
        <div className={css.imagePathContainer}>
          <FormInput.MultiTypeInput
            label={getString('pipeline.bamboo.planName')}
            name="spec.planKey"
            useValue
            selectItems={planDetails}
            placeholder={
              connectorRefValue && getMultiTypeFromValue(connectorRefValue) === MultiTypeInputType.FIXED
                ? loadingPlans
                  ? getString('pipeline.bamboo.fetchingPlans')
                  : plansError?.message
                  ? plansError?.message
                  : getString('pipeline.planNamePlaceholder')
                : getString('select')
            }
            multiTypeInputProps={{
              onTypeChange: (type: MultiTypeInputType) => formik.setFieldValue('spec.planKey', type),
              expressions,
              selectProps: {
                allowCreatingNewItems: true,
                addClearBtn: !isReadonly,
                items: planDetails,
                loadingItems: loadingPlans,
                itemRenderer: planPathItemRenderer,
                noResults: (
                  <NoTagResults
                    tagError={plansError}
                    isServerlessDeploymentTypeSelected={false}
                    defaultErrorText={loadingPlans ? getString('loading') : getString('common.filters.noResultsFound')}
                  />
                )
              },
              onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                if (
                  e?.target?.type !== 'text' ||
                  (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                ) {
                  return
                }

                refetchPlans()
              },
              allowableTypes
            }}
          />
          {getMultiTypeFromValue(formik.values.spec?.planName) === MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              value={formik.values?.spec?.jobName as string}
              style={{ marginTop: 22 }}
              type="String"
              variableName="spec.planKey"
              showRequiredField={false}
              showDefaultField={false}
              onChange={value => formik.setFieldValue('spec.planKey', value)}
              isReadonly={isReadonly}
            />
          )}
        </div>
        <div className={css.imagePathContainer}>
          <FormInput.MultiTypeInput
            label={getString('pipeline.artifactPathLabel')}
            name="spec.artifactPaths"
            useValue
            placeholder={fetchingArtifacts ? getString('loading') : getString('pipeline.selectArtifactPathPlaceholder')}
            multiTypeInputProps={{
              onTypeChange: (type: MultiTypeInputType) => formik.setFieldValue('spec.artifactPath', type),
              expressions,
              onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                if (
                  e?.target?.type !== 'text' ||
                  (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING) ||
                  canFetchBuildsOrArtifacts
                ) {
                  return
                }
                refetchArtifactPaths()
              },
              selectProps: {
                allowCreatingNewItems: true,
                addClearBtn: !isReadonly,
                items: defaultTo(artifactPath, []),
                noResults: (
                  <NoTagResults
                    tagError={artifactPathError}
                    isServerlessDeploymentTypeSelected={false}
                    defaultErrorText={
                      fetchingArtifacts
                        ? getString('loading')
                        : canFetchBuildsOrArtifacts
                        ? `${getString('pipeline.artifactsSelection.validation.jobConnectorRequired')} artifactPath`
                        : getString('common.filters.noResultsFound')
                    }
                  />
                ),
                itemRenderer: artifactPathItemRenderer
              },
              allowableTypes
            }}
            selectItems={artifactPath || []}
          />
          {getMultiTypeFromValue(formik.values?.spec?.artifactPath) === MultiTypeInputType.RUNTIME && (
            <div className={css.configureOptions}>
              <ConfigureOptions
                value={formik.values?.spec?.artifactPath}
                type="String"
                variableName="spec.artifactPaths"
                showRequiredField={false}
                showDefaultField={false}
                onChange={value => {
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
                    defaultErrorText={
                      fetchingBuild
                        ? getString('loading')
                        : canFetchBuildsOrArtifacts
                        ? `${getString('pipeline.artifactsSelection.validation.jobConnectorRequired')} build`
                        : getString('common.filters.noResultsFound')
                    }
                  />
                )
              },
              onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                if (
                  e?.target?.type !== 'text' ||
                  (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING) ||
                  canFetchBuildsOrArtifacts
                ) {
                  return
                }
                refetchBambooBuild()
              },
              allowableTypes
            }}
            selectItems={builds || []}
          />
          {getMultiTypeFromValue(formik.values?.spec?.build) === MultiTypeInputType.RUNTIME && (
            <div className={css.configureOptions}>
              <ConfigureOptions
                value={formik.values?.spec?.build}
                type="String"
                variableName="spec.build"
                showRequiredField={false}
                showDefaultField={false}
                onChange={value => {
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
            onClick={() => previousStep?.(prevStepData)}
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
  const { context, handleSubmit, initialValues, prevStepData, selectedArtifact, artifactIdentifiers } = props
  const isIdentifierAllowed = context === ModalViewFor.SIDECAR || !!props.isMultiArtifactSource
  const hideHeaderAndNavBtns = shouldHideHeaderAndNavBtns(context)

  const getInitialValues = (): BambooArtifactType => {
    return getArtifactFormData(
      initialValues,
      selectedArtifact as ArtifactType,
      isIdentifierAllowed
    ) as BambooArtifactType
  }

  const submitFormData = (formData: BambooArtifactType, connectorId?: string): void => {
    const planKey = formData.spec?.planKey

    handleSubmit({
      identifier: formData.identifier,
      spec: {
        connectorRef: connectorId,
        artifactPaths: formData.spec.artifactPaths,
        build: formData.spec.build,
        planKey
      }
    })
  }

  const handleValidate = (formData: BambooArtifactType) => {
    if (hideHeaderAndNavBtns) {
      submitFormData(
        {
          ...formData
        },
        getConnectorIdValue(prevStepData)
      )
    }
  }

  const schemaObject = {
    spec: Yup.object().shape({
      planKey: Yup.lazy(value =>
        typeof value === 'object'
          ? Yup.object().required(getString('pipeline.bambooStep.validations.planName')) // typeError is necessary here, otherwise we get a bad-looking yup error
          : Yup.string().required(getString('pipeline.bambooStep.validations.planName'))
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
            getConnectorIdValue(prevStepData)
          )
        }}
      >
        {formik => {
          return <FormComponent {...props} formik={formik} />
        }}
      </Formik>
    </Layout.Vertical>
  )
}
