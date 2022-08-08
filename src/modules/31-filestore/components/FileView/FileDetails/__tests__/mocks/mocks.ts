import { FileStoreContextState } from '@filestore/components/FileStoreContext/FileStoreContext'

export const fileStoreContextMock = {
  currentNode: {
    name: 'test.sh',
    identifier: 'Root_setup_github_registry_sh_b6f18e',
    type: 'FILE',
    mimeType: 'sh',
    content: 'test',
    parentIdentifier: 'Root',
    parentName: '/',
    fileUsage: ''
  },
  fileStore: [
    {
      name: 'test.sh',
      identifier: 'Root_setup_github_registry_sh_b6f18e',
      type: 'FILE',
      mimeType: 'sh',
      content: 'test',
      parentIdentifier: 'Root',
      parentName: '/',
      fileUsage: ''
    },
    {
      identifier: 'a',
      parentIdentifier: 'Root',
      name: 'a',
      type: 'FOLDER',
      path: '/a',
      lastModifiedAt: 1659692424349,
      lastModifiedBy: {
        name: 'Admin',
        email: 'admin@harness.io'
      },
      children: [],
      parentName: 'Root'
    }
  ],
  loading: false,
  tempNodes: [
    {
      name: 'test.sh',
      identifier: 'Root_setup_github_registry_sh_b6f18e',
      type: 'FILE',
      mimeType: 'sh',
      content: 'test',
      parentIdentifier: 'Root',
      parentName: '/',
      fileUsage: ''
    }
  ],
  activeTab: 'details',
  isModalView: false,
  scope: '',
  queryParams: {
    accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
    orgIdentifier: 'default',
    projectIdentifier: 'defaultproject'
  },
  deletedNode: '',
  unsavedNodes: []
}

export const getDummyFileStoreContextValue = (): FileStoreContextState => {
  return {
    ...fileStoreContextMock,
    setCurrentNode: jest.fn(),
    setFileStore: jest.fn(),
    updateFileStore: jest.fn(),
    getNode: jest.fn(),
    setLoading: jest.fn(),
    setAcriveTab: jest.fn(),
    updateCurrentNode: jest.fn(),
    setTempNodes: jest.fn(),
    setUnsavedNode: jest.fn(),
    updateTempNodes: jest.fn(),
    addDeletedNode: jest.fn(),
    removeFromTempNodes: jest.fn(),
    isCachedNode: jest.fn()
  } as any
}
// interface Response extends Body {
//     readonly headers: Headers;
//     readonly ok: boolean;
//     readonly redirected: boolean;
//     readonly status: number;
//     readonly statusText: string;
//     readonly type: ResponseType;
//     readonly url: string;
//     clone(): Response;
// }
