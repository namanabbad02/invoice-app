// import React from 'react';

// const FloatingLabelInput = ({ label, id, ...props }) => {
//   return (
//     <div className="relative">
//       <input
//         id={id}
//         className="peer w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg placeholder-transparent 
//                    focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 dark:bg-gray-700/50"
//         placeholder={label}
//         {...props}
//       />
//       <label
//         htmlFor={id}
//         className="absolute left-4 -top-2.5 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 px-1 transition-all
//                    peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base 
//                    peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 dark:peer-focus:text-blue-400"
//       >
//         {label}
//       </label>
//     </div>
//   );
// };

// export default FloatingLabelInput;
import React from 'react';

const FloatingLabelInput = ({ label, id, ...props }) => {
  return (
    <div className="relative">
      <input
        id={id}
        className="peer w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg placeholder-transparent 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 dark:bg-gray-700/50 transition-colors"
        placeholder={label}
        {...props}
      />
      <label
        htmlFor={id}
        className="absolute left-3 -top-2.5 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-1 transition-all
                   peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base 
                   peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 dark:peer-focus:text-blue-400"
      >
        {label}
      </label>
    </div>
  );
};

export default FloatingLabelInput;