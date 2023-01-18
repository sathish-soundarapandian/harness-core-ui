import { ResourceType } from '@common/interfaces/GitSyncInterface'
import { getDisableFields } from '../MigrateUtils'

describe('Migrate Utils', () => {
  test('Git fields should be disabled for input sets', () => {
    expect(getDisableFields(ResourceType.INPUT_SETS)).toEqual({ branch: true, connectorRef: true, repoName: true })
  })

  test('Git fields should not be disabled for pipeline', () => {
    expect(getDisableFields(ResourceType.PIPELINES)).toEqual(undefined)
  })
})
