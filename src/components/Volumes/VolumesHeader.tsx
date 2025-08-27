import React from 'react';
import './VolumesHeader.css';

interface VolumesHeaderProps {
	title:string;
  count: number;
  loading: boolean;
  onRefresh: () => void;
}

const VolumesHeader: React.FC<VolumesHeaderProps> = ({ count, loading, onRefresh,title }) => (
  <div className="volumes-header">
    <div className="header-content">
      <h2>{title} ({count})</h2>
      <div className="header-actions">
        <button
          onClick={onRefresh}
          className="refresh-btn"
          disabled={loading}
          data-tooltip="Refresh volumes list"
        >
          🔄 Refresh
        </button>
      </div>
    </div>
  </div>
);

export default VolumesHeader;
