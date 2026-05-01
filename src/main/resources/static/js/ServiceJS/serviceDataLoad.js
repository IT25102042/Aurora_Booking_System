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
