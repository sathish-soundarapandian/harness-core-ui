/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, set } from 'lodash-es'
import * as Yup from 'yup'
import type { UseStringsReturn } from 'framework/strings'
import type { SecretReferenceInterface } from '@secrets/utils/SecretField'
import type { HostFilter, HostFilterSpec, PdcInfrastructure } from 'services/cd-ng'
import { getConnectorSchema } from '../PipelineStepsUtil'

export interface PDCInfrastructureYAML {
  hostsType: number
  allowSimultaneousDeployments: boolean
  attributeFilters?: string | { [key: string]: string }
  hosts: string | string[]
  connectorRef?: string
  delegateSelectors?: string[]
  hostFilters?: string | string[]
  hostFilter: HostFilter
  sshKey: SecretReferenceInterface | void
  credentialsRef: string
}

export interface PDCInfrastructureUI {
  hostsType?: number
  allowSimultaneousDeployments?: boolean
  attributeFilters?: string
  hostFilter?: HostFilter
  hosts: string
  connectorRef?: string
  delegateSelectors?: string[]
  hostFilters: string
  sshKey?: SecretReferenceInterface | void
  credentialsRef: string
  serviceType?: string
}

export const PreconfiguredHosts = {
  TRUE: 'true',
  FALSE: 'false'
}

export const HostScope = {
  ALL: 'All',
  HOST_NAME: 'HostNames',
  HOST_ATTRIBUTES: 'HostAttributes'
}

export const parseByComma = (data: string) =>
  defaultTo(
    data
      ?.replace(/,/g, '\n')
      .split('\n')
      .filter(part => part.length)
      .map(part => part.trim()),
    []
  )

export const parseHosts = (hosts: string) => parseByComma(hosts)

export const parseAttributes = (attributes: string) =>
  parseByComma(attributes).reduce((prev, current) => {
    const [key, value] = current.split(':')
    /* istanbul ignore else */
    if (key && value) {
      set(prev, key, value.trim())
    }
    return prev
  }, {})

export type PdcInfrastructureTemplate = { [key in keyof PdcInfrastructure]: string }
export type PdcInfraTemplate = {
  connectorRef?: string
  credentialsRef: string
  delegateSelectors?: string
  hostFilter?: {
    type: HostFilterSpec
    spec?: {
      value: string
    }
  }
  hosts?: string
  hostFilters?: string
  attributeFilters?: string
}

export function getValidationSchemaNoPreconfiguredHosts(getString: UseStringsReturn['getString']): Yup.ObjectSchema {
  return Yup.object().shape({
    credentialsRef: Yup.string().required(getString('fieldRequired', { field: getString('credentials') })),
    hosts: Yup.string().required(
      getString('common.validation.fieldIsRequired', { name: getString('connectors.pdc.hosts') })
    )
  })
}

export function getValidationSchemaHostFilters(getString: UseStringsReturn['getString']): Yup.ObjectSchema {
  return Yup.object().shape({
    connectorRef: getConnectorSchema(getString),
    credentialsRef: Yup.string().required(getString('fieldRequired', { field: getString('credentials') })),
    hostFilters: Yup.string().required(getString('cd.validation.specifyFilter'))
  })
}

export function getValidationSchemaAttributeFilters(getString: UseStringsReturn['getString']): Yup.ObjectSchema {
  return Yup.object().shape({
    connectorRef: getConnectorSchema(getString),
    credentialsRef: Yup.string().required(getString('fieldRequired', { field: getString('credentials') })),
    attributeFilters: Yup.string().required(getString('cd.validation.specifyFilter'))
  })
}

export function getValidationSchemaAll(getString: UseStringsReturn['getString']): Yup.ObjectSchema {
  return Yup.object().shape({
    connectorRef: getConnectorSchema(getString),
    credentialsRef: Yup.string().required(getString('fieldRequired', { field: getString('credentials') }))
  })
}
