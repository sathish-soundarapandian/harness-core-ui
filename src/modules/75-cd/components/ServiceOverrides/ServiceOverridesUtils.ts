import type {
  ApplicationSettingsConfiguration,
  ConfigFileWrapper,
  ConnectionStringsConfiguration,
  ManifestConfigWrapper,
  ServiceOverridesResponseDTOV2 as CDServiceOverridesResponseDTOV2
} from 'services/cd-ng'
import type { StringKeys } from 'framework/strings'
import type { AllNGVariables } from '@pipeline/utils/types'
import type { RequiredField } from '@common/interfaces/RouteInterfaces'

export enum ServiceOverridesTab {
  ENVIRONMENT_GLOBAL = 'ENVIRONMENT_GLOBAL',
  ENVIRONMENT_SERVICE_SPECIFIC = 'ENVIRONMENT_SERVICE_SPECIFIC',
  INFRA_GLOBAL = 'INFRA_GLOBAL',
  INFRA_SERVICE_SPECIFIC = 'INFRA_SERVICE_SPECIFIC'
}
interface RowConfig {
  headerWidth?: string | number
  rowWidth?: string | number
  value: StringKeys
  accessKey?: 'environmentRef' | 'infraIdentifier' | 'serviceRef' | 'overrideType'
  mapper?: Record<any, any>
}

export enum OverrideTypes {
  VARIABLE = 'variableoverride',
  CONFIG = 'configoverride',
  MANIFEST = 'manifestoverride',
  APPLICATIONSETTING = 'applicationsetting',
  CONNECTIONSTRING = 'connectionstring'
}

export const overridesLabelStringMap: Record<OverrideTypes, StringKeys> = {
  [OverrideTypes.VARIABLE]: 'variableLabel',
  [OverrideTypes.MANIFEST]: 'manifestsText',
  [OverrideTypes.CONFIG]: 'cd.configFileStoreTitle',
  [OverrideTypes.APPLICATIONSETTING]: 'pipeline.appServiceConfig.applicationSettings.name',
  [OverrideTypes.CONNECTIONSTRING]: 'pipeline.appServiceConfig.connectionStrings.name'
}

export const noOverridesStringMap: Record<Required<ServiceOverridesResponseDTOV2>['type'], StringKeys> = {
  ENV_GLOBAL_OVERRIDE: 'common.serviceOverrides.noOverrides.globalEnvironment',
  ENV_SERVICE_OVERRIDE: 'common.serviceOverrides.noOverrides.environmentServiceSpecific',
  INFRA_GLOBAL_OVERRIDE: 'common.serviceOverrides.noOverrides.globalInfrastructure',
  INFRA_SERVICE_OVERRIDE: 'common.serviceOverrides.noOverrides.infrastructureServiceSpecific',
  CLUSTER_GLOBAL_OVERRIDE: 'common.serviceOverrides.noOverrides.globalInfrastructure',
  CLUSTER_SERVICE_OVERRIDE: 'common.serviceOverrides.noOverrides.globalInfrastructure'
}

export const rowConfigMap: Record<Required<ServiceOverridesResponseDTOV2>['type'], RowConfig[]> = {
  ENV_GLOBAL_OVERRIDE: [
    {
      headerWidth: 160,
      rowWidth: 156,
      value: 'environment',
      accessKey: 'environmentRef'
    },
    {
      headerWidth: 150,
      rowWidth: 150,
      value: 'common.serviceOverrides.overrideType',
      accessKey: 'overrideType',
      mapper: overridesLabelStringMap
    },
    {
      value: 'common.serviceOverrides.overrideInfo'
    }
  ],
  ENV_SERVICE_OVERRIDE: [
    {
      headerWidth: 160,
      rowWidth: 156,
      value: 'environment',
      accessKey: 'environmentRef'
    },
    {
      headerWidth: 160,
      rowWidth: 160,
      value: 'service',
      accessKey: 'serviceRef'
    },
    {
      headerWidth: 150,
      rowWidth: 150,
      value: 'common.serviceOverrides.overrideType',
      accessKey: 'overrideType',
      mapper: overridesLabelStringMap
    },
    {
      value: 'common.serviceOverrides.overrideInfo'
    }
  ],
  INFRA_GLOBAL_OVERRIDE: [
    {
      headerWidth: 160,
      rowWidth: 156,
      value: 'environment',
      accessKey: 'environmentRef'
    },
    {
      headerWidth: 160,
      rowWidth: 160,
      value: 'infrastructureText',
      accessKey: 'infraIdentifier'
    },
    {
      headerWidth: 150,
      rowWidth: 150,
      value: 'common.serviceOverrides.overrideType',
      accessKey: 'overrideType',
      mapper: overridesLabelStringMap
    },
    {
      value: 'common.serviceOverrides.overrideInfo'
    }
  ],
  INFRA_SERVICE_OVERRIDE: [
    {
      headerWidth: 160,
      rowWidth: 156,
      value: 'environment',
      accessKey: 'environmentRef'
    },
    {
      headerWidth: 160,
      rowWidth: 160,
      value: 'infrastructureText',
      accessKey: 'infraIdentifier'
    },
    {
      headerWidth: 160,
      rowWidth: 160,
      value: 'service',
      accessKey: 'serviceRef'
    },
    {
      headerWidth: 150,
      rowWidth: 150,
      value: 'common.serviceOverrides.overrideType',
      accessKey: 'overrideType',
      mapper: overridesLabelStringMap
    },
    {
      rowWidth: '40%',
      value: 'common.serviceOverrides.overrideInfo'
    }
  ],
  CLUSTER_GLOBAL_OVERRIDE: [
    {
      headerWidth: '12%',
      rowWidth: '12%',
      value: 'environment'
    },
    {
      headerWidth: '12%',
      rowWidth: '12%',
      value: 'infrastructureText'
    },
    {
      headerWidth: '12%',
      rowWidth: '12%',
      value: 'common.serviceOverrides.overrideType'
    },
    {
      headerWidth: '62%',
      rowWidth: '62%',
      value: 'common.serviceOverrides.overrideInfo'
    }
  ],
  CLUSTER_SERVICE_OVERRIDE: [
    {
      headerWidth: '12%',
      rowWidth: '12%',
      value: 'environment'
    },
    {
      headerWidth: '12%',
      rowWidth: '12%',
      value: 'infrastructureText'
    },
    {
      headerWidth: '12%',
      rowWidth: '12%',
      value: 'service'
    },
    {
      headerWidth: '12%',
      rowWidth: '12%',
      value: 'common.serviceOverrides.overrideType'
    },
    {
      headerWidth: '50%',
      rowWidth: '50%',
      value: 'common.serviceOverrides.overrideInfo'
    }
  ]
}

export interface ServiceOverrideRowProps {
  /**
   * isNew is set to true when creating a new override row
   */
  isNew: boolean
  /**
   * isEdit is set to true when editing an existing override row
   */
  isEdit: boolean
  /**
   * rowIndex is used to identify the row in case of any actions - duplicate, edit, delete
   */
  rowIndex: number
  /**
   * variableIndex is used to update the field in case of any updates to a variable
   */
  variableIndex?: number
  /**
   * manifestIndex is used to update the field in case of any updates to a manifest
   */
  manifestIndex?: number
  /**
   * configFileIndex is used to update the field in case of any updates to a config file
   */
  configFileIndex?: number
  /**
   * overrideDetails contains all the values that form part of 1 override row
   */
  overrideDetails?: OverrideDetails
  /**
   * groupKey is used to identify a group - for display or for actions
   */
  groupKey: string
  /**
   * overrideResponse is used to handle any operations that require the entire object
   */
  overrideResponse?: ServiceOverridesResponseDTOV2
}

interface CommonOverrideDetails extends Omit<ServiceOverridesResponseDTOV2, 'spec'> {
  overrideType: OverrideTypes
}

export type VariableOverrideDetails = CommonOverrideDetails & {
  variableValue: RequiredField<AllNGVariables, 'name' | 'type'>
}

export type ManifestOverrideDetails = CommonOverrideDetails & {
  manifestValue: Required<ManifestConfigWrapper>
}

export type ConfigFileOverrideDetails = CommonOverrideDetails & {
  configFileValue: Required<ConfigFileWrapper>
}

export type ApplicationSettingsOverrideDetails = CommonOverrideDetails & {
  applicationSettingsValue: RequiredField<ApplicationSettingsConfiguration, 'store'>
}

export type ConnectionStringsOverrideDetails = CommonOverrideDetails & {
  connectionStringsValue: RequiredField<ConnectionStringsConfiguration, 'store'>
}

export type OverrideDetails =
  | VariableOverrideDetails
  | ManifestOverrideDetails
  | ConfigFileOverrideDetails
  | ApplicationSettingsOverrideDetails
  | ConnectionStringsOverrideDetails

export type PartiallyRequired<T, K extends keyof T> = Partial<T> & Required<Pick<T, K>>

export interface ServiceOverrideRowFormState {
  overrideType?: OverrideTypes
  environmentRef?: string
  serviceRef?: string
  infraIdentifier?: string
  variables?: RequiredField<AllNGVariables, 'type' | 'name'>[]
  manifests?: Required<ManifestConfigWrapper>[]
  configFiles?: Required<ConfigFileWrapper>[]
  applicationSettings?: RequiredField<ApplicationSettingsConfiguration, 'store'>
  connectionStrings?: RequiredField<ConnectionStringsConfiguration, 'store'>
}

export type ServiceOverridesResponseDTOV2 = RequiredField<
  CDServiceOverridesResponseDTOV2,
  'environmentRef' | 'identifier' | 'spec' | 'type'
>
