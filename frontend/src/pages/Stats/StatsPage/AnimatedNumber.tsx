import { useCountUp } from '../../../hooks/useCountUp'

interface AnimatedNumberProps {
  value: number
}

function AnimatedNumber({ value }: AnimatedNumberProps) {
  const animated = useCountUp(value)

  return <>{Math.round(animated).toLocaleString('pl-PL')}</>
}

export default AnimatedNumber