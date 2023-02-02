/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import { once } from 'lodash-es'
import type { SelectOption } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'

export const getCIShellOptions = once((getString: UseStringsReturn['getString']): SelectOption[] => [
  { label: getString('common.bash'), value: 'Bash' },
  { label: getString('common.powershell'), value: 'Powershell' },
  { label: getString('common.pwsh'), value: 'Pwsh' },
  { label: getString('common.sh'), value: 'Sh' },
  { label: getString('common.python'), value: 'Python' }
])

export const getCIRunTestsStepShellOptions = once((getString: UseStringsReturn['getString']): SelectOption[] => [
  { label: getString('common.bash'), value: 'Bash' },
  { label: getString('common.powershell'), value: 'Powershell' },
  { label: getString('common.pwsh'), value: 'Pwsh' },
  { label: getString('common.sh'), value: 'Sh' }
])
