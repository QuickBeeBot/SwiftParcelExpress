// src/components/Dashboard/SupportPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import './SupportPage.css';

const SupportPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    category: 'general',
    priority: 'medium'
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch user's tickets
  const fetchTickets = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError('');

      const q = query(
        collection(db, 'tickets'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));

      setTickets(data);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Failed to load support tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Update ticket status
  const updateTicket = async (ticketId, field, value) => {
    try {
      const ticketRef = doc(db, 'tickets', ticketId);
      await updateDoc(ticketRef, {
        [field]: value,
        updatedAt: serverTimestamp()
      });

      // Optimistic UI update
      setTickets(prev => prev.map(t => 
        t.id === ticketId ? { ...t, [field]: value } : t
      ));
    } catch (err) {
      console.error('Update failed:', err);
      alert(`Failed to update ticket ${field}.`);
    }
  };

  // Create new ticket
  const handleCreateTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.message.trim()) {
      alert('Please fill in subject and message.');
      return;
    }

    setSubmitting(true);
    try {
      const ticketData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || currentUser.email.split('@')[0],
        subject: newTicket.subject,
        message: newTicket.message,
        category: newTicket.category,
        priority: newTicket.priority,
        status: 'open',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        assignee: getAutoAssignee(newTicket.priority),
        resolved: false
      };

      await addDoc(collection(db, 'tickets'), ticketData);

      // Reset & close
      setNewTicket({ subject: '', message: '', category: 'general', priority: 'medium' });
      setIsCreating(false);
      setSubmitting(false);

      // Refresh
      fetchTickets();
      alert('Ticket created! Our team will respond within 2 hours.');
    } catch (err) {
      console.error('Ticket creation failed:', err);
      setSubmitting(false);
      alert('Failed to create ticket. Please try again.');
    }
  };

  // Auto-assign agent based on priority
  const getAutoAssignee = (priority) => {
    const agents = {
      high: 'Sarah Chen',
      medium: 'Michael Lee',
      low: 'Alex Rivera'
    };
    return agents[priority] || 'Support Team';
  };

  // Get status/priority classes
  const getStatusClass = (status) => status.toLowerCase();
  const getPriorityClass = (priority) => priority.toLowerCase();

  return (
    <div className="support-page">
      <div className="page-header">
        <div>
          <h1>Support Tickets</h1>
          <p>Track and manage your support requests</p>
        </div>
        <button 
          className="btn-primarys" 
          onClick={() => setIsCreating(true)}
        >
          <i className="fas fa-plus"></i> New Ticket
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="alert error">
          ❌ {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading support tickets...</p>
        </div>
      )}

      {/* New Ticket Modal */}
      {isCreating && (
        <div className="ticket-modal">
          <div className="ticket-content">
            <div className="ticket-header">
              <h2>Create New Support Ticket</h2>
              <button className="close-btn" onClick={() => setIsCreating(false)}>×</button>
            </div>
            
            <div className="form-group">
              <label>Category:</label>
              <select
                value={newTicket.category}
                onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
              >
                <option value="general">General Inquiry</option>
                <option value="billing">Billing Issue</option>
                <option value="shipment">Shipment Problem</option>
                <option value="technical">Technical Issue</option>
                <option value="account">Account Help</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Priority:</label>
              <div className="priority-selector">
                <label>
                  <input
                    type="radio"
                    name="priority"
                    value="low"
                    checked={newTicket.priority === 'low'}
                    onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                  />
                  <span className="priority-badge low">Low</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="priority"
                    value="medium"
                    checked={newTicket.priority === 'medium'}
                    onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                  />
                  <span className="priority-badge medium">Medium</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="priority"
                    value="high"
                    checked={newTicket.priority === 'high'}
                    onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                  />
                  <span className="priority-badge high">High</span>
                </label>
              </div>
            </div>
            
            <div className="form-group">
              <label>Subject:</label>
              <input
                type="text"
                value={newTicket.subject}
                onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                placeholder="Brief summary of your issue"
                maxLength="100"
              />
            </div>
            
            <div className="form-group">
              <label>Details:</label>
              <textarea
                value={newTicket.message}
                onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                placeholder="Please describe your issue in detail..."
                rows="6"
                required
              />
            </div>
            
            <div className="ticket-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setIsCreating(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleCreateTicket}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner"></span>
                    Creating...
                  </>
                ) : (
                  'Submit Ticket'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tickets Table */}
      {!loading && !error && (
        <div className="tickets-table">
          {tickets.length === 0 ? (
            <div className="empty-state">
              {/* <div className="empty-icon">🎫</div> */}
              <h3>No support tickets yet</h3>
              <p>Get help with shipments, billing, or account issues.</p>
              <button 
                className="btn-secondary" 
                onClick={() => setIsCreating(true)}
              >
                Create Your First Ticket
              </button>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Created</th>
                  <th>Assignee</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => (
                  <tr key={ticket.id}>
                    <td>#{ticket.id?.substring(0, 6)}</td>
                    <td>{ticket.subject}</td>
                    <td>
                      <span className="category-badge">
                        {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}
                      </span>
                    </td>
                    <td>
                      <select
                        value={ticket.status}
                        onChange={(e) => updateTicket(ticket.id, 'status', e.target.value)}
                        className={`status-selector ${getStatusClass(ticket.status)}`}
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="waiting_on_customer">Waiting on Customer</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td>
                      <select
                        value={ticket.priority}
                        onChange={(e) => updateTicket(ticket.id, 'priority', e.target.value)}
                        className={`priority-selector-inline ${getPriorityClass(ticket.priority)}`}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </td>
                    <td>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td>{ticket.assignee}</td>
                    <td>
                      <button 
                        className="btn-small"
                        onClick={() => navigate(`/dashboard/support/${ticket.id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default SupportPage;










// // src/components/Dashboard/SupportPage.jsx
// import React, { useState, useEffect } from 'react';
// import './SupportPage.css';

// const SupportPage = () => {
//   const [tickets, setTickets] = useState([
//     {
//       id: 'TICKET001',
//       subject: 'Delayed Shipment',
//       status: 'Open',
//       priority: 'High',
//       date: '2025-06-18',
//       assignee: 'Sarah Chen'
//     },
//     {
//       id: 'TICKET002',
//       subject: 'Billing Inquiry',
//       status: 'In Progress',
//       priority: 'Medium',
//       date: '2025-06-15',
//       assignee: 'Michael Lee'
//     },
//     {
//       id: 'TICKET003',
//       subject: 'Package Damage',
//       status: 'Closed',
//       priority: 'Low',
//       date: '2025-06-10',
//       assignee: 'Alex Rivera'
//     }
//   ]);

//   return (
//     <div className="support-page">
//       <div className="page-header">
//         <h1>Support</h1>
//         <button className="btn-primarys">New Ticket</button>
//       </div>

//       <div className="tickets-table">
//         <table>
//           <thead>
//             <tr>
//               <th>Ticket ID</th>
//               <th>Subject</th>
//               <th>Status</th>
//               <th>Priority</th>
//               <th>Date</th>
//               <th>Assignee</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {tickets.map(ticket => (
//               <tr key={ticket.id}>
//                 <td>{ticket.id}</td>
//                 <td>{ticket.subject}</td>
//                 <td>
//                   <span className={`status-badge ${ticket.status.toLowerCase()}`}>
//                     {ticket.status}
//                   </span>
//                 </td>
//                 <td>
//                   <span className={`priority-badge ${ticket.priority.toLowerCase()}`}>
//                     {ticket.priority}
//                   </span>
//                 </td>
//                 <td>{ticket.date}</td>
//                 <td>{ticket.assignee}</td>
//                 <td>
//                   <button className="btn-small">View</button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default SupportPage;






