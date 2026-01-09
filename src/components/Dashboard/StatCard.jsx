// src/components/Dashboard/StatCard.jsx
import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, trend }) => {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{title}</div>
      {trend && <div className="stat-trend">{trend}</div>}
    </div>
  );
};

export default StatCard;

// // src/components/Dashboard/StatCard.jsx
// import React from 'react';
// import './StatCard.css';

// const StatCard = ({ title, value, icon, trend, color = '#FF6B35', children }) => {
//   return (
//     <div className="stat-card" style={{ borderColor: color }}>
//       <div className="stat-header">
//         <h3>{title}</h3>
//         {children}
//       </div>
//       <div className="stat-body">
//         <div className="value">{value}</div>
//         <div className="trend">{trend}</div>
//       </div>
//     </div>
//   );
// };

// export default StatCard;