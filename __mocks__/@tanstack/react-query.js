module.exports.useQuery = () => {
  fail('Please mock your API calls')
  return {}
}

module.exports.useMutation = () => {
  fail('Please mock your API calls')
  return {}
}

class QueryClientMock {
  invalidateQueries = () => void 0
}

module.exports.QueryClient = QueryClientMock
