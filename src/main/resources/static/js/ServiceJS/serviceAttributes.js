loadCategories();

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