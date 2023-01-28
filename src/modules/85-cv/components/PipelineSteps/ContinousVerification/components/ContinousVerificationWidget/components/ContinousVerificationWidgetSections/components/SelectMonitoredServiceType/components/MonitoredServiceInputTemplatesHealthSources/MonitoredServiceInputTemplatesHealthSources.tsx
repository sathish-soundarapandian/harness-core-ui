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
import { useStrings } from 'framework/strings'
import {
  getFieldLabelForVerifyTemplate,
  getNestedFields
} from '@cv/pages/monitored-service/CVMonitoredService/MonitoredServiceInputSetsTemplate.utils'
import NoResultsView from '@templates-library/pages/TemplatesPage/views/NoResultsView/NoResultsView'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { TemplateInputs } from '@cv/components/PipelineSteps/ContinousVerification/types'
import {
  enrichHealthSourceWithVersionForHealthsourceType,
  getMetricDefinitionData,
  getSourceTypeForConnector,
  setCommaSeperatedList,
  shouldRenderField,
  showQueriesText
} from '@cv/components/PipelineSteps/ContinousVerification/utils'
import type { UpdatedHealthSourceWithAllSpecs } from '@cv/pages/health-source/types'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { CONNECTOR_REF, IDENTIFIER, INDEXES, NAME } from './MonitoredServiceInputTemplatesHealthSources.constants'

interface MonitoredServiceInputTemplatesHealthSourcesProps {
  templateIdentifier: string
  versionLabel: string
  allowableTypes: AllowedTypes
  healthSources: TemplateInputs['sources']['healthSources']
}

export default function MonitoredServiceInputTemplatesHealthSources(
  props: MonitoredServiceInputTemplatesHealthSourcesProps
): JSX.Element {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<PipelineType<ProjectPathProps>>()
  const { setFieldValue: onChange } = useFormikContext()
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { allowableTypes, healthSources } = props

  return (
    <>
      {healthSources?.map((healthSourceData: any, index: number) => {
        const spec = healthSourceData?.spec || {}
        const path = `sources.healthSources.${index}.spec`
        const fields = Object.entries(spec).map(item => {
          return { name: item[0], path: `${path}.${item[0]}` }
        })

        // TODO - this can be removed once the templateInputs api gives version also in healthsoure entity.
        const healthSource = enrichHealthSourceWithVersionForHealthsourceType(
          healthSourceData as UpdatedHealthSourceWithAllSpecs
        )
        const { metricDefinitions, metricDefinitionInptsetFormPath } = getMetricDefinitionData(healthSource, path)

        return (
          <Card key={`${healthSource?.name}.${index}`}>
            <Text font={'normal'} color={Color.BLACK} padding={{ bottom: 'medium' }}>
              {/* TODO - healthsource name should also be persisted in templateData */}
              {getString('cv.healthSource.nameLabel')}: {healthSource?.name || healthSource?.identifier}
            </Text>
            {fields.length ? (
              fields.map(input => {
                if (input.name === CONNECTOR_REF) {
                  return (
                    <FormMultiTypeConnectorField
                      accountIdentifier={accountId}
                      projectIdentifier={projectIdentifier}
                      orgIdentifier={orgIdentifier}
                      width={400}
                      name={`spec.monitoredService.spec.templateInputs.${input.path}`}
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
                } else if (shouldRenderField(input)) {
                  return (
                    <FormInput.MultiTextInput
                      key={input.name}
                      name={`spec.monitoredService.spec.templateInputs.${input.path}`}
                      label={getFieldLabelForVerifyTemplate(input.name, getString)}
                      multiTextInputProps={{
                        expressions,
                        allowableTypes
                      }}
                    />
                  )
                }
              })
            ) : (
              <NoResultsView text={'No Runtime inputs available'} minimal={true} />
            )}
            {Array.isArray(metricDefinitions) && metricDefinitions.length ? (
              <Layout.Vertical padding={{ top: 'medium' }}>
                {metricDefinitions.map((item: any, idx: number) => {
                  const metricDefinitionFields = getNestedFields(item, [], `${metricDefinitionInptsetFormPath}.${idx}`)
                  return (
                    <>
                      <Text font={'normal'} color={Color.BLACK} padding={{ bottom: 'medium' }}>
                        {showQueriesText(healthSource)
                          ? getString('cv.query')
                          : getString('cv.monitoringSources.metricLabel')}
                        : {item?.metricName || item?.identifier}
                      </Text>
                      {metricDefinitionFields.map(input => {
                        if (input.name === INDEXES) {
                          return (
                            <FormInput.MultiTextInput
                              key={input.name}
                              name={`spec.monitoredService.spec.templateInputs.${input.path}`}
                              label={getFieldLabelForVerifyTemplate(input.name, getString)}
                              onChange={value =>
                                setCommaSeperatedList(
                                  value as string,
                                  onChange,
                                  `spec.monitoredService.spec.templateInputs.${input.path}`
                                )
                              }
                              multiTextInputProps={{
                                expressions,
                                allowableTypes
                              }}
                            />
                          )
                        } else if (input.name !== IDENTIFIER && input.name !== NAME) {
                          return (
                            <FormInput.MultiTextInput
                              key={input.name}
                              name={`spec.monitoredService.spec.templateInputs.${input.path}`}
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
    </>
  )
}
