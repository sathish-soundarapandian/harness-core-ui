/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import styled from '@emotion/styled'
import { Layout } from '@harness/uicore'

const HorizontalLayout = styled(Layout.Horizontal)`
  display: flex;
  justify-content: space-between;
  ${(props: any) => `align-items: ${props?.alignItem}`};
`

const BGColorWrapper = styled.div`
  background: var(--form-bg);
`
BGColorWrapper.displayName = 'BGColorWrapper'

export { HorizontalLayout, BGColorWrapper }
