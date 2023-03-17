/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, {
  Component,
  ComponentType,
  LazyExoticComponent,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  Suspense
} from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import { PermissionsContext } from 'framework/rbac/PermissionsContext'
import { LicenseStoreContext } from 'framework/LicenseStore/LicenseStoreContext'
import { AppStoreContext } from 'framework/AppStore/AppStoreContext'
import { TooltipContext } from 'framework/tooltip/TooltipContext'
import { PageSpinner } from '@common/components'
import ChildAppError from './ChildAppError'
import type { ChildComponentProps, Scope } from './index'

const logger = loggerFor(ModuleName.FRAMEWORK)

export { ChildComponentProps }

export interface ChildComponentMounterProps extends PropsWithChildren<unknown> {
  ChildComponent: LazyExoticComponent<ComponentType<ChildComponentProps>>
  fallback?: ReactNode
}

interface ChildComponentMounterState {
  hasError: boolean
}

class ChildComponentMounter<T> extends Component<
  T & ChildComponentMounterProps & RouteComponentProps<Scope>,
  ChildComponentMounterState
> {
  state: ChildComponentMounterState = {
    hasError: false
  }

  static getDerivedStateFromError(e: Error): ChildComponentMounterState {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger.error(e.message, e as any)
    return { hasError: true }
  }

  render(): ReactElement {
    const { ChildComponent, match, children, history, fallback = <PageSpinner />, ...rest } = this.props

    // We use routeMatch instead of location because,
    // we want to pass the mount url and not the actual url
    const { url, params, path } = match

    if (this.state.hasError) {
      return <ChildAppError />
    }

    return (
      <Suspense fallback={fallback}>
        <ChildComponent
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...(rest as any)}
          renderUrl={url}
          matchPath={path}
          scope={params}
          parentContextObj={{
            appStoreContext: AppStoreContext,
            permissionsContext: PermissionsContext,
            licenseStoreProvider: LicenseStoreContext,
            tooltipContext: TooltipContext
          }}
        >
          {children}
        </ChildComponent>
      </Suspense>
    )
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ChildComponentMounterWithRouter = withRouter(ChildComponentMounter as any)

// It's impossible to use a HOC with Generics, while using `withRouter`
// hence, we need to create a wrapper around it to add support for generics
function ChildComponentMounterWithRouterWrapper<T>(props: T & ChildComponentMounterProps): ReactElement {
  return <ChildComponentMounterWithRouter {...props} />
}

export default ChildComponentMounterWithRouterWrapper
