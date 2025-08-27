import React from 'react';
import './ReusableHeader.css';

type ReusableHeaderProps = {
  title: string;
  count: number;
  loading: boolean;
  onRefresh: () => void;
};

export const ReusableHeader: React.FC<ReusableHeaderProps> = ({
  title,
  count,
  loading,
  onRefresh,
}) => {
  return (
    <div className="header-container">
      <div className="header-content">
        <h2>
          {title} ({count})
        </h2>
        <div className="header-actions">
          <button
            onClick={onRefresh}
            className="refresh-btn"
            disabled={loading}
            data-tooltip={`Refresh ${title.toLowerCase()} list`}
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  );
};
