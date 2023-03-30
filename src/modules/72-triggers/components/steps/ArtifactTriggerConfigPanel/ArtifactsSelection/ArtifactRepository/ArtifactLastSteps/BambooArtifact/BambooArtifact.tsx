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
import type { FormikProps } from 'formik'

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
  Failure
} from 'services/cd-ng'
import { getConnectorIdValue } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import { NoTagResults } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/ArtifactImagePathTagView/ArtifactImagePathTagView'
import type { BambooRegistrySpec } from 'services/pipeline-ng'
import type { ImagePathProps } from '../../../ArtifactInterface'

import css from '../../ArtifactConnector.module.scss'

function FormComponent(
  props: StepProps<ConnectorConfigDTO> &
    ImagePathProps<BambooRegistrySpec> & { formik: FormikProps<BambooRegistrySpec> }
): React.ReactElement {
  const { prevStepData, previousStep, formik } = props

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

  const connectorRefValue = getConnectorIdValue(prevStepData)
  const planNameValue = get(formik.values, 'spec.planKey', '')

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
    if (planNameValue) {
      refetchArtifactPaths()
    }
  }, [planNameValue])

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
            fieldName: getString('common.subscriptions.overview.plan')
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
      <div className={cx(css.artifactForm)}>
        <div className={css.imagePathContainer}>
          <FormInput.MultiTypeInput
            label={getString('pipeline.bamboo.planName')}
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
              selectProps: {
                allowCreatingNewItems: true,

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

              onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                onFocus(e, refetchPlans)
              },

              allowableTypes: [MultiTypeInputType.FIXED]
            }}
          />
        </div>
        <div className={css.imagePathContainer}>
          <FormInput.MultiSelectTypeInput
            selectItems={defaultTo(artifactPaths, [])}
            label={getString('pipeline.artifactPathLabel')}
            name="spec.artifactPaths"
            placeholder={fetchingArtifacts ? getString('loading') : getString('pipeline.selectArtifactPathPlaceholder')}
            multiSelectTypeInputProps={{
              allowableTypes: [MultiTypeInputType.FIXED]
            }}
          />
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

              selectProps: {
                allowCreatingNewItems: true,
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
              allowableTypes: [MultiTypeInputType.FIXED]
            }}
            selectItems={builds || []}
          />
        </div>
      </div>

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
    </FormikForm>
  )
}

export function BambooArtifact(
  props: StepProps<ConnectorConfigDTO> & ImagePathProps<BambooRegistrySpec>
): React.ReactElement {
  const { getString } = useStrings()
  const { handleSubmit, initialValues, prevStepData } = props

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>

      <Formik
        initialValues={initialValues}
        formName="bambooTriggerForm"
        validationSchema={Yup.object().shape({
          spec: Yup.object().shape({
            planKey: Yup.string().required(getString('pipeline.bambooStep.validations.planName')),
            artifactPaths: Yup.string()
          })
        })}
        onSubmit={formData => {
          handleSubmit({
            ...formData,
            connectorRef: getConnectorIdValue(prevStepData)
          })
        }}
      >
        {formik => {
          return <FormComponent {...props} formik={formik} />
        }}
      </Formik>
    </Layout.Vertical>
  )
}
