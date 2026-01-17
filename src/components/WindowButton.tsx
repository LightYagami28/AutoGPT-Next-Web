import React from "react";
import Ping from "./Ping";

type WindowButtonProps = {
  ping?: boolean; // Toggles the ping animation
  onClick?: () => void;
  icon: React.ReactNode;
  name: string;
  styleClass?: { [key: string]: string };
};

const WindowButton = ({
  ping,
  onClick,
  icon,
  name,
  styleClass,
}: WindowButtonProps) => {
  return (
    <button
      type="button"
      className={`flex cursor-pointer items-center gap-2 p-1 px-2 text-sm hover:bg-white/10 transition-colors ${styleClass?.container || ""
        }`}
      onClick={onClick}
    >
      {ping ? <Ping color="blue" /> : null}
      {icon}
      <p className="font-mono">{name}</p>
    </button>
  );
};

export default WindowButton;
