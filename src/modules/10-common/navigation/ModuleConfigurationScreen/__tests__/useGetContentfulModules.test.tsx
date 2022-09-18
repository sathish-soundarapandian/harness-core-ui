/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { renderHook } from '@testing-library/react-hooks'
import { TestWrapper } from '@common/utils/testUtils'
import useGetContentfulModules from '../useGetContentfulModules'

jest.mock('../Contentful', () => {
  return {
    getClient: () => {
      return {
        getEntries: () => {
          return new Promise(resolve => {
            resolve({
              sys: {
                type: 'Array'
              },
              total: 7,
              skip: 0,
              limit: 100,
              items: [
                {
                  metadata: {
                    tags: []
                  },
                  sys: {
                    space: {
                      sys: {
                        type: 'Link',
                        linkType: 'Space',
                        id: 'uu5c47kz2byk'
                      }
                    },
                    id: '3waDKP3fUP0V0O5FQGtt6q',
                    type: 'Entry',
                    createdAt: '2022-08-16T13:35:17.716Z',
                    updatedAt: '2022-09-08T08:57:38.272Z',
                    environment: {
                      sys: {
                        id: 'master',
                        type: 'Link',
                        linkType: 'Environment'
                      }
                    },
                    revision: 26,
                    contentType: {
                      sys: {
                        type: 'Link',
                        linkType: 'ContentType',
                        id: 'module'
                      }
                    },
                    locale: 'en-US'
                  },
                  fields: {
                    identifier: 'CD',
                    data: [
                      {
                        metadata: {
                          tags: []
                        },
                        sys: {
                          space: {
                            sys: {
                              type: 'Link',
                              linkType: 'Space',
                              id: 'uu5c47kz2byk'
                            }
                          },
                          id: '2gZvUXFpe3ic1rXqSAx58S',
                          type: 'Entry',
                          createdAt: '2022-08-16T13:33:57.869Z',
                          updatedAt: '2022-08-16T13:33:57.869Z',
                          environment: {
                            sys: {
                              id: 'master',
                              type: 'Link',
                              linkType: 'Environment'
                            }
                          },
                          revision: 1,
                          contentType: {
                            sys: {
                              type: 'Link',
                              linkType: 'ContentType',
                              id: 'carouselImageAndDesc'
                            }
                          },
                          locale: 'en-US'
                        },
                        fields: {
                          primaryText: 'Automatically Deploy, Verify, and Roll Back Artifacts without Toil',
                          secondaryText:
                            'CD as-a-Service without scripts, plugins, version dependencies, toil, downtime and frustration.',
                          image: {
                            metadata: {
                              tags: []
                            },
                            sys: {
                              space: {
                                sys: {
                                  type: 'Link',
                                  linkType: 'Space',
                                  id: 'uu5c47kz2byk'
                                }
                              },
                              id: '4ebrw6LbQrQl9HoRPot1kr',
                              type: 'Asset',
                              createdAt: '2022-08-16T13:33:50.582Z',
                              updatedAt: '2022-08-16T13:33:50.582Z',
                              environment: {
                                sys: {
                                  id: 'master',
                                  type: 'Link',
                                  linkType: 'Environment'
                                }
                              },
                              revision: 1,
                              locale: 'en-US'
                            },
                            fields: {
                              title: 'CD Image',
                              description: '',
                              file: {
                                url: '//images.ctfassets.net/uu5c47kz2byk/4ebrw6LbQrQl9HoRPot1kr/03d1be15bbfa81026882106b6eee0697/Allow_Save_Despite_form_issues_1.png',
                                details: {
                                  size: 63941,
                                  image: {
                                    width: 654,
                                    height: 351
                                  }
                                },
                                fileName: 'Allow Save Despite form issues 1.png',
                                contentType: 'image/png'
                              }
                            }
                          }
                        }
                      },
                      {
                        metadata: {
                          tags: []
                        },
                        sys: {
                          space: {
                            sys: {
                              type: 'Link',
                              linkType: 'Space',
                              id: 'uu5c47kz2byk'
                            }
                          },
                          id: '6jRy9rxe4Yw0hF0VRk1HV6',
                          type: 'Entry',
                          createdAt: '2022-08-23T11:31:45.477Z',
                          updatedAt: '2022-08-23T11:31:45.477Z',
                          environment: {
                            sys: {
                              id: 'master',
                              type: 'Link',
                              linkType: 'Environment'
                            }
                          },
                          revision: 1,
                          contentType: {
                            sys: {
                              type: 'Link',
                              linkType: 'ContentType',
                              id: 'lottie'
                            }
                          },
                          locale: 'en-US'
                        },
                        fields: {
                          name: 'CD landing page',
                          json: {
                            metadata: {
                              tags: []
                            },
                            sys: {
                              space: {
                                sys: {
                                  type: 'Link',
                                  linkType: 'Space',
                                  id: 'uu5c47kz2byk'
                                }
                              },
                              id: '3GSFoUNrqGU0UuyqWDjmlJ',
                              type: 'Asset',
                              createdAt: '2022-08-23T11:31:38.028Z',
                              updatedAt: '2022-08-23T11:31:38.028Z',
                              environment: {
                                sys: {
                                  id: 'master',
                                  type: 'Link',
                                  linkType: 'Environment'
                                }
                              },
                              revision: 1,
                              locale: 'en-US'
                            },
                            fields: {
                              title: 'CD landing page JSON',
                              description: '',
                              file: {
                                url: '//assets.ctfassets.net/uu5c47kz2byk/3GSFoUNrqGU0UuyqWDjmlJ/cb0deebcea96855d9273de1b6d3ad9b8/CD_Landing_Page.json',
                                details: {
                                  size: 611111
                                },
                                fileName: 'CD Landing Page.json',
                                contentType: 'application/json'
                              }
                            }
                          }
                        }
                      }
                    ],
                    label: 'Continuous Delivery'
                  }
                }
              ]
            })
          })
        }
      }
    }
  }
})

describe('test useGetContentfulModues', () => {
  test('test response', () => {
    const { result } = renderHook(() => useGetContentfulModules(), {
      wrapper: TestWrapper,
      initialProps: { path: '/account/my_account_id/cd/orgs/my_org/projects/my_project' }
    })
    expect(result).toBeDefined()
  })
})
