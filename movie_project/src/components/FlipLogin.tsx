import { useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import LoginBox from "./LoginBox";
import CreateAccountBox from "./CreateAccountBox";

function FlipLogin() {
  const [flipped, setFlipped] = useState(false);
  const { transform, opacity } = useSpring({
    opacity: flipped ? 1 : 0,
    transform: `perspective(1000px) rotateY(${flipped ? 180 : 0}deg)`,
    config: { mass: 5, tension: 500, friction: 80 },
  });
  const reverseOpacity = opacity.to((o) => 1 - o);
  return (
    <>
      <animated.div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          transform,
          opacity: reverseOpacity,
          visibility: reverseOpacity.to((o) =>
            o === 0 ? "hidden" : "visible"
          ),
        }}
      >
        {<LoginBox onFlip={() => setFlipped(true)} />}
      </animated.div>
      <animated.div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          transform: transform.to((t) => `${t} rotateY(180deg)`),
          opacity,
          //rotateY: "180deg",
          visibility: opacity.to((o) => (o === 0 ? "hidden" : "visible")),
        }}
      >
        {<CreateAccountBox onFlip={() => setFlipped(false)} />}
      </animated.div>
    </>
  );
}

export default FlipLogin;
