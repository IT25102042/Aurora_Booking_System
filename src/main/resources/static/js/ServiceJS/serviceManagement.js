let allServices = [];
let currentEditingService = null;
loadServices();
loadCategories();
loadAddServiceDropdowns();

function loadServices() {
    fetch('http://localhost:8080/api/service/all')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            allServices = data;
            const tbody = document.getElementById('serviceTableBody');
            if (!tbody) return;
            
            tbody.innerHTML = ''; // Clear existing rows

            data.forEach(service => {
                const tr = document.createElement('tr');
                
                // Determine status badge class based on status name
                let statusClass = 'status-pending'; // Default
                if (service.serviceStatusName && service.serviceStatusName.toLowerCase() === 'available') {
                    statusClass = 'status-completed';
                } else if (service.serviceStatusName && service.serviceStatusName.toLowerCase() === 'unavailable') {
                    statusClass = 'status-cancelled';
                }
                
                tr.innerHTML = `
                    <td>${service.id}</td>
                    <td>${service.title}</td>
                    <td>${service.categoryName || '-'}</td>
                    <td>${service.genderName || '-'}</td>
                    <td>Rs. ${service.price ? service.price.toFixed(2) : '0.00'}</td>
                    <td>${service.durationMinutes} mins</td>
                    <td><span class="status ${statusClass}">${service.serviceStatusName || '-'}</span></td>
                    <td>
                        <button class="action-btn btn-view" data-bs-toggle="modal" data-bs-target="#serivceQuickViewModal" onclick="loadServiceDataToView(${service.id})"><i class="fas fa-eye"></i></button>
                        <button class="action-btn btn-edit" data-bs-toggle="modal" data-bs-target="#serviceEditModal" onclick="loadServiceDataToEdit(${service.id})"><i class="fas fa-edit"></i></button>
                        <button class="action-btn btn-delete" onclick="deleteService(${service.id})"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error('Error fetching services:', error);
        });
}

function saveService() {
    const titleInput = document.getElementById('addServiceTitle');
    const descriptionInput = document.getElementById('addServiceDescription');
    const priceInput = document.getElementById('addServicePrice');
    const durationInput = document.getElementById('addServiceDuration');
    const categoryInput = document.getElementById('addServiceCategory');
    const genderInput = document.getElementById('addServiceGender');
    const statusInput = document.getElementById('addServiceStatus');

    const image1Input = document.getElementById('addServiceImage1');
    const image2Input = document.getElementById('addServiceImage2');
    const image3Input = document.getElementById('addServiceImage3');

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const price = priceInput.value.trim();
    const duration = durationInput.value.trim();
    const category = categoryInput.value;
    const gender = genderInput.value;
    const status = statusInput.value;

    const image1 = image1Input.files[0];
    const image2 = image2Input.files[0];
    const image3 = image3Input.files[0];

    // --- Frontend Validation ---
    let errors = [];

    if (!title) errors.push("Service Title is required.");
    if (title.length > 200) errors.push("Service Title cannot exceed 200 characters.");

    if (!description) errors.push("Description is required.");

    if (!price) {
        errors.push("Price is required.");
    } else if (parseFloat(price) <= 0) {
        errors.push("Price must be a positive value.");
    }

    if (!duration) {
        errors.push("Duration is required.");
    } else {
        const d = parseInt(duration);
        if (d < 5 || d > 480) errors.push("Duration must be between 5 and 480 minutes.");
    }

    if (!category) errors.push("Please select a Category.");
    if (!gender) errors.push("Please select a Target Gender.");
    if (!status) errors.push("Please select a Status.");

    if (!image1) errors.push("First Product Image is required.");

    if (errors.length > 0) {
        alert("Validation Errors:\n- " + errors.join("\n- "));
        return;
    }

    const serviceDto = {
        title: title,
        description: description,
        price: parseFloat(price),
        durationMinutes: parseInt(duration),
        categoryId: parseInt(category),
        genderId: parseInt(gender),
        serviceStatusId: parseInt(status)
    };

    const formData = new FormData();
    formData.append("service", new Blob([JSON.stringify(serviceDto)], { type: "application/json" }));
    formData.append("image1", image1);

    if (image2) formData.append("image2", image2);
    if (image3) formData.append("image3", image3);

    fetch('http://localhost:8080/api/service/add', {
        method: 'POST',
        body: formData
    })
    .then(async response => {
        const message = await response.text();
        if (response.ok) {
            alert("Success: " + message);

            // Reset form
            titleInput.value = '';
            descriptionInput.value = '';
            priceInput.value = '';
            durationInput.value = '';
            categoryInput.value = '';
            genderInput.value = '';
            statusInput.value = '';
            image1Input.value = '';
            image2Input.value = '';
            image3Input.value = '';

            // Close the modal (if using Bootstrap)
            const modalElement = document.getElementById('addServiceModal');
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) modal.hide();
            }

            loadServices();
        } else {
            throw new Error(message || "Failed to add service");
        }
    })
    .catch(error => {
        console.error('Error adding service:', error);
        alert("Error: " + error.message);
    });
}

function loadServiceDataToView(id) {
    const service = allServices.find(s => s.id === id);
    if (!service) return;

    document.getElementById('viewServiceTitle').textContent = service.title;
    document.getElementById('viewServiceDescription').textContent = service.description;
    document.getElementById('viewServicePrice').textContent = `Rs. ${parseFloat(service.price).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('viewServiceDuration').textContent = service.durationMinutes;
    document.getElementById('viewServiceCategory').textContent = service.categoryName || '-';
    document.getElementById('viewServiceCategoryHeader').textContent = service.categoryName || '-';
    document.getElementById('viewServiceGender').textContent = service.genderName || '-';
    document.getElementById('viewServiceGenderHeader').textContent = service.genderName || '-';
    document.getElementById('viewServiceStatus').textContent = service.serviceStatusName || '-';
    document.getElementById('viewServiceBadge').textContent = service.serviceStatusName || '-';
    document.getElementById('viewServiceCreated').textContent = service.createdAt ? new Date(service.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';

    // Set onclick for Edit button in modal
    const editBtn = document.getElementById('btnEditFromQuickView');
    if (editBtn) {
        editBtn.onclick = () => loadServiceDataToEdit(service.id);
    }

    // Status badge class
    const badge = document.getElementById('viewServiceBadge');
    badge.className = 'detail-badge'; // Reset
    if (service.serviceStatusName && service.serviceStatusName.toLowerCase() === 'available') {
        badge.classList.add('available');
    } else if (service.serviceStatusName && service.serviceStatusName.toLowerCase() === 'unavailable') {
        badge.classList.add('unavailable');
    }

    // Load Images
    const mainImgContainer = document.getElementById('viewServiceImageMain');
    const thumbnailsContainer = document.getElementById('viewServiceThumbnails');

    // Clear existing
    mainImgContainer.innerHTML = '';
    thumbnailsContainer.innerHTML = '';

    const img1Url = `service_images/${service.id}/image1.png`;
    const img2Url = `service_images/${service.id}/image2.png`;
    const img3Url = `service_images/${service.id}/image3.png`;

    // Main Image
    const mainImg = document.createElement('img');
    mainImg.src = img1Url;
    mainImg.alt = service.title;
    mainImg.id = 'mainViewImage';
    mainImg.style.width = '100%';
    mainImg.style.height = '100%';
    mainImg.style.objectFit = 'cover';
    mainImg.style.borderRadius = '12px';
    mainImg.onerror = function() {
        mainImgContainer.innerHTML = '<i class="fas fa-spa" style="font-size:3rem;color:var(--primary-color);"></i>';
    };
    mainImgContainer.appendChild(mainImg);

    // Thumbnails
    const images = [img1Url, img2Url, img3Url];
    images.forEach((url, index) => {
        const thumbDiv = document.createElement('div');
        thumbDiv.className = 'detail-thumb' + (index === 0 ? ' active' : '');

        const img = document.createElement('img');
        img.src = url;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '8px';
        img.onerror = function() {
            thumbDiv.style.display = 'none'; // Hide if image doesn't exist
        };
        img.onclick = function() {
            // Change main image
            const mainImageElement = document.getElementById('mainViewImage');
            if(mainImageElement) mainImageElement.src = url;
            // Update active thumbnail
            document.querySelectorAll('.detail-thumb').forEach(t => t.classList.remove('active'));
            thumbDiv.classList.add('active');
        };

        thumbDiv.appendChild(img);
        thumbnailsContainer.appendChild(thumbDiv);
    });
}

function loadServiceDataToEdit(id) {
    const service = allServices.find(s => s.id === id);
    if (!service) return;

    // Deep copy to store original state for change detection
    currentEditingService = {
        id: service.id,
        title: service.title,
        description: service.description,
        price: service.price,
        durationMinutes: service.durationMinutes,
        categoryId: service.categoryId,
        genderId: service.genderId,
        serviceStatusId: service.serviceStatusId
    };

    document.getElementById('editServiceId').value = service.id;
    document.getElementById('editServiceTitle').value = service.title;
    document.getElementById('editServiceDescription').value = service.description;
    document.getElementById('editServicePrice').value = service.price;
    document.getElementById('editServiceDuration').value = service.durationMinutes;

    document.getElementById('editServiceCategory').value = service.categoryId || "";
    document.getElementById('editServiceGender').value = service.genderId || "";
    document.getElementById('editServiceStatus').value = service.serviceStatusId || "";
}

function updateService() {
    const id = document.getElementById('editServiceId').value;
    const titleInput = document.getElementById('editServiceTitle');
    const descriptionInput = document.getElementById('editServiceDescription');
    const priceInput = document.getElementById('editServicePrice');
    const durationInput = document.getElementById('editServiceDuration');
    const categoryInput = document.getElementById('editServiceCategory');
    const genderInput = document.getElementById('editServiceGender');
    const statusInput = document.getElementById('editServiceStatus');

    const image1Input = document.getElementById('editServiceImage1');
    const image2Input = document.getElementById('editServiceImage2');
    const image3Input = document.getElementById('editServiceImage3');

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const price = priceInput.value.trim();
    const duration = durationInput.value.trim();
    const category = categoryInput.value;
    const gender = genderInput.value;
    const status = statusInput.value;

    const image1 = image1Input.files[0];
    const image2 = image2Input.files[0];
    const image3 = image3Input.files[0];

    // --- Frontend Validation ---
    let errors = [];

    if (!title) {
        errors.push("Service Title is required.");
    } else if (title.length < 2 || title.length > 200) {
        errors.push("Service Title must be between 2 and 200 characters.");
    }

    if (!description) {
        errors.push("Description is required.");
    } else if (description.length < 10) {
        errors.push("Description should be at least 10 characters long.");
    }

    if (!price) {
        errors.push("Price is required.");
    } else if (parseFloat(price) <= 0) {
        errors.push("Price must be a positive value greater than zero.");
    }

    if (!duration) {
        errors.push("Duration is required.");
    } else {
        const d = parseInt(duration);
        if (d < 5 || d > 480) errors.push("Duration must be between 5 and 480 minutes.");
    }

    if (!category) errors.push("Please select a Category.");
    if (!gender) errors.push("Please select a Target Gender.");
    if (!status) errors.push("Please select a Status.");

    if (errors.length > 0) {
        alert("Validation Errors:\n- " + errors.join("\n- "));
        return;
    }

    // --- Change Detection ---
    const hasDataChanged = 
        title !== currentEditingService.title ||
        description !== currentEditingService.description ||
        parseFloat(price) !== currentEditingService.price ||
        parseInt(duration) !== currentEditingService.durationMinutes ||
        parseInt(category) !== currentEditingService.categoryId ||
        parseInt(gender) !== currentEditingService.genderId ||
        parseInt(status) !== currentEditingService.serviceStatusId ||
        image1Input.files.length > 0 ||
        image2Input.files.length > 0 ||
        image3Input.files.length > 0;

    if (!hasDataChanged) {
        alert("No changes detected.");
        const modalElement = document.getElementById('serviceEditModal');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }
        return;
    }

    const serviceDto = {
        id: parseInt(id),
        title: title,
        description: description,
        price: parseFloat(price),
        durationMinutes: parseInt(duration),
        categoryId: parseInt(category),
        genderId: parseInt(gender),
        serviceStatusId: parseInt(status)
    };

    const formData = new FormData();
    formData.append("service", new Blob([JSON.stringify(serviceDto)], { type: "application/json" }));

    if (image1) formData.append("image1", image1);
    if (image2) formData.append("image2", image2);
    if (image3) formData.append("image3", image3);

    fetch('http://localhost:8080/api/service/update', {
        method: 'POST',
        body: formData
    })
    .then(async response => {
        const message = await response.text();
        if (response.ok) {
            alert("Success: " + message);

            // Close the modal
            const modalElement = document.getElementById('serviceEditModal');
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) modal.hide();
            }

            loadServices();
        } else {
            throw new Error(message || "Failed to update service");
        }
    })
    .catch(error => {
        console.error('Error updating service:', error);
        alert("Error: " + error.message);
    });
}



function loadAddServiceDropdowns() {
    // Categories
    fetch('http://localhost:8080/api/service-attributes/all-categories')
        .then(response => response.json())
        .then(data => {
            const addSelect = document.getElementById('addServiceCategory');
            const editSelect = document.getElementById('editServiceCategory');
            [addSelect, editSelect].forEach(select => {
                if(select) {
                    select.innerHTML = '<option value="">-- Select --</option>';
                    data.forEach(category => {
                        select.innerHTML += `<option value="${category.id}">${category.category}</option>`;
                    });
                }
            });
        })
        .catch(error => console.error('Error fetching categories:', error));

    // Genders
    fetch('http://localhost:8080/api/service-attributes/all-genders')
        .then(response => response.json())
        .then(data => {
            const addSelect = document.getElementById('addServiceGender');
            const editSelect = document.getElementById('editServiceGender');
            [addSelect, editSelect].forEach(select => {
                if(select) {
                    select.innerHTML = '<option value="">-- Select --</option>';
                    data.forEach(gender => {
                        select.innerHTML += `<option value="${gender.id}">${gender.gender}</option>`;
                    });
                }
            });
        })
        .catch(error => console.error('Error fetching genders:', error));

    // Statuses
    fetch('http://localhost:8080/api/service-attributes/all-service-statuses')
        .then(response => response.json())
        .then(data => {
            const addSelect = document.getElementById('addServiceStatus');
            const editSelect = document.getElementById('editServiceStatus');
            [addSelect, editSelect].forEach(select => {
                if(select) {
                    select.innerHTML = '<option value="">-- Select --</option>';
                    data.forEach(status => {
                        select.innerHTML += `<option value="${status.id}">${status.serviceStatus}</option>`;
                    });
                }
            });
        })
        .catch(error => console.error('Error fetching statuses:', error));
}

function loadCategories() {
    fetch('http://localhost:8080/api/service-attributes/all-categories')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const tbody = document.getElementById('categoryTableBody');
            if (!tbody) return;

            tbody.innerHTML = ''; // Clear existing rows

            data.forEach(category => {
                const tr = document.createElement('tr');

                tr.innerHTML = `
                    <td>${category.id}</td>
                    <td>${category.category}</td>
                    <td>
                        <button class="action-btn btn-edit" data-bs-toggle="modal" data-bs-target="#categoryEditModal" onclick="categoryEditModel('${category.id}','${category.category}')"><i class="fas fa-edit"></i></button>
                        <button class="action-btn btn-delete" onclick="deleteCategory('${category.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error('Error fetching services:', error);
        });
}

function addCategory() {
    const categoryName = document.getElementById('newCategoryName').value;

    // Validation
    if (!categoryName || categoryName.trim() === "") {
        alert("Please enter a category name.");
        return;
    }

    const categoryDto = {
        category: categoryName
    };

    fetch('http://localhost:8080/api/service-attributes/register-category', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryDto)
    })
    .then(response => {
        if (response.ok) {
            alert("Category added successfully!");
            document.getElementById('newCategoryName').value = ''; // Clear input
            loadCategories();
            loadAddServiceDropdowns();// Refresh the table and drop downs
        } else {
            return response.text().then(text => { throw new Error(text); });
        }
    })
    .catch(error => {
        console.error('Error adding category:', error);
        alert(error.message || "Failed to add category. Please try again.");
    });
}

function categoryEditModel(id, category) {
    document.getElementById("catId").textContent = id;
    document.getElementById("catNameE").textContent = category;
    document.getElementById("editCategoryName1").value = category;
}

function editCategory() {
    const id = document.getElementById("catId").textContent;
    const categoryName = document.getElementById('editCategoryName1').value;

    // Validation
    if (!categoryName || categoryName.trim() === "") {
        alert("Please enter Category Name");
        return;
    }

    const categoryDto = {
        id: parseInt(id),
        category: categoryName
    };

    fetch('http://localhost:8080/api/service-attributes/update-category', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryDto)
    })
    .then(response => {
        if (response.ok) {
            alert("Category updated successfully!");

            // Close the modal
            const modalElement = document.getElementById('categoryEditModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();

            loadCategories(); // Refresh the table
        } else {
            return response.text().then(text => { throw new Error(text); });
        }
    })
    .catch(error => {
        console.error('Error updating category:', error);
        alert(error.message || "Failed to update category. Please try again.");
    });
}

function deleteCategory(id) {
    if (confirm("Are you sure you want to delete this category?")) {
        fetch(`http://localhost:8080/api/service-attributes/delete-category/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                alert("Category deleted successfully!");
                loadCategories(); // Refresh the table
            } else {
                return response.text().then(text => { throw new Error(text); });
            }
        })
        .catch(error => {
            console.error('Error deleting category:', error);
            alert(error.message || "Failed to delete category. It might be in use.");
        });
    }
}

function deleteService(id) {
    if (confirm("Are you sure you want to delete this service? This action cannot be undone and will also delete all associated images.")) {
        fetch(`http://localhost:8080/api/service/delete/${id}`, {
            method: 'DELETE'
        })
        .then(async response => {
            const message = await response.text();
            if (response.ok) {
                alert("Success: " + message);
                loadServices(); // Refresh the table
            } else {
                throw new Error(message || "Failed to delete service");
            }
        })
        .catch(error => {
            console.error('Error deleting service:', error);
            alert("Error: " + error.message);
        });
    }
}

// ==========================================
// SERVICE STYLISTS TAB - FUNCTIONALITY
// ==========================================

let selectedServiceId = null;

// Auto-load on page start
loadServicesForStylistTab();
loadStylistDropdown();
loadAssignedServiceStylists();

// --- Load services into the selection table ---
function loadServicesForStylistTab() {
    fetch('http://localhost:8080/api/service/all')
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch services');
            return response.json();
        })
        .then(data => {
            const tbody = document.getElementById('serviceSearchForStylist');
            if (!tbody) return;
            tbody.innerHTML = '';

            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:20px;color:var(--text-muted);">No services found</td></tr>';
                return;
            }

            data.forEach(service => {
                const tr = document.createElement('tr');
                tr.setAttribute('data-id', service.id);
                tr.innerHTML = `
                    <td>${service.id}</td>
                    <td>${service.title}</td>
                    <td>${service.categoryName || '-'}</td>
                `;
                // Row click handler for selection
                tr.addEventListener('click', function() {
                    // Remove selection from all rows
                    tbody.querySelectorAll('tr').forEach(row => row.classList.remove('selected-row'));
                    // Select this row
                    this.classList.add('selected-row');
                    selectedServiceId = service.id;
                    checkAssignBtnState();
                });
                tbody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error('Error loading services for stylist tab:', error);
            const tbody = document.getElementById('serviceSearchForStylist');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:20px;color:var(--text-muted);">Failed to load services</td></tr>';
            }
        });
}

// --- Search/filter services in the selection table ---
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('serviceTableSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase().trim();
            const tbody = document.getElementById('serviceSearchForStylist');
            if (!tbody) return;

            const rows = tbody.querySelectorAll('tr[data-id]');
            rows.forEach(row => {
                const id = row.querySelector('td:first-child').textContent.toLowerCase();
                const name = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                if (id.includes(query) || name.includes(query)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
});

// --- Load stylists into the dropdown ---
function loadStylistDropdown() {
    fetch('http://localhost:8080/api/stylist-profiles')
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch stylists');
            return response.json();
        })
        .then(data => {
            const select = document.getElementById('stylistDropdown');
            if (!select) return;
            select.innerHTML = '<option value="">-- Choose Stylist --</option>';

            data.forEach(stylist => {
                const fullName = `${stylist.firstName} ${stylist.lastName}`;
                const roleName = stylist.stylistRoleName || '';
                const option = document.createElement('option');
                option.value = stylist.id;
                option.textContent = `${fullName} (${roleName})`;
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading stylists dropdown:', error);
        });
}

// --- Stylist dropdown change -> check button state ---
document.addEventListener('DOMContentLoaded', function() {
    const dropdown = document.getElementById('stylistDropdown');
    if (dropdown) {
        dropdown.addEventListener('change', function() {
            checkAssignBtnState();
        });
    }
});

// --- Enable/disable assign button ---
function checkAssignBtnState() {
    const btn = document.getElementById('assignStylistBtn');
    if (!btn) return;
    const stylistVal = document.getElementById('stylistDropdown')?.value;
    btn.disabled = !(selectedServiceId && stylistVal);
}

// --- Assign Stylist Button Handler ---
document.addEventListener('DOMContentLoaded', function() {
    const assignBtn = document.getElementById('assignStylistBtn');
    if (assignBtn) {
        assignBtn.addEventListener('click', function() {
            const stylistProfileId = document.getElementById('stylistDropdown')?.value;
            if (!selectedServiceId || !stylistProfileId) {
                alert('Please select both a service and a stylist.');
                return;
            }

            fetch(`http://localhost:8080/api/service/assign-stylist?serviceId=${selectedServiceId}&stylistProfileId=${stylistProfileId}`, {
                method: 'POST'
            })
            .then(async response => {
                const message = await response.text();
                if (response.ok) {
                    alert('Success: ' + message);
                    // Reset selections
                    selectedServiceId = null;
                    const tbody = document.getElementById('serviceSearchForStylist');
                    if (tbody) tbody.querySelectorAll('tr').forEach(row => row.classList.remove('selected-row'));
                    document.getElementById('stylistDropdown').value = '';
                    checkAssignBtnState();
                    // Refresh assigned table
                    loadAssignedServiceStylists();
                } else {
                    throw new Error(message || 'Failed to assign stylist');
                }
            })
            .catch(error => {
                console.error('Error assigning stylist:', error);
                alert('Error: ' + error.message);
            });
        });
    }
});

// --- Load assigned service-stylist pairs ---
function loadAssignedServiceStylists() {
    fetch('http://localhost:8080/api/service/service-stylist-assignments')
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch assignments');
            return response.json();
        })
        .then(data => {
            const tbody = document.getElementById('assignedServiceStyliststable');
            if (!tbody) return;
            tbody.innerHTML = '';

            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--text-muted);">No stylist assignments found</td></tr>';
                return;
            }

            data.forEach(assignment => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${assignment.serviceTitle}</td>
                    <td>${assignment.stylistName}</td>
                    <td>${assignment.stylistRole || '-'}</td>
                    <td>
                        <button class="action-btn btn-delete" onclick="unassignStylist(${assignment.serviceId}, ${assignment.stylistProfileId})">
                            <i class="fas fa-unlink"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error('Error loading assignments:', error);
            const tbody = document.getElementById('assignedServiceStyliststable');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--text-muted);">Failed to load assignments</td></tr>';
            }
        });
}

// --- Unassign stylist from service ---
function unassignStylist(serviceId, stylistProfileId) {
    if (confirm('Are you sure you want to unassign this stylist from this service?')) {
        fetch(`http://localhost:8080/api/service/unassign-stylist?serviceId=${serviceId}&stylistProfileId=${stylistProfileId}`, {
            method: 'DELETE'
        })
        .then(async response => {
            const message = await response.text();
            if (response.ok) {
                alert('Success: ' + message);
                loadAssignedServiceStylists();
            } else {
                throw new Error(message || 'Failed to unassign stylist');
            }
        })
        .catch(error => {
            console.error('Error unassigning stylist:', error);
            alert('Error: ' + error.message);
        });
    }
}

// --- Search/filter for All Services ---
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('serviceSearchInput1');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase().trim();
            const tbody = document.getElementById('serviceTableBody');
            if (!tbody) return;

            const rows = tbody.querySelectorAll('tr');
            rows.forEach(row => {
                // Ignore the loading row if it exists
                if (row.querySelector('td') && row.querySelector('td').getAttribute('colspan') === '9') {
                    return;
                }

                const id = row.querySelector('td:nth-child(1)')?.textContent.toLowerCase() || '';
                const title = row.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
                const category = row.querySelector('td:nth-child(3)')?.textContent.toLowerCase() || '';
                const gender = row.querySelector('td:nth-child(4)')?.textContent.toLowerCase() || '';

                if (id.includes(query) || title.includes(query) || category.includes(query) || gender.includes(query)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
});
