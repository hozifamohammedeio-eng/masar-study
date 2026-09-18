"use client";

import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

type Props = {
  viewKey: string;
  children: ReactNode;
};

export default function SmoothView({
  viewKey,
  children,
}: Props) {
  const [visible, setVisible] =
    useState(true);

  const [displayedContent, setDisplayedContent] =
    useState(children);

  const previousKey =
    useRef(viewKey);

  useEffect(() => {
    if (
      previousKey.current ===
      viewKey
    ) {
      setDisplayedContent(
        children
      );

      return;
    }

    setVisible(false);

    const changeTimer =
      window.setTimeout(() => {
        setDisplayedContent(
          children
        );

        previousKey.current =
          viewKey;

        window.requestAnimationFrame(
          () => {
            window.requestAnimationFrame(
              () => {
                setVisible(
                  true
                );
              }
            );
          }
        );
      }, 110);

    return () => {
      window.clearTimeout(
        changeTimer
      );
    };
  }, [
    viewKey,
    children,
  ]);

  return (
    <div
      className={`transition-[opacity,transform] duration-200 ease-out ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-[5px] opacity-0"
      }`}
    >
      {displayedContent}
    </div>
  );
}