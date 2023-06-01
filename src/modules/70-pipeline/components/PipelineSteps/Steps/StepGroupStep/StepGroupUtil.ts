/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo } from 'lodash-es'

import type {
  CIVolume,
  ContainerInfraYamlSpec,
  ExecutionWrapperConfig,
  K8sDirectInfra,
  StepGroupElementConfig
} from 'services/cd-ng'
import type { SecurityContext, Toleration } from 'services/ci'
import type { ListUIType } from '@common/components/List/List'
import type { MultiTypeListUIType } from '@common/components/MultiTypeListInputSet/MultiTypeListInputSet'
import type { MapUIType } from '@common/components/Map/Map'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import type { ConnectorRef } from '../StepsTypes'

interface K8sDirectInfraSpec extends Omit<ContainerInfraYamlSpec, 'resources' | 'volumes'> {
  volumes?: string | CIVolume[]
}
export interface K8sDirectInfraStepGroupElementConfig extends StepGroupElementConfig {
  sharedPaths?: any
  stepGroupInfra?: {
    type: K8sDirectInfra['type']
    spec: K8sDirectInfraSpec
  }
}

export interface TolerationFormik extends Toleration {
  id: string
}

export interface StepGroupFormikValues {
  identifier: string
  name: string
  steps?: ExecutionWrapperConfig[]
  type?: 'KubernetesDirect'
  sharedPaths?: ListUIType | string
  connectorRef?: ConnectorRef
  namespace?: string
  volumes?: string | CIVolume[]
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
): K8sDirectInfraStepGroupElementConfig => {
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
    if (values.sharedPaths) {
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

    let tolerations: string | Toleration[] = []
    if (values.tolerations) {
      if (typeof values.tolerations === 'string') {
        tolerations = values.tolerations
      } else {
        tolerations = values.tolerations.map(({ id, ...rest }) => ({
          ...rest
        }))
      }
    }

    return {
      ...values,
      sharedPaths,
      stepGroupInfra: {
        type: 'KubernetesDirect',
        spec: {
          connectorRef: ((values.connectorRef as ConnectorSelectedValue)?.value || values?.connectorRef) as string,
          namespace: defaultTo(values.namespace, ''),
          volumes: values.volumes as any,
          serviceAccountName: values.serviceAccountName,
          initTimeout: values.initTimeout,
          labels: labels as any,
          annotations: annotations as any,
          nodeSelector: nodeSelector as any,
          automountServiceAccountToken: values.automountServiceAccountToken,
          priorityClassName: values.priorityClassName,
          tolerations,
          containerSecurityContext: containerSecurityContext,
          harnessImageConnectorRef: ((values.harnessImageConnectorRef as ConnectorSelectedValue)?.value ||
            values?.harnessImageConnectorRef) as string,
          os: values.os,
          hostNames:
            typeof values.hostNames === 'string'
              ? (values.hostNames as any)
              : values.hostNames?.map((hostName: { id: string; value: string }) => hostName.value)
        }
      }
    }
  }

  return values
}
