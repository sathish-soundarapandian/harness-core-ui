/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Text, Container, Card, Checkbox } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { ServiceCardInterfaceProps, InfrastructureDependencyMetaData } from './SelectServiceCard.types'
import MonitoredServiceCategory from './components/MonitoredServiceCategory/MonitoredServiceCategory'
import K8sNamespaceAndWorkload from './components/K8sNamespaceAndWorkload/K8sNamespaceAndWorkload'
import { getConnectorRefFromChangeSourceService } from './components/SelectServiceCard.utils'
import css from './SelectServiceCard.module.scss'

export default function SelectServiceCard(props: ServiceCardInterfaceProps): JSX.Element | null {
  switch (props.monitoredService?.type) {
    case 'Application':
      return <ServiceCard {...props} />
    case 'Infrastructure':
      return <KubernetesServiceCard {...props} />
    default:
      return null
  }
}

export function ServiceCardContent(props: ServiceCardInterfaceProps): JSX.Element {
  const { monitoredService, dependencyMetaData, onChange } = props
  const { serviceRef, identifier, type } = monitoredService || {}
  const { getString } = useStrings()
  return (
    <Container flex>
      <Container flex>
        <Checkbox
          checked={Boolean(dependencyMetaData)}
          id={serviceRef}
          className={css.selectService}
          onChange={event =>
            onChange(event.currentTarget.checked, {
              monitoredServiceIdentifier: identifier
            })
          }
        />
        <Container>
          <Text>{serviceRef}</Text>
          <Text color={Color.GREY_200} font={{ size: 'small' }}>
            {`${getString('common.ID')}: ${serviceRef}`}
          </Text>
        </Container>
      </Container>
      <MonitoredServiceCategory type={type} />
    </Container>
  )
}

export function ServiceCard(props: ServiceCardInterfaceProps): JSX.Element {
  return (
    <Card className={css.serviceCard}>
      <ServiceCardContent {...props} />
    </Card>
  )
}

export function KubernetesServiceCard(props: ServiceCardInterfaceProps): JSX.Element {
  const { monitoredService, dependencyMetaData, onChange } = props
  const connectorIdentifier = useMemo(
    () => (dependencyMetaData ? getConnectorRefFromChangeSourceService(monitoredService, 'K8sCluster') : undefined),
    [dependencyMetaData, monitoredService]
  )
  return (
    <Card className={css.serviceCard}>
      <ServiceCardContent {...props} />
      <K8sNamespaceAndWorkload
        connectorIdentifier={connectorIdentifier}
        dependencyMetaData={dependencyMetaData as InfrastructureDependencyMetaData}
        onChange={(namespace, workload) =>
          onChange(true, {
            monitoredServiceIdentifier: monitoredService?.identifier,
            dependencyMetadata: {
              type: 'KUBERNETES',
              namespace,
              workload
            }
          })
        }
      />
    </Card>
  )
}
