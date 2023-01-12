/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Card, FormInput, MultiTypeInputType, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import type { HealthSource } from 'services/cv'
import { FormConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/FormConnectorReferenceField'
import { getLabelByName } from '@cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/MonitoredServiceInputSetsTemplate.utils'
import type { UpdatedHealthSourceWithAllSpecs } from '@cv/pages/health-source/types'
import { spacingMedium } from '@cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/MonitoredServiceInputSetsTemplate.constants'
import NoResultsView from '@templates-library/pages/TemplatesPage/views/NoResultsView/NoResultsView'
import {
  enrichHealthSourceWithVersionForHealthsourceType,
  getMetricDefinitionData,
  getSourceTypeForConnector
} from '@cv/components/PipelineSteps/ContinousVerification/utils'
import MetricDefinitionInptsetForm from '../MetricDefinitionInptsetForm/MetricDefinitionInptsetForm'
import css from '@cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/MonitoredServiceInputSetsTemplate.module.scss'

interface HealthSourceInputsetFormInterface {
  healthSources?: HealthSource[]
  isReadOnlyInputSet?: boolean
}

export default function HealthSourceInputsetForm({
  healthSources,
  isReadOnlyInputSet
}: HealthSourceInputsetFormInterface): JSX.Element {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const content = healthSources?.map((healthSourceData, index: number) => {
    const spec = healthSourceData?.spec
    const path = `sources.healthSources.${index}.spec`
    const runtimeInputs = Object.entries(spec)
      .filter(item => item[1] === '<+input>')
      .map(item => {
        return { name: item[0], path: `${path}.${item[0]}` }
      })

    // TODO - this can be removed once the templateInputs api gives version also in healthsoure entity.
    const healthSource = enrichHealthSourceWithVersionForHealthsourceType(
      healthSourceData as UpdatedHealthSourceWithAllSpecs
    )
    const { metricDefinitions, metricDefinitionInptsetFormPath } = getMetricDefinitionData(
      healthSource as UpdatedHealthSourceWithAllSpecs,
      path
    )
    const areMetricDefinitionsPresent = Boolean(Array.isArray(metricDefinitions) && metricDefinitions?.length)

    return (
      <Card key={`${healthSource?.name}.${index}`} className={css.healthSourceInputSet}>
        <Text font={'normal'} color={Color.BLACK} style={{ paddingBottom: spacingMedium }}>
          {getString('cv.healthSource.nameLabel')}: {healthSource?.name}
        </Text>
        {runtimeInputs?.length || areMetricDefinitionsPresent ? (
          runtimeInputs.reverse().map(input => {
            if (input.name === 'connectorRef' && !isReadOnlyInputSet) {
              return (
                <FormConnectorReferenceField
                  width={400}
                  type={getSourceTypeForConnector(healthSource)}
                  name={input.path}
                  label={
                    <Text color={Color.BLACK} font={'small'} margin={{ bottom: 'small' }}>
                      {getString('connectors.selectConnector')}
                    </Text>
                  }
                  accountIdentifier={accountId}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  placeholder={getString('cv.healthSource.connectors.selectConnector', {
                    sourceType: getSourceTypeForConnector(healthSource)
                  })}
                  tooltipProps={{ dataTooltipId: 'selectHealthSourceConnector' }}
                />
              )
            } else {
              return (
                <>
                  <FormInput.MultiTextInput
                    key={input.name}
                    name={input.path}
                    label={getLabelByName(input.name, getString)}
                    multiTextInputProps={{ allowableTypes: [MultiTypeInputType.FIXED] }}
                  />
                </>
              )
            }
          })
        ) : (
          <NoResultsView minimal={true} text={getString('templatesLibrary.noInputsRequired')} />
        )}
        {Boolean(areMetricDefinitionsPresent) && (
          <MetricDefinitionInptsetForm path={metricDefinitionInptsetFormPath} metricDefinitions={metricDefinitions} />
        )}
      </Card>
    )
  })

  if (content?.length) {
    return <>{content}</>
  } else {
    return <></>
  }
}
