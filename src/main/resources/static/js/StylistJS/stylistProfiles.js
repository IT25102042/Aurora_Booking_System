document.addEventListener("DOMContentLoaded", () => {
    fetchStylistProfiles();
    initStylistSearch();
    initGlobalStylistSearch();
    
    const saveBtn = document.getElementById("saveStylistBtn");
    if (saveBtn) {
        saveBtn.addEventListener("click", saveStylist);
    }
    
    const stylistDropdown2 = document.getElementById("stylistDropdown2");
    if (stylistDropdown2) {
        stylistDropdown2.addEventListener("change", (e) => {
            fetchStylistServices(e.target.value);
        });
    }
});

window.searchStylists = searchStylists;
window.saveStylist = saveStylist;
window.populateEditStylistModal = populateEditStylistModal;
window.updateStylist = updateStylist;

async function fetchStylistProfiles() {
    try {
        const response = await fetch('/api/stylist-profiles');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const profiles = await response.json();
        console.log("Successfully fetched stylist profiles:", profiles);
        
        // Call a function to render the profiles on the UI
        renderStylistProfiles(profiles);
        
    } catch (error) {
        console.error("Error fetching stylist profiles:", error);
        // Handle the error appropriately in the UI
    }
}

function renderStylistProfiles(profiles) {
    const tableBody = document.getElementById('stylistsTableBody');
    const stylistDropdown2 = document.getElementById('stylistDropdown2');
    
    if (stylistDropdown2) {
        stylistDropdown2.innerHTML = '<option value="">-- Choose Stylist --</option>';
    }
    
    if (!tableBody) {
        console.warn("Table body 'stylistsTableBody' not found in the DOM.");
        return;
    }

    tableBody.innerHTML = '';

    if (profiles.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4">No stylists found.</td></tr>';
        return;
    }

    profiles.forEach(profile => {
        const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || '-';
        const experience = profile.experienceYears ?? 0;

        if (stylistDropdown2) {
            const option = document.createElement('option');
            option.value = profile.id;
            option.textContent = `${fullName} (${profile.stylistRoleName || 'Stylist'})`;
            stylistDropdown2.appendChild(option);
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${profile.id ?? '-'}</td>
            <td>${fullName}</td>
            <td>${profile.stylistRoleName || '-'}</td>
            <td>${experience} Years</td>
            <td>${profile.bio || '-'}</td>
            <td><span class="status status-completed">${profile.stylistStatusName || '-'}</span></td>
            <td>
                <button class="action-btn btn-edit" data-bs-toggle="modal" data-bs-target="#stylistEditModal" onclick='populateEditStylistModal(${JSON.stringify(profile).replace(/'/g, "&#39;")})'><i class="fas fa-edit"></i></button>
                <button class="action-btn btn-delete"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

function initGlobalStylistSearch() {
    const searchInput = document.getElementById("globalSearchInput");
    const searchIcon = document.getElementById("globalSearchIcon");

    if (!searchInput) {
        return;
    }

    searchInput.addEventListener("input", () => {
        if (isStylistManagementPageActive()) {
            searchStylistProfilesForTable(searchInput.value);
        }
    });

    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && isStylistManagementPageActive()) {
            event.preventDefault();
            searchStylistProfilesForTable(searchInput.value);
        }
    });

    if (searchIcon) {
        searchIcon.addEventListener("click", () => {
            if (isStylistManagementPageActive()) {
                searchStylistProfilesForTable(searchInput.value);
            }
        });
    }
}

function isStylistManagementPageActive() {
    const page = document.getElementById("stylist-management-page");
    return page && page.classList.contains("active");
}

async function searchStylistProfilesForTable(keyword) {
    const trimmedKeyword = keyword.trim();
    const url = trimmedKeyword
        ? `/api/stylist-profiles/search?keyword=${encodeURIComponent(trimmedKeyword)}`
        : '/api/stylist-profiles';

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const profiles = await response.json();
        renderStylistProfiles(profiles);
    } catch (error) {
        console.error("Error searching stylist profiles:", error);
        const tableBody = document.getElementById('stylistsTableBody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4">Could not load stylists.</td></tr>';
        }
    }
}

function initStylistSearch() {
    const searchInput = document.getElementById("searchByStlistnoenamil");
    const searchButton = document.getElementById("getStylistByEmailOrMobileBtn");

    if (!searchInput || !searchButton) {
        return;
    }

    if (!searchButton.hasAttribute("onclick")) {
        searchButton.addEventListener("click", searchStylists);
    }
    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            searchStylists();
        }
    });
}

async function searchStylists() {
    const searchInput = document.getElementById("searchByStlistnoenamil");
    const message = document.getElementById("stylistSearchMessage");
    const keyword = searchInput.value.trim();

    clearSelectedStylistUser();

    if (!keyword) {
        setStylistSearchMessage("Please enter a mobile number or email.", true);
        return;
    }

    try {
        setStylistSearchMessage("Searching...", false);

        const response = await fetch(`/api/stylist-profiles/search?keyword=${encodeURIComponent(keyword)}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const stylists = await response.json();
        displaySelectedStylistUser(stylists);
    } catch (error) {
        console.error("Error searching stylist:", error);
        setStylistSearchMessage("Could not search stylist. Please try again.", true);
    }
}

function displaySelectedStylistUser(stylists) {
    if (!Array.isArray(stylists) || stylists.length === 0) {
        setStylistSearchMessage("No stylist found for this mobile number or email.", true);
        return;
    }

    const stylist = stylists[0];
    const fullName = [stylist.firstName, stylist.lastName].filter(Boolean).join(" ") || "-";

    document.getElementById("selectedStylistUserId").value = stylist.userId || "";
    document.getElementById("selectedStylistUserIdText").textContent = stylist.userId || "-";
    document.getElementById("selectedStylistUserNameText").textContent = fullName;
    setStylistSearchMessage("Stylist selected successfully.", false);
}

function clearSelectedStylistUser() {
    const selectedUserId = document.getElementById("selectedStylistUserId");
    const selectedUserIdText = document.getElementById("selectedStylistUserIdText");
    const selectedUserNameText = document.getElementById("selectedStylistUserNameText");

    if (selectedUserId) selectedUserId.value = "";
    if (selectedUserIdText) selectedUserIdText.textContent = "-";
    if (selectedUserNameText) selectedUserNameText.textContent = "-";
}

function setStylistSearchMessage(text, isError) {
    const message = document.getElementById("stylistSearchMessage");

    if (!message) {
        return;
    }

    message.textContent = text;
    message.style.color = isError ? "#dc3545" : "#198754";
}

async function saveStylist() {
    const errorContainer = document.getElementById("saveStylistError");
    if (errorContainer) errorContainer.textContent = "";

    const userId = document.getElementById("selectedStylistUserId").value;
    const roleId = document.getElementById("addStylistRole").value;
    const experience = document.getElementById("addStylistExperience").value;
    const statusId = document.getElementById("addStylistStatus").value;
    const bio = document.getElementById("addStylistBio").value;

    if (!userId) {
        if (errorContainer) errorContainer.textContent = "Please select a user first.";
        return;
    }

    if (!roleId || !statusId) {
        if (errorContainer) errorContainer.textContent = "Please select both a Role and a Status.";
        return;
    }

    const payload = {
        userId: parseInt(userId, 10),
        stylistRoleId: parseInt(roleId, 10),
        stylistStatusId: parseInt(statusId, 10),
        experienceYears: parseInt(experience || "0", 10),
        bio: bio.trim()
    };

    try {
        const response = await fetch('/api/stylist-profiles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const newProfile = await response.json();
        console.log("Successfully saved stylist:", newProfile);
        
        // Close the modal using Bootstrap API
        const addStylistModalEl = document.getElementById('addStylistModal');
        if (addStylistModalEl) {
            const addStylistModal = bootstrap.Modal.getInstance(addStylistModalEl) || new bootstrap.Modal(addStylistModalEl);
            addStylistModal.hide();
            
            // Remove modal backdrop manually if Bootstrap gets stuck
            setTimeout(() => {
                const backdrops = document.querySelectorAll('.modal-backdrop');
                backdrops.forEach(b => b.remove());
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
            }, 300);
        }

        // Reset the form
        document.getElementById("searchByStlistnoenamil").value = "";
        clearSelectedStylistUser();
        document.getElementById("addStylistRole").value = "";
        document.getElementById("addStylistExperience").value = "0";
        document.getElementById("addStylistStatus").value = "1";
        document.getElementById("addStylistBio").value = "";
        setStylistSearchMessage("", false);

        // Refresh table
        fetchStylistProfiles();
    } catch (error) {
        console.error("Error saving stylist:", error);
        if (errorContainer) errorContainer.textContent = "Could not save stylist. Please check connection and try again.";
    }
}

function populateEditStylistModal(profile) {
    document.getElementById("editStylistId").value = profile.id || "";
    document.getElementById("editStylistNameText").textContent = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "-";
    document.getElementById("editStylistUserIdText").textContent = profile.userId || "-";
    
    document.getElementById("editStylistRole").value = profile.stylistRoleId || "";
    document.getElementById("editStylistExperience").value = profile.experienceYears || "0";
    document.getElementById("editStylistStatus").value = profile.stylistStatusId || "";
    document.getElementById("editStylistBio").value = profile.bio || "";
}

async function updateStylist() {
    const id = document.getElementById("editStylistId").value;
    const roleId = document.getElementById("editStylistRole").value;
    const experience = document.getElementById("editStylistExperience").value;
    const statusId = document.getElementById("editStylistStatus").value;
    const bio = document.getElementById("editStylistBio").value;

    if (!id || !roleId || !statusId) {
        alert("Please ensure all required fields are filled.");
        return;
    }

    const payload = {
        stylistRoleId: parseInt(roleId, 10),
        stylistStatusId: parseInt(statusId, 10),
        experienceYears: parseInt(experience || "0", 10),
        bio: bio.trim()
    };

    try {
        const response = await fetch(`/api/stylist-profiles/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log("Successfully updated stylist");
        
        const editModalEl = document.getElementById('stylistEditModal');
        if (editModalEl) {
            const editModal = bootstrap.Modal.getInstance(editModalEl) || new bootstrap.Modal(editModalEl);
            editModal.hide();
            
            setTimeout(() => {
                const backdrops = document.querySelectorAll('.modal-backdrop');
                backdrops.forEach(b => b.remove());
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
            }, 300);
        }

        fetchStylistProfiles();
    } catch (error) {
        console.error("Error updating stylist:", error);
        alert("Could not update stylist. Please check connection and try again.");
    }
}

async function fetchStylistServices(stylistId) {
    const servicesTableBody = document.querySelector('#stylistServicesTable tbody');
    if (!servicesTableBody) return;

    if (!stylistId) {
        servicesTableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4">Search and select a stylist to view their services</td></tr>';
        return;
    }

    servicesTableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4">Loading services...</td></tr>';

    try {
        const response = await fetch(`/api/service/stylist/${stylistId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const services = await response.json();
        
        if (services.length === 0) {
            servicesTableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4">No services assigned to this stylist.</td></tr>';
            return;
        }

        servicesTableBody.innerHTML = '';
        services.forEach(service => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${service.id}</td>
                <td>${service.title || '-'}</td>
                <td>${service.categoryName || '-'}</td>
                <td>
                    <button class="action-btn btn-view"><i class="fas fa-eye"></i></button>
                </td>
            `;
            servicesTableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching stylist services:", error);
        servicesTableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4" style="color: #dc3545;">Failed to load services.</td></tr>';
    }
}

