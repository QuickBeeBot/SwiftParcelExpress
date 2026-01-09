// src/components/Dashboard/MessagesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import './MessagesPage.css';

const MessagesPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [composeForm, setComposeForm] = useState({
    subject: '',
    body: ''
  });
  const [replyTo, setReplyTo] = useState(null);

  // Fetch user's messages
  const fetchMessages = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError('');

      const q = query(
        collection(db, 'messages'),
        where('recipientId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));

      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Mark as read
  const markAsRead = async (messageId, currentStatus) => {
    if (currentStatus) return; // Already read

    try {
      const msgRef = doc(db, 'messages', messageId);
      await updateDoc(msgRef, {
        read: true,
        readAt: serverTimestamp()
      });

      // Optimistic UI update
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, read: true } : m
      ));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  // Open message (mark as read + navigate)
  const openMessage = (msg) => {
    markAsRead(msg.id, msg.read);
    navigate(`/dashboard/messages/${msg.id}`, { state: { message: msg } });
  };

  // Delete message
  const deleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      const msgRef = doc(db, 'messages', messageId);
      // In Firestore, soft delete is better:
      await updateDoc(msgRef, { deleted: true, deletedAt: serverTimestamp() });

      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete message.');
    }
  };

  // Start reply
  const startReply = (msg) => {
    setReplyTo(msg);
    setIsComposing(true);
    setComposeForm({
      subject: `Re: ${msg.subject}`,
      body: `\n\n--- Original Message ---\nFrom: ${msg.sender}\nDate: ${new Date(msg.createdAt).toLocaleString()}\n\n${msg.body || msg.preview}`
    });
  };

  // Compose form handlers
  const handleComposeChange = (e) => {
    const { name, value } = e.target;
    setComposeForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSend = async () => {
    if (!composeForm.subject.trim() || !composeForm.body.trim()) {
      alert('Please fill in subject and message.');
      return;
    }

    try {
      // Send to support (hardcoded recipientId for now)
      await addDoc(collection(db, 'messages'), {
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'User',
        senderEmail: currentUser.email,
        recipientId: 'support-team', // ← You can make this dynamic
        subject: composeForm.subject,
        body: composeForm.body,
        createdAt: serverTimestamp(),
        read: false
      });

      // Clear & close
      setComposeForm({ subject: '', body: '' });
      setIsComposing(false);
      setReplyTo(null);
      alert('Message sent! Our team will respond within 2 hours.');

      // Refresh
      fetchMessages();
    } catch (err) {
      console.error('Send failed:', err);
      alert('Failed to send message. Please try again.');
    }
  };

  const getStatusClass = (read) => read ? 'read' : 'unread';

  return (
    <div className="messages-page">
      <div className="page-header">
        <h1>Messages</h1>
        <button 
          className="btn-primarys" 
          onClick={() => {
            setIsComposing(true);
            setReplyTo(null);
            setComposeForm({ subject: '', body: '' });
          }}
        >
          <i className="fas fa-edit"></i> Compose
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
          <p>Loading messages...</p>
        </div>
      )}

      {/* Compose Modal */}
      {isComposing && (
        <div className="compose-modal">
          <div className="compose-content">
            <div className="compose-header">
              <h3>{replyTo ? 'Reply' : 'New Message'}</h3>
              <button className="close-btn" onClick={() => setIsComposing(false)}>×</button>
            </div>
            
            <div className="form-group">
              <label>To:</label>
              <input 
                type="text" 
                value="SwiftParcel Support" 
                disabled 
                className="to-field"
              />
            </div>
            
            <div className="form-group">
              <label>Subject:</label>
              <input
                type="text"
                name="subject"
                value={composeForm.subject}
                onChange={handleComposeChange}
                placeholder="Enter subject"
              />
            </div>
            
            <div className="form-group">
              <label>Message:</label>
              <textarea
                name="body"
                value={composeForm.body}
                onChange={handleComposeChange}
                placeholder="Write your message..."
                rows="6"
              />
            </div>
            
            <div className="compose-actions">
              <button className="btn-secondary" onClick={() => setIsComposing(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSend}>
                <i className="fas fa-paper-plane"></i> Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages List */}
      {!loading && !error && (
        <div className="messages-list">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✉️</div>
              <h3>No messages yet</h3>
              <p>Your inbox is empty. Send a message or wait for shipment updates.</p>
              <button 
                className="btn-secondary" 
                onClick={() => setIsComposing(true)}
              >
                Compose Message
              </button>
            </div>
          ) : (
            messages.map(msg => (
              <div 
                key={msg.id} 
                className={`message-item ${getStatusClass(msg.read)}`}
                onClick={() => openMessage(msg)}
              >
                <div className="message-sender">
                  <div className={`status-dot ${getStatusClass(msg.read)}`}></div>
                  {msg.senderName || msg.sender || 'System'}
                </div>
                <div className="message-content">
                  <h3>{msg.subject}</h3>
                  <p>{msg.body?.substring(0, 100) || msg.preview || 'No content'}</p>
                </div>
                <div className="message-meta">
                  <div className="message-date">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </div>
                  <div className="message-actions">
                    {!msg.read && (
                      <button 
                        className="btn-action btn-read"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(msg.id, msg.read);
                        }}
                      >
                        Mark Read
                      </button>
                    )}
                    <button 
                      className="btn-action"
                      onClick={(e) => {
                        e.stopPropagation();
                        startReply(msg);
                      }}
                    >
                      Reply
                    </button>
                    <button 
                      className="btn-action btn-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMessage(msg.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MessagesPage;


// // src/components/Dashboard/MessagesPage.jsx
// import React, { useState, useEffect } from 'react';
// import './MessagesPage.css';

// const MessagesPage = () => {
//   const [messages, setMessages] = useState([
//     {
//       id: 1,
//       sender: 'Support Team',
//       subject: 'Your shipment has been delayed',
//       preview: 'Due to weather conditions, your package will arrive on June 20.',
//       date: '2025-06-18',
//       read: false
//     },
//     {
//       id: 2,
//       sender: 'Customer Service',
//       subject: 'Invoice #INV2025001 is ready',
//       preview: 'Please find your invoice attached. Payment due in 14 days.',
//       date: '2025-06-15',
//       read: true
//     },
//     {
//       id: 3,
//       sender: 'Delivery Agent',
//       subject: 'Package pickup scheduled',
//       preview: 'Your item will be picked up tomorrow at 10 AM.',
//       date: '2025-06-10',
//       read: true
//     }
//   ]);

//   return (
//     <div className="messages-page">
//       <div className="page-header">
//         <h1>Messages</h1>
//         <button className="btn-primarys">Compose</button>
//       </div>

//       <div className="messages-list">
//         {messages.map(msg => (
//           <div key={msg.id} className={`message-item ${msg.read ? 'read' : 'unread'}`}>
//             <div className="message-sender">{msg.sender}</div>
//             <div className="message-content">
//               <h3>{msg.subject}</h3>
//               <p>{msg.preview}</p>
//             </div>
//             <div className="message-date">{msg.date}</div>
//             <button className="btn-small">Reply</button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default MessagesPage;







