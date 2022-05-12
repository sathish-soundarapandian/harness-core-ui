/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getScopeOptions } from '@templates-library/components/TemplateSelector/TemplateSelectorLeftView/TemplateSelectorLeftViewUtils'
import type { StringKeys } from 'framework/strings'
import { Scope } from '@common/interfaces/SecretsInterface'

function getString(key: StringKeys): StringKeys {
  return key
}

describe('test TemplateSelectorLeftViewUtils', () => {
  test('test getScopeOptions method', () => {
    expect(getScopeOptions(Scope.ACCOUNT, getString)).toEqual([{ label: 'account', value: 'account' }])
    expect(getScopeOptions(Scope.ORG, getString)).toEqual([
      { label: 'all', value: 'all' },
      { label: 'account', value: 'account' },
      { label: 'orgLabel', value: 'org' }
    ])
    expect(getScopeOptions(Scope.PROJECT, getString)).toEqual([
      { label: 'all', value: 'all' },
      { label: 'account', value: 'account' },
      { label: 'orgLabel', value: 'org' },
      { label: 'projectLabel', value: 'project' }
    ])
  })
})
