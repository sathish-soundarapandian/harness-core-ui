/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useMutate, UseMutateProps } from 'restful-react'

export interface V1Time {
  /**
   * Non-negative fractions of a second at nanosecond resolution. Negative
   * second values with fractions must still have non-negative nanos values
   * that count forward in time. Must be from 0 to 999,999,999
   * inclusive. This field may be limited in precision depending on context.
   */
  nanos?: number
  /**
   * Represents seconds of UTC time since Unix epoch
   * 1970-01-01T00:00:00Z. Must be from 0001-01-01T00:00:00Z to
   * 9999-12-31T23:59:59Z inclusive.
   */
  seconds?: string
}

export interface V1AgentCredentials {
  privateKey?: string
  publicKey?: string
}

export interface V1DisasterRecoveryNode {
  identifier?: string
  name?: string
  type?: V1DisasterRecoveryType
}

export type V1DisasterRecoveryType = 'UNKNOWN_TYPE' | 'PRIMARY' | 'SECONDARY'

export interface V1AgentComponentHealth {
  k8sError?: string
  message?: string
  status?: Servicev1HealthStatus
  version?: string
}
export type Servicev1HealthStatus = 'HEALTH_STATUS_UNSET' | 'HEALTHY' | 'UNHEALTHY'
export type V1ConnectedStatus = 'CONNECTED_STATUS_UNSET' | 'CONNECTED' | 'DISCONNECTED'

export interface V1AgentHealth {
  argoAppController?: V1AgentComponentHealth
  argoAppSetController?: V1AgentComponentHealth
  argoRedisServer?: V1AgentComponentHealth
  argoRepoServer?: V1AgentComponentHealth
  connectionStatus?: V1ConnectedStatus
  harnessGitopsAgent?: V1AgentComponentHealth
  lastHeartbeat?: string
}
export interface V1AgentMetadata {
  deployedApplicationCount?: number
  existingInstallation?: boolean
  highAvailability?: boolean
  mappedProjects?: Servicev1AppProjectMapping
  namespace?: string
}

export interface Servicev1AppProjectMapping {
  appProjMap?: {
    [key: string]: Servicev1Project
  }
}

export interface Servicev1Project {
  /**
   * Organization Identifier for the Entity.
   */
  orgIdentifier?: string
  /**
   * Project Identifier for the Entity.
   */
  projectIdentifier?: string
}

export interface V1Agent {
  /**
   * Account Identifier for the Entity.
   */
  accountIdentifier?: string
  createdAt?: V1Time
  credentials?: V1AgentCredentials
  description?: string
  disasterRecoveryNode?: V1DisasterRecoveryNode
  health?: V1AgentHealth
  identifier?: string
  lastModifiedAt?: V1Time
  metadata?: V1AgentMetadata
  name?: string
  /**
   * Organization Identifier for the Entity.
   */
  orgIdentifier?: string
  /**
   * Project Identifier for the Entity.
   */
  projectIdentifier?: string
  scope?: V1AgentScope
  tags?: {
    [key: string]: string
  }
  type?: V1AgentType
  upgradeAvailable?: boolean
  version?: V1SemanticVersion
}
export interface V1SemanticVersion {
  major?: string
  minor?: string
  patch?: string
}

export type V1AgentType =
  | 'AGENT_TYPE_UNSET'
  | 'CONNECTED_ARGO_PROVIDER'
  | 'MANAGED_ARGO_PROVIDER'
  | 'HOSTED_ARGO_PROVIDER'
export type V1AgentScope = 'AGENT_SCOPE_UNSET' | 'ACCOUNT' | 'ORG' | 'PROJECT'
export type UseAgentServiceForServerCreateProps = Omit<
  UseMutateProps<V1Agent, GatewayruntimeError, void, V1AgentRequestBody, void>,
  'path' | 'verb'
>

export interface GatewayruntimeError {
  code?: number
  details?: ProtobufAny[]
  error?: string
  message?: string
}

export interface ProtobufAny {
  /**
   * A URL/resource name that uniquely identifies the type of the serialized
   * protocol buffer message. This string must contain at least
   * one "/" character. The last segment of the URL's path must represent
   * the fully qualified name of the type (as in
   * `path/google.protobuf.Duration`). The name should be in a canonical form
   * (e.g., leading "." is not accepted).
   *
   * In practice, teams usually precompile into the binary all types that they
   * expect it to use in the context of Any. However, for URLs which use the
   * scheme `http`, `https`, or no scheme, one can optionally set up a type
   * server that maps type URLs to message definitions as follows:
   *
   * * If no scheme is provided, `https` is assumed.
   * * An HTTP GET on the URL must yield a [google.protobuf.Type][]
   *   value in binary format, or produce an error.
   * * Applications are allowed to cache lookup results based on the
   *   URL, or have them precompiled into a binary to avoid any
   *   lookup. Therefore, binary compatibility needs to be preserved
   *   on changes to types. (Use versioned type names to manage
   *   breaking changes.)
   *
   * Note: this functionality is not currently available in the official
   * protobuf release, and it is not used for type URLs beginning with
   * type.googleapis.com.
   *
   * Schemes other than `http`, `https` (or the empty scheme) might be
   * used with implementation specific semantics.
   */
  type_url?: string
  /**
   * Must be a valid serialized protocol buffer of the above specified type.
   */
  value?: string
}

/**
 * Create agent.
 */
export const useAgentServiceForServerCreate = (props: UseAgentServiceForServerCreateProps) =>
  useMutate<V1Agent, GatewayruntimeError, void, V1AgentRequestBody, void>('POST', `/api/v1/agents`, {
    base: window.getApiBaseUrl('gitops'),
    ...props
  })

export type V1AgentRequestBody = V1Agent
