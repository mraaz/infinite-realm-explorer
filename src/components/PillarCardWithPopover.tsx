// src/components/PillarCardWithPopover.tsx

import { FC, Fragment, ReactNode } from "react";
import { Popover, Transition } from "@headlessui/react";
import PillarCard from "@/components/PillarCard";

// --- TYPE DEFINITION ---
interface PillarCardWithPopoverProps {
  icon: ReactNode;
  title: string;
  description: string;
  hoverBorderColor: string;
  iconBgColor: string;
  popoverContent: {
    title: string;
    text: string;
  };
}

// --- MAIN COMPONENT ---
const PillarCardWithPopover: FC<PillarCardWithPopoverProps> = ({
  icon,
  title,
  description,
  hoverBorderColor,
  iconBgColor,
  popoverContent,
}) => {
  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          {/* 1. The focus outline has been removed. */}
          <Popover.Button className="w-full text-left rounded-2xl focus:outline-none">
            <PillarCard
              icon={icon}
              title={title}
              description={description}
              hoverBorderColor={hoverBorderColor}
              iconBgColor={iconBgColor}
            />
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition-opacity duration-300 ease-out"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-200 ease-in"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            {/* 2. The Panel now overlays the card directly. */}
            <Popover.Panel
              static // 'static' helps with animations by keeping the element in the DOM
              className="absolute inset-0 z-10 p-4"
            >
              {/* This div creates the dark backdrop and centers the text */}
              <div className="flex h-full w-full items-center justify-center rounded-2xl bg-black/70 p-6 backdrop-blur-sm text-center">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {popoverContent.title}
                  </h3>
                  <p className="text-sm text-gray-200">{popoverContent.text}</p>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default PillarCardWithPopover;
