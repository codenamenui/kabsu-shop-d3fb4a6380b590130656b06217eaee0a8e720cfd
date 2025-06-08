import React, { useState } from "react";

const ExpandableText = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // If text is short enough, just show it normally
  if (!text || text.length < 100) {
    return (
      <p className="border-t border-gray-100 pt-3 text-sm italic text-gray-500">
        {text}
      </p>
    );
  }

  return (
    <div className="relative w-10">
      <p
        className={`border-t border-gray-100 pt-3 text-sm italic text-gray-500 ${
          isExpanded ? "" : "line-clamp-2"
        }`}
      >
        {text}
      </p>

      {!isExpanded && (
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent" />
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-1 text-xs text-blue-500 hover:text-blue-700 focus:outline-none"
      >
        {isExpanded ? "Show less" : "Show more"}
      </button>
    </div>
  );
};

export default ExpandableText;

// Usage example:
// {status.details && <ExpandableText text={status.details} />}
