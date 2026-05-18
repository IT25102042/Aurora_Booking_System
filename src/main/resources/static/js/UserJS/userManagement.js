let allUsers = [];
loadAllUsers();
loadUserDropdowns();

// Search functionality
document.getElementById('userTableSearch')?.addEventListener('input', function(e) {
    const searchText = e.target.value.toLowerCase().trim();
    
    if (searchText === "") {
        renderUserTable(allUsers);
        return;
    }

    const filteredUsers = allUsers.filter(user => {
        const email = (user.email || "").toLowerCase();
        const mobile = (user.mobile || "").toLowerCase();
        return email.includes(searchText) || mobile.includes(searchText);
    });

    renderUserTable(filteredUsers);
});

function loadAllUsers() {
    fetch('http://localhost:8080/api/users/all')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(users => {
            allUsers = users;
            renderUserTable(allUsers);
        })
        .catch(error => {
            console.error('Error fetching users:', error);
        });
}

function renderUserTable(users) {
    const tableBody = document.getElementById('allUsersTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');

        let statusClass = 'status-pending';
        if (user.userStatus && user.userStatus.toLowerCase() === 'active') {
            statusClass = 'status-completed';
        } else if (user.userStatus && (user.userStatus.toLowerCase() === 'inactive' || user.userStatus.toLowerCase() === 'banned')) {
            statusClass = 'status-cancelled';
        }

        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.firstName} ${user.lastName}</td>
            <td>${user.email}</td>
            <td>${user.mobile}</td>
            <td>${user.gender || '-'}</td>
            <td>${user.userType || '-'}</td>
            <td><span class="status ${statusClass}">${user.userStatus || '-'}</span></td>
            <td>
                <button class="action-btn btn-edit" onclick="editUser(${user.id})" data-bs-toggle="modal" data-bs-target="#userEditModal">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn btn-delete" onclick="deleteUser(${user.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function loadUserDropdowns() {
    // Load Genders
    fetch('http://localhost:8080/api/users/genders')
        .then(response => response.json())
        .then(data => {
            const addSelect = document.getElementById('addUserGender');
            const editSelect = document.getElementById('editUserGender');
            [addSelect, editSelect].forEach(select => {
                if (select) {
                    select.innerHTML = '<option value="">-- Select Gender --</option>';
                    data.forEach(item => {
                        select.innerHTML += `<option value="${item.id}">${item.gender}</option>`;
                    });
                }
            });
        });

    // Load User Roles
    fetch('http://localhost:8080/api/users/types')
        .then(response => response.json())
        .then(data => {
            const addSelect = document.getElementById('addUserType');
            const editSelect = document.getElementById('editUserType');
            [addSelect, editSelect].forEach(select => {
                if (select) {
                    select.innerHTML = '<option value="">-- Select Role --</option>';
                    data.forEach(item => {
                        select.innerHTML += `<option value="${item.id}">${item.userType}</option>`;
                    });
                }
            });
        });

    // Load User Statuses
    fetch('http://localhost:8080/api/users/statuses')
        .then(response => response.json())
        .then(data => {
            const addSelect = document.getElementById('addUserStatus');
            const editSelect = document.getElementById('editUserStatus');
            [addSelect, editSelect].forEach(select => {
                if (select) {
                    select.innerHTML = '<option value="">-- Select Status --</option>';
                    data.forEach(item => {
                        select.innerHTML += `<option value="${item.id}">${item.userStatus}</option>`;
                    });
                }
            });
        });
}

function saveUser() {
    const firstName = document.getElementById('addUserFirstName').value.trim();
    const lastName = document.getElementById('addUserLastName').value.trim();
    const email = document.getElementById('addUserEmail').value.trim();
    const mobile = document.getElementById('addUserMobile').value.trim();
    const password = document.getElementById('addUserPassword').value.trim();
    const genderId = document.getElementById('addUserGender').value;
    const userTypeId = document.getElementById('addUserType').value;
    const userStatusId = document.getElementById('addUserStatus').value;

    if (!firstName || !lastName || !email || !mobile || !password || !genderId || !userTypeId || !userStatusId) {
        alert("Please fill all required fields.");
        return;
    }

    const userDto = {
        firstName,
        lastName,
        email,
        mobile,
        password,
        genderId: parseInt(genderId),
        userTypeId: parseInt(userTypeId),
        userStatusId: parseInt(userStatusId)
    };

    fetch('http://localhost:8080/api/users/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userDto)
    })
    .then(async response => {
        const message = await response.text();
        if (response.ok) {
            alert("Success: " + message);
            const modalElement = document.getElementById('addUserModal');
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) modal.hide();
            }
            // Reset form
            document.querySelectorAll('#addUserForm input, #addUserForm select').forEach(el => el.value = '');
            loadAllUsers();
        } else {
            throw new Error(message || "Failed to add user");
        }
    })
    .catch(error => {
        console.error('Error adding user:', error);
        alert("Error: " + error.message);
    });
}

function editUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUserFirstName').value = user.firstName;
    document.getElementById('editUserLastName').value = user.lastName;
    document.getElementById('editUserEmail').value = user.email;
    document.getElementById('editUserMobile').value = user.mobile;
    document.getElementById('editUserPassword').value = ''; // Don't show password
    
    document.getElementById('editUserGender').value = user.genderId || "";
    document.getElementById('editUserType').value = user.userTypeId || "";
    document.getElementById('editUserStatus').value = user.userStatusId || "";
}

function updateUser() {
    const id = document.getElementById('editUserId').value;
    const firstName = document.getElementById('editUserFirstName').value.trim();
    const lastName = document.getElementById('editUserLastName').value.trim();
    const email = document.getElementById('editUserEmail').value.trim();
    const mobile = document.getElementById('editUserMobile').value.trim();
    const password = document.getElementById('editUserPassword').value.trim();
    const genderId = document.getElementById('editUserGender').value;
    const userTypeId = document.getElementById('editUserType').value;
    const userStatusId = document.getElementById('editUserStatus').value;

    if (!firstName || !lastName || !email || !mobile || !genderId || !userTypeId || !userStatusId) {
        alert("Please fill all required fields.");
        return;
    }

    const userDto = {
        id: parseInt(id),
        firstName,
        lastName,
        email,
        mobile,
        password: password || null,
        genderId: parseInt(genderId),
        userTypeId: parseInt(userTypeId),
        userStatusId: parseInt(userStatusId)
    };

    fetch('http://localhost:8080/api/users/update', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userDto)
    })
    .then(async response => {
        const message = await response.text();
        if (response.ok) {
            alert("Success: " + message);
            const modalElement = document.getElementById('userEditModal');
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) modal.hide();
            }
            loadAllUsers();
        } else {
            throw new Error(message || "Failed to update user");
        }
    })
    .catch(error => {
        console.error('Error updating user:', error);
        alert("Error: " + error.message);
    });
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        console.log('Delete user:', userId);
        // TODO: Implement delete functionality
    }
}
