import React from 'react';
import './VolumesHeader.css';

interface VolumesHeaderProps {
	title:string;
  count: number;
}

const VolumesHeader: React.FC<VolumesHeaderProps> = ({ count, title }) => (
  <div className="volumes-header">
    <div className="header-content">
      <h2>{title} ({count})</h2>
      <div className="header-actions">
        {/* Refresh functionality moved to global header */}
      </div>
    </div>
  </div>
);

export default VolumesHeader;
