import type { StoreMetadata } from '@common/constants/GitSyncTypes'
import { ResourceType } from '@common/interfaces/GitSyncInterface'
import type { NameIdDescriptionTagsType } from '@common/utils/Validation'

export enum MigrationType {
  IMPORT = 'IMPORT',
  INLINE_TO_REMOTE = 'INLINE_TO_REMOTE',
  REMOTE_TO_INLINE = 'REMOTE_TO_INLINE'
}

export interface ExtraQueryParams {
  pipelineIdentifier?: string
  inputSetIdentifier?: string
  name?: string
}

export type InitialValuesType = NameIdDescriptionTagsType &
  StoreMetadata & { versionLabel?: string; commitMsg?: string }
export type ModifiedInitialValuesType = Omit<InitialValuesType, 'repoName'> & { repo?: string }

export const getDisableFields = (resourceType: ResourceType): Record<string, boolean> | undefined => {
  if (resourceType === ResourceType.INPUT_SETS) {
    return {
      connectorRef: true,
      repoName: true,
      branch: true
    }
  }
}
