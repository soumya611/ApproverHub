import { useAppNavigate } from "./useAppNavigate";

const useGoBack = () => {
  const { goBack } = useAppNavigate();

  return () => goBack({ fallbackTo: "/" });
};

export default useGoBack;
