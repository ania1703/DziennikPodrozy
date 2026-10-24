import { useCallback, useEffect, useRef, useState } from 'react'

export type RecorderStatus = 'idle' | 'recording' | 'recorded'

const MAX_SECONDS = 300

export function useAudioRecorder() {
  const [status, setStatus] = useState<RecorderStatus>('idle')
  const [seconds, setSeconds] = useState(0)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const secondsRef = useRef(0)

  const cleanup = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }

    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  const stop = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
  }, [])

  const start = useCallback(async () => {
    setError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)

      streamRef.current = stream
      recorderRef.current = recorder
      chunksRef.current = []
      secondsRef.current = 0
      setSeconds(0)

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        const recorded = new Blob(chunksRef.current, { type: recorder.mimeType })

        cleanup()
        setBlob(recorded)
        setStatus('recorded')
      }

      recorder.start()
      setStatus('recording')

      timerRef.current = window.setInterval(() => {
        secondsRef.current += 1
        setSeconds(secondsRef.current)

        if (secondsRef.current >= MAX_SECONDS) {
          stop()
        }
      }, 1000)
    } catch {
      cleanup()
      setError('Nie udało się uzyskać dostępu do mikrofonu. Sprawdź zgodę w przeglądarce.')
      setStatus('idle')
    }
  }, [cleanup, stop])

  const reset = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.onstop = null
      recorderRef.current.stop()
    }

    cleanup()
    setBlob(null)
    setSeconds(0)
    setError(null)
    setStatus('idle')
  }, [cleanup])

  useEffect(() => reset, [reset])

  return { status, seconds, blob, error, start, stop, reset }
}