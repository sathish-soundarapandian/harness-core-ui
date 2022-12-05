/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React, { useCallback, useContext, useMemo } from 'react'
import {
  Card,
  Container,
  FormInput,
  getMultiTypeFromValue,
  Icon,
  IconName,
  Layout,
  MultiTypeInputType,
  SelectOption,
  Text
} from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import { useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { HealthSourcesType } from '@cv/constants'
import { BGColorWrapper } from '@cv/pages/health-source/common/StyledComponents'
import DrawerFooter from '@cv/pages/health-source/common/DrawerFooter/DrawerFooter'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { Connectors } from '@connectors/constants'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { AllMultiTypeInputTypesForStep } from '@ci/components/PipelineSteps/CIStep/StepUtils'
import { FormConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/FormConnectorReferenceField'
import {
  healthSourceTypeMapping,
  healthSourceTypeMappingForReferenceField
} from '@cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/MonitoredServiceInputSetsTemplate.utils'
import CardWithOuterTitle from '@common/components/CardWithOuterTitle/CardWithOuterTitle'
import { HEALTHSOURCE_LIST } from './CommonDefineHealthSource.constant'
import {
  getFeatureOption,
  getConnectorTypeName,
  getConnectorPlaceholderText,
  canShowDataSelector,
  canShowDataInfoSelector,
  getIsConnectorDisabled,
  getDisabledConnectorsList
} from './CommonDefineHealthSource.utils'
import PrometheusDataSourceTypeSelector from './components/DataSourceTypeSelector/DataSourceTypeSelector'
import DataInfoSelector from './components/DataInfoSelector/DataInfoSelector'
import { HealthSourceFormFieldNames } from '../../CommonHealthSourceDrawer.constant'
import type { CommonHealthSourceInterface } from '../../CommonHealthSourceDrawer.types'
import css from './CommonDefineHealthSource.module.scss'

interface CommonDefineHealthSourceProps {
  isTemplate?: boolean
  expressions?: string[]
}

function CommonDefineHealthSource(props: CommonDefineHealthSourceProps): JSX.Element {
  const { isTemplate, expressions } = props
  const { getString } = useStrings()
  const data = useContext(SetupSourceTabsContext)
  const { sourceData, onNext, tabsInfo } = useContext(SetupSourceTabsContext)
  const formik = useFormikContext<CommonHealthSourceInterface>()
  const { values, setFieldValue, setValues, submitForm } = formik
  const { product, sourceType, dataSourceType, connectorRef, serviceRef, environmentRef } = values || {}
  const { orgIdentifier, projectIdentifier, accountId, templateType } = useParams<
    ProjectPathProps & { identifier: string; templateType?: string }
  >()
  const { isEdit } = sourceData

  const isSplunkMetricEnabled = useFeatureFlag(FeatureFlag.CVNG_SPLUNK_METRICS)
  const isErrorTrackingEnabled = useFeatureFlag(FeatureFlag.CVNG_ENABLED)
  const isElkEnabled = useFeatureFlag(FeatureFlag.ELK_HEALTH_SOURCE)
  // const isDataSourceTypeSelectorEnabled = useFeatureFlag(FeatureFlag.SRM_ENABLE_HEALTHSOURCE_AWS_PROMETHEUS)
  const isDataSourceTypeSelectorEnabled = true
  const isCloudWatchEnabled = useFeatureFlag(FeatureFlag.SRM_ENABLE_HEALTHSOURCE_CLOUDWATCH_METRICS)
  const isSumoLogicEnabled = useFeatureFlag(FeatureFlag.SRM_SUMO) || true

  const disabledByFF: string[] = useMemo(() => {
    return getDisabledConnectorsList(isErrorTrackingEnabled, isElkEnabled, isCloudWatchEnabled, isSumoLogicEnabled)
  }, [isErrorTrackingEnabled, isElkEnabled, isCloudWatchEnabled, isSumoLogicEnabled])

  const isCardSelected = useCallback(
    name => {
      if ((product as SelectOption)?.value) {
        const features = getFeatureOption(name, getString, isSplunkMetricEnabled)
        return features.some(el => el?.value === (product as SelectOption)?.value)
      } else {
        // TODO check if this condition is needed
        if (name === Connectors.GCP && (sourceType as HealthSourcesType) === HealthSourcesType.Stackdriver) {
          return true
        }
        return name == sourceType
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSplunkMetricEnabled, product, sourceType]
  )

  const connectorData = useCallback(() => {
    return isTemplate ? (
      <FormMultiTypeConnectorField
        enableConfigureOptions={false}
        name={HealthSourceFormFieldNames.CONNECTOR_REF}
        disabled={!sourceType}
        label={
          <Text color={Color.BLACK} font={'small'} margin={{ bottom: 'small' }}>
            {getString('connectors.selectConnector')}
          </Text>
        }
        placeholder={getString('cv.healthSource.connectors.selectConnector', {
          sourceType: healthSourceTypeMapping(sourceType)
        })}
        accountIdentifier={accountId}
        projectIdentifier={projectIdentifier}
        orgIdentifier={orgIdentifier}
        width={400}
        type={healthSourceTypeMapping(sourceType)}
        multiTypeProps={{ expressions, allowableTypes: AllMultiTypeInputTypesForStep }}
        onChange={(value: any) => {
          const connectorValue =
            value?.scope && value?.scope !== 'project'
              ? `${value.scope}.${value?.record?.identifier}`
              : value?.record?.identifier || value
          setFieldValue(HealthSourceFormFieldNames.CONNECTOR_REF, connectorValue)
        }}
      />
    ) : (
      <FormConnectorReferenceField
        width={400}
        formik={formik}
        type={healthSourceTypeMappingForReferenceField(sourceType, dataSourceType)}
        name={HealthSourceFormFieldNames.CONNECTOR_REF}
        label={
          <Text color={Color.BLACK} font={'small'} margin={{ bottom: 'small' }}>
            {getString('connectors.selectConnector')}
          </Text>
        }
        accountIdentifier={accountId}
        projectIdentifier={projectIdentifier}
        orgIdentifier={orgIdentifier}
        placeholder={getString('cv.healthSource.connectors.selectConnector', {
          sourceType: getConnectorPlaceholderText(sourceType, dataSourceType)
        })}
        disabled={getIsConnectorDisabled({
          isEdit,
          connectorRef: connectorRef as string,
          sourceType,
          dataSourceType,
          isDataSourceTypeSelectorEnabled
        })}
        tooltipProps={{ dataTooltipId: 'selectHealthSourceConnector' }}
      />
    )
  }, [templateType, values])

  const getDetails = (value: string) => {
    switch (getMultiTypeFromValue(value)) {
      case MultiTypeInputType.RUNTIME:
        return MultiTypeInputType.RUNTIME
      case MultiTypeInputType.EXPRESSION:
        return MultiTypeInputType.EXPRESSION
      default:
        return value
    }
  }

  const getDataSourceTypeSelector = (sourceTypeInfo?: string): JSX.Element | null => {
    if (canShowDataSelector(sourceTypeInfo, isDataSourceTypeSelectorEnabled)) {
      return <PrometheusDataSourceTypeSelector isEdit={isEdit} />
    }

    return null
  }

  const getDataInfoSelector = (sourceTypeInfo?: string, dataSourceTypeInfo?: string): JSX.Element | null => {
    if (canShowDataInfoSelector(sourceTypeInfo, dataSourceTypeInfo, isDataSourceTypeSelectorEnabled)) {
      return <DataInfoSelector isEdit={isEdit} />
    }

    return null
  }

  const featureOption = getFeatureOption(sourceType, getString, isSplunkMetricEnabled)
  return (
    <BGColorWrapper className={css.formFullheight}>
      <CardWithOuterTitle title={getString('cv.healthSource.defineHealthSource')}>
        <>
          <Text
            color={Color.BLACK}
            font={'small'}
            margin={{ bottom: 'large' }}
            tooltipProps={{ dataTooltipId: 'selectHealthSourceType' }}
          >
            {getString('cv.healthSource.selectHealthSource')}
          </Text>
          <FormInput.CustomRender
            name={HealthSourceFormFieldNames.SOURCE_TYPE}
            render={() => {
              return (
                <Layout.Horizontal
                  className={cx(css.healthSourceListContainer, {
                    [css.disabled]: isEdit
                  })}
                >
                  {HEALTHSOURCE_LIST.filter(({ name }) => !disabledByFF.includes(name)).map(({ name, icon }) => {
                    const connectorTypeName = getConnectorTypeName(name)

                    return (
                      <div key={name} className={cx(css.squareCardContainer, isEdit && css.disabled)}>
                        <Card
                          disabled={false}
                          interactive={true}
                          selected={isCardSelected(connectorTypeName)}
                          cornerSelected={isCardSelected(connectorTypeName)}
                          className={css.squareCard}
                          onClick={() => {
                            const featureOptionConnectorType = getFeatureOption(
                              connectorTypeName,
                              getString,
                              isSplunkMetricEnabled
                            )
                            setValues((currentValues: any) => {
                              if (!currentValues) {
                                return {}
                              }

                              return {
                                ...currentValues,
                                sourceType: connectorTypeName,
                                dataSourceType: null,
                                product: featureOptionConnectorType.length === 1 ? featureOptionConnectorType[0] : '',
                                [HealthSourceFormFieldNames.CONNECTOR_REF]: null
                              }
                            })
                          }}
                        >
                          <Icon name={icon as IconName} size={26} height={26} />
                        </Card>
                        <Text
                          className={css.healthSourceName}
                          style={{
                            color: name === values.sourceType ? 'var(--grey-900)' : 'var(--grey-350)'
                          }}
                        >
                          {name}
                        </Text>
                      </div>
                    )
                  })}
                </Layout.Horizontal>
              )
            }}
          />
          <Container margin={{ bottom: 'large' }} width={'400px'} color={Color.BLACK}>
            <FormInput.InputWithIdentifier
              isIdentifierEditable={!isEdit}
              inputName="healthSourceName"
              inputLabel={getString('cv.healthSource.nameLabel')}
              inputGroupProps={{
                placeholder: getString('cv.healthSource.namePlaceholder')
              }}
              idName="healthSourceIdentifier"
            />
          </Container>
          <Text font={'small'} color={Color.BLACK}>
            {getString('cv.healthSource.seriveEnvironmentNote', {
              service: templateType ? getDetails(serviceRef) : serviceRef,
              environment: templateType ? getDetails(environmentRef) : environmentRef
            })}
          </Text>
        </>
      </CardWithOuterTitle>
      <CardWithOuterTitle title={getString('cv.healthSource.connectHealthSource')}>
        <>
          {getDataSourceTypeSelector(sourceType)}

          <Container margin={{ bottom: 'large' }} width={'400px'}>
            <div className={css.connectorField}>{connectorData()}</div>
          </Container>
          <Container margin={{ bottom: 'large' }} width={'400px'}>
            <Text
              color={Color.BLACK}
              font={'small'}
              margin={{ bottom: 'small' }}
              tooltipProps={{ dataTooltipId: 'selectFeature' }}
            >
              {featureOption.length === 1
                ? getString('common.purpose.cf.feature')
                : getString('cv.healthSource.featureLabel')}
            </Text>
            <FormInput.Select
              items={featureOption}
              placeholder={getString('cv.healthSource.featurePlaceholder', {
                sourceType: sourceType
              })}
              value={product as SelectOption}
              name={HealthSourceFormFieldNames.PRODUCT}
              disabled={isEdit || featureOption.length === 1}
              onChange={productData => setFieldValue(HealthSourceFormFieldNames.PRODUCT, productData)}
            />
          </Container>

          {getDataInfoSelector(sourceType, dataSourceType)}
        </>
      </CardWithOuterTitle>
      <DrawerFooter
        onNext={() => {
          // This will trigger formik validation
          submitForm()
          onNext(values, { tabStatus: 'SUCCESS' })
        }}
      />
    </BGColorWrapper>
  )
}

export default CommonDefineHealthSource
