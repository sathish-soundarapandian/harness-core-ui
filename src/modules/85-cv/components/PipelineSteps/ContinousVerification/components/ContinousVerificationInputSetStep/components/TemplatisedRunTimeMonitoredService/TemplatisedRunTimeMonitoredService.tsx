/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { AllowedTypes, Card, FormInput, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import React from 'react'
import { useParams } from 'react-router-dom'
import { useFormikContext } from 'formik'
import type { VerifyStepMonitoredService } from '@cv/components/PipelineSteps/ContinousVerification/types'
import { useStrings } from 'framework/strings'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import {
  getFieldLabelForVerifyTemplate,
  getNestedRuntimeInputs
} from '@cv/pages/monitored-service/CVMonitoredService/MonitoredServiceInputSetsTemplate.utils'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  useGetHarnessEnvironments,
  useGetHarnessServices
} from '@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment'
import {
  checkIfRunTimeInput,
  enrichHealthSourceWithVersionForHealthsourceType,
  getMetricDefinitionData,
  getSourceTypeForConnector,
  setCommaSeperatedList,
  showQueriesText
} from '@cv/components/PipelineSteps/ContinousVerification/utils'
import type { UpdatedHealthSourceWithAllSpecs } from '@cv/pages/health-source/types'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { getMultiTypeInputProps } from '../../../ContinousVerificationWidget/components/ContinousVerificationWidgetSections/components/VerificationJobFields/VerificationJobFields.utils'
import { getRunTimeInputsFromHealthSource } from './TemplatisedRunTimeMonitoredService.utils'
import {
  CONNECTOR_REF,
  INDEXES
} from '../../../ContinousVerificationWidget/components/ContinousVerificationWidgetSections/components/SelectMonitoredServiceType/components/MonitoredServiceInputTemplatesHealthSources/MonitoredServiceInputTemplatesHealthSources.constants'
import css from './TemplatisedRunTimeMonitoredService.module.scss'

export interface TemplatisedRunTimeMonitoredServiceProps {
  prefix: string
  monitoredService?: VerifyStepMonitoredService
  expressions: string[]
  allowableTypes: AllowedTypes
}

export default function TemplatisedRunTimeMonitoredService(
  props: TemplatisedRunTimeMonitoredServiceProps
): JSX.Element {
  const { prefix, monitoredService, expressions, allowableTypes } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<PipelineType<ProjectPathProps>>()
  const { getString } = useStrings()
  const { serviceOptions } = useGetHarnessServices()
  const { environmentOptions } = useGetHarnessEnvironments()
  const healthSources = monitoredService?.spec?.templateInputs?.sources?.healthSources || []
  const healthSourcesVariables = monitoredService?.spec?.templateInputs?.variables || []
  const { serviceRef, environmentRef } = monitoredService?.spec?.templateInputs || {}
  const areRunTimeVariablesPresent = healthSourcesVariables?.some(variable => checkIfRunTimeInput(variable?.value))
  const { setFieldValue: onChange } = useFormikContext()

  return (
    <Layout.Vertical>
      {checkIfRunTimeInput(serviceRef) || checkIfRunTimeInput(environmentRef) ? (
        <Card className={css.card}>
          {checkIfRunTimeInput(serviceRef) ? (
            <FormInput.MultiTypeInput
              name={`${prefix}spec.monitoredService.spec.templateInputs.serviceRef`}
              label={getString('service')}
              selectItems={serviceOptions}
              multiTypeInputProps={getMultiTypeInputProps(expressions, allowableTypes)}
              useValue
            />
          ) : null}
          {checkIfRunTimeInput(environmentRef) ? (
            <FormInput.MultiTypeInput
              name={`${prefix}spec.monitoredService.spec.templateInputs.environmentRef`}
              label={getString('environment')}
              selectItems={environmentOptions}
              multiTypeInputProps={getMultiTypeInputProps(expressions, allowableTypes)}
              useValue
            />
          ) : null}
        </Card>
      ) : null}
      {healthSources?.map((healthSourceData: any, index: number) => {
        const spec = healthSourceData?.spec || {}
        const path = `sources.healthSources.${index}.spec`
        const runtimeInputs = getRunTimeInputsFromHealthSource(spec, path)

        // TODO - this can be removed once the templateInputs api gives version also in healthsoure entity.
        const healthSource = enrichHealthSourceWithVersionForHealthsourceType(
          healthSourceData as UpdatedHealthSourceWithAllSpecs
        )

        const { metricDefinitions, metricDefinitionInptsetFormPath } = getMetricDefinitionData(healthSource, path)

        return (
          <Card key={`${healthSource?.name}.${index}`} className={css.card}>
            <Text font={'normal'} color={Color.BLACK} padding={{ bottom: 'medium' }}>
              {/* TODO - healthsource name should also be persisted in templateData */}
              {getString('cv.healthSource.nameLabel')}: {healthSource?.name || healthSource?.identifier}
            </Text>
            {runtimeInputs.length
              ? runtimeInputs.map(input => {
                  if (input.name === CONNECTOR_REF) {
                    return (
                      <FormMultiTypeConnectorField
                        accountIdentifier={accountId}
                        projectIdentifier={projectIdentifier}
                        orgIdentifier={orgIdentifier}
                        width={330}
                        name={`${prefix}spec.monitoredService.spec.templateInputs.${input.path}`}
                        label={getString('connector')}
                        placeholder={getString('cv.healthSource.connectors.selectConnector', {
                          sourceType: getSourceTypeForConnector(healthSource)
                        })}
                        disabled={!getSourceTypeForConnector(healthSource)}
                        setRefValue
                        multiTypeProps={{ allowableTypes, expressions }}
                        type={getSourceTypeForConnector(healthSource) as ConnectorInfoDTO['type']}
                        enableConfigureOptions={false}
                      />
                    )
                  } else {
                    return (
                      <>
                        <FormInput.MultiTextInput
                          key={input.name}
                          name={`${prefix}spec.monitoredService.spec.templateInputs.${input.path}`}
                          label={getFieldLabelForVerifyTemplate(input.name, getString)}
                          multiTextInputProps={{
                            expressions,
                            allowableTypes
                          }}
                        />
                      </>
                    )
                  }
                })
              : null}
            {Array.isArray(metricDefinitions) && metricDefinitions.length ? (
              <Layout.Vertical padding={{ top: 'medium' }}>
                {metricDefinitions.map((item: any, idx: number) => {
                  const runtimeItems = getNestedRuntimeInputs(item, [], `${metricDefinitionInptsetFormPath}.${idx}`)
                  return (
                    <>
                      <Text font={'normal'} color={Color.BLACK} padding={{ bottom: 'medium' }}>
                        {showQueriesText(healthSource)
                          ? getString('cv.query')
                          : getString('cv.monitoringSources.metricLabel')}
                        : {item?.metricName || item?.identifier}
                      </Text>
                      {runtimeItems.map(input => {
                        if (input.name === INDEXES) {
                          return (
                            <FormInput.MultiTextInput
                              key={input.name}
                              name={`${prefix}spec.monitoredService.spec.templateInputs.${input.path}`}
                              label={getFieldLabelForVerifyTemplate(input.name, getString)}
                              onChange={value => {
                                setCommaSeperatedList(
                                  value as string,
                                  onChange,
                                  `${prefix}spec.monitoredService.spec.templateInputs.${input.path}`
                                )
                              }}
                              multiTextInputProps={{
                                expressions,
                                allowableTypes
                              }}
                            />
                          )
                        } else {
                          return (
                            <FormInput.MultiTextInput
                              key={input.name}
                              name={`${prefix}spec.monitoredService.spec.templateInputs.${input.path}`}
                              label={getFieldLabelForVerifyTemplate(input.name, getString)}
                              multiTextInputProps={{
                                expressions,
                                allowableTypes
                              }}
                            />
                          )
                        }
                      })}
                    </>
                  )
                })}
              </Layout.Vertical>
            ) : null}
          </Card>
        )
      })}

      {Boolean(healthSourcesVariables?.length) && (
        <Card className={css.card}>
          {areRunTimeVariablesPresent ? (
            <Text font={'normal'} style={{ paddingBottom: 'medium' }}>
              {getString('common.variables')}
            </Text>
          ) : null}
          {healthSourcesVariables?.map((variable: any, index: number) => {
            if (checkIfRunTimeInput(variable?.value)) {
              return (
                <FormInput.MultiTextInput
                  key={variable?.name}
                  name={`${prefix}spec.monitoredService.spec.templateInputs.variables.${index}.value`}
                  label={variable?.name}
                  multiTextInputProps={{
                    expressions,
                    allowableTypes
                  }}
                />
              )
            }
          })}
        </Card>
      )}
    </Layout.Vertical>
  )
}
