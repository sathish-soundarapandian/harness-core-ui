/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { UseGetProps, useMutate, UseMutateProps, useGet } from 'restful-react'

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

export interface RepositoriesRefs {
  branches?: string[]
  tags?: string[]
}
export interface AgentRepositoryServiceListRefsQueryParams {
  /**
   * Account Identifier for the Entity.
   */
  accountIdentifier?: string
  /**
   * Organization Identifier for the Entity.
   */
  orgIdentifier?: string
  /**
   * Project Identifier for the Entity.
   */
  projectIdentifier?: string
  /**
   * Repo URL for query.
   */
  'query.repo'?: string
  /**
   * Whether to force a cache refresh on repo's connection state.
   */
  'query.forceRefresh'?: boolean
  /**
   * The associated project project.
   */
  'query.project'?: string
}

export interface AgentRepositoryServiceListRefsPathParams {
  /**
   * Agent identifier for entity.
   */
  agentIdentifier: string
  identifier: string
}

export type UseAgentRepositoryServiceListRefsProps = Omit<
  UseGetProps<
    RepositoriesRefs,
    GatewayruntimeError,
    AgentRepositoryServiceListRefsQueryParams,
    AgentRepositoryServiceListRefsPathParams
  >,
  'path'
> &
  AgentRepositoryServiceListRefsPathParams

/**
 * Returns a list of refs (e.g. branches and tags) in the repo
 *
 * Returns a list of refs (e.g. branches and tags) in the repo.
 */
export const useAgentRepositoryServiceListRefs = ({
  agentIdentifier,
  identifier,
  ...props
}: UseAgentRepositoryServiceListRefsProps) =>
  useGet<
    RepositoriesRefs,
    GatewayruntimeError,
    AgentRepositoryServiceListRefsQueryParams,
    AgentRepositoryServiceListRefsPathParams
  >(
    (paramsInPath: AgentRepositoryServiceListRefsPathParams) =>
      `/api/v1/agents/${paramsInPath.agentIdentifier}/repositories/${paramsInPath.identifier}/refs`,
    { base: window.getApiBaseUrl('gitops'), pathParams: { agentIdentifier, identifier }, ...props }
  )

export interface CommonsConnectionState {
  attemptedAt?: V1Time
  message?: string
  status?: string
}

export interface RepositoriesRepository {
  connectionState?: CommonsConnectionState
  connectionType?: string
  /**
   * EnableLFS specifies whether git-lfs support should be enabled for this repo. Only valid for Git repositories.
   */
  enableLfs?: boolean
  enableOCI?: boolean
  githubAppEnterpriseBaseUrl?: string
  githubAppID?: string
  githubAppInstallationID?: string
  githubAppPrivateKey?: string
  inheritedCreds?: boolean
  insecure?: boolean
  insecureIgnoreHostKey?: boolean
  name?: string
  password?: string
  project?: string
  proxy?: string
  repo?: string
  /**
   * SSHPrivateKey contains the PEM data for authenticating at the repo server. Only used with Git repos.
   */
  sshPrivateKey?: string
  tlsClientCertData?: string
  tlsClientCertKey?: string
  /**
   * Type specifies the type of the repo. Can be either "git" or "helm. "git" is assumed if empty or absent.
   */
  type?: string
  username?: string
}

export interface Servicev1Repository {
  /**
   * Account Identifier for the Entity.
   */
  accountIdentifier?: string
  /**
   * Agent identifier for entity.
   */
  agentIdentifier?: string
  createdAt?: string
  identifier?: string
  lastModifiedAt?: string
  /**
   * Organization Identifier for the Entity.
   */
  orgIdentifier?: string
  /**
   * Project Identifier for the Entity.
   */
  projectIdentifier?: string
  repository?: RepositoriesRepository
  repositoryCredentialsId?: string
  stale?: boolean
}

export interface AgentRepositoryServiceCreateRepositoryQueryParams {
  /**
   * Account Identifier for the Entity.
   */
  accountIdentifier?: string
  /**
   * Organization Identifier for the Entity.
   */
  orgIdentifier?: string
  /**
   * Project Identifier for the Entity.
   */
  projectIdentifier?: string
  identifier?: string
  repoCredsId?: string
}

export interface RepositoriesRepoCreateRequest {
  credsOnly?: boolean
  repo?: RepositoriesRepository
  upsert?: boolean
}

export interface AgentRepositoryServiceCreateRepositoryPathParams {
  /**
   * Agent identifier for entity.
   */
  agentIdentifier: string
}

export type UseAgentRepositoryServiceCreateRepositoryProps = Omit<
  UseMutateProps<
    Servicev1Repository,
    GatewayruntimeError,
    AgentRepositoryServiceCreateRepositoryQueryParams,
    RepositoriesRepoCreateRequest,
    AgentRepositoryServiceCreateRepositoryPathParams
  >,
  'path' | 'verb'
> &
  AgentRepositoryServiceCreateRepositoryPathParams

/**
 * CreateRepository creates a new repository configuration
 *
 * CreateRepository creates a new repository configuration.
 */
export const useAgentRepositoryServiceCreateRepository = ({
  agentIdentifier,
  ...props
}: UseAgentRepositoryServiceCreateRepositoryProps) =>
  useMutate<
    Servicev1Repository,
    GatewayruntimeError,
    AgentRepositoryServiceCreateRepositoryQueryParams,
    RepositoriesRepoCreateRequest,
    AgentRepositoryServiceCreateRepositoryPathParams
  >(
    'POST',
    (paramsInPath: AgentRepositoryServiceCreateRepositoryPathParams) =>
      `/api/v1/agents/${paramsInPath.agentIdentifier}/repositories`,
    { base: window.getApiBaseUrl('gitops'), pathParams: { agentIdentifier }, ...props }
  )

export interface V1FieldsV1 {
  /**
   * Raw is the underlying serialization of this object.
   */
  Raw?: string
}

/**
 * ManagedFieldsEntry is a workflow-id, a FieldSet and the group version of the resource
 * that the fieldset applies to.
 */
export interface V1ManagedFieldsEntry {
  /**
   * APIVersion defines the version of this resource that this field set
   * applies to. The format is "group/version" just like the top-level
   * APIVersion field. It is necessary to track the version of a field
   * set because it cannot be automatically converted.
   */
  apiVersion?: string
  fieldsType?: string
  fieldsV1?: V1FieldsV1
  /**
   * Manager is an identifier of the workflow managing these fields.
   */
  manager?: string
  /**
   * Operation is the type of operation which lead to this ManagedFieldsEntry being created.
   * The only valid values for this field are 'Apply' and 'Update'.
   */
  operation?: string
  /**
   * Subresource is the name of the subresource used to update that object, or
   * empty string if the object was updated through the main resource. The
   * value of this field is used to distinguish between managers, even if they
   * share the same name. For example, a status update will be distinct from a
   * regular update using the same manager name.
   * Note that the APIVersion field is not related to the Subresource field and
   * it always corresponds to the version of the main resource.
   */
  subresource?: string
  time?: V1Time
}

export interface V1OwnerReference {
  /**
   * API version of the referent.
   */
  apiVersion?: string
  blockOwnerDeletion?: boolean
  controller?: boolean
  kind?: string
  name?: string
  uid?: string
}

/**
 * ObjectMeta is metadata that all persisted resources must have, which includes all objects
 * users must create.
 */
export interface V1ObjectMeta {
  annotations?: {
    [key: string]: string
  }
  /**
   * Deprecated: ClusterName is a legacy field that was always cleared by
   * the system and never used; it will be removed completely in 1.25.
   *
   * The name in the go struct is changed to help clients detect
   * accidental use.
   *
   * +optional
   */
  clusterName?: string
  creationTimestamp?: V1Time
  deletionGracePeriodSeconds?: string
  deletionTimestamp?: V1Time
  finalizers?: string[]
  /**
   * GenerateName is an optional prefix, used by the server, to generate a unique
   * name ONLY IF the Name field has not been provided.
   * If this field is used, the name returned to the client will be different
   * than the name passed. This value will also be combined with a unique suffix.
   * The provided value has the same validation rules as the Name field,
   * and may be truncated by the length of the suffix required to make the value
   * unique on the server.
   *
   * If this field is specified and the generated name exists, the server will return a 409.
   *
   * Applied only if Name is not specified.
   * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#idempotency
   * +optional
   */
  generateName?: string
  generation?: string
  labels?: {
    [key: string]: string
  }
  /**
   * ManagedFields maps workflow-id and version to the set of fields
   * that are managed by that workflow. This is mostly for internal
   * housekeeping, and users typically shouldn't need to set or
   * understand this field. A workflow can be the user's name, a
   * controller's name, or the name of a specific apply path like
   * "ci-cd". The set of fields is always in the version that the
   * workflow used when modifying the object.
   *
   * +optional
   */
  managedFields?: V1ManagedFieldsEntry[]
  name?: string
  /**
   * Namespace defines the space within which each name must be unique. An empty namespace is
   * equivalent to the "default" namespace, but "default" is the canonical representation.
   * Not all objects are required to be scoped to a namespace - the value of this field for
   * those objects will be empty.
   *
   * Must be a DNS_LABEL.
   * Cannot be updated.
   * More info: http://kubernetes.io/docs/user-guide/namespaces
   * +optional
   */
  namespace?: string
  ownerReferences?: V1OwnerReference[]
  /**
   * An opaque value that represents the internal version of this object that can
   * be used by clients to determine when objects have changed. May be used for optimistic
   * concurrency, change detection, and the watch operation on a resource or set of resources.
   * Clients must treat these values as opaque and passed unmodified back to the server.
   * They may only be valid for a particular resource or set of resources.
   *
   * Populated by the system.
   * Read-only.
   * Value must be treated as opaque by clients and .
   * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency
   * +optional
   */
  resourceVersion?: string
  selfLink?: string
  /**
   * UID is the unique in time and space value for this object. It is typically generated by
   * the server on successful creation of a resource and is not allowed to change on PUT
   * operations.
   *
   * Populated by the system.
   * Read-only.
   * More info: http://kubernetes.io/docs/user-guide/identifiers#uids
   * +optional
   */
  uid?: string
}

export interface ApplicationsInfo {
  name?: string
  value?: string
}

export interface ApplicationsOperationInitiator {
  /**
   * Automated is set to true if operation was initiated automatically by the application controller.
   */
  automated?: boolean
  username?: string
}

export interface ApplicationsBackoff {
  duration?: string
  factor?: string
  maxDuration?: string
}
export interface ApplicationsRetryStrategy {
  backoff?: ApplicationsBackoff
  /**
   * Limit is the maximum number of attempts for retrying a failed sync. If set to 0, no retries will be performed.
   */
  limit?: string
}

/**
 * SyncOperationResource contains resources to sync.
 */
export interface ApplicationsSyncOperationResource {
  group?: string
  kind?: string
  name?: string
  namespace?: string
}

export interface ApplicationsJsonnetVar {
  code?: boolean
  name?: string
  value?: string
}

export interface ApplicationsApplicationSourceJsonnet {
  extVars?: ApplicationsJsonnetVar[]
  libs?: string[]
  tlas?: ApplicationsJsonnetVar[]
}
export interface ApplicationsApplicationSourceDirectory {
  exclude?: string
  include?: string
  jsonnet?: ApplicationsApplicationSourceJsonnet
  recurse?: boolean
}

export interface ApplicationsHelmFileParameter {
  name?: string
  path?: string
}

export interface ApplicationsHelmParameter {
  forceString?: boolean
  name?: string
  value?: string
}
export interface ApplicationsApplicationSourceHelm {
  fileParameters?: ApplicationsHelmFileParameter[]
  parameters?: ApplicationsHelmParameter[]
  passCredentials?: boolean
  releaseName?: string
  valueFiles?: string[]
  values?: string
  version?: string
}

export interface ApplicationsKsonnetParameter {
  component?: string
  name?: string
  value?: string
}

export interface ApplicationsApplicationSourceKsonnet {
  environment?: string
  parameters?: ApplicationsKsonnetParameter[]
}

export interface ApplicationsApplicationSourceKustomize {
  commonAnnotations?: {
    [key: string]: string
  }
  commonLabels?: {
    [key: string]: string
  }
  forceCommonAnnotations?: boolean
  forceCommonLabels?: boolean
  images?: string[]
  namePrefix?: string
  nameSuffix?: string
  version?: string
}

export interface ApplicationsEnvEntry {
  name?: string
  value?: string
}

export interface ApplicationsApplicationSourcePlugin {
  env?: ApplicationsEnvEntry[]
  name?: string
}

export interface ApplicationsApplicationSource {
  /**
   * Chart is a Helm chart name, and must be specified for applications sourced from a Helm repo.
   */
  chart?: string
  directory?: ApplicationsApplicationSourceDirectory
  helm?: ApplicationsApplicationSourceHelm
  ksonnet?: ApplicationsApplicationSourceKsonnet
  kustomize?: ApplicationsApplicationSourceKustomize
  /**
   * Path is a directory path within the Git repository, and is only valid for applications sourced from Git.
   */
  path?: string
  plugin?: ApplicationsApplicationSourcePlugin
  repoURL?: string
  /**
   * TargetRevision defines the revision of the source to sync the application to.
   * In case of Git, this can be commit, tag, or branch. If omitted, will equal to HEAD.
   * In case of Helm, this is a semver tag for the Chart's version.
   */
  targetRevision?: string
}

export interface ApplicationsSyncStrategyApply {
  /**
   * Force indicates whether or not to supply the --force flag to `kubectl apply`.
   * The --force flag deletes and re-create the resource, when PATCH encounters conflict and has
   * retried for 5 times.
   */
  force?: boolean
}

/**
 * SyncStrategyHook will perform a sync using hooks annotations.
 * If no hook annotation is specified falls back to `kubectl apply`.
 */
export interface ApplicationsSyncStrategyHook {
  syncStrategyApply?: ApplicationsSyncStrategyApply
}

export interface ApplicationsSyncStrategy {
  apply?: ApplicationsSyncStrategyApply
  hook?: ApplicationsSyncStrategyHook
}

/**
 * SyncOperation contains details about a sync operation.
 */
export interface ApplicationsSyncOperation {
  dryRun?: boolean
  manifests?: string[]
  prune?: boolean
  resources?: ApplicationsSyncOperationResource[]
  /**
   * Revision is the revision (Git) or chart version (Helm) which to sync the application to
   * If omitted, will use the revision specified in app spec.
   */
  revision?: string
  source?: ApplicationsApplicationSource
  syncOptions?: string[]
  syncStrategy?: ApplicationsSyncStrategy
}

export interface ApplicationsOperation {
  info?: ApplicationsInfo[]
  initiatedBy?: ApplicationsOperationInitiator
  retry?: ApplicationsRetryStrategy
  sync?: ApplicationsSyncOperation
}

export interface ApplicationsApplicationDestination {
  name?: string
  namespace?: string
  server?: string
}

/**
 * ResourceIgnoreDifferences contains resource filter and list of json paths which should be ignored during comparison with live state.
 */
export interface ApplicationsResourceIgnoreDifferences {
  group?: string
  jqPathExpressions?: string[]
  jsonPointers?: string[]
  kind?: string
  managedFieldsManagers?: string[]
  name?: string
  namespace?: string
}

export interface ApplicationsSyncPolicyAutomated {
  allowEmpty?: boolean
  prune?: boolean
  selfHeal?: boolean
}

export interface ApplicationsSyncPolicy {
  automated?: ApplicationsSyncPolicyAutomated
  retry?: ApplicationsRetryStrategy
  syncOptions?: string[]
}

/**
 * ApplicationSpec represents desired application state. Contains link to repository with application definition and additional parameters link definition revision.
 */
export interface ApplicationsApplicationSpec {
  destination?: ApplicationsApplicationDestination
  ignoreDifferences?: ApplicationsResourceIgnoreDifferences[]
  info?: ApplicationsInfo[]
  /**
   * Project is a reference to the project this application belongs to.
   * The empty string means that application belongs to the 'default' project.
   */
  project?: string
  /**
   * RevisionHistoryLimit limits the number of items kept in the application's revision history, which is used for informational purposes as well as for rollbacks to previous versions.
   * This should only be changed in exceptional circumstances.
   * Setting to zero will store no history. This will reduce storage used.
   * Increasing will increase the space used to store the history, so we do not recommend increasing it.
   * Default is 10.
   */
  revisionHistoryLimit?: string
  source?: ApplicationsApplicationSource
  syncPolicy?: ApplicationsSyncPolicy
}

export interface ApplicationsApplicationCondition {
  lastTransitionTime?: V1Time
  message?: string
  type?: string
}

export interface ApplicationsHealthStatus {
  message?: string
  status?: string
}

export interface ApplicationsResourceResult {
  group?: string
  /**
   * HookPhase contains the state of any operation associated with this resource OR hook
   * This can also contain values for non-hook resources.
   */
  hookPhase?: string
  hookType?: string
  kind?: string
  message?: string
  name?: string
  namespace?: string
  status?: string
  syncPhase?: string
  version?: string
}

export interface ApplicationsSyncOperationResult {
  resources?: ApplicationsResourceResult[]
  revision?: string
  source?: ApplicationsApplicationSource
}
export interface ApplicationsOperationState {
  finishedAt?: V1Time
  finishedAtTs?: string
  /**
   * Message holds any pertinent messages when attempting to perform operation (typically errors).
   */
  message?: string
  operation?: ApplicationsOperation
  phase?: string
  retryCount?: string
  startedAt?: V1Time
  startedAtTs?: string
  syncResult?: ApplicationsSyncOperationResult
}

export interface ApplicationsRevisionHistory {
  deployStartedAt?: V1Time
  deployedAt?: V1Time
  id?: string
  revision?: string
  source?: ApplicationsApplicationSource
}

export interface ApplicationsResourceStatus {
  group?: string
  health?: ApplicationsHealthStatus
  hook?: boolean
  kind?: string
  name?: string
  namespace?: string
  requiresPruning?: boolean
  status?: string
  version?: string
}

export interface ApplicationsApplicationSummary {
  /**
   * ExternalURLs holds all external URLs of application child resources.
   */
  externalURLs?: string[]
  /**
   * Images holds all images of application child resources.
   */
  images?: string[]
}
export interface ApplicationsApplicationStatus {
  conditions?: ApplicationsApplicationCondition[]
  health?: ApplicationsHealthStatus
  history?: ApplicationsRevisionHistory[]
  observedAt?: V1Time
  operationState?: ApplicationsOperationState
  reconciledAt?: V1Time
  resources?: ApplicationsResourceStatus[]
  sourceType?: string
  summary?: ApplicationsApplicationSummary
  sync?: ApplicationsSyncStatus
}

export interface ApplicationsComparedTo {
  destination?: ApplicationsApplicationDestination
  source?: ApplicationsApplicationSource
}
export interface ApplicationsSyncStatus {
  comparedTo?: ApplicationsComparedTo
  revision?: string
  status?: string
}

export interface ApplicationsApplication {
  metadata?: V1ObjectMeta
  operation?: ApplicationsOperation
  spec?: ApplicationsApplicationSpec
  status?: ApplicationsApplicationStatus
}
export interface Servicev1Application {
  /**
   * Account Identifier for the Entity.
   */
  accountIdentifier?: string
  /**
   * Agent identifier for entity.
   */
  agentIdentifier?: string
  app?: ApplicationsApplication
  clusterIdentifier?: string
  createdAt?: string
  lastModifiedAt?: string
  name?: string
  /**
   * Organization Identifier for the Entity.
   */
  orgIdentifier?: string
  /**
   * Project Identifier for the Entity.
   */
  projectIdentifier?: string
  repoIdentifier?: string
  stale?: boolean
}

export interface V1Repositorylist {
  content?: Servicev1Repository[]
  empty?: boolean
  pageIndex?: number
  pageItemCount?: number
  pageSize?: number
  totalItems?: number
  totalPages?: number
}

export interface V1RepositoryQuery {
  /**
   * Account Identifier for the Entity.
   */
  accountIdentifier?: string
  /**
   * Agent identifier for entity.
   */
  agentIdentifier?: string
  /**
   * Filters for Repositories. Eg. "identifier": { "$in": ["id1", "id2"]
   */
  filter?: { [key: string]: any }
  identifier?: string
  /**
   * Organization Identifier for the Entity.
   */
  orgIdentifier?: string
  pageIndex?: number
  pageSize?: number
  /**
   * Project Identifier for the Entity.
   */
  projectIdentifier?: string
  repoCredsId?: string
  searchTerm?: string
}

export type UseRepositoryServiceListRepositoriesProps = Omit<
  UseMutateProps<V1Repositorylist, GatewayruntimeError, void, V1RepositoryQuery, void>,
  'path' | 'verb'
>

/**
 * List returns list of Repositories
 *
 * List returns list of Repositories
 */
export const useRepositoryServiceListRepositories = (props: UseRepositoryServiceListRepositoriesProps) =>
  useMutate<V1Repositorylist, GatewayruntimeError, void, V1RepositoryQuery, void>('POST', `/api/v1/repositories`, {
    base: window.getApiBaseUrl('gitops'),
    ...props
  })

export interface AgentApplicationServiceCreatePathParams {
  /**
   * Agent identifier for entity.
   */
  agentIdentifier: string
}

export interface ApplicationsApplicationCreateRequest {
  application?: ApplicationsApplication
  project?: string
  upsert?: boolean
  validate?: boolean
}

export interface AgentApplicationServiceCreateQueryParams {
  /**
   * Account Identifier for the Entity.
   */
  accountIdentifier?: string
  /**
   * Organization Identifier for the Entity.
   */
  orgIdentifier?: string
  /**
   * Project Identifier for the Entity.
   */
  projectIdentifier?: string
  clusterIdentifier?: string
  repoIdentifier?: string
}

export type UseAgentApplicationServiceCreateProps = Omit<
  UseMutateProps<
    Servicev1Application,
    GatewayruntimeError,
    AgentApplicationServiceCreateQueryParams,
    ApplicationsApplicationCreateRequest,
    AgentApplicationServiceCreatePathParams
  >,
  'path' | 'verb'
> &
  AgentApplicationServiceCreatePathParams

/**
 * Create creates an application
 *
 * Creates application in project.
 */
export const useAgentApplicationServiceCreate = ({
  agentIdentifier,
  ...props
}: UseAgentApplicationServiceCreateProps) =>
  useMutate<
    Servicev1Application,
    GatewayruntimeError,
    AgentApplicationServiceCreateQueryParams,
    ApplicationsApplicationCreateRequest,
    AgentApplicationServiceCreatePathParams
  >(
    'POST',
    (paramsInPath: AgentApplicationServiceCreatePathParams) =>
      `/api/v1/agents/${paramsInPath.agentIdentifier}/applications`,
    { base: window.getApiBaseUrl('gitops'), pathParams: { agentIdentifier }, ...props }
  )

export interface RepositoriesAppInfo {
  path?: string
  type?: string
}

export interface ClustersClusterCacheInfo {
  apisCount?: string
  lastCacheSyncTime?: V1Time
  resourcesCount?: string
}

export interface ClustersAWSAuthConfig {
  clusterName?: string
  /**
   * RoleARN contains optional role ARN. If set then AWS IAM Authenticator assume a role to perform cluster operations instead of the default AWS credential provider chain.
   */
  roleARN?: string
}

export interface ClustersExecProviderConfig {
  apiVersion?: string
  args?: string[]
  command?: string
  env?: {
    [key: string]: string
  }
  installHint?: string
}
export interface ClustersTLSClientConfig {
  caData?: string
  certData?: string
  /**
   * Insecure specifies that the server should be accessed without verifying the TLS certificate. For testing only.
   */
  insecure?: boolean
  keyData?: string
  /**
   * ServerName is passed to the server for SNI and is used in the client to check server
   * certificates against. If ServerName is empty, the hostname used to contact the
   * server is used.
   */
  serverName?: string
}

/**
 * ClusterConfig is the configuration attributes. This structure is subset of the go-client
 * rest.Config with annotations added for marshalling.
 */
export interface ClustersClusterConfig {
  awsAuthConfig?: ClustersAWSAuthConfig
  /**
   * Server requires Bearer authentication. This client will not attempt to use
   * refresh tokens for an OAuth2 flow.
   * TODO: demonstrate an OAuth2 compatible client.
   */
  bearerToken?: string
  clusterConnectionType?: string
  execProviderConfig?: ClustersExecProviderConfig
  password?: string
  tlsClientConfig?: ClustersTLSClientConfig
  username?: string
}

export interface ClustersClusterInfo {
  apiVersions?: string[]
  applicationsCount?: string
  cacheInfo?: ClustersClusterCacheInfo
  connectionState?: CommonsConnectionState
  serverVersion?: string
}

export interface ClustersCluster {
  annotations?: {
    [key: string]: string
  }
  /**
   * Indicates if cluster level resources should be managed. This setting is used only if cluster is connected in a namespaced mode.
   */
  clusterResources?: boolean
  config?: ClustersClusterConfig
  connectionState?: CommonsConnectionState
  info?: ClustersClusterInfo
  labels?: {
    [key: string]: string
  }
  name?: string
  /**
   * Holds list of namespaces which are accessible in that cluster. Cluster level resources will be ignored if namespace list is not empty.
   */
  namespaces?: string[]
  project?: string
  refreshRequestedAt?: V1Time
  server?: string
  serverVersion?: string
  /**
   * Shard contains optional shard number. Calculated on the fly by the application controller if not specified.
   */
  shard?: string
}
export interface Servicev1Cluster {
  /**
   * Account Identifier for the Entity.
   */
  accountIdentifier?: string
  /**
   * Agent identifier for entity.
   */
  agentIdentifier?: string
  cluster?: ClustersCluster
  createdAt?: string
  identifier?: string
  lastModifiedAt?: string
  /**
   * Organization Identifier for the Entity.
   */
  orgIdentifier?: string
  /**
   * Project Identifier for the Entity.
   */
  projectIdentifier?: string
  stale?: boolean
  tags?: {
    [key: string]: string
  }
}

export interface AgentClusterServiceCreateQueryParams {
  /**
   * Account Identifier for the Entity.
   */
  accountIdentifier?: string
  /**
   * Organization Identifier for the Entity.
   */
  orgIdentifier?: string
  /**
   * Project Identifier for the Entity.
   */
  projectIdentifier?: string
  identifier?: string
}

export interface ClustersClusterCreateRequest {
  cluster?: ClustersCluster
  tags?: {
    [key: string]: string
  }
  upsert?: boolean
}

export interface AgentClusterServiceCreatePathParams {
  /**
   * Agent identifier for entity.
   */
  agentIdentifier: string
}

export type UseAgentClusterServiceCreateProps = Omit<
  UseMutateProps<
    Servicev1Cluster,
    GatewayruntimeError,
    AgentClusterServiceCreateQueryParams,
    ClustersClusterCreateRequest,
    AgentClusterServiceCreatePathParams
  >,
  'path' | 'verb'
> &
  AgentClusterServiceCreatePathParams

/**
 * Create creates a cluster
 *
 * Create clusters.
 */
export const useAgentClusterServiceCreate = ({ agentIdentifier, ...props }: UseAgentClusterServiceCreateProps) =>
  useMutate<
    Servicev1Cluster,
    GatewayruntimeError,
    AgentClusterServiceCreateQueryParams,
    ClustersClusterCreateRequest,
    AgentClusterServiceCreatePathParams
  >(
    'POST',
    (paramsInPath: AgentClusterServiceCreatePathParams) => `/api/v1/agents/${paramsInPath.agentIdentifier}/clusters`,
    { base: window.getApiBaseUrl('gitops'), pathParams: { agentIdentifier }, ...props }
  )

export interface AgentRepositoryServiceListAppsQueryParams {
  /**
   * Account Identifier for the Entity.
   */
  accountIdentifier?: string
  /**
   * Organization Identifier for the Entity.
   */
  orgIdentifier?: string
  /**
   * Project Identifier for the Entity.
   */
  projectIdentifier?: string
  'query.repo'?: string
  'query.revision'?: string
  'query.appName'?: string
  'query.appProject'?: string
}

export interface RepositoriesRepoAppsResponse {
  items?: RepositoriesAppInfo[]
}

export interface AgentRepositoryServiceListAppsPathParams {
  /**
   * Agent identifier for entity.
   */
  agentIdentifier: string
  identifier: string
}

export type UseAgentRepositoryServiceListAppsProps = Omit<
  UseGetProps<
    RepositoriesRepoAppsResponse,
    GatewayruntimeError,
    AgentRepositoryServiceListAppsQueryParams,
    AgentRepositoryServiceListAppsPathParams
  >,
  'path'
> &
  AgentRepositoryServiceListAppsPathParams

/**
 * ListApps returns list of apps in the repo
 *
 * ListApps returns list of apps in the repo.
 */
export const useAgentRepositoryServiceListApps = ({
  agentIdentifier,
  identifier,
  ...props
}: UseAgentRepositoryServiceListAppsProps) =>
  useGet<
    RepositoriesRepoAppsResponse,
    GatewayruntimeError,
    AgentRepositoryServiceListAppsQueryParams,
    AgentRepositoryServiceListAppsPathParams
  >(
    (paramsInPath: AgentRepositoryServiceListAppsPathParams) =>
      `/api/v1/agents/${paramsInPath.agentIdentifier}/repositories/${paramsInPath.identifier}/apps`,
    { base: window.getApiBaseUrl('gitops'), pathParams: { agentIdentifier, identifier }, ...props }
  )

export interface AgentServiceForServerListQueryParams {
  /**
   * Account Identifier for the Entity.
   */
  accountIdentifier?: string
  /**
   * Project Identifier for the Entity.
   */
  projectIdentifier?: string
  /**
   * Organization Identifier for the Entity.
   */
  orgIdentifier?: string
  identifier?: string
  name?: string
  type?: 'AGENT_TYPE_UNSET' | 'CONNECTED_ARGO_PROVIDER' | 'MANAGED_ARGO_PROVIDER'
  tags?: string[]
  searchTerm?: string
  pageSize?: number
  pageIndex?: number
  scope?: 'AGENT_SCOPE_UNSET' | 'ACCOUNT' | 'ORG' | 'PROJECT'
  drIdentifier?: string
}

export interface V1AgentList {
  content?: V1Agent[]
  empty?: boolean
  pageIndex?: number
  pageItemCount?: number
  pageSize?: number
  totalItems?: number
  totalPages?: number
}

export type UseAgentServiceForServerListProps = Omit<
  UseGetProps<V1AgentList, GatewayruntimeError, AgentServiceForServerListQueryParams, void>,
  'path'
>

/**
 * List agents.
 */
export const useAgentServiceForServerList = (props: UseAgentServiceForServerListProps) =>
  useGet<V1AgentList, GatewayruntimeError, AgentServiceForServerListQueryParams, void>(`/api/v1/agents`, {
    base: window.getApiBaseUrl('gitops'),
    ...props
  })

export interface AgentRepositoryServiceGetQueryParams {
  /**
   * Account Identifier for the Entity.
   */
  accountIdentifier?: string
  /**
   * Organization Identifier for the Entity.
   */
  orgIdentifier?: string
  /**
   * Project Identifier for the Entity.
   */
  projectIdentifier?: string
  /**
   * Repo URL for query.
   */
  'query.repo'?: string
  /**
   * Whether to force a cache refresh on repo's connection state.
   */
  'query.forceRefresh'?: boolean
  /**
   * The associated project project.
   */
  'query.project'?: string
}

export interface AgentRepositoryServiceGetPathParams {
  /**
   * Agent identifier for entity.
   */
  agentIdentifier: string
  identifier: string
}

export type UseAgentRepositoryServiceGetProps = Omit<
  UseGetProps<
    Servicev1Repository,
    GatewayruntimeError,
    AgentRepositoryServiceGetQueryParams,
    AgentRepositoryServiceGetPathParams
  >,
  'path'
> &
  AgentRepositoryServiceGetPathParams

/**
 * Get returns a repository or its credentials
 *
 * Get returns a repository or its credentials.
 */
export const useAgentRepositoryServiceGet = ({
  agentIdentifier,
  identifier,
  ...props
}: UseAgentRepositoryServiceGetProps) =>
  useGet<
    Servicev1Repository,
    GatewayruntimeError,
    AgentRepositoryServiceGetQueryParams,
    AgentRepositoryServiceGetPathParams
  >(
    (paramsInPath: AgentRepositoryServiceGetPathParams) =>
      `/api/v1/agents/${paramsInPath.agentIdentifier}/repositories/${paramsInPath.identifier}`,
    { base: window.getApiBaseUrl('gitops'), pathParams: { agentIdentifier, identifier }, ...props }
  )

export interface V1Clusterlist {
  content?: Servicev1Cluster[]
  empty?: boolean
  pageIndex?: number
  pageItemCount?: number
  pageSize?: number
  totalItems?: number
  totalPages?: number
}

export interface Servicev1ClusterQuery {
  /**
   * Account Identifier for the Entity.
   */
  accountIdentifier?: string
  /**
   * Agent identifier for entity.
   */
  agentIdentifier?: string
  /**
   * Filters for Clusters. Eg. "identifier": { "$in": ["id1", "id2"]
   */
  filter?: { [key: string]: any }
  identifier?: string
  /**
   * Organization Identifier for the Entity.
   */
  orgIdentifier?: string
  pageIndex?: number
  pageSize?: number
  /**
   * Project Identifier for the Entity.
   */
  projectIdentifier?: string
  searchTerm?: string
}

export type UseClusterServiceListClustersProps = Omit<
  UseMutateProps<V1Clusterlist, GatewayruntimeError, void, Servicev1ClusterQuery, void>,
  'path' | 'verb'
>

/**
 * List returns list of Clusters
 *
 * List returns list of Clusters
 */
export const useClusterServiceListClusters = (props: UseClusterServiceListClustersProps) =>
  useMutate<V1Clusterlist, GatewayruntimeError, void, Servicev1ClusterQuery, void>('POST', `/api/v1/clusters`, {
    base: window.getApiBaseUrl('gitops'),
    ...props
  })

export interface AgentClusterServiceGetQueryParams {
  /**
   * Account Identifier for the Entity.
   */
  accountIdentifier?: string
  /**
   * Organization Identifier for the Entity.
   */
  orgIdentifier?: string
  /**
   * Project Identifier for the Entity.
   */
  projectIdentifier?: string
  'query.server'?: string
  'query.name'?: string
  /**
   * type is the type of the specified cluster identifier ( "server" - default, "name" ).
   */
  'query.id.type'?: string
  /**
   * value holds the cluster server URL or cluster name.
   */
  'query.id.value'?: string
  'query.project'?: string
}

export interface AgentClusterServiceGetPathParams {
  /**
   * Agent identifier for entity.
   */
  agentIdentifier: string
  identifier: string
}

export type UseAgentClusterServiceGetProps = Omit<
  UseGetProps<
    Servicev1Cluster,
    GatewayruntimeError,
    AgentClusterServiceGetQueryParams,
    AgentClusterServiceGetPathParams
  >,
  'path'
> &
  AgentClusterServiceGetPathParams

/**
 * Get returns a cluster by identifier
 *
 * Get cluster.
 */
export const useAgentClusterServiceGet = ({ agentIdentifier, identifier, ...props }: UseAgentClusterServiceGetProps) =>
  useGet<Servicev1Cluster, GatewayruntimeError, AgentClusterServiceGetQueryParams, AgentClusterServiceGetPathParams>(
    (paramsInPath: AgentClusterServiceGetPathParams) =>
      `/api/v1/agents/${paramsInPath.agentIdentifier}/clusters/${paramsInPath.identifier}`,
    { base: window.getApiBaseUrl('gitops'), pathParams: { agentIdentifier, identifier }, ...props }
  )
