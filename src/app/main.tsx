import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import { registerLicense } from "@syncfusion/ej2-base";
import App from "./App";

registerLicense(
  "Ngo9BigBOggjHTQxAR8/V1JFaF1cXGFCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdmWH1ed3ZWQmVYVkZwWEFWYEw="
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
