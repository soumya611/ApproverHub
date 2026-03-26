import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadIcon } from "../../../icons";

interface FileDropzoneProps {
  onFilesChange?: (files: File[]) => void;
  files?: File[];
  className?: string;
  helperText?: string;
}

export default function FileDropzone({
  onFilesChange,
  files,
  className = "",
  helperText = "Drag & drop files or upload",
}: FileDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesChange?.(acceptedFiles);
    },
    [onFilesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`flex min-h-[216px] cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed border-gray-300 bg-gray-200 px-4 text-center transition hover:border-gray-400 ${className}`}
    >
      <input {...getInputProps()} />
      <div className="flex  items-center justify-center text-gray-500">
       <UploadIcon className="h-10 w-10"/>
      </div>
      <p className="mt-3 text-sm text-gray-500">
        {isDragActive ? "Drop files here" : helperText}{" "}
        <span className="text-[#F25C54] underline">upload</span>
      </p>
      {files && files.length > 0 ? (
        <div className="mt-3 space-y-1 text-xs text-gray-500">
          {files.map((file) => (
            <div key={file.name}>{file.name}</div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
