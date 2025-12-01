"use client";
import styles from "./styles.module.scss";
import { useState } from "react";
import { motion } from "framer-motion";
import useMousePosition from "../_components/constant/useMousePosition";

export default function MaskEffect() {
  const [isHovered, setIsHovered] = useState(false);
  const { x, y } = useMousePosition();
  const size = isHovered ? 400 : 40;

  return (
    <div className="hidden md:block bg-black">
      <main className={styles.main}>
        <motion.div
          className={styles.mask}
          animate={{
            WebkitMaskPosition: `${x - size / 2}px ${y - size / 2}px`,
            WebkitMaskSize: `${size}px`,
            maskPosition: `${x - size / 2}px ${y - size / 2}px`,
            maskSize: `${size}px`,
          } as any}
          transition={{ 
            type: "tween", 
            damping: 25, 
            stiffness: 300, 
            mass: 0.3,
            restDelta: 0.001
          }}
        >
          <p
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            ...And one typo away from spending the entire day debugging.
          </p>
        </motion.div>

        <div className={styles.body}>
          <p>
            In <span>programming</span>, you're always just one step away from
            making something incredible!
          </p>
        </div>
      </main>
    </div>
  );
}
