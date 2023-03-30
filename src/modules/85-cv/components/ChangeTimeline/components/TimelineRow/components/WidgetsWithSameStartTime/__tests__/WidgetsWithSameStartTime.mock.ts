export const mockedSecondaryEventsDetailsResponse = {
  status: 'SUCCESS',
  data: {
    type: 'Annotation',
    startTime: 1679229000,
    endTime: 1679580900,
    details: {
      annotations: [
        {
          uuid: '2fq95fHDS_6If0_QRixu6w',
          message: 'New one again 2',
          createdBy: 'harshil.garg@harness.io',
          createdAt: 1679579146830
        },
        {
          uuid: 'YXrDFNNcSPC3kS9J1V8pPw',
          message: 'add new message',
          createdBy: 'harshil.garg@harness.io',
          createdAt: 1679635272710
        }
      ]
    }
  },
  correlationId: 'c4e2c08f-726a-4a00-98d7-4b3cf994fb57'
}

export const mockedProps = {
  index: 0,
  widgets: [
    {
      endTime: 1679230800000,
      startTime: 1679229000000,
      icon: {
        height: 16,
        width: 16,
        url: 'images/downtime'
      },
      type: 'Downtime',
      identifiers: ['yEudIuKcQ_Cnd4TTzluxxg'],
      leftOffset: 471.3019313602891
    },
    {
      endTime: 1679580900000,
      startTime: 1679229000000,
      icon: {
        height: 16,
        width: 16,
        url: '/images/d400ced.svg'
      },
      type: 'Annotation',
      identifiers: ['2fq95fHDS_6If0_QRixu6w', 'YXrDFNNcSPC3kS9J1V8pPw'],
      leftOffset: 471.3019313602891
    }
  ],
  startTimeForWidgets: 1679229000000,
  addAnnotation: jest.fn(),
  fetchSecondaryEvents: jest.fn()
}
