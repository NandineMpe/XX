"use client";
import React, { useState, useRef } from "react";

interface HalomotButtonProps {
  gradient?: string; // Gradient for the button border/background
  inscription: string; // Button text
  onClick: () => void;
  fillWidth?: boolean;
  fixedWidth?: string;
  href?: string;
  backgroundColor?: string; // Solid color for the inner button (not gradient)
  icon?: React.ReactElement;
  borderWidth?: string; // Controls the padding (thickness of the gradient border)
  padding?: string; // Custom padding for the inner button, e.g., "1rem 4rem"
  outerBorderRadius?: string; // Border radius for the gradient outer border
  innerBorderRadius?: string; // Border radius for the inner button
  textColor?: string; // Text color for the button, default #fff
  hoverTextColor?: string;
}

export const HalomotButton: React.FC<HalomotButtonProps> = ({
  gradient = "linear-gradient(135deg, #8b5cf6, #a855f7, #7c3aed)",
  inscription,
  onClick,
  fillWidth = false,
  fixedWidth,
  href,
  backgroundColor = "rgba(0, 0, 0, 0.8)",
  icon,
  borderWidth = "1px",
  padding,
  outerBorderRadius = "12px",
  innerBorderRadius = "11px",
  textColor = "#fff",
  hoverTextColor,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [delayedColor, setDelayedColor] = useState<string | undefined>(undefined);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Container style for fixed width
  const containerStyle: React.CSSProperties = fixedWidth
    ? { width: fixedWidth, display: "inline-block" }
    : {};

  // Outer button style (gradient border with glass effect)
  const buttonStyle: React.CSSProperties = {
    margin: fillWidth || fixedWidth ? "0" : "auto",
    padding: borderWidth,
    background: gradient,
    border: "0",
    borderRadius: outerBorderRadius,
    color: textColor,
    fontWeight: "bold",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textDecoration: "none",
    userSelect: "none",
    WebkitUserSelect: "none",
    whiteSpace: "nowrap",
    transition: "all .3s ease",
    width: fillWidth || fixedWidth ? "100%" : "fit-content",
    flexDirection: "row",
    boxSizing: "border-box",
    backdropFilter: "blur(10px)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
  };

  // Inner span style (actual clickable area with glass effect)
  const spanStyle: React.CSSProperties = {
    background: isHovered 
      ? "rgba(255, 255, 255, 0.1)" 
      : backgroundColor,
    padding: padding ?? (fillWidth || fixedWidth ? "1rem 0" : "1rem 2rem"),
    border: "0",
    borderRadius: innerBorderRadius,
    width: "100%",
    height: "100%",
    transition: hoverTextColor ? "color 0.3s, background 300ms" : "background 300ms",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    color: delayedColor ? delayedColor : textColor,
    whiteSpace: "nowrap",
    fontFamily: "inherit",
    fontSize: "1rem",
    gap: icon ? "0.5em" : 0,
    flexDirection: "row",
    boxSizing: "border-box",
    cursor: "pointer",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  };

  // Icon style
  const iconStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    height: "1em",
    width: "1em",
    fontSize: "1.1em",
    verticalAlign: "middle",
    flexShrink: 0,
  };

  // No delay, just set color immediately
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (hoverTextColor) {
      setDelayedColor(hoverTextColor);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setDelayedColor(undefined);
  };

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    onClick();
  };

  const ButtonContent = (
    <span
      style={spanStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {icon && React.cloneElement(icon, { style: iconStyle })}
      {inscription}
    </span>
  );

  const ButtonElement = href ? (
    <a href={href} style={buttonStyle} onClick={handleClick}>
      {ButtonContent}
    </a>
  ) : (
    <button type="button" style={buttonStyle} onClick={handleClick}>
      {ButtonContent}
    </button>
  );

  return fixedWidth ? (
    <div style={containerStyle}>{ButtonElement}</div>
  ) : (
    ButtonElement
  );
}; 