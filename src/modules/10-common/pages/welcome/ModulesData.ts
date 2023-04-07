import type { IconName } from '@harness/icons'
import type { StringKeys } from 'framework/strings'
export interface ModuleInfoValue {
  module: string
  icon: IconName
  title: StringKeys
  subTitle: StringKeys
  bodyText: StringKeys
  points?: StringKeys
  hasPoints?: boolean
  helpURL: string
}
export interface ModulesInfoMap {
  [key: string]: ModuleInfoValue
}
const modulesInfo = {
  cd: {
    module: 'cd',
    icon: 'cd-main',
    title: 'common.cdAndGitops',
    subTitle: 'common.welcomePage.cd.subTitle',
    bodyText: 'common.welcomePage.cd.bodyText',
    points: 'common.welcomePage.cd.points',
    helpURL: 'https://developer.harness.io/tutorials/deploy-services',
    hasPoints: true
  },
  ci: {
    module: 'ci',
    icon: 'ci-main',
    title: 'common.welcomePage.ci.title',
    subTitle: 'common.welcomePage.ci.subTitle',
    bodyText: 'common.welcomePage.ci.bodyText',
    points: 'common.welcomePage.ci.points',
    helpURL: 'https://developer.harness.io/tutorials/build-code',
    hasPoints: true
  },
  ce: {
    module: 'ce',
    icon: 'ce-main',
    title: 'common.welcomePage.ce.title',
    subTitle: 'common.welcomePage.ce.subTitle',
    bodyText: 'common.welcomePage.ce.bodyText',
    helpURL: 'https://developer.harness.io/tutorials/manage-cloud-costs'
  },
  cf: {
    module: 'cf',
    icon: 'cf-main',
    title: 'common.welcomePage.cf.title',
    subTitle: 'common.welcomePage.cf.subTitle',
    bodyText: 'common.welcomePage.cf.bodyText',
    helpURL: 'https://developer.harness.io/tutorials/manage-feature-flags'
  },
  cv: {
    module: 'cv',
    icon: 'cv-main',
    title: 'common.welcomePage.cv.title',
    subTitle: 'common.welcomePage.cv.subTitle',
    bodyText: 'common.welcomePage.cv.bodyText',
    helpURL: 'https://developer.harness.io/tutorials/manage-service-reliability'
  },
  chaos: {
    module: 'chaos',
    icon: 'chaos-main',
    title: 'common.welcomePage.chaos.title',
    subTitle: 'common.welcomePage.chaos.subTitle',
    bodyText: 'common.welcomePage.chaos.bodyText',
    helpURL: 'https://developer.harness.io/tutorials/run-chaos-experiments'
  }
} as ModulesInfoMap

export { modulesInfo }
