// ── APPOINTMENT MANAGEMENT — BACKEND INTEGRATION ──────────────
    const APT_API = 'http://localhost:8080/api';
    let _allAppointments = [];
    let _allStatuses     = [];
    let _currentAptId    = null;

    // Helpers
    function aptFmtDate(val) {
        if (!val) return '—';
        return new Date(val).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
    }
    function aptFmtTime(t) { return t ? t.substring(0,5) : '—'; }
    function aptIdLabel(id) { return `#APT-${String(id).padStart(4,'0')}`; }
    function aptStatusCls(s) {
        if (!s) return '';
        switch(s.toLowerCase()) {
            case 'confirmed': return 'status-processing';
            case 'completed': return 'status-completed';
            case 'pending':   return 'status-pending';
            case 'cancelled': return 'status-cancelled';
            default: return '';
        }
    }

    // Load & render table
    async function aptLoadAll() {
        const tbody = document.getElementById('aptTableBody');
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:30px;color:var(--text-muted);"><i class="fas fa-spinner fa-spin me-2"></i>Loading appointments…</td></tr>`;
        try {
            const res = await fetch(`${APT_API}/appointments`);
            if (!res.ok) throw new Error(`Server error ${res.status}`);
            _allAppointments = await res.json();
            aptRender();
        } catch(err) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:30px;color:#dc3545;"><i class="fas fa-exclamation-triangle me-2"></i>Failed to load: ${err.message}</td></tr>`;
        }
    }

    function aptRender() {
        const tbody  = document.getElementById('aptTableBody');
        const search = (document.getElementById('aptSearchInput')?.value || '').toLowerCase();
        const status = (document.getElementById('aptStatusFilter')?.value || '').toLowerCase();

        const list = _allAppointments.filter(a => {
            const matchS = !search ||
                (a.userName||'').toLowerCase().includes(search) ||
                (a.fullName||'').toLowerCase().includes(search) ||
                (a.serviceName||'').toLowerCase().includes(search) ||
                (a.stylistName||'').toLowerCase().includes(search) ||
                aptIdLabel(a.id).toLowerCase().includes(search);
            const matchSt = !status || (a.appointmentStatus||'').toLowerCase() === status;
            return matchS && matchSt;
        });

        if (!list.length) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--text-muted);"><i class="fas fa-calendar-times" style="font-size:2rem;display:block;margin-bottom:10px;opacity:0.4;"></i>No appointments found.</td></tr>`;
            return;
        }

        tbody.innerHTML = '';
        list.forEach(apt => {
            const tr = document.createElement('tr');
            const dt = `${aptFmtDate(apt.appointmentDate)} ${aptFmtTime(apt.startTime)}`;
            tr.innerHTML = `
                <td><strong>${aptIdLabel(apt.id)}</strong></td>
                <td>${apt.userName||'—'}</td>
                <td>${apt.fullName||'—'}</td>
                <td>${apt.contactNo||'—'}</td>
                <td>${apt.serviceName||'—'}</td>
                <td>${apt.stylistName||'—'}</td>
                <td>${dt}</td>
                <td><span class="status ${aptStatusCls(apt.appointmentStatus)}">${apt.appointmentStatus||'—'}</span></td>
                <td>
                    <button class="action-btn btn-edit" title="Edit" onclick="aptOpenEdit(${apt.id})"><i class="fas fa-edit"></i></button>
                </td>`;
            tbody.appendChild(tr);
        });
    }

    // Live search & filter
    document.getElementById('aptSearchInput')?.addEventListener('input', aptRender);
    document.getElementById('aptStatusFilter')?.addEventListener('change', aptRender);

    // Quick View modal
    function aptOpenView(id) {
        const apt = _allAppointments.find(a => a.id === id);
        if (!apt) return;
        _currentAptId = id;

        const badge = document.getElementById('viewAptStatusBadge');
        badge.className = `status ${aptStatusCls(apt.appointmentStatus)}`;
        badge.textContent = apt.appointmentStatus || '—';
        badge.style.fontSize = '0.95rem';
        badge.style.padding  = '8px 18px';

        document.getElementById('viewAptId').textContent      = aptIdLabel(apt.id);
        document.getElementById('viewAptCreated').textContent = `Created: ${aptFmtDate(apt.createdAt)}`;
        document.getElementById('viewAptUser').textContent    = apt.userName     || '—';
        document.getElementById('viewAptCustomer').textContent= apt.fullName     || '—';
        document.getElementById('viewAptService').textContent = apt.serviceName  || '—';
        document.getElementById('viewAptStylist').textContent = apt.stylistName  || '—';
        document.getElementById('viewAptDate').textContent    = aptFmtDate(apt.appointmentDate);
        document.getElementById('viewAptTime').textContent    = `${aptFmtTime(apt.startTime)} – ${aptFmtTime(apt.endTime)}`;
        document.getElementById('viewAptPayment').textContent = apt.paymentMethod|| '—';
        document.getElementById('viewAptTotal').textContent   = `Rs. ${(apt.total||0).toLocaleString()}`;
        document.getElementById('viewAptMobile').textContent  = apt.contactNo    || '—';
        document.getElementById('viewAptNotes').textContent   = apt.specialRequests || 'None';

        bootstrap.Modal.getOrCreateInstance(document.getElementById('appointmentQuickViewModal')).show();
    }

    // "Edit Appointment" inside view modal → open edit modal
    document.getElementById('viewToEditBtn').addEventListener('click', () => {
        bootstrap.Modal.getInstance(document.getElementById('appointmentQuickViewModal'))?.hide();
        setTimeout(() => aptOpenEdit(_currentAptId), 350);
    });

    // Edit modal — populate all fields; only Status is editable
    async function aptOpenEdit(id) {
        const apt = _allAppointments.find(a => a.id === id);
        if (!apt) return;
        _currentAptId = id;

        // Fill hidden + read-only fields
        document.getElementById('editAptId').value        = apt.id;
        document.getElementById('editAptDate').value      = apt.appointmentDate ? new Date(apt.appointmentDate).toISOString().split('T')[0] : '';
        document.getElementById('editAptStartTime').value = apt.startTime ? apt.startTime.substring(0,5) : '';
        document.getElementById('editAptEndTime').value   = apt.endTime   ? apt.endTime.substring(0,5)   : '';
        document.getElementById('editAptTotal').value     = apt.total || 0;
        document.getElementById('editAptNotes').value     = apt.specialRequests || '';

        // Make non-status fields read-only
        ['editAptDate','editAptStartTime','editAptEndTime','editAptTotal','editAptNotes'].forEach(elId => {
            const el = document.getElementById(elId);
            if (el) { el.setAttribute('readonly', true); el.style.opacity='0.6'; el.style.cursor='not-allowed'; }
        });

        // Customer (read-only)
        const custSel = document.getElementById('editAptCustomer');
        custSel.innerHTML = `<option value="${apt.userId}" selected>${apt.userName || 'User #'+apt.userId}</option>`;
        custSel.disabled = true; custSel.style.opacity='0.6';

        // Service (read-only)
        const svcSel = document.getElementById('editAptService');
        svcSel.innerHTML = `<option value="${apt.serviceId}" selected>${apt.serviceName || 'Service #'+apt.serviceId}</option>`;
        svcSel.disabled = true; svcSel.style.opacity='0.6';

        // Stylist (read-only)
        const stylistSel = document.getElementById('editAptStylist');
        stylistSel.innerHTML = `<option value="${apt.stylistProfileId}" selected>${apt.stylistName || 'Stylist #'+apt.stylistProfileId}</option>`;
        stylistSel.disabled = true; stylistSel.style.opacity='0.6';

        // Payment (read-only)
        const paymentSel = document.getElementById('editAptPayment');
        paymentSel.innerHTML = `<option value="${apt.paymentMethodId}" selected>${apt.paymentMethod || 'Method #'+apt.paymentMethodId}</option>`;
        paymentSel.disabled = true; paymentSel.style.opacity='0.6';

        // Status — editable, load from API
        const statusSel = document.getElementById('editAptStatus');
        statusSel.disabled = false; statusSel.style.opacity=''; statusSel.style.cursor='';

        if (_allStatuses.length === 0) {
            try {
                const r = await fetch(`${APT_API}/appointment-status`);
                if (r.ok) _allStatuses = await r.json();
            } catch(e) { /* use fallback */ }
        }

        if (_allStatuses.length > 0) {
            statusSel.innerHTML = _allStatuses.map(s =>
                `<option value="${s.id}" ${s.id === apt.appointmentStatusId ? 'selected':''}>${s.appointmentStatus}</option>`
            ).join('');
        } else {
            statusSel.innerHTML = `
                <option value="1" ${apt.appointmentStatus==='Pending'   ?'selected':''}>Pending</option>
                <option value="2" ${apt.appointmentStatus==='Confirmed' ?'selected':''}>Confirmed</option>
                <option value="3" ${apt.appointmentStatus==='Completed' ?'selected':''}>Completed</option>
                <option value="4" ${apt.appointmentStatus==='Cancelled' ?'selected':''}>Cancelled</option>`;
        }

        bootstrap.Modal.getOrCreateInstance(document.getElementById('appointmentEditModal')).show();
    }

    // Save — PUT /api/appointments/{id}  (only status changes)
    async function aptSaveEdit() {
        const id       = parseInt(document.getElementById('editAptId').value);
        const statusId = parseInt(document.getElementById('editAptStatus').value);
        if (!id || !statusId) { alert('Please select a status.'); return; }

        const apt = _allAppointments.find(a => a.id === id);
        if (!apt) return;

        const payload = {
            userId:              apt.userId,
            fullName:            apt.fullName,
            contactNo:           apt.contactNo,
            serviceId:           apt.serviceId,
            stylistProfileId:    apt.stylistProfileId,
            appointmentDate:     apt.appointmentDate,
            startTime:           apt.startTime,
            endTime:             apt.endTime,
            specialRequests:     apt.specialRequests,
            total:               apt.total,
            paymentMethodId:     apt.paymentMethodId,
            appointmentStatusId: statusId
        };

        const btn = document.getElementById('aptSaveBtn');
        const orig = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Saving…';

        try {
            const res = await fetch(`${APT_API}/appointments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
            const updated = await res.json();

            // Update cache & re-render table instantly
            const idx = _allAppointments.findIndex(a => a.id === id);
            if (idx !== -1) _allAppointments[idx] = updated;

            bootstrap.Modal.getInstance(document.getElementById('appointmentEditModal'))?.hide();
            aptRender();

            // Re-enable fields for next open
            ['editAptDate','editAptStartTime','editAptEndTime','editAptTotal','editAptNotes'].forEach(elId => {
                const el = document.getElementById(elId);
                if (el) { el.removeAttribute('readonly'); el.style.opacity=''; el.style.cursor=''; }
            });
            ['editAptCustomer','editAptService','editAptStylist','editAptPayment'].forEach(elId => {
                const el = document.getElementById(elId);
                if (el) { el.disabled=false; el.style.opacity=''; }
            });
        } catch(err) {
            alert(`Failed to update: ${err.message}`);
        } finally {
            btn.disabled = false;
            btn.innerHTML = orig;
        }
    }

    // Auto-load when sidebar nav clicked
    document.querySelector('.sidebar-menu .nav-link[data-page="order-management"]')
        ?.addEventListener('click', () => setTimeout(aptLoadAll, 60));
