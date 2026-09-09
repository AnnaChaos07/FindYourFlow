import { createContext, useContext } from "react";
import { toast } from "react-toastify";

const AppContext = createContext(null);

export function AppContextProvider({ children }) {
  function handleError(error, fallbackMessage = "Ein Fehler ist aufgetreten.") {
    const message = error?.response?.data?.message || fallbackMessage;

    toast.error(message);
  }

  return (
    <AppContext.Provider value={{ handleError }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}