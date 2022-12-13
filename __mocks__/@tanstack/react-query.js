module.exports.useQuery = args => {
  const queryKey = Array.isArray(args) ? args[0] : args.queryKey

  fail(`Please mock your API calls: ${queryKey}`)
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
