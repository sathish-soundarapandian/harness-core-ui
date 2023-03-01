/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React, { useCallback, useEffect, useMemo } from 'react'
import cx from 'classnames'
import * as Yup from 'yup'
import { defaultTo, get, memoize, merge } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import type { IItemRendererProps } from '@blueprintjs/select'
import {
  Formik,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  Button,
  SelectOption,
  StepProps,
  Text,
  ButtonVariation,
  FormikForm
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'

import { useListAwsRegions } from 'services/portal'
import {
  ConnectorConfigDTO,
  GetImagesListForEcrQueryParams,
  useGetBuildDetailsForEcr,
  useGetImagesListForEcr
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import { useMutateAsGet, useQueryParams } from '@common/hooks'
import { isMultiTypeRuntime } from '@common/utils/utils'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import {
  checkIfQueryParamsisNotEmpty,
  getArtifactFormData,
  getConnectorIdValue,
  getFinalArtifactObj,
  resetFieldValue,
  shouldFetchFieldOptions,
  shouldHideHeaderAndNavBtns
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import type {
  ArtifactType,
  ImagePathProps,
  ImagePathTypes
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { ArtifactIdentifierValidation, ModalViewFor } from '../../../ArtifactHelper'
import ArtifactImagePathTagView from '../ArtifactImagePathTagView/ArtifactImagePathTagView'
import { ArtifactSourceIdentifier, SideCarArtifactIdentifier } from '../ArtifactIdentifier'
import css from '../../ArtifactConnector.module.scss'

export function ECRArtifact({
  context,
  handleSubmit,
  expressions,
  allowableTypes,
  prevStepData,
  initialValues,
  previousStep,
  artifactIdentifiers,
  isReadonly = false,
  selectedArtifact,
  isMultiArtifactSource,
  formClassName = ''
}: StepProps<ConnectorConfigDTO> & ImagePathProps<ImagePathTypes>): React.ReactElement {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { getRBACErrorMessage } = useRBACError()

  const [tagList, setTagList] = React.useState([])
  const [lastQueryData, setLastQueryData] = React.useState<{ imagePath: string; region: any }>({
    imagePath: '',
    region: ''
  })
  const [imagesListLastQueryData, setImagesListLastQueryData] = React.useState<{ region: string }>({
    region: ''
  })

  const isIdentifierAllowed = context === ModalViewFor.SIDECAR || !!isMultiArtifactSource
  const hideHeaderAndNavBtns = shouldHideHeaderAndNavBtns(context)
  const getConnectorRefQueryData = (): string => {
    return defaultTo(prevStepData?.connectorId?.value, prevStepData?.identifier)
  }

  // Region
  const { data } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })
  const regions: SelectOption[] = useMemo(() => {
    const regionValues = defaultTo(data?.resource, []).map(region => ({
      value: defaultTo(region.value, ''),
      label: defaultTo(region.name, '')
    }))
    return regionValues
  }, [data?.resource])

  // Image Path
  const imagesListAPIQueryParams: GetImagesListForEcrQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    connectorRef: getConnectorRefQueryData(),
    region: imagesListLastQueryData.region,
    repoIdentifier,
    branch
  }

  const {
    data: imagesListData,
    loading: imagesListLoading,
    refetch: refetchImagesList,
    error: imagesListError
  } = useMutateAsGet(useGetImagesListForEcr, {
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: imagesListAPIQueryParams,
    lazy: true,
    debounce: 300
  })

  const allImageOptions = useMemo(() => {
    if (imagesListLoading) {
      return [{ label: getString('loading'), value: getString('loading') }]
    }
    return defaultTo(
      imagesListData?.data?.images?.map((image: string) => ({
        label: defaultTo(image, ''),
        value: defaultTo(image, '')
      })),
      []
    )
  }, [imagesListLoading, imagesListData])

  const canFetchImagesList = useCallback(
    (region: string): boolean =>
      !!(imagesListLastQueryData.region !== region && shouldFetchFieldOptions(prevStepData, [region])),
    [imagesListLastQueryData, prevStepData]
  )

  const fetchImagesList = useCallback(
    (region = ''): void => {
      if (canFetchImagesList(region)) {
        setImagesListLastQueryData({ region })
        refetchImagesList({
          queryParams: {
            ...imagesListAPIQueryParams,
            region
          }
        })
      }
    },
    [canFetchImagesList, refetchImagesList]
  )

  // Tags
  const {
    data: ecrBuildData,
    loading: ecrBuildDetailsLoading,
    refetch: refetchECRBuilddata,
    error: ecrTagError
  } = useGetBuildDetailsForEcr({
    queryParams: {
      imagePath: lastQueryData.imagePath,
      connectorRef: getConnectorRefQueryData(),
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      region: defaultTo(lastQueryData.region.value, lastQueryData.region),
      repoIdentifier,
      branch
    },
    lazy: true
  })
  useEffect(() => {
    if (ecrTagError) {
      setTagList([])
    } else if (Array.isArray(ecrBuildData?.data?.buildDetailsList)) {
      setTagList(ecrBuildData?.data?.buildDetailsList as [])
    }
  }, [ecrBuildData, ecrTagError])

  useEffect(() => {
    if (checkIfQueryParamsisNotEmpty(Object.values(lastQueryData))) {
      refetchECRBuilddata()
    }
  }, [lastQueryData, prevStepData, refetchECRBuilddata])

  const fetchTags = (imagePath = '', region = ''): void => {
    if (canFetchTags(imagePath, region)) {
      setLastQueryData({ imagePath, region })
    }
  }
  const canFetchTags = useCallback(
    (imagePath: string, region: string): boolean =>
      !!(
        (lastQueryData.imagePath !== imagePath || lastQueryData.region !== region) &&
        shouldFetchFieldOptions(prevStepData, [imagePath, region])
      ),
    [lastQueryData, prevStepData]
  )

  const isTagDisabled = useCallback((formikValue): boolean => {
    return !checkIfQueryParamsisNotEmpty([formikValue.imagePath, formikValue.region])
  }, [])

  const schemaObject = {
    imagePath: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.imagePath')),
    region: Yup.mixed().required(getString('pipeline.artifactsSelection.validation.region')),
    tagType: Yup.string().required(),
    tagRegex: Yup.string().when('tagType', {
      is: 'regex',
      then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.tagRegex'))
    }),
    tag: Yup.mixed().when('tagType', {
      is: 'value',
      then: Yup.mixed().required(getString('pipeline.artifactsSelection.validation.tag'))
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

  const getInitialValues = useCallback((): ImagePathTypes => {
    const values = getArtifactFormData(
      initialValues,
      selectedArtifact as ArtifactType,
      isIdentifierAllowed
    ) as ImagePathTypes
    const specValues = get(initialValues, 'spec', null)
    values.region = specValues?.region
    return values
  }, [initialValues, isIdentifierAllowed, regions, selectedArtifact])

  const submitFormData = (formData: ImagePathTypes & { connectorId?: string }): void => {
    const artifactObj = getFinalArtifactObj(formData, isIdentifierAllowed)

    merge(artifactObj.spec, { region: formData?.region })
    handleSubmit(artifactObj)
  }

  const handleValidate = (formData: ImagePathTypes & { connectorId?: string }) => {
    if (hideHeaderAndNavBtns) {
      submitFormData({
        ...prevStepData,
        ...formData,
        connectorId: getConnectorIdValue(prevStepData)
      })
    }
  }

  const getImagePathHelperText = (formikForm: FormikProps<ImagePathTypes>) => {
    const connectorRefValue = getConnectorIdValue(prevStepData)
    if (
      (getMultiTypeFromValue(formikForm?.values.imagePath) === MultiTypeInputType.FIXED &&
        (isMultiTypeRuntime(getMultiTypeFromValue(connectorRefValue)) || connectorRefValue?.length === 0)) ||
      getMultiTypeFromValue(formikForm.values.region) === MultiTypeInputType.RUNTIME ||
      formikForm.values.region?.length === 0
    ) {
      return getString('pipeline.imagePathHelperText')
    }
  }

  const itemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem
      item={item}
      itemProps={itemProps}
      disabled={imagesListLoading || !!imagesListError}
      style={imagesListError ? { lineClamp: 1, width: 400, padding: 'small' } : {}}
    />
  ))

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      {!hideHeaderAndNavBtns && (
        <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
          {getString('pipeline.artifactsSelection.artifactDetails')}
        </Text>
      )}
      <Formik
        initialValues={getInitialValues()}
        validationSchema={isIdentifierAllowed ? schemaWithIdentifier : primarySchema}
        formName="ecrArtifact"
        validate={handleValidate}
        onSubmit={formData => {
          submitFormData({
            ...prevStepData,
            ...formData,
            connectorId: getConnectorIdValue(prevStepData)
          })
        }}
        enableReinitialize={true}
      >
        {formik => (
          <FormikForm>
            <div className={cx(css.artifactForm, formClassName)}>
              {isMultiArtifactSource && context === ModalViewFor.PRIMARY && <ArtifactSourceIdentifier />}
              {context === ModalViewFor.SIDECAR && <SideCarArtifactIdentifier />}

              <div className={css.imagePathContainer}>
                <FormInput.MultiTypeInput
                  name="region"
                  selectItems={regions}
                  useValue
                  multiTypeInputProps={{
                    onChange: () => {
                      tagList.length && setTagList([])
                      resetFieldValue(formik, `imagePath`)
                      resetFieldValue(formik, `tag`)
                    },
                    selectProps: {
                      defaultSelectedItem: formik.values.region,
                      items: regions
                    }
                  }}
                  label={getString('regionLabel')}
                  placeholder={getString('select')}
                />

                {getMultiTypeFromValue(formik.values.region) === MultiTypeInputType.RUNTIME && (
                  <div className={css.configureOptions}>
                    <SelectConfigureOptions
                      options={regions}
                      style={{ alignSelf: 'center' }}
                      value={formik.values?.region as string}
                      type="String"
                      variableName="region"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => {
                        formik.setFieldValue('region', value)
                      }}
                      isReadonly={isReadonly}
                    />
                  </div>
                )}
              </div>

              <div className={css.imagePathContainer}>
                <FormInput.MultiTypeInput
                  name="imagePath"
                  label={getString('pipeline.imagePathLabel')}
                  placeholder={getString('pipeline.artifactsSelection.existingDocker.imageNamePlaceholder')}
                  selectItems={allImageOptions}
                  disabled={isReadonly}
                  helperText={getImagePathHelperText(formik)}
                  useValue
                  multiTypeInputProps={{
                    expressions,
                    allowableTypes,
                    onChange: selected => {
                      if (formik.values.imagePath !== (selected as unknown as any)?.value) {
                        resetFieldValue(formik, 'tag')
                      }
                    },
                    selectProps: {
                      defaultSelectedItem: formik?.values?.tag,
                      noResults: (
                        <Text lineClamp={1} width={400} padding="small">
                          {getRBACErrorMessage(imagesListError as RBACError) || getString('pipeline.noImagesFound')}
                        </Text>
                      ),
                      items: allImageOptions,
                      itemRenderer: itemRenderer,
                      allowCreatingNewItems: true,
                      addTooltip: true
                    },
                    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                      if (
                        e?.target?.type !== 'text' ||
                        (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                      ) {
                        return
                      }
                      if (!imagesListLoading) {
                        fetchImagesList(formik.values.region)
                      }
                    }
                  }}
                />
                {getMultiTypeFromValue(formik.values?.imagePath) === MultiTypeInputType.RUNTIME && (
                  <div className={css.configureOptions}>
                    <SelectConfigureOptions
                      options={allImageOptions}
                      value={formik.values?.imagePath as string}
                      type="String"
                      variableName="imagePath"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => {
                        formik.setFieldValue('imagePath', value)
                      }}
                      isReadonly={isReadonly}
                    />
                  </div>
                )}
              </div>

              <ArtifactImagePathTagView
                selectedArtifact={selectedArtifact as ArtifactType}
                formik={formik}
                expressions={expressions}
                allowableTypes={allowableTypes}
                isReadonly={isReadonly}
                connectorIdValue={getConnectorIdValue(prevStepData)}
                fetchTags={imagePath => fetchTags(imagePath, formik.values?.region)}
                buildDetailsLoading={ecrBuildDetailsLoading}
                tagError={ecrTagError}
                tagList={tagList}
                setTagList={setTagList}
                tagDisabled={isTagDisabled(formik?.values)}
                isImagePath={false}
                isArtifactPath={false}
              />
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
        )}
      </Formik>
    </Layout.Vertical>
  )
}
