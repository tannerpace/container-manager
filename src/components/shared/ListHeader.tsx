import React from "react";
import "./ListHeader.css";

interface ListHeaderProps {
  title: string;
  count: number;
  onAction: () => void;
  isLoading: boolean;
}

export const ListHeader: React.FC<ListHeaderProps> = ({
  title,
  count,
  onAction,
  isLoading,
}) => {
  return (
    <div className="list-header">
      <div className="header-content">
        <h2>
          {title} ({count})
        </h2>
        <div className="header-actions">
          <button
            onClick={onAction}
            className="refresh-btn"
            disabled={isLoading}
            data-tooltip="Refresh list"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  );
};
