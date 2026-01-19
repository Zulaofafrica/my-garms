"use client";

import React, { createContext, useContext, useState } from "react";

type ConfiguratorState = {
    color: string;
    material: "cotton" | "silk" | "denim";
    setColor: (color: string) => void;
    setMaterial: (material: "cotton" | "silk" | "denim") => void;
};

const ConfiguratorContext = createContext<ConfiguratorState | undefined>(
    undefined
);

export const ConfiguratorProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [color, setColor] = useState("#4338ca");
    const [material, setMaterial] = useState<"cotton" | "silk" | "denim">("cotton");

    return (
        <ConfiguratorContext.Provider
            value={{
                color,
                material,
                setColor,
                setMaterial,
            }}
        >
            {children}
        </ConfiguratorContext.Provider>
    );
};

export const useConfigurator = () => {
    const context = useContext(ConfiguratorContext);
    if (!context) {
        throw new Error(
            "useConfigurator must be used within a ConfiguratorProvider"
        );
    }
    return context;
};
