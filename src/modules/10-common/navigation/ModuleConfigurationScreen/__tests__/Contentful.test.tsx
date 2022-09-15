/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import Contentful, { ContentfulEnvironment } from '../Contentful'

jest.mock('contentful', () => {
  return {
    createClient: () => 'createClient'
  }
})

describe('Contentful test', () => {
  test('get client without initialise', () => {
    try {
      Contentful.getClient()
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  test('get client after initialise', () => {
    Contentful.initialise('accesstoken', 'space', ContentfulEnvironment.PRODUCTION)
    expect(Contentful.getClient()).toEqual('createClient')
  })
})
