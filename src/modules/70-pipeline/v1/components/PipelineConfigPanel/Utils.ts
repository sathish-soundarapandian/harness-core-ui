import {
  PipelineAtomicEntity,
  PipelineAtomicEntityToEntityGroupMapping,
  PipelineEntity
} from '@common/components/YAMLBuilder/YAMLBuilderConstants'
import { ConfigOptionsMapWithAdditionalOptions, PipelineConfigOptionInterface } from './PipelineConfigOptions'

export const getConfigOptionForPipelineEntity = (
  entityType: PipelineEntity
): PipelineConfigOptionInterface | undefined => {
  const entityGroup = PipelineAtomicEntityToEntityGroupMapping.get(entityType as PipelineAtomicEntity)
  return (
    ConfigOptionsMapWithAdditionalOptions.get(entityType) ||
    (entityGroup && ConfigOptionsMapWithAdditionalOptions.get(entityGroup))
  )
}
