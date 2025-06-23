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
          <Popover.Button className="w-full text-left rounded-2xl focus:outline-none h-full">
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
            <Popover.Panel static className="absolute inset-0 z-10">
              {/* This div creates the backdrop */}
              <div className="relative h-full w-full rounded-2xl bg-black/70 backdrop-blur-sm">
                {/* This div holds the content and is centered using the transform technique */}
                <div className="absolute top-1/2 left-1/2 w-full -translate-y-1/2 -translate-x-1/2 p-6 text-center">
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
