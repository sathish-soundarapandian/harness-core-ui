import React from 'react'
import { render } from '@testing-library/react'

import * as cdNgServices from 'services/cd-ng'

import routes from '@common/RouteDefinitions'
import { environmentPathProps, projectPathProps } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'

import InfrastructureModal from '../InfrastructureModal'

import yamlSchema from './__mocks__/infrastructureYamlSchema.json'
import createInfrastructureResponse from './__mocks__/createInfrastructureResponse.json'

describe('Infrastructure Modal Test', () => {
  test('snapshot test', () => {
    jest.spyOn(cdNgServices, 'useGetYamlSchema').mockImplementation(() => ({ data: yamlSchema, loading: false } as any))
    jest.spyOn(cdNgServices, 'useUpdateInfrastructure').mockImplementation(() => {
      return {
        loading: false,
        mutate: jest.fn().mockResolvedValue({}),
        cancel: jest.fn(),
        error: null
      }
    })
    jest.spyOn(cdNgServices, 'useCreateInfrastructure').mockImplementation(() => {
      return {
        loading: false,
        mutate: jest.fn().mockResolvedValue(createInfrastructureResponse),
        cancel: jest.fn(),
        error: null
      }
    })

    const { container } = render(
      <TestWrapper
        path={routes.toEnvironmentDetails({
          accountId: 'dummy',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy',
          module: 'cd',
          environmentIdentifier: 'test_env'
        })}
        pathParams={{ ...projectPathProps, ...environmentPathProps }}
      >
        <InfrastructureModal environmentIdentifier="test_env" hideModal={jest.fn()} refetch={jest.fn()} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
