import { IParallax } from "@react-spring/parallax";
import { useSpring, animated } from "@react-spring/web";
interface LandingPageNavigator {
  parallaxref: React.RefObject<IParallax>;
}
function NavBar({ parallaxref }: LandingPageNavigator) {
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    delay: 500,
  });
  const scrollToLogin = () => {
    parallaxref.current?.scrollTo(2);
  };
  const scrolltoHome = () => {
    parallaxref.current?.scrollTo(0);
  };
  const scrollToFeatures = () => {
    parallaxref.current?.scrollTo(1.28);
  };
  return (
    <>
      <animated.div
        style={fadeIn}
        className="fixed flex justify-center top-0 left-0 right-0 z-10 bg-transparent py-5 "
      >
        <div className="flex space-x-20 ">
          <button onClick={scrolltoHome} className="navBar">
            Home
          </button>
          <button onClick={scrollToFeatures} className="navBar">
            Features
          </button>
          <button onClick={scrollToLogin} className="navBar">
            Sign In
          </button>
        </div>
      </animated.div>
    </>
  );
}

export default NavBar;
