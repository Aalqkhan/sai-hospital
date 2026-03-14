import React from "react";

const renderStaffSummary = (data) => {
    const total = data.length;
    const doctors = data.filter(s => s.role === "DOCTOR").length;
    const nurses = data.filter(s => s.role === "NURSE").length;
    const labStaff = data.filter(s => s.role === "LAB_STAFF").length;

    return (
        <div className="metrics-grid" style={{ marginBottom: '30px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div className="metric-card-premium m-total">
                <div className="metric-icon-wrapper"><i className="fa-solid fa-users"></i></div>
                <div className="metric-details">
                    <h4>Total Staff</h4>
                    <p className="value">{total}</p>
                </div>
            </div>
            <div className="metric-card-premium m-appt">
                <div className="metric-icon-wrapper"><i className="fa-solid fa-user-doctor"></i></div>
                <div className="metric-details">
                    <h4>Doctors</h4>
                    <p className="value">{doctors}</p>
                </div>
            </div>
            <div className="metric-card-premium m-pending">
                <div className="metric-icon-wrapper"><i className="fa-solid fa-user-nurse"></i></div>
                <div className="metric-details">
                    <h4>Nurses</h4>
                    <p className="value">{nurses}</p>
                </div>
            </div>
            <div className="metric-card-premium m-lab-p">
                <div className="metric-icon-wrapper"><i className="fa-solid fa-flask-vial"></i></div>
                <div className="metric-details">
                    <h4>Lab Staff</h4>
                    <p className="value">{labStaff}</p>
                </div>
            </div>
        </div>
    );
};

function TeamDirectory({ staffMembers, onBack, staffSearch, setStaffSearch, refreshStaff, activeCategory }) {
    const [selectedIds, setSelectedIds] = React.useState([]);
    const [isRefreshing, setIsRefreshing] = React.useState(false);

    const handleRefresh = async () => {
        if (!refreshStaff) return;
        setIsRefreshing(true);
        await refreshStaff();
        // Add a small delay for the animation to feel "proper"
        setTimeout(() => setIsRefreshing(false), 800);
    };

    const filteredStaff = staffMembers.filter(s => {
        const matchSearch = (s.name || "").toLowerCase().includes(staffSearch.toLowerCase()) ||
            (s.email || "").toLowerCase().includes(staffSearch.toLowerCase()) ||
            (s.phoneNumber || "").toLowerCase().includes(staffSearch.toLowerCase());

        let matchCategory = true;
        if (activeCategory === "doctors") matchCategory = s.role === "DOCTOR";
        else if (activeCategory === "nurses") matchCategory = s.role === "NURSE";
        else if (activeCategory === "lab") matchCategory = s.role === "LAB_STAFF";
        else if (activeCategory === "admin") matchCategory = s.role === "ADMIN";

        return matchSearch && matchCategory;
    });

    React.useEffect(() => {
        if (refreshStaff) refreshStaff();
    }, []);

    // ... (rest of the functions remain same)

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        const allIds = filteredStaff.map(s => s.id);
        const areAllSelected = allIds.every(id => selectedIds.includes(id));

        if (areAllSelected) {
            setSelectedIds(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            setSelectedIds(prev => [...new Set([...prev, ...allIds])]);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this staff member?")) {
            try {
                const token = localStorage.getItem("jwtToken");
                const res = await fetch(`http://localhost:8080/api/auth/staff/${id}`, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    refreshStaff();
                    setSelectedIds(prev => prev.filter(i => i !== id));
                }
            } catch (err) {
                console.error("Delete failed:", err);
            }
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedIds.length} staff members?`)) {
            try {
                const token = localStorage.getItem("jwtToken");
                const deletePromises = selectedIds.map(id =>
                    fetch(`http://localhost:8080/api/auth/staff/${id}`, {
                        method: "DELETE",
                        headers: { "Authorization": `Bearer ${token}` }
                    })
                );
                await Promise.all(deletePromises);
                refreshStaff();
                setSelectedIds([]);
            } catch (err) {
                console.error("Bulk delete failed:", err);
            }
        }
    };

    const getInitials = (name) => {
        if (!name) return "??";
        const parts = name.split(" ");
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "Never";
        const date = new Date(dateStr);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="team-directory-wrapper">
            <div className="directory-header">
                <div className="header-left">
                    <button className="global-back-btn" onClick={onBack}>
                        <i className="fa-solid fa-arrow-left"></i> Back
                    </button>
                    <div className="title-group">
                        <h2>
                            {activeCategory === "all" || !activeCategory ? "Staff" :
                                activeCategory === "lab" ? "Lab Staff" :
                                    activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Directory
                        </h2>
                        <p>Manage and monitor hospital staff activity</p>
                    </div>
                </div>

                <div className="search-bar-premium" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <button
                        className={`refresh-btn-premium ${isRefreshing ? 'refreshing' : ''}`}
                        onClick={handleRefresh}
                        title="Refresh Staff List"
                        disabled={isRefreshing}
                    >
                        <i className={`fa-solid fa-rotate ${isRefreshing ? 'fa-spin' : ''}`}></i>
                    </button>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={staffSearch}
                            onChange={(e) => setStaffSearch(e.target.value)}
                            style={{ padding: '12px 15px 12px 45px', borderRadius: '12px', border: '2px solid #e2e8f0', width: '100%' }}
                        />
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                    type="checkbox"
                    className="table-checkbox"
                    checked={filteredStaff.length > 0 && filteredStaff.every(s => selectedIds.includes(s.id))}
                    onChange={(e) => { e.stopPropagation(); handleSelectAll(); }}
                    onClick={(e) => e.stopPropagation()}
                />
                <span style={{ fontWeight: 600, color: '#64748b' }}>Select All Staff</span>
            </div>

            {renderStaffSummary(filteredStaff)}

            <div className="staff-cards-list">
                {filteredStaff.length === 0 ? (
                    <div className="no-results">
                        <i className="fa-solid fa-user-slash"></i>
                        <p>No staff members found matching your search.</p>
                    </div>
                ) : (
                    filteredStaff.map((staff) => (
                        <div key={staff.id} className={`staff-card-horizontal ${selectedIds.includes(staff.id) ? 'selected' : ''}`}>
                            <div className="u-card-checkbox">
                                <input
                                    type="checkbox"
                                    className="table-checkbox"
                                    checked={selectedIds.includes(staff.id)}
                                    onChange={(e) => { e.stopPropagation(); toggleSelect(staff.id); }}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>

                            <div className="staff-card-main">
                                <div className="staff-card-avatar">{getInitials(staff.name)}</div>
                                <div className="staff-card-info">
                                    <h3>{staff.name}</h3>
                                    <span className="staff-card-role-badge">{staff.role || "Hospital Staff"}</span>
                                </div>
                            </div>

                            <div className="staff-card-details">
                                <div className="staff-detail-group">
                                    <span className="staff-detail-label">Contact</span>
                                    <span className="staff-detail-value"><i className="fa-solid fa-envelope"></i> {staff.email}</span>
                                    <span className="staff-detail-value"><i className="fa-solid fa-phone"></i> {staff.phoneNumber}</span>
                                </div>
                                <div className="staff-detail-group">
                                    <span className="staff-detail-label">Live Status</span>
                                    <span className="staff-detail-value">
                                        <div className={`status-dot ${staff.lastLogin && (!staff.lastLogout || new Date(staff.lastLogin) > new Date(staff.lastLogout)) ? 'active' : 'inactive'}`} style={{ position: 'static', display: 'inline-block' }}></div>
                                        {staff.lastLogin && (!staff.lastLogout || new Date(staff.lastLogin) > new Date(staff.lastLogout)) ? 'Online Now' : 'Offline'}
                                    </span>
                                </div>
                            </div>

                            <div className="staff-card-actions">
                                <button
                                    className="delete-btn"
                                    onClick={(e) => { e.stopPropagation(); handleDelete(staff.id); }}
                                    style={{ padding: '10px', borderRadius: '10px', background: '#fee2e2', color: '#ef4444', border: 'none', cursor: 'pointer' }}
                                    title="Delete Staff"
                                >
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* BULK ACTION BAR */}
            {selectedIds.length > 0 && (
                <div className="bulk-action-bar">
                    <span className="selection-count">{selectedIds.length} members selected</span>
                    <button className="bulk-delete-btn" onClick={handleBulkDelete}>
                        <i className="fa-solid fa-trash"></i> Delete Selected
                    </button>
                    <button className="global-back-btn" onClick={() => setSelectedIds([])} style={{ margin: 0, padding: "8px 15px" }}>
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
}

export default TeamDirectory;
