"use client";
import styles from "./_components/taskmask/styles.module.scss";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const phrases = [
  "Start with simple coding exercises.",
  "Learn the basics of algorithms.",
  "Practice coding regularly.",
  "Join coding communities for support.",
];

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className={styles.container}>
        <MaskText />
      </div>
    </div>
  );
}

export function MaskText() {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-50px" }); // Remove `once` to trigger every time

  const animation = {
    initial: { y: "100%" },
    enter: (i: number) => ({
      y: "0",
      transition: {
        duration: 0.75,
        ease: [0.33, 1, 0.68, 1] as [number, number, number, number],
        delay: 0.075 * i,
      },
    }),
    exit: { y: "100%" }, // Optional exit animation
  };

  return (
    <div ref={ref} className={styles.body}>
      {phrases.map((phrase, index) => (
        <div key={index} className={styles.lineMask}>
          <motion.p
            custom={index}
            variants={animation}
            initial="initial"
            animate={inView ? "enter" : "initial"} // Re-run animation on each view
          >
            {phrase}
          </motion.p>
        </div>
      ))}
    </div>
  );
}
