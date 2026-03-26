import { ServerErronIcon } from "../../icons";

interface NotFoundViewProps {
  variant?: '404' | 'error' | 'empty';
  title?: string;
  message?: string;
  showLogo?: boolean;
  showIcon?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}


export default function NotFoundView({ 
  variant = 'empty',
  title,
  message,
  showIcon = true,
  action 
}: NotFoundViewProps) {
  const variants = {
    '404': {
      title: 'Error 404',
      message: 'Page Not Found: The page you are looking for could not be found.',
      icon: <ServerErronIcon className="w-16 h-16" />,
    },
    error: {
      title: 'Error 500',
      message: 'Server Error: Please Try Again Later',
      icon: <ServerErronIcon className="md:w-10 md:h-10 lg:w-12 lg:h-10 xl:w-14 xl:h-14"/>,
    },
    empty: {
      title: 'No Content',
      message: 'There is nothing to display at the moment.',
      icon: <ServerErronIcon className="w-16 h-16" />,
    }
  };

  const content = variants[variant];

  return (
    <div className="text-center sm:min-h-[80px] md:min-h-[118px] lg:min-h-[148px] xl:min-h-[168px]">  
      {showIcon && content.icon && (
        <div className="flex justify-center">
          {content.icon}
        </div>
      )}
      
      <h3 className="text-red-400 md:text-[20px] lg:text-[28px] xl:text-[30px] font-bold">
        {title || content.title}
      </h3>
      
      <p className="text-gray-600 text-base  md:text-[12px] xl:text-[18] leading-relaxed  md:pb-0 lg:pb-2">
        {message || content.message}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          className="px-4 md:py-1 lg:py-1.5 bg-[var(--color-primary-500)] sm:text-[8px] md:text-[12px] lg:text-[14px] text-white rounded-[8px] hover:bg-[var(--color-primary-600)] transition-colors font-medium shadow-sm hover:shadow-md"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
