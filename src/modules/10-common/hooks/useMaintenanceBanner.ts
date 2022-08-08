import { useEffect, useState } from 'react'

interface Response {
  show: boolean
  message: string
}

export function useMaintenanceBanner(): Response {
  const [showBanner, setShowBanner] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('https://api.jsonbin.io/v3/qs/62e8e05170a3846ee750c09c')
      .then(response => response.json())
      .then(res => {
        const { record } = res
        setShowBanner((record as Response).show)
        setMessage((record as Response).message)
      })
  }, [])

  return {
    show: showBanner,
    message
  }
}
