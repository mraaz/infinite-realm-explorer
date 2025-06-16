
export const usePrintReport = () => {
  const handlePrintReport = () => {
    window.print();
  };

  return { handlePrintReport };
};
