/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { createClient, ContentfulClientApi } from 'contentful'

export enum ContentfulEnvironment {
  PRODUCTION = 'master'
}

class Contentful {
  private client: ContentfulClientApi | undefined = undefined

  getClient(): ContentfulClientApi {
    if (this.client) {
      return this.client
    }

    throw new Error('Please initialise Contentful before calling getClient')
  }

  initialise(accessToken: string, space: string, environment: ContentfulEnvironment): void {
    if (!this.client) {
      this.client = createClient({
        space,
        accessToken,
        environment
      })
    }
  }
}

export default new Contentful()
