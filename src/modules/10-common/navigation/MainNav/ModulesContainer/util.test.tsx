/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { DEFAULT_MODULES_ORDER, NavModuleName, useNavModuleInfoReturnType } from '@common/hooks/useNavModuleInfo'
import { filterNavModules } from '../util'

const moduleMap: Record<NavModuleName, useNavModuleInfoReturnType> = {
  CD: {
    shouldVisible: true,
    icon: 'cd-main',
    label: 'common.cdAndGitops',
    hasLicense: true,
    homePageUrl: '',
    color: 'green'
  },
  CE: {
    shouldVisible: true,
    icon: 'ce-main',
    label: 'common.cdAndGitops',
    hasLicense: false,
    homePageUrl: '',
    color: 'green'
  },
  CF: {
    shouldVisible: true,
    icon: 'ff-solid',
    label: 'common.cdAndGitops',
    hasLicense: false,
    homePageUrl: '',
    color: 'green'
  },
  CHAOS: {
    shouldVisible: true,
    icon: 'cd-main',
    label: 'common.cdAndGitops',
    hasLicense: false,
    homePageUrl: '',
    color: 'green'
  },
  CI: {
    shouldVisible: true,
    icon: 'ci-main',
    label: 'common.cdAndGitops',
    hasLicense: false,
    homePageUrl: '',
    color: 'green'
  },
  CV: {
    shouldVisible: true,
    icon: 'cv-main',
    label: 'common.cdAndGitops',
    hasLicense: false,
    homePageUrl: '',
    color: 'green'
  },
  STO: {
    shouldVisible: true,
    icon: 'cd-main',
    label: 'common.cdAndGitops',
    hasLicense: false,
    homePageUrl: '',
    color: 'green'
  },
  CODE: {
    shouldVisible: true,
    icon: 'cd-main',
    label: 'common.cdAndGitops',
    hasLicense: false,
    homePageUrl: '',
    color: 'green'
  },
  // eslint-disable-next-line
  // @ts-ignore
  TEMPLATES: {
    shouldVisible: true,
    icon: 'cd-main',
    label: 'common.cdAndGitops',
    hasLicense: false,
    homePageUrl: '',
    color: 'green'
  },
  IACM: {
    shouldVisible: true,
    icon: 'cd-main',
    label: 'common.cdAndGitops',
    hasLicense: false,
    homePageUrl: '',
    color: 'green'
  },
  SSCS: {
    shouldVisible: true,
    icon: 'sscs-main',
    label: 'common.cdAndGitops',
    hasLicense: false,
    homePageUrl: '',
    color: 'green'
  }
}

describe('test main nav util', () => {
  test('when selectedModules and orderedModules is empty', () => {
    expect(filterNavModules([], [], moduleMap)).toEqual({
      selectedModules: ['CD'],
      orderedModules: DEFAULT_MODULES_ORDER
    })
  })

  test('when there are no selected modules ', () => {
    expect(filterNavModules(DEFAULT_MODULES_ORDER, [], moduleMap)).toEqual({
      selectedModules: [],
      orderedModules: DEFAULT_MODULES_ORDER
    })
  })

  test('when new module is added ', () => {
    const modules = [...DEFAULT_MODULES_ORDER].slice(0, DEFAULT_MODULES_ORDER.length - 2)
    expect(filterNavModules(modules, [], moduleMap)).toEqual({
      selectedModules: [],
      orderedModules: DEFAULT_MODULES_ORDER
    })
  })
})
