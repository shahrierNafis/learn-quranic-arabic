"use client";
import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import {
  type Container,
  type ISourceOptions,
  OutMode,
} from "@tsparticles/engine";
// import { loadAll } from "@tsparticles/all"; // if you are going to use `loadAll`, install the "@tsparticles/all" package too.
// import { loadFull } from "tsparticles"; // if you are going to use `loadFull`, install the "tsparticles" package too.
import { loadSlim } from "@tsparticles/slim"; // if you are going to use `loadSlim`, install the "@tsparticles/slim" package too.
// import { loadBasic } from "@tsparticles/basic"; // if you are going to use `loadBasic`, install the "@tsparticles/basic" package too.

export default function ParticlesEffect() {
  const [init, setInit] = useState(false);

  // this should be run only once per application lifetime
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
      // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
      // starting from v2 you can add only the features you need reducing the bundle size
      //await loadAll(engine);
      //await loadFull(engine);
      await loadSlim(engine);
      //await loadBasic(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {};

  const options: ISourceOptions = useMemo(
    () => ({
      background: {
        color: {
          value: "black",
        },
      },
      fpsLimit: 120,
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: "connect",

            parallax: {
              enable: true,
              force: 20,
              smooth: 100,
            },
          },
        },
        modes: {
          connect: {
            distance: 3,
            radius: 5,
            links: {
              opacity: 0.1,
            },
          },
        },
      },
      particles: {
        color: {
          value: "#20df70",
        },
        collisions: { enable: true },
        move: {
          size: true,
          direction: "right",
          enable: true,
          outModes: {
            default: "out",
          },
          random: false,
          speed: 1,
          straight: true,
        },
        number: {
          value: 1,
          density: {
            enable: true,
            height: 100,
            width: 100,
          },
        },
        opacity: {
          value: 1,
        },
        shape: {
          fill: true,
          type: "star",
        },
        size: {
          value: { min: 1, max: 2 },
        },
      },
      detectRetina: true,
    }),
    []
  );

  if (init) {
    return (
      <Particles
        id="tsparticles"
        className="-z-10 fixed"
        particlesLoaded={particlesLoaded}
        options={options}
      />
    );
  }

  return <>{/* <LoadingScreen /> */}</>;
}
