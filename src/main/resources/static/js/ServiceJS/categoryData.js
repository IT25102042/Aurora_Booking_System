loadCategories();

function loadCategories() {
    fetch('http://localhost:8080/api/category/all')
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

    fetch('http://localhost:8080/api/category/register-category', {
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