import MotionWrapper from "./MotionWrapper"

const FadeIn = ({ children, delay = 0, direction = "up", className = "", ...props }) => {
  return (
    <MotionWrapper delay={delay} direction={direction} className={className} {...props}>
      {children}
    </MotionWrapper>
  )
}

export default FadeIn
