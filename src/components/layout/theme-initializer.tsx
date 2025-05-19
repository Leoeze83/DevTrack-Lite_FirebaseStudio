
"use client";

import { useEffect } from "react";

export function ThemeInitializer() {
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      // Opcional: si no hay tema, o es light, asegurarse que no esté la clase dark
      // y si es la primera vez, establecer 'light' en localStorage.
      // if (localStorage.getItem("theme") === null) {
      //   localStorage.setItem("theme", "light");
      // }
    }
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

  return null; // Este componente no renderiza nada visible
}
