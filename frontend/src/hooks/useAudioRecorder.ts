import { useCallback, useEffect, useRef, useState } from 'react'

export type RecorderStatus = 'idle' | 'requesting' | 'recording' | 'recorded'

const MAX_SECONDS = 300

function describeError(error: unknown): string {
  const name = error instanceof DOMException ? error.name : ''

  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return 'Przeglądarka blokuje mikrofon. Kliknij ikonę obok paska adresu, zezwól na mikrofon i spróbuj ponownie. Jeśli to nie pomaga, sprawdź ustawienia prywatności systemu.'
  }

  if (name === 'NotFoundError') {
    return 'Nie znaleziono mikrofonu. Podłącz go i spróbuj ponownie.'
  }

  if (name === 'NotReadableError') {
    return 'Nie można użyć mikrofonu. Być może korzysta z niego inny program.'
  }

  return 'Nie udało się rozpocząć nagrywania.'
}

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
  const requestRef = useRef(0)

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

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Ta przeglądarka nie pozwala tutaj nagrywać. Użyj aktualnej przeglądarki.')
      return
    }

    requestRef.current += 1
    const request = requestRef.current
    setStatus('requesting')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      if (request !== requestRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }

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
    } catch (caught) {
      if (request !== requestRef.current) {
        return
      }

      cleanup()
      setError(describeError(caught))
      setStatus('idle')
    }
  }, [cleanup, stop])

  const reset = useCallback(() => {
    requestRef.current += 1

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