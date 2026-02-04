'use client';

import { useEffect, useState } from 'react';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showAddAiCommentsModal, setShowAddAiCommentsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [additionalAiComments, setAdditionalAiComments] = useState(0);
  
  // Add User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPlanId, setNewUserPlanId] = useState('');
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [createdUserCredentials, setCreatedUserCredentials] = useState<{email: string, password: string} | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchPlans();
  }, [page]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/users?page=${page}&limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/plans', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const changePlan = async (userId: string, planId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/users/${userId}/plan`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planId })
      });
      const data = await response.json();
      if (data.success) {
        alert('Plan updated successfully!');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error changing plan:', error);
      alert('Failed to update plan');
    }
  };

  const deleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user "${userEmail}"?\n\nThis action cannot be undone and will permanently delete all user data.`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        alert('User deleted successfully!');
        fetchUsers();
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const openAddAiCommentsModal = (user: any) => {
    setSelectedUser(user);
    setAdditionalAiComments(0);
    setShowAddAiCommentsModal(true);
  };

  const addAiComments = async () => {
    if (!selectedUser || additionalAiComments < 1) {
      alert('Please enter a valid number of AI comments');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/users/${selectedUser.id}/ai-comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ additionalAiComments })
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        setShowAddAiCommentsModal(false);
        fetchUsers();
      } else {
        alert(data.error || 'Failed to add AI comments');
      }
    } catch (error) {
      console.error('Error adding AI comments:', error);
      alert('Failed to add AI comments');
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUserPassword(password);
  };

  const addNewUser = async () => {
    if (!newUserEmail || !newUserPassword || !newUserName) {
      alert('Please fill in all required fields');
      return;
    }

    setAddUserLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          name: newUserName,
          planId: newUserPlanId || undefined,
          sendWelcomeEmail
        })
      });
      const data = await response.json();
      if (data.success) {
        setCreatedUserCredentials(data.credentials);
        fetchUsers();
      } else {
        alert(data.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    } finally {
      setAddUserLoading(false);
    }
  };

  const closeAddUserModal = () => {
    setShowAddUserModal(false);
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserName('');
    setNewUserPlanId('');
    setSendWelcomeEmail(true);
    setCreatedUserCredentials(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '30px', color: '#693fe9' }}>
        User Management
      </h1>

      <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#666' }}>Total Users: {total}</div>
          <button
            onClick={() => setShowAddUserModal(true)}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #693fe9, #8b5cf6)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ➕ Add New User
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Current Plan</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Available AI Comments</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Change Plan</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Joined</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const availableAiComments = (user.plan?.aiCommentsPerMonth || 0) - (user.monthlyUsage?.aiComments || 0) + (user.monthlyUsage?.bonusAiComments || 0);
              return (
                <tr key={user.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px' }}>{user.name}</td>
                  <td style={{ padding: '12px' }}>{user.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      background: '#693fe9',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      {user.plan?.name}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      background: availableAiComments > 0 ? '#10b981' : '#dc3545',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {availableAiComments}
                    </span>
                  </td>
                <td style={{ padding: '12px' }}>
                  <select
                    onChange={(e) => changePlan(user.id, e.target.value)}
                    defaultValue={user.planId}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} (${plan.price})
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '12px' }}>
                  <button
                    onClick={() => deleteUser(user.id, user.email)}
                    style={{
                      padding: '6px 12px',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      marginRight: '8px'
                    }}
                  >
                    🗑️ Delete
                  </button>
                  <button
                    onClick={() => openAddAiCommentsModal(user)}
                    style={{
                      padding: '6px 12px',
                      background: '#693fe9',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ➕ Add AI Comments
                  </button>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: '8px 16px',
              background: page === 1 ? '#ccc' : '#693fe9',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: page === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Previous
          </button>
          <span style={{ padding: '8px 16px' }}>Page {page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={users.length < 20}
            style={{
              padding: '8px 16px',
              background: users.length < 20 ? '#ccc' : '#693fe9',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: users.length < 20 ? 'not-allowed' : 'pointer'
            }}
          >
            Next
          </button>
        </div>
      </div>

      {/* Add AI Comments Modal */}
      {showAddAiCommentsModal && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '15px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#693fe9' }}>Add AI Comments</h2>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              User: <strong>{selectedUser.name || selectedUser.email}</strong><br />
              Current available: <strong>{(selectedUser.plan?.aiCommentsPerMonth || 0) - (selectedUser.monthlyUsage?.aiComments || 0) + (selectedUser.monthlyUsage?.bonusAiComments || 0)}</strong>
            </p>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Number of AI Comments to Add
              </label>
              <input
                type="number"
                min="1"
                value={additionalAiComments}
                onChange={(e) => setAdditionalAiComments(parseInt(e.target.value) || 0)}
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #e0e0e0',
                  width: '100%',
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={addAiComments}
                style={{
                  padding: '10px 20px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  flex: 1
                }}
              >
                Add Comments
              </button>
              <button
                onClick={() => setShowAddAiCommentsModal(false)}
                style={{
                  padding: '10px 20px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  flex: 1
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            {!createdUserCredentials ? (
              <>
                <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#693fe9' }}>Add New User</h2>
                <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
                  Create a new user account. You can share the credentials with the user so they can login directly.
                </p>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Full Name *</label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="John Doe"
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid #e0e0e0',
                      width: '100%',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Email *</label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="user@example.com"
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid #e0e0e0',
                      width: '100%',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Password *</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      style={{
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #e0e0e0',
                        flex: 1,
                        fontSize: '14px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      style={{
                        padding: '10px 16px',
                        background: '#f3f4f6',
                        color: '#374151',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Assign Plan</label>
                  <select
                    value={newUserPlanId}
                    onChange={(e) => setNewUserPlanId(e.target.value)}
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid #e0e0e0',
                      width: '100%',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Default (Trial Plan)</option>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} (${plan.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={sendWelcomeEmail}
                      onChange={(e) => setSendWelcomeEmail(e.target.checked)}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontSize: '14px' }}>Send welcome email to user</span>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={addNewUser}
                    disabled={addUserLoading}
                    style={{
                      padding: '12px 24px',
                      background: addUserLoading ? '#ccc' : 'linear-gradient(135deg, #693fe9, #8b5cf6)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: addUserLoading ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      flex: 1
                    }}
                  >
                    {addUserLoading ? 'Creating...' : 'Create User'}
                  </button>
                  <button
                    onClick={closeAddUserModal}
                    style={{
                      padding: '12px 24px',
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      flex: 1
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#10b981' }}>✓ User Created Successfully!</h2>
                <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
                  Share these credentials with the user. They can use these to login at the login page.
                </p>

                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  padding: '20px',
                  marginBottom: '20px'
                }}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Email</label>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>{createdUserCredentials.email}</div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Password</label>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#333', fontFamily: 'monospace' }}>{createdUserCredentials.password}</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`Email: ${createdUserCredentials.email}\nPassword: ${createdUserCredentials.password}`);
                    alert('Credentials copied to clipboard!');
                  }}
                  style={{
                    padding: '12px 24px',
                    background: '#693fe9',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    width: '100%',
                    marginBottom: '10px'
                  }}
                >
                  📋 Copy Credentials
                </button>

                <button
                  onClick={closeAddUserModal}
                  style={{
                    padding: '12px 24px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    width: '100%'
                  }}
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
