import { Parallax, ParallaxLayer, IParallax } from "@react-spring/parallax";
import { useSpring, animated } from "@react-spring/web";
import NavBar from "./NavBar";
import { useRef, useContext, useEffect } from "react";
import FlipLogin from "./FlipLogin";
import { LoginContext } from "../userContext";
import { useNavigate } from "react-router-dom";
function LandingPage() {
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    delay: 500,
  });
  const { user } = useContext(LoginContext);
  const navigate = useNavigate();
  useEffect(() => {
    console.log("Inside LandingPage");
    console.log(user);
    if (user) {
      navigate("/HomePage");
    }
  }, [user]);
  const parallax = useRef<IParallax>(null!);
  return (
    <>
      <div className="scrollbar-hide overflow-auto">
        {/* <animated.div style={fadeIn}> */}
        <NavBar parallaxref={parallax} />
        {/* </animated.div> */}

        <Parallax pages={3} ref={parallax}>
          <ParallaxLayer //BLACK BACKGROUND LAYER FIRST
            offset={0}
            speed={0.2}
            factor={1.2}
            style={{
              backgroundColor: "#121212",
              zIndex: 10,
            }}
          ></ParallaxLayer>
          <ParallaxLayer //RATE THAT FLICK
            offset={0}
            speed={0.65}
            style={{
              zIndex: 20,
            }}
          >
            <div className="flex items-center justify-center h-screen">
              <animated.h1
                style={fadeIn}
                className="text-landing text-6xl font-bold text-plat font-mono"
              >
                Rate That Flick
              </animated.h1>
            </div>
          </ParallaxLayer>
          <ParallaxLayer
            offset={1}
            speed={0.2}
            factor={1}
            style={{
              zIndex: 10,
              background:
                "linear-gradient(180deg, rgba(18, 18, 18, 1) 0%, rgba(4, 31, 86, 0) 100%)",
            }}
          ></ParallaxLayer>
          <div className="background-with-filter flex items-center justify-center h-full w-full relative">
            <ParallaxLayer offset={1.8} speed={0.5} factor={2}>
              <div>
                <h1 className="text-9xl text-white z-20 text-center image-overlay-text text-with-shadow bg-opacity-100">
                  TEST HEADING
                </h1>
              </div>
            </ParallaxLayer>
          </div>

          <ParallaxLayer
            offset={1.9}
            speed={0.2}
            factor={2}
            style={{
              zIndex: 10,
              background:
                "linear-gradient(180deg, rgba(4, 31, 86, 0) 0%, rgba(18, 18, 18, 1) 25%)",
            }}
          >
            <div id="LogIn">
              <FlipLogin></FlipLogin>
              {/* <LoginBox /> */}
              {/* <CreateAccountBox /> */}
            </div>
          </ParallaxLayer>
        </Parallax>
      </div>
    </>
  );
}

export default LandingPage;
