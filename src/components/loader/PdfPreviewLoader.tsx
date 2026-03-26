import React from "react";

const PdfPreviewLoader: React.FC = () => {
  return (
    <div className="flex justify-center items-center w-full sm:min-h-[80px] md:min-h-[118px] lg:min-h-[148px] xl:min-h-[168px]">
      <div className="flex items-center justify-center">
        <span className="inline-block w-[4px] h-[20px] bg-[var(--color-primary-500)] rounded-[10px] animate-scale-up4" />
        <span className="inline-block w-[4px] h-[35px] bg-[var(--color-primary-500)] rounded-[10px] mx-[6px] animate-scale-up4 delay-250" />
        <span className="inline-block w-[4px] h-[20px] bg-[var(--color-primary-500)] rounded-[10px] animate-scale-up4 delay-500" />
      </div>
    </div>
  );
};

export default PdfPreviewLoader;
