let allServices = [];
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
                        <button class="action-btn btn-edit" data-bs-toggle="modal" data-bs-target="#serviceEditModal"><i class="fas fa-edit"></i></button>
                        <button class="action-btn btn-delete"><i class="fas fa-trash"></i></button>
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



function loadAddServiceDropdowns() {
    // Categories
    fetch('http://localhost:8080/api/service-attributes/all-categories')
        .then(response => response.json())
        .then(data => {
            const categorySelect = document.getElementById('addServiceCategory');
            if(categorySelect) {
                categorySelect.innerHTML = '<option value="">-- Select --</option>';
                data.forEach(category => {
                    categorySelect.innerHTML += `<option value="${category.id}">${category.category}</option>`;
                });
            }
        })
        .catch(error => console.error('Error fetching categories:', error));

    // Genders
    fetch('http://localhost:8080/api/service-attributes/all-genders')
        .then(response => response.json())
        .then(data => {
            const genderSelect = document.getElementById('addServiceGender');
            if(genderSelect) {
                genderSelect.innerHTML = '<option value="">-- Select --</option>';
                data.forEach(gender => {
                    genderSelect.innerHTML += `<option value="${gender.id}">${gender.gender}</option>`;
                });
            }
        })
        .catch(error => console.error('Error fetching genders:', error));

    // Statuses
    fetch('http://localhost:8080/api/service-attributes/all-service-statuses')
        .then(response => response.json())
        .then(data => {
            const statusSelect = document.getElementById('addServiceStatus');
            if(statusSelect) {
                statusSelect.innerHTML = '<option value="">-- Select --</option>';
                data.forEach(status => {
                    statusSelect.innerHTML += `<option value="${status.id}">${status.serviceStatus}</option>`;
                });
            }
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
            loadCategories(); // Refresh the table
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

