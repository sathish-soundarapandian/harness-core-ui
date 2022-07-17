import type { MultiTypeInputType } from '@wings-software/uicore'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { ServiceDefinition, ServiceSpec, ConfigFileWrapper, ConfigFile } from 'services/cd-ng'
import type { ConfigFileSourceBaseFactory } from '@cd/factory/ConfigFileSourceFactory/ConfigFileSourceBaseFactory'

export interface SshWinRmDirectServiceStep extends ServiceSpec {
  stageIndex?: number
  setupModeType?: string
  handleTabChange?: (tab: string) => void
  customStepProps?: Record<string, any>
  deploymentType?: ServiceDefinition['type']
  isReadonlyServiceMode?: boolean
}

export interface SshWinRmConfigFilesProps {
  template: ServiceSpec
  path?: string
  stepViewType?: StepViewType
  configFileSourceBaseFactory: ConfigFileSourceBaseFactory
  configFiles?: ConfigFileWrapper[]
  initialValues: SshWinRmDirectServiceStep
  readonly: boolean
  stageIdentifier: string
  formik?: any
  fromTrigger?: boolean
  allowableTypes: MultiTypeInputType[]
  configFile?: ConfigFile
  configFilePath?: string
}
