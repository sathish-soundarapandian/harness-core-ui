/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import { once } from 'lodash-es'
import type { SelectOption } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'

export enum Shell {
  Bash = 'Bash',
  Powershell = 'Powershell',
  Pwsh = 'Pwsh',
  Sh = 'Sh',
  Python = 'Python'
}

export const getCIShellOptions = once((getString: UseStringsReturn['getString']): SelectOption[] => [
  { label: getString('common.bash'), value: Shell.Bash },
  { label: getString('common.powershell'), value: Shell.Powershell },
  { label: getString('common.pwsh'), value: Shell.Pwsh },
  { label: getString('common.sh'), value: Shell.Sh },
  { label: getString('common.python'), value: Shell.Python }
])

export const getCIRunTestsStepShellOptions = once((getString: UseStringsReturn['getString']): SelectOption[] => [
  { label: getString('common.bash'), value: Shell.Bash },
  { label: getString('common.powershell'), value: Shell.Powershell },
  { label: getString('common.pwsh'), value: Shell.Pwsh },
  { label: getString('common.sh'), value: Shell.Sh }
])
