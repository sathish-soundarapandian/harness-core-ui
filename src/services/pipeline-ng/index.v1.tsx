/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export type Stage = Stage1 & Stage2
export type Stage1 =
  | {
      [k: string]: unknown
    }
  | {
      [k: string]: unknown
    }
export type Stage2 =
  | ({
      type?: 'ci'
      [k: string]: unknown
    } & {
      spec?: StageCI
      [k: string]: unknown
    })
  | ({
      type?: 'cd'
      [k: string]: unknown
    } & {
      spec?: StageCD
      [k: string]: unknown
    })
  | ({
      type?: 'custom'
      [k: string]: unknown
    } & {
      spec?: StageCustom
      [k: string]: unknown
    })
  | ({
      type?: 'iacm'
      [k: string]: unknown
    } & {
      spec?: StageInfra
      [k: string]: unknown
    })
  | ({
      type?: 'flag'
      [k: string]: unknown
    } & {
      spec?: StageFlag
      [k: string]: unknown
    })
  | ({
      type?: 'template'
      [k: string]: unknown
    } & {
      spec?: StageTemplate
      [k: string]: unknown
    })
/**
 * Arch defines the target cpu architecture.
 */
export type Arch =
  | 'amd64'
  | 'arm'
  | 'arm64'
  | '386'
  | 'ppc'
  | 'ppc64'
  | 'ppc64le'
  | 'riscv'
  | 'riscv64'
  | 's390'
  | 's390x'
  | 'sparc'
  | 'sparc64'
/**
 * OS defines the target operating system.
 */
export type OS =
  | 'linux'
  | 'windows'
  | 'macos'
  | 'darwin'
  | 'dragonfly'
  | 'freebsd'
  | 'netbsd'
  | 'openbsd'
  | 'plan9'
  | 'solaris'
/**
 * Configures the target runtime engine.
 */
export type Runtime =
  | ({
      type?: 'cloud'
      [k: string]: unknown
    } & {
      spec?: RuntimeCloud
      [k: string]: unknown
    })
  | ({
      type?: 'machine'
      [k: string]: unknown
    } & {
      spec?: RuntimeMachine
      [k: string]: unknown
    })
  | ({
      type?: 'kubernetes'
      [k: string]: unknown
    } & {
      spec?: RuntimeKube
      [k: string]: unknown
    })
  | ({
      type?: 'vm'
      [k: string]: unknown
    } & {
      spec?: RuntimeVM
      [k: string]: unknown
    })
export type Step =
  | ({
      type?: 'action'
      [k: string]: unknown
    } & {
      spec?: StepAction
      [k: string]: unknown
    })
  | ({
      type?: 'background'
      [k: string]: unknown
    } & {
      spec?: StepBackground
      [k: string]: unknown
    })
  | ({
      type?: 'barrier'
      [k: string]: unknown
    } & {
      spec?: StepBarrier
      [k: string]: unknown
    })
  | ({
      type?: 'bitrise'
      [k: string]: unknown
    } & {
      spec?: StepBitrise
      [k: string]: unknown
    })
  | ({
      type?: 'script'
      [k: string]: unknown
    } & {
      spec?: StepExec
      [k: string]: unknown
    })
  | ({
      type?: 'test'
      [k: string]: unknown
    } & {
      spec?: StepTest
      [k: string]: unknown
    })
  | ({
      type?: 'group'
      [k: string]: unknown
    } & {
      spec?: StepGroup
      [k: string]: unknown
    })
  | ({
      type?: 'parallel'
      [k: string]: unknown
    } & {
      spec?: StepParallel
      [k: string]: unknown
    })
  | ({
      type?: 'plugin'
      [k: string]: unknown
    } & {
      spec?: StepPlugin
      [k: string]: unknown
    })
  | ({
      type?: 'template'
      [k: string]: unknown
    } & {
      spec?: StepTemplate
      [k: string]: unknown
    })
  | ({
      type?: 'jenkins'
      [k: string]: unknown
    } & {
      spec?: StepJenkins
      [k: string]: unknown
    })
export type Volume =
  | ({
      type?: 'host'
      [k: string]: unknown
    } & {
      spec?: VolumeHost
      [k: string]: unknown
    })
  | ({
      type?: 'claim'
      [k: string]: unknown
    } & {
      spec?: VolumeClaim
      [k: string]: unknown
    })
  | ({
      type?: 'temp'
      [k: string]: unknown
    } & {
      spec?: VolumeTemp
      [k: string]: unknown
    })
  | ({
      type?: 'config-map'
      [k: string]: unknown
    } & {
      spec?: VolumeConfigMap
      [k: string]: unknown
    })
/**
 * Configures the target runtime engine.
 */
export type Runtime1 =
  | ({
      type?: 'cloud'
      [k: string]: unknown
    } & {
      spec?: RuntimeCloud
      [k: string]: unknown
    })
  | ({
      type?: 'machine'
      [k: string]: unknown
    } & {
      spec?: RuntimeMachine
      [k: string]: unknown
    })
  | ({
      type?: 'kubernetes'
      [k: string]: unknown
    } & {
      spec?: RuntimeKube
      [k: string]: unknown
    })
  | ({
      type?: 'vm'
      [k: string]: unknown
    } & {
      spec?: RuntimeVM
      [k: string]: unknown
    })
/**
 * Configures the target runtime engine.
 */
export type Runtime2 =
  | ({
      type?: 'cloud'
      [k: string]: unknown
    } & {
      spec?: RuntimeCloud
      [k: string]: unknown
    })
  | ({
      type?: 'machine'
      [k: string]: unknown
    } & {
      spec?: RuntimeMachine
      [k: string]: unknown
    })
  | ({
      type?: 'kubernetes'
      [k: string]: unknown
    } & {
      spec?: RuntimeKube
      [k: string]: unknown
    })
  | ({
      type?: 'vm'
      [k: string]: unknown
    } & {
      spec?: RuntimeVM
      [k: string]: unknown
    })
/**
 * Configures the target runtime engine.
 */
export type Runtime3 =
  | ({
      type?: 'cloud'
      [k: string]: unknown
    } & {
      spec?: RuntimeCloud
      [k: string]: unknown
    })
  | ({
      type?: 'machine'
      [k: string]: unknown
    } & {
      spec?: RuntimeMachine
      [k: string]: unknown
    })
  | ({
      type?: 'kubernetes'
      [k: string]: unknown
    } & {
      spec?: RuntimeKube
      [k: string]: unknown
    })
  | ({
      type?: 'vm'
      [k: string]: unknown
    } & {
      spec?: RuntimeVM
      [k: string]: unknown
    })
/**
 * Configures the target runtime engine.
 */
export type Runtime4 =
  | ({
      type?: 'cloud'
      [k: string]: unknown
    } & {
      spec?: RuntimeCloud
      [k: string]: unknown
    })
  | ({
      type?: 'machine'
      [k: string]: unknown
    } & {
      spec?: RuntimeMachine
      [k: string]: unknown
    })
  | ({
      type?: 'kubernetes'
      [k: string]: unknown
    } & {
      spec?: RuntimeKube
      [k: string]: unknown
    })
  | ({
      type?: 'vm'
      [k: string]: unknown
    } & {
      spec?: RuntimeVM
      [k: string]: unknown
    })

/**
 * Pipeline defines the pipeline execution.
 */
export interface Pipeline {
  /**
   * Version defines the schema version.
   */
  version: string | number
  /**
   * Pipeline provides the pipeline name.
   */
  name?: string
  /**
   * Stages defines a list of pipeline stages.
   */
  stages: Stage[]
  /**
   * Inputs defines the pipeline input parameters.
   */
  inputs?: {
    [k: string]: Input
  }
  options?: Default
  [k: string]: unknown
}
export interface StageCI {
  cache?: Cache
  clone?: CloneStage
  platform?: Platform
  runtime?: Runtime
  /**
   * Configures a series of steps to executes.
   */
  steps?: Step[]
  /**
   * The stage environment variables.
   */
  envs?: {
    [k: string]: string
  }
  /**
   * Configures a container volumes.
   */
  volumes?: Volume[]
  [k: string]: unknown
}
/**
 * Configures the cache behavior.
 */
export interface Cache {
  /**
   * Enabled enables cache intelligence.
   */
  enabled?: boolean
  /**
   * Paths provides a list of paths to cache.
   */
  paths?: string[]
  /**
   * Key provides a caching key.
   */
  key?: string
  /**
   * Policy configures the pull and push behavior of the cache.
   * By default, the stage pulls the cache when the stage starts
   * and pushes changes to the cache when the stage ends.
   *
   */
  policy?: 'pull' | 'pull-push' | 'push'
  [k: string]: unknown
}
/**
 * Overrides the clone behavior.
 */
export interface CloneStage {
  /**
   * Depth defines the clone depth.
   */
  depth?: number
  /**
   * Disabled disables the default clone step.
   */
  disabled?: boolean
  /**
   * Insecure disables ssl verification.
   */
  insecure?: boolean
  /**
   * Strategy configures the clone strategy.
   */
  strategy?: 'source-branch' | 'merge'
  /**
   * Trace enables trace logging.
   */
  trace?: boolean
  [k: string]: unknown
}
/**
 * Configures the target execution platform.
 */
export interface Platform {
  arch?: Arch
  /**
   * Features defines the target platform features.
   */
  features?: string[]
  os?: OS
  /**
   * Variant defines the target cpu architecture variant.
   */
  variant?: string
  /**
   * Version defines the target operating system version.
   */
  version?: string
  [k: string]: unknown
}
export interface RuntimeCloud {
  size?: string
  [k: string]: unknown
}
export interface RuntimeMachine {
  [k: string]: unknown
}
export interface RuntimeKube {
  connector?: string
  namespace?: string
  annotations?: {
    [k: string]: string
  }
  labels?: {
    [k: string]: string
  }
  resources?: Resources
  mount_service_token?: boolean
  service_account?: string
  security_context?: string
  priority_class?: string
  init_timeout?: string
  user?: string
  image_pull_secrets?: string[]
  node?: string
  node_selector?: {
    [k: string]: string
  }
  tolerations?: {
    [k: string]: unknown
  }
  [k: string]: unknown
}
/**
 * Defines the container resource request and limits.
 */
export interface Resources {
  limits?: Resource
  requests?: Resource
  [k: string]: unknown
}
/**
 * Resource defines the system resources.
 */
export interface Resource {
  cpu?: string | number
  memory?: string | number
  [k: string]: unknown
}
export interface RuntimeVM {
  pool?: string
  [k: string]: unknown
}
export interface StepAction {
  uses?: string
  with?: {
    [k: string]: unknown
  }
  /**
   * The stage environment variables.
   */
  envs?: {
    [k: string]: string
  }
  outputs?: string[]
  mount?: Mount[]
  [k: string]: unknown
}
/**
 * Mount defines a volume mount.
 */
export interface Mount {
  /**
   * Name defines the volume name.
   */
  name?: string
  /**
   * Path specifies the target mount path.
   */
  path?: string
  [k: string]: unknown
}
export interface StepBackground {
  image?: string
  user?: string
  pull?: 'always' | 'never' | 'if-not-exists'
  shell?: 'sh' | 'bash' | 'powershell' | 'pwsh'
  /**
   * The step environment variables.
   */
  envs?: {
    [k: string]: string
  }
  run?: string
  entrypoint?: string
  args?: string[]
  ports?: string[]
  network?: string
  privileged?: boolean
  resources?: Resources
  mount?: Mount[]
  [k: string]: unknown
}
export interface StepBarrier {
  ref?: string
  [k: string]: unknown
}
export interface StepBitrise {
  uses?: string
  with?: {
    [k: string]: unknown
  }
  /**
   * The stage environment variables.
   */
  envs?: {
    [k: string]: string
  }
  outputs?: string[]
  mount?: Mount[]
  [k: string]: unknown
}
export interface StepExec {
  image?: string
  connector?: string
  user?: string
  group?: string
  pull?: 'always' | 'never' | 'if-not-exists'
  shell?: 'sh' | 'bash' | 'powershell' | 'pwsh' | 'python'
  /**
   * The step environment variables.
   */
  envs?: {
    [k: string]: string
  }
  run?: string
  entrypoint?: string
  args?: string[]
  privileged?: boolean
  network?: string
  reports?: Report[]
  outputs?: string[]
  resources?: Resources
  mount?: Mount[]
  [k: string]: unknown
}
/**
 * Report defines a report artifact.
 */
export interface Report {
  /**
   * Path provides the report file path.
   */
  path: string[] | string
  /**
   * Type provides the report type.
   */
  type: 'junit' | 'xunit' | 'nunit'
  [k: string]: unknown
}
export interface StepTest {
  /**
   * The stage environment variables.
   */
  envs?: {
    [k: string]: string
  }
  uses?: string
  with?: {
    [k: string]: unknown
  }
  splitting?: Splitting
  reports?: Report[]
  mount?: Mount[]
  image?: string
  connector?: string
  user?: string
  pull?: 'always' | 'never' | 'if-not-exists'
  resources?: Resources
  [k: string]: unknown
}
export interface Splitting {
  enabled?: boolean
  concurrency?: number
  strategy?: string
  [k: string]: unknown
}
export interface StepGroup {
  steps?: Step[]
  [k: string]: unknown
}
export interface StepParallel {
  steps?: Step[]
  [k: string]: unknown
}
export interface StepPlugin {
  image?: string
  uses?: string
  connector?: string
  pull?: 'always' | 'never' | 'if-not-exists'
  /**
   * The step environment variables.
   */
  envs?: {
    [k: string]: string
  }
  reports?: Report[]
  privileged?: boolean
  user?: string
  group?: string
  network?: string
  with?: {
    [k: string]: unknown
  }
  outputs?: string[]
  resources?: Resources
  mount?: Mount[]
  [k: string]: unknown
}
export interface StepTemplate {
  /**
   * Template name.
   */
  name?: string
  inputs?: {
    [k: string]: string
  }
  overlays?: {
    [k: string]: unknown
  }
  [k: string]: unknown
}
export interface StepJenkins {
  /**
   * The stage environment variables.
   */
  envs?: {
    [k: string]: string
  }
  path?: string
  mirror?: string
  plugins?: string[]
  mount?: Mount[]
  [k: string]: unknown
}
export interface VolumeHost {
  path: string
  [k: string]: unknown
}
export interface VolumeClaim {
  name: string
  [k: string]: unknown
}
export interface VolumeTemp {
  medium?: 'memory'
  limit?: string | number
  [k: string]: unknown
}
export interface VolumeConfigMap {
  name: string
  mode?: string
  optional?: boolean
  [k: string]: unknown
}
export interface StageCD {
  platform?: Platform1
  runtime?: Runtime1
  /**
   * Configures a series of steps to executes.
   */
  steps?: Step[]
  /**
   * The stage environment variables.
   */
  envs?: {
    [k: string]: string
  }
  [k: string]: unknown
}
/**
 * Configures the target execution platform.
 */
export interface Platform1 {
  arch?: Arch
  /**
   * Features defines the target platform features.
   */
  features?: string[]
  os?: OS
  /**
   * Variant defines the target cpu architecture variant.
   */
  variant?: string
  /**
   * Version defines the target operating system version.
   */
  version?: string
  [k: string]: unknown
}
export interface StageCustom {
  platform?: Platform2
  runtime?: Runtime2
  /**
   * Configures a series of steps to executes.
   */
  steps?: Step[]
  /**
   * The stage environment variables.
   */
  envs?: {
    [k: string]: string
  }
  [k: string]: unknown
}
/**
 * Configures the target execution platform.
 */
export interface Platform2 {
  arch?: Arch
  /**
   * Features defines the target platform features.
   */
  features?: string[]
  os?: OS
  /**
   * Variant defines the target cpu architecture variant.
   */
  variant?: string
  /**
   * Version defines the target operating system version.
   */
  version?: string
  [k: string]: unknown
}
export interface StageInfra {
  /**
   * Configures the stack id to be used in the pipeline execution.
   */
  stack?: string
  /**
   * Configures the workflow to be used in the pipeline execution.
   */
  workflow?: 'provision' | 'teardown'
  clone?: Clone
  platform?: Platform3
  runtime?: Runtime3
  /**
   * Configures a series of steps to executes.
   */
  steps?: Step[]
  /**
   * The stage environment variables.
   */
  envs?: {
    [k: string]: string
  }
  [k: string]: unknown
}
/**
 * Configures the default clone behavior.
 */
export interface Clone {
  /**
   * Depth defines the clone depth.
   */
  depth?: number
  /**
   * Disabled disables the default clone step.
   */
  disabled?: boolean
  /**
   * Insecure disables ssl verification.
   */
  insecure?: boolean
  /**
   * Strategy configures the clone strategy.
   */
  strategy?: 'source-branch' | 'merge'
  /**
   * Trace enables trace logging.
   */
  trace?: boolean
  ref?: Reference
  [k: string]: unknown
}
/**
 * Reference defines the clone ref.
 */
export interface Reference {
  /**
   * Name provides ref name.
   */
  name?: string
  /**
   * Type defines the ref type.
   */
  type?: 'branch' | 'tag' | 'pr'
  /**
   * Sha provides the ref sha.
   */
  sha?: string
  [k: string]: unknown
}
/**
 * Configures the target execution platform.
 */
export interface Platform3 {
  arch?: Arch
  /**
   * Features defines the target platform features.
   */
  features?: string[]
  os?: OS
  /**
   * Variant defines the target cpu architecture variant.
   */
  variant?: string
  /**
   * Version defines the target operating system version.
   */
  version?: string
  [k: string]: unknown
}
export interface StageFlag {
  platform?: Platform4
  runtime?: Runtime4
  /**
   * Configures a series of steps to executes.
   */
  steps?: Step[]
  /**
   * The stage environment variables.
   */
  envs?: {
    [k: string]: string
  }
  [k: string]: unknown
}
/**
 * Configures the target execution platform.
 */
export interface Platform4 {
  arch?: Arch
  /**
   * Features defines the target platform features.
   */
  features?: string[]
  os?: OS
  /**
   * Variant defines the target cpu architecture variant.
   */
  variant?: string
  /**
   * Version defines the target operating system version.
   */
  version?: string
  [k: string]: unknown
}
export interface StageTemplate {
  /**
   * Template name.
   */
  name?: string
  inputs?: {
    [k: string]: string
  }
  overlays?: {
    [k: string]: unknown
  }
  [k: string]: unknown
}
/**
 * Input defines an input parameter.
 */
export interface Input {
  /**
   * Type defines the input type.
   */
  type?: 'string' | 'number' | 'boolean' | 'array' | 'map'
  /**
   * Desc defines the input description.
   */
  description?: string
  default?:
    | string
    | number
    | boolean
    | unknown[]
    | {
        [k: string]: unknown
      }
  /**
   * Required indicates the input is required.
   */
  required?: boolean
  items?: InputItems
  /**
   * Enum defines a list of accepted input values.
   */
  enum?: (string | number | boolean)[]
  [k: string]: unknown
}
/**
 * Items defines an arrat type.
 */
export interface InputItems {
  /**
   * Type defines the input type.
   */
  type?: 'string' | 'number' | 'boolean'
  [k: string]: unknown
}
/**
 * Options defines global configuration options.
 */
export interface Default {
  clone?: Clone1
  repository?: Repository
  registry?: Registry
  resources?: Resources1
  delegate?: Delegate
  barriers?: Barrier[]
  status?: Status
  /**
   * Configures the pipeline timeout.
   */
  timeout?: string
  /**
   * Provides the default environment variables.
   */
  envs?: {
    [k: string]: string
  }
  [k: string]: unknown
}
/**
 * Configures the default clone behavior.
 */
export interface Clone1 {
  /**
   * Depth defines the clone depth.
   */
  depth?: number
  /**
   * Disabled disables the default clone step.
   */
  disabled?: boolean
  /**
   * Insecure disables ssl verification.
   */
  insecure?: boolean
  /**
   * Strategy configures the clone strategy.
   */
  strategy?: 'source-branch' | 'merge'
  /**
   * Trace enables trace logging.
   */
  trace?: boolean
  ref?: Reference
  [k: string]: unknown
}
/**
 * Configures the default repository.
 */
export interface Repository {
  /**
   * Connector provides the repository connector.
   */
  connector?: string
  /**
   * Name provides the repository name.
   */
  name?: string
  [k: string]: unknown
}
/**
 * Provides the default registry credentials.
 */
export interface Registry {
  connector?: string | (RegistryConnector | string)[] | RegistryConnector1
  mirror?: string | string[]
  [k: string]: unknown
}
/**
 * RegistryConnector provides a registry connector.
 */
export interface RegistryConnector {
  /**
   * Name provides the registry connector name.
   */
  name?: string
  /**
   * Match provides the regitry connector endpoint.
   */
  match?: string
  [k: string]: unknown
}
/**
 * RegistryConnector provides a registry connector.
 */
export interface RegistryConnector1 {
  /**
   * Name provides the registry connector name.
   */
  name?: string
  /**
   * Match provides the regitry connector endpoint.
   */
  match?: string
  [k: string]: unknown
}
/**
 * Defines the container resource request and limits.
 */
export interface Resources1 {
  limits?: Resource
  requests?: Resource
  [k: string]: unknown
}
/**
 * Configures the default delegate matching logic.
 */
export interface Delegate {
  /**
   * Selectors defines tags that are used to match the stage
   * with a delegate.
   *
   */
  selectors?: string[]
  [k: string]: unknown
}
/**
 * Barrier defines a pipeline barrier.
 */
export interface Barrier {
  id?: string
  name?: string
  [k: string]: unknown
}
/**
 * Configures the scm status checks.
 */
export interface Status {
  disabled?: boolean
  level?: 'pipeline' | 'stage'
  matrix?: 'itemize' | 'summarize'
  name?: string
  [k: string]: unknown
}
