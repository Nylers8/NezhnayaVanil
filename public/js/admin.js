document.addEventListener('DOMContentLoaded', function () {
    const categoryForm = document.getElementById('add-category-form');
    categoryForm.onsubmit = function(e) {
        e.preventDefault();
        sendCategory();
    };

    const productForm = document.getElementById('add-product-form');
    productForm.onsubmit = function(e) {
        e.preventDefault();
        sendProduct();
    };

    const categoryInput = document.getElementById('category-input');
    const categoryList = document.getElementById('category-list');
    categoryInput.onclick = function() {
        categoryList.style.display = (categoryList.style.display === 'block') ? 'none' : 'block';
        fetchCategories();
    };
});

function sendCategory() {
    const name = document.getElementById('category-name').value;
    fetch('http://localhost:3000/add-category', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        document.getElementById('category-name').value = '';
    })
    .catch(error => {
        console.error('Ошибка при добавлении категории:', error);
    });
}

function sendProduct() {
    const formData = new FormData(document.getElementById('add-product-form'));
    formData.append('categories', JSON.stringify(getSelectedCategories())); // Добавление категорий
    // Убедитесь, что input для файла имеет name="product-photo"
    fetch('http://localhost:3000/add-product', {
        method: 'POST',
        body: formData  // Важно: не устанавливать Content-Type при отправке FormData!
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        document.getElementById('add-product-form').reset();
    })
    .catch(error => {
        console.error('Ошибка при добавлении товара:', error);
    });
}

function fetchCategories() {
    fetch('http://localhost:3000/get-categories')
    .then(response => response.json())
    .then(data => {
        showCategories(data.categories);
    })
    .catch(error => {
        console.error('Ошибка при получении категорий:', error);
    });
}

function showCategories(categories) {
    const list = document.getElementById('category-list');
    list.innerHTML = '';
    categories.forEach(category => {
        const item = document.createElement('li');
        item.textContent = category.name;
        item.onclick = function() {
            selectCategory(category.name);
        };
        list.appendChild(item);
    });
}

function selectCategory(categoryName) {
    const input = document.getElementById('category-input');
    const currentCategories = getSelectedCategories();
    const categoryIndex = currentCategories.indexOf(categoryName);

    if (categoryIndex === -1) {
        currentCategories.push(categoryName);
    } else {
        currentCategories.splice(categoryIndex, 1);
    }

    input.value = currentCategories.join(', ');
}

function getSelectedCategories() {
    const input = document.getElementById('category-input');
    return input.value ? input.value.split(', ').filter(Boolean) : [];
}
