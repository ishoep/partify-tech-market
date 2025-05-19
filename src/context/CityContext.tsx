
import React, { createContext, useState, useEffect, useContext } from "react";

const uzbekistanCities = [
  "Ташкент",
  "Самарканд",
  "Бухара",
  "Наманган",
  "Андижан",
  "Нукус",
  "Фергана",
  "Карши",
  "Коканд",
  "Маргилан",
  "Чирчик",
  "Джизак"
];

interface CityContextType {
  cities: string[];
  selectedCity: string;
  setSelectedCity: (city: string) => void;
}

const CityContext = createContext<CityContextType | null>(null);

export const CityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    const savedCity = localStorage.getItem("selectedCity");
    return savedCity || uzbekistanCities[0];
  });

  useEffect(() => {
    localStorage.setItem("selectedCity", selectedCity);
  }, [selectedCity]);

  const value = {
    cities: uzbekistanCities,
    selectedCity,
    setSelectedCity,
  };

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
};

export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error("useCity must be used within a CityProvider");
  }
  return context;
};
