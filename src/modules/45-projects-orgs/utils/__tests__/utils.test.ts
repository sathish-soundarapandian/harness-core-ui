/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ModuleName } from 'framework/types/ModuleName'
import {
  getModuleDescription,
  getModuleDescriptionsForModuleSelectionDialog,
  getModuleFullLengthTitle,
  getModulePurpose,
  getModuleTitle
} from '../utils'

describe('Testcase for utils', () => {
  test('Validate getModuleTitle', () => {
    expect(getModuleTitle(ModuleName.CV)).toEqual('common.purpose.cv.serviceReliability')
    expect(getModuleTitle(ModuleName.CD)).toEqual('projectsOrgs.purposeList.continuous')
    expect(getModuleTitle(ModuleName.CI)).toEqual('projectsOrgs.purposeList.continuous')
    expect(getModuleTitle(ModuleName.CE)).toEqual('common.purpose.ce.cloudCost')
    expect(getModuleTitle(ModuleName.CF)).toEqual('common.purpose.cf.feature')
    expect(getModuleTitle(ModuleName.STO)).toEqual('common.purpose.sto.security')
    expect(getModuleTitle(ModuleName.CHAOS)).toEqual('common.purpose.chaos.chaos')
  })

  test('Validate getModulePurpose', () => {
    expect(getModulePurpose(ModuleName.CV)).toEqual('common.purpose.ce.management')
    expect(getModulePurpose(ModuleName.CD)).toEqual('common.purpose.cd.delivery')
    expect(getModulePurpose(ModuleName.CI)).toEqual('common.purpose.ci.integration')
    expect(getModulePurpose(ModuleName.CE)).toEqual('common.purpose.ce.management')
    expect(getModulePurpose(ModuleName.CF)).toEqual('common.purpose.cf.flags')
    expect(getModulePurpose(ModuleName.STO)).toEqual('common.purpose.sto.tests')
    expect(getModulePurpose(ModuleName.CHAOS)).toEqual('common.purpose.chaos.engineering')
  })

  test('Validate getModuleDescriptionsForModuleSelectionDialog', () => {
    expect(getModuleDescriptionsForModuleSelectionDialog(ModuleName.CV)).toEqual(
      'common.purpose.cv.moduleSelectionSubHeading'
    )
    expect(getModuleDescriptionsForModuleSelectionDialog(ModuleName.CD)).toEqual('common.selectAVersion.description')
    expect(getModuleDescriptionsForModuleSelectionDialog(ModuleName.CI)).toEqual('common.purpose.ci.descriptionOnly')
    expect(getModuleDescriptionsForModuleSelectionDialog(ModuleName.CE)).toEqual(
      'common.purpose.ce.moduleSelectionSubHeading'
    )
    expect(getModuleDescriptionsForModuleSelectionDialog(ModuleName.CF)).toEqual(
      'common.purpose.cf.moduleSelectionSubHeading'
    )
    expect(getModuleDescriptionsForModuleSelectionDialog(ModuleName.STO)).toEqual(
      'common.purpose.sto.moduleSelectionSubHeading'
    )
    expect(getModuleDescriptionsForModuleSelectionDialog(ModuleName.CHAOS)).toEqual(
      'common.purpose.chaos.moduleSelectionSubHeading'
    )
  })

  test('Validate getModuleDescription', () => {
    expect(getModuleDescription(ModuleName.CV)).toEqual('projectsOrgs.purposeList.descriptionCV')
    expect(getModuleDescription(ModuleName.CD)).toEqual('projectsOrgs.purposeList.descriptionCD')
    expect(getModuleDescription(ModuleName.CI)).toEqual('projectsOrgs.purposeList.descriptionCI')
    expect(getModuleDescription(ModuleName.CE)).toEqual('projectsOrgs.purposeList.descriptionCE')
    expect(getModuleDescription(ModuleName.CF)).toEqual('projectsOrgs.purposeList.descriptionCF')
    expect(getModuleDescription(ModuleName.CHAOS)).toEqual('projectsOrgs.purposeList.descriptionCHAOS')
  })

  test('Validate getModuleFullLengthTitle', () => {
    expect(getModuleFullLengthTitle(ModuleName.CV)).toEqual('common.purpose.cv.continuous')
    expect(getModuleFullLengthTitle(ModuleName.CD)).toEqual('common.purpose.cd.continuous')
    expect(getModuleFullLengthTitle(ModuleName.CI)).toEqual('common.purpose.ci.continuous')
    expect(getModuleFullLengthTitle(ModuleName.CE)).toEqual('common.purpose.ce.continuous')
    expect(getModuleFullLengthTitle(ModuleName.CF)).toEqual('common.purpose.cf.continuous')
    expect(getModuleFullLengthTitle(ModuleName.CHAOS)).toEqual('common.purpose.chaos.continuous')
  })
})
