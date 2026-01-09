// ActivityFeed.jsx
import React from 'react';
import './ActivityFeed.css';

const ActivityFeed = () => {
  const activities = [
    {
      id: 1,
      type: 'shipment',
      text: 'New shipment request from John Doe (SP2025ABC)',
      time: '2 minutes ago',
      user: 'system'
    },
    {
      id: 2,
      type: 'ticket',
      text: 'Support ticket #TICKET045 opened: "Delayed delivery"',
      time: '15 minutes ago',
      user: 'customer'
    },
    {
      id: 3,
      type: 'approval',
      text: 'Approved shipment SP2025XYZ ($384.99)',
      time: '1 hour ago',
      user: 'admin'
    },
    {
      id: 4,
      type: 'delivery',
      text: 'Package SP2025DEF delivered in Tokyo',
      time: '3 hours ago',
      user: 'system'
    }
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'shipment': return '📦';
      case 'ticket': return '🎫';
      case 'approval': return ' ';
      case 'delivery': return '🚚';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="activity-feed">
      {activities.map(activity => (
        <div key={activity.id} className="activity-item">
          <div className="activity-icon">
            {getIcon(activity.type)}
          </div>
          <div className="activity-content">
            <div className="activity-text">{activity.text}</div>
            <div className="activity-meta">
              <span>{activity.time}</span>
              {activity.user === 'admin' && <span className="badge admin">Admin</span>}
              {activity.user === 'customer' && <span className="badge customer">Customer</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;