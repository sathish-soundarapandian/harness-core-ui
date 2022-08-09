/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ModuleName } from 'framework/types/ModuleName'
import type { ModuleInfo } from './types'

export const DEFAULT_MODULES_ORDER: ModuleName[] = [
  ModuleName.CD,
  ModuleName.CI,
  ModuleName.CF,
  ModuleName.CE,
  ModuleName.CV,
  ModuleName.STO,
  ModuleName.CHAOS
]

export const moduleMap: Record<ModuleName, ModuleInfo | undefined> = {
  CD: {
    label: 'Deployments',
    icon: 'cd-main',
    details: {
      title: 'Continuos Delivery',
      carousel: [
        // this will come from Contentful
        {
          primaryText: 'Automatically deploy, verify and Roll back Artifcats without tail',
          secondoryText:
            'CD as-a-Service without scripts, plugins, version dependencies, toil, downtime and frustration.',
          imageUrl:
            'https://assets-global.website-files.com/6222ca42ea87e1bd1aa1d10c/623d0a5d0f373855a9a621bb_screens-cd-new.png'
        },
        {
          primaryText: '2nd Carousel item',
          secondoryText:
            'CD as-a-Service without scripts, plugins, version dependencies, toil, downtime and frustration.',
          imageUrl:
            'https://assets-global.website-files.com/6222ca42ea87e1bd1aa1d10c/623d0a5d0f373855a9a621bb_screens-cd-new.png'
        }
      ]
    }
  },
  CI: {
    label: 'Builds',
    icon: 'ci-main',
    details: {
      title: 'Continuos Integration'
    }
  },
  CF: {
    label: 'Feature Flags',
    icon: 'cf-main',
    details: {
      title: 'Feature Flags'
    }
  },
  CE: {
    label: 'Cloud Costs',
    icon: 'ce-main',
    details: {
      title: 'Cloud Costs'
    }
  },
  CV: {
    label: 'Service Reliability',
    icon: 'cv-main',
    details: {
      title: 'Service Reliability'
    }
  },
  STO: {
    label: 'Security Tests',
    icon: 'sto-color-filled',
    details: {
      title: 'Security Tests'
    }
  },
  CHAOS: {
    label: 'Chaos Engineering',
    icon: 'chaos-main',
    details: {
      title: 'Chaos Engineering'
    }
  },
  DX: undefined,
  COMMON: undefined,
  FRAMEWORK: undefined,
  TEMPLATES: undefined
}

export const getModuleInfo = (module: ModuleName): ModuleInfo | undefined => moduleMap[module]
