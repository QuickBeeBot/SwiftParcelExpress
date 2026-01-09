// src/components/Admin/TicketsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import './TicketsPage.css';

const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyForm, setReplyForm] = useState({ message: '' });
  const [assigningTo, setAssigningTo] = useState(null);
  const [assignForm, setAssignForm] = useState({ assignee: 'Unassigned' });

  // Mock agents (in prod: fetch from /agents)
  const agents = [
    { id: 'agent_1', name: 'Sarah Chen', role: 'Senior Support' },
    { id: 'agent_2', name: 'Michael Lee', role: 'Support Lead' },
    { id: 'agent_3', name: 'Alex Rivera', role: 'Support Specialist' }
  ];

  // Fetch tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError('');

        const q = query(collection(db, 'tickets'));
        const querySnapshot = await getDocs(q);
        const ticketList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));

        setTickets(ticketList);
      } catch (err) {
        console.error('Failed to load tickets:', err);
        setError('Failed to load support tickets.');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Update ticket
  const updateTicket = async (ticketId, updates) => {
    try {
      await updateDoc(doc(db, 'tickets', ticketId), {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Optimistic update
      setTickets(prev => prev.map(t => 
        t.id === ticketId ? { ...t, ...updates, updatedAt: new Date() } : t
      ));
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update ticket.');
    }
  };

  // Reply to ticket
  const handleReply = async (ticketId) => {
    if (!replyForm.message.trim()) {
      alert('Please enter a reply message.');
      return;
    }

    try {
      // Add reply to /ticketReplies
      await addDoc(collection(db, 'ticketReplies'), {
        ticketId,
        senderId: 'admin_1',
        senderName: 'Admin Team',
        senderRole: 'admin',
        message: replyForm.message,
        createdAt: serverTimestamp()
      });

      // Update ticket
      await updateTicket(ticketId, {
        status: 'in_progress',
        lastReplyAt: serverTimestamp()
      });

      // Reset
      setReplyingTo(null);
      setReplyForm({ message: '' });
    } catch (err) {
      alert('Failed to send reply.');
    }
  };

  // Assign ticket
  const handleAssign = async (ticketId) => {
    await updateTicket(ticketId, {
      assignee: assignForm.assignee,
      assignedAt: serverTimestamp()
    });
    setAssigningTo(null);
  };

  // Filter tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = 
        ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.userName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchTerm, filterStatus, filterPriority]);

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const config = {
      open: { text: 'Open', color: 'warning' },
      'in_progress': { text: 'In Progress', color: 'info' },
      'waiting_on_customer': { text: 'Waiting', color: 'secondary' },
      resolved: { text: 'Resolved', color: 'success' },
      closed: { text: 'Closed', color: 'default' }
    };
    return config[status] || config.open;
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const config = {
      low: { text: 'Low', color: 'success' },
      medium: { text: 'Medium', color: 'warning' },
      high: { text: 'High', color: 'danger' }
    };
    return config[priority] || config.medium;
  };

  return (
    <div className="tickets-page">
      <div className="page-header">
        <h1>Support Tickets</h1>
        <p>Manage and respond to customer support requests</p>
      </div>

      {/* Controls */}
      <div className="controls">
        <div className="search-bar">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by subject, ID, or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filters">
          <div className="filter-group">
            <label>Status:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_on_customer">Waiting on Customer</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Priority:</label>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error & Loading */}
      {error && (
        <div className="alert error">
          ❌ {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading tickets...</p>
        </div>
      ) : (
        <div className="tickets-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Subject</th>
                <th>User</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assignee</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">
                    No tickets found. Try adjusting your filters.
                  </td>
                </tr>
              ) : (
                filteredTickets.map(ticket => {
                  const statusBadge = getStatusBadge(ticket.status);
                  const priorityBadge = getPriorityBadge(ticket.priority);
                  return (
                    <tr key={ticket.id}>
                      <td>
                        <code>{ticket.id.substring(0, 6)}</code>
                      </td>
                      <td>{ticket.subject}</td>
                      <td>
                        <div className="user-info">
                          <div className="user-name">{ticket.userName || '—'}</div>
                          <div className="user-id">{ticket.userId?.substring(0, 6) || '—'}</div>
                        </div>
                      </td>
                      <td>
                        <span className={`priority-badge ${priorityBadge.color}`}>
                          {priorityBadge.text}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${statusBadge.color}`}>
                          {statusBadge.text}
                        </span>
                      </td>
                      <td>
                        {assigningTo === ticket.id ? (
                          <div className="assign-form">
                            <select
                              value={assignForm.assignee}
                              onChange={(e) => setAssignForm({ assignee: e.target.value })}
                              className="assign-select"
                            >
                              <option value="Unassigned">Unassigned</option>
                              {agents.map(agent => (
                                <option key={agent.id} value={agent.name}>
                                  {agent.name}
                                </option>
                              ))}
                            </select>
                            <div className="assign-actions">
                              <button 
                                className="btn-small btn-success"
                                onClick={() => handleAssign(ticket.id)}
                              >
                                Assign
                              </button>
                              <button 
                                className="btn-small btn-secondary"
                                onClick={() => setAssigningTo(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="assignee">
                            {ticket.assignee || 'Unassigned'}
                            <button 
                              className="assign-btn"
                              onClick={() => {
                                setAssigningTo(ticket.id);
                                setAssignForm({ assignee: ticket.assignee || 'Unassigned' });
                              }}
                            >
                              <i className="fas fa-user-edit"></i>
                            </button>
                          </div>
                        )}
                      </td>
                      <td>{formatDate(ticket.createdAt)}</td>
                      <td>
                        <button 
                          className="btn-small"
                          onClick={() => setReplyingTo(ticket.id)}
                        >
                          <i className="fas fa-reply"></i> Reply
                        </button>
                        <button 
                          className="btn-small btn-secondary"
                          onClick={() => updateTicket(ticket.id, { status: 'resolved' })}
                        >
                          <i className="fas fa-check"></i> Resolve
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Reply Modal */}
      {replyingTo && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Reply to Ticket</h3>
              <button 
                className="close-btn" 
                onClick={() => setReplyingTo(null)}
              >×</button>
            </div>
            <div className="modal-body">
              <div className="ticket-preview">
                <div className="subject">{tickets.find(t => t.id === replyingTo)?.subject}</div>
                <div className="user">{tickets.find(t => t.id === replyingTo)?.userName}</div>
              </div>
              <div className="form-group">
                <label>Reply Message</label>
                <textarea
                  value={replyForm.message}
                  onChange={(e) => setReplyForm({ message: e.target.value })}
                  placeholder="Type your response here..."
                  rows="5"
                  required
                />
              </div>
              <div className="modal-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => setReplyingTo(null)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary"
                  onClick={() => handleReply(replyingTo)}
                >
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      {!loading && (
        <div className="stats-summary">
          <div className="stat-card warning">
            <div className="stat-value">
              {tickets.filter(t => t.status === 'open').length}
            </div>
            <div className="stat-label">Open</div>
          </div>
          <div className="stat-card info">
            <div className="stat-value">
              {tickets.filter(t => t.status === 'in_progress').length}
            </div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card success">
            <div className="stat-value">
              {tickets.filter(t => t.status === 'resolved').length}
            </div>
            <div className="stat-label">Resolved</div>
          </div>
          <div className="stat-card danger">
            <div className="stat-value">
              {tickets.filter(t => t.priority === 'high').length}
            </div>
            <div className="stat-label">High Priority</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsPage;