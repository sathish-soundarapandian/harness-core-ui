export const mockActivityFS = {
  content: [
    {
      accountIdentifier: 'a1',
      referredEntity: {
        type: 'Files',
        entityRef: {
          scope: 'project',
          identifier: 'a4',
          accountIdentifier: 'acc1',
          orgIdentifier: 'org1',
          projectIdentifier: 'proj1',
          metadata: null,
          repoIdentifier: null,
          branch: null,
          isDefault: null,
          fullyQualifiedScopeIdentifier: 'acc1/org1/proj1',
          default: null
        },
        name: 'a4'
      },
      type: 'ENTITY_UPDATE',
      activityStatus: 'SUCCESS',
      detail: null,
      activityTime: Date.now(),
      description: 'File Updated'
    },

    {
      accountIdentifier: 'acc1',
      referredEntity: {
        type: 'Files',
        entityRef: {
          scope: 'project',
          identifier: 'a4',
          accountIdentifier: 'acc1',
          orgIdentifier: 'org1',
          projectIdentifier: 'proj1',
          metadata: null,
          repoIdentifier: null,
          branch: null,
          isDefault: null,
          fullyQualifiedScopeIdentifier: 'acc1/org1/proj1',

          default: null
        },
        name: 'a4'
      },
      type: 'ENTITY_UPDATE',
      activityStatus: 'SUCCESS',
      detail: null,
      activityTime: Date.now(),
      description: 'File Updated'
    }
  ],
  pageable: 'INSTANCE',
  last: true,
  totalPages: 1,
  totalElements: 16,
  sort: {
    unsorted: true,
    sorted: false,
    empty: true
  },
  first: true,
  number: 0,
  numberOfElements: 16,
  size: 16,
  empty: false
}
