// import React from 'react'
// import { render, screen } from '@testing-library/react'
// import { BrowserRouter, useParams, Link } from 'react-router-dom'
// import ServiceName from '../ServiceName'
// import type { Row } from 'react-table'
// import type { MonitoredServiceListItemDTO } from 'services/cv'

// // eslint-disable-next-line jest-no-mock
// jest.mock('react-router-dom', () => ({
//   useParams: jest.fn(),
//   Link: jest.fn()
// }))

// describe('ServiceName', () => {
//   const mockedUseParams = useParams as jest.Mock
//   const mockedLink = Link as jest.Mock

//   beforeEach(() => {
//     mockedUseParams.mockReturnValue({
//       accountId: 'mockAccountId',
//       orgIdentifier: 'mockOrgIdentifier',
//       projectIdentifier: 'mockProjectIdentifier'
//     })
//     mockedLink.mockImplementation(({ to, children }) => <a href={to}>{children}</a>)
//   })

//   afterEach(() => {
//     jest.clearAllMocks()
//   })

//   test('should render service name with link and tags', () => {
//     const row = {
//       original: {
//         identifier: 'mockIdentifier',
//         serviceName: 'Mock Service',
//         tags: {
//           tag1: 'Tag 1',
//           tag2: 'Tag 2'
//         },
//         environmentRefList: [],
//         type: 'mockType',
//         environmentRef: 'mockEnvironmentRef'
//       }
//     } as Row<MonitoredServiceListItemDTO>

//     render(
//       <BrowserRouter>
//         <ServiceName row={row} module="mockModule" />
//       </BrowserRouter>
//     )

//     expect(screen.getByText('Mock Service')).toBeInTheDocument()
//     expect(screen.getByText('Mock Service')).toHaveAttribute(
//       'href',
//       '/monitored-services-configurations/mockOrgIdentifier/mockProjectIdentifier/mockAccountId/mockIdentifier'
//     )
//     expect(screen.getByText('Tag 1')).toBeInTheDocument()
//     expect(screen.getByText('Tag 2')).toBeInTheDocument()
//     expect(screen.getByText('Tag 1')).toHaveAttribute('color', '#5c7080')
//     expect(screen.getByText('Tag 2')).toHaveAttribute('color', '#5c7080')
//   })

//   test('should render service name without tags', () => {
//     const row = {
//       original: {
//         identifier: 'mockIdentifier',
//         serviceName: 'Mock Service',
//         environmentRefList: [],
//         type: 'mockType',
//         environmentRef: 'mockEnvironmentRef'
//       }
//     }

//     render(
//       <BrowserRouter>
//         <ServiceName row={row} />
//       </BrowserRouter>
//     )

//     expect(screen.getByText('Mock Service')).toBeInTheDocument()
//     expect(screen.queryByText('TagsPopover')).toBeNull()
//   })

//   test('should render service name without environment tooltip', () => {
//     const row = {
//       original: {
//         identifier: 'mockIdentifier',
//         serviceName: 'Mock Service',
//         tags: {
//           tag1: 'Tag 1',
//           tag2: 'Tag 2'
//         },
//         type: 'mockType'
//       }
//     }

//     render(
//       <BrowserRouter>
//         <ServiceName row={row} />
//       </BrowserRouter>
//     )

//     expect(screen.getByText('Mock Service')).toBeInTheDocument()
//     expect(screen.getByText('Mock Service')).toHaveAttribute(
//       'href',
//       '/monitored-services-configurations/mockOrgIdentifier/mockProjectIdentifier/mockAccountId/mockIdentifier'
//     )
//     expect(screen.queryByText('EnvironmentToolTipDisplay')).toBeNull()
//   })
// })
