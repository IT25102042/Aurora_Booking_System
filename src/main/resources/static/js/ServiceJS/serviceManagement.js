loadServices();

function loadServices() {
    fetch('http://localhost:8080/api/service/all')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
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
                        <button class="action-btn btn-view" data-bs-toggle="modal" data-bs-target="#serivceQuickViewModal"><i class="fas fa-eye"></i></button>
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
