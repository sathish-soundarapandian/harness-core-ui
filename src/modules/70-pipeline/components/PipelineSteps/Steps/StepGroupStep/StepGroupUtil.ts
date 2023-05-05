/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo } from 'lodash-es'

import type { StepGroupElementConfig } from 'services/cd-ng'
import type { SecurityContext, Toleration } from 'services/ci'
import type { ListUIType } from '@common/components/List/List'
import type { MultiTypeListUIType } from '@common/components/MultiTypeListInputSet/MultiTypeListInputSet'
import type { MapUIType } from '@common/components/Map/Map'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import type { ConnectorRef } from '../StepsTypes'

export interface CustomStepGroupElementConfig extends StepGroupElementConfig {
  sharedPaths?: string | string[]
  stepGroupInfra?: {
    type: 'KunernetesDirect'
    spec: {
      connectorRef: string
      namespace: string
      volumes?: {
        type?: 'EmptyDir' | 'PersistentVolumeClaim' | 'HostPath'
      }[]
      serviceAccountName?: string
      automountServiceAccountToken?: boolean
      containerSecurityContext?: SecurityContext
      labels?: { [key: string]: string }[]
      annotations?: { [key: string]: string }[]
      nodeSelector?: { [key: string]: string }[]
      hostNames?: string | string[]
      priorityClassName?: string
      runAsUser?: number
      tolerations?: Toleration[]
      initTimeout?: string
      harnessImageConnectorRef?: string
      os?: 'Linux' | 'MacOS' | 'Windows'
    }
  }
}

interface TolerationFormik extends Toleration {
  id: string
}

export interface StepGroupFormikValues {
  identifier: string
  name: string
  type?: 'KunernetesDirect'
  sharedPaths?: ListUIType | string
  connectorRef?: ConnectorRef
  namespace?: string
  volumes?: {
    type?: 'EmptyDir' | 'PersistentVolumeClaim' | 'HostPath'
  }[]
  annotations?: MapUIType
  labels?: MapUIType
  nodeSelector?: MapUIType
  serviceAccountName?: string
  automountServiceAccountToken?: boolean
  priorityClassName?: string
  addCapabilities?: MultiTypeListUIType
  dropCapabilities?: MultiTypeListUIType
  privileged?: boolean
  allowPrivilegeEscalation?: boolean
  runAsNonRoot?: boolean
  readOnlyRootFilesystem?: boolean
  runAsUser?: number
  tolerations?: TolerationFormik[]
  hostNames?: MultiTypeListUIType
  initTimeout?: string
  harnessImageConnectorRef?: ConnectorRef
  os?: 'Linux' | 'MacOS' | 'Windows'
}

export const getModifiedFormikValues = (
  values: StepGroupFormikValues,
  isContainerBasedExecutionEnabled: boolean
): CustomStepGroupElementConfig => {
  if (isContainerBasedExecutionEnabled) {
    const containerSecurityContext: SecurityContext = {
      capabilities: {
        add:
          typeof values.addCapabilities === 'string'
            ? (values.addCapabilities as any)
            : (values.addCapabilities as ListUIType)?.map(
                (capability: { id: string; value: string }) => capability.value
              ),
        drop:
          typeof values.dropCapabilities === 'string'
            ? (values.dropCapabilities as any)
            : (values.dropCapabilities as ListUIType)?.map(
                (capability: { id: string; value: string }) => capability.value
              )
      },
      privileged: values.privileged,
      allowPrivilegeEscalation: values.allowPrivilegeEscalation,
      runAsNonRoot: values.runAsNonRoot,
      readOnlyRootFilesystem: values.readOnlyRootFilesystem,
      runAsUser: values.runAsUser
    }

    let sharedPaths: string[] | string = []
    if (values.sharedPaths && values.sharedPaths.length > 0) {
      sharedPaths =
        typeof values.sharedPaths === 'string'
          ? values.sharedPaths
          : values.sharedPaths.map((listValue: { id: string; value: string }) => listValue.value)
    }

    let labels: { [key: string]: string }[] = []
    if (values.labels && values.labels.length > 0) {
      labels = values.labels.map((listValue: { key: string; value: string }) => ({
        [listValue.key]: listValue.value
      }))
    }

    let annotations: { [key: string]: string }[] = []
    if (values.annotations && values.annotations.length > 0) {
      annotations = values.annotations.map((listValue: { key: string; value: string }) => ({
        [listValue.key]: listValue.value
      }))
    }

    let nodeSelector: { [key: string]: string }[] = []
    if (values.nodeSelector && values.nodeSelector.length > 0) {
      nodeSelector = values.nodeSelector.map((listValue: { key: string; value: string }) => ({
        [listValue.key]: listValue.value
      }))
    }

    let tolerations: Toleration[] = []
    if (values.tolerations && values.tolerations.length > 0) {
      tolerations = values.tolerations.map(({ id, ...rest }) => ({
        ...rest
      }))
    }

    return {
      identifier: values.identifier,
      name: values.name,
      sharedPaths,
      stepGroupInfra: {
        type: 'KunernetesDirect',
        spec: {
          connectorRef: ((values.connectorRef as ConnectorSelectedValue)?.value || values?.connectorRef) as string,
          namespace: defaultTo(values.namespace, ''),
          volumes: values.volumes,
          serviceAccountName: values.serviceAccountName,
          initTimeout: values.initTimeout,
          labels,
          annotations,
          nodeSelector,
          automountServiceAccountToken: values.automountServiceAccountToken,
          priorityClassName: values.priorityClassName,
          tolerations,
          containerSecurityContext: containerSecurityContext,
          harnessImageConnectorRef: ((values.harnessImageConnectorRef as ConnectorSelectedValue)?.value ||
            values?.harnessImageConnectorRef) as string,
          os: values.os,
          hostNames:
            typeof values.hostNames === 'string'
              ? values.hostNames
              : values.hostNames?.map((hostName: { id: string; value: string }) => hostName.value)
        }
      }
    }
  }
  return {
    identifier: values.identifier,
    name: values.name
  }
}
