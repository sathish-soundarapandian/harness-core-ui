/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/** Harness Module Names */
export enum ModuleName {
  CD = 'CD',
  CE = 'CE',
  CI = 'CI',
  CF = 'CF',
  CV = 'CV',
  SRM = 'SRM',
  CODE = 'CODE',
  STO = 'STO',
  CHAOS = 'CHAOS',
  DX = 'DX',
  COMMON = 'COMMON',
  FRAMEWORK = 'FRAMEWORK',
  TEMPLATES = 'TEMPLATES',
  IACM = 'IACM',
  SSCA = 'SSCA',
  IDP = 'IDP',
  ET = 'ET',
  DASHBOARDS = 'DASHBOARDS',
  IDPAdmin = 'IDPAdmin',
  CET = 'CET'
}

export const moduleToModuleNameMapping: Record<Module, ModuleName> = {
  ci: ModuleName.CI,
  cd: ModuleName.CD,
  ce: ModuleName.CE,
  cf: ModuleName.CF,
  cv: ModuleName.CV,
  code: ModuleName.CODE,
  sto: ModuleName.STO,
  chaos: ModuleName.CHAOS,
  iacm: ModuleName.IACM,
  ssca: ModuleName.SSCA,
  idp: ModuleName.IDP,
  dashboards: ModuleName.DASHBOARDS,
  'idp-admin': ModuleName.IDPAdmin,
  cet: ModuleName.CET
}

export type Module =
  | 'ci'
  | 'cd'
  | 'cf'
  | 'cv'
  | 'ce'
  | 'sto'
  | 'chaos'
  | 'code'
  | 'iacm'
  | 'ssca'
  | 'idp'
  | 'cet'
  | 'dashboards'
  | 'idp-admin'
  | 'cet'
